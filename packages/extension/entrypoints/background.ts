import { generateText } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import type {
  CompletionRequest,
  CompletionResponse,
} from "@monaco-autocomplete/core"

export default defineBackground(() => {
  console.log("Monaco AI Autocomplete background started")

  // Handle completion requests from content scripts
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "COMPLETION_REQUEST") {
      handleCompletionRequest(message.payload)
        .then((response) => sendResponse({ success: true, data: response }))
        .catch((error) =>
          sendResponse({ success: false, error: error.message }),
        )
      return true // Keep channel open for async response
    }
  })
})

async function handleCompletionRequest(
  request: CompletionRequest,
): Promise<CompletionResponse> {
  try {
    // Check cache first
    const cacheKey = hashRequest(request)
    const cached = await getFromCache(cacheKey)
    if (cached) {
      console.log("Cache hit for request")
      return { ...cached, cached: true }
    }

    // Get config from storage
    const config = await chrome.storage.sync.get([
      "apiKey",
      "model",
      "temperature",
      "maxTokens",
      "enabled",
    ])

    if (!config.enabled) {
      throw new Error("Autocomplete is disabled")
    }

    if (!config.apiKey) {
      throw new Error(
        "API key not configured. Please set it in the extension popup.",
      )
    }

    // Build prompt
    const prompt = buildFIMPrompt(request)

    console.log("Prompt", prompt)

    const system = `You are a fill-in-the-middle code completion engine.

You will be given a code PREFIX and a code SUFFIX. Your job is to generate ONLY the code that belongs between them.

Output rules (must follow exactly):
- Output ONLY the missing code (the middle). Do NOT repeat the PREFIX or the SUFFIX.
- Do NOT include markdown fences (\`\`\`), language tags, comments about what you did, or any explanation.
- Do NOT include phrases like "Here is", "Sure", or "This code".
- Preserve indentation/style consistent with the PREFIX/SUFFIX.
- If the correct completion is empty, output an empty string (no whitespace, no newline).`

    // Call OpenRouter
    const openrouter = createOpenRouter({ apiKey: config.apiKey })
    const result = await generateText({
      model: openrouter(config.model),
      system,
      prompt,
      maxOutputTokens: config.maxTokens || 128,
      temperature: config.temperature || 0.2,
      stopSequences: ["```", "<fim_prefix>", "<fim_suffix>", "<fim_middle>"],
    })

    console.log("Result", result)

    const response: CompletionResponse = {
      text: result.text,
      tokensUsed: {
        prompt: result.usage?.inputTokens || 0,
        completion: result.usage?.outputTokens || 0,
        total: result.usage?.totalTokens || 0,
      },
    }

    // Track usage
    await updateTokenUsage(response.tokensUsed!)

    // Cache result
    await cacheResult(cacheKey, response)

    return response
  } catch (error: any) {
    console.error("Failed to get completion:", error)
    throw error
  }
}

function buildFIMPrompt(request: CompletionRequest): string {
  // FIM (Fill-In-Middle) format
  // Format: <prefix>CODE_BEFORE<suffix>CODE_AFTER<middle>
  return `<fim_prefix>${request.prefix}<fim_suffix>${request.suffix}<fim_middle>`
}

function hashRequest(request: CompletionRequest): string {
  const data = `${request.prefix}|${request.suffix}|${request.languageId}`
  // Simple hash for caching
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return hash.toString(36)
}

async function getFromCache(key: string): Promise<CompletionResponse | null> {
  try {
    const result = await chrome.storage.local.get(["cache"])
    const cache = result.cache?.completions || {}
    const entry = cache[key]

    if (!entry) return null

    // Check if cache is still valid (5 minutes)
    const now = Date.now()
    if (now - entry.timestamp > 5 * 60 * 1000) {
      return null
    }

    return entry.response
  } catch (error) {
    console.error("Cache read error:", error)
    return null
  }
}

async function cacheResult(
  key: string,
  response: CompletionResponse,
): Promise<void> {
  try {
    const result = await chrome.storage.local.get(["cache"])
    const cache = result.cache || { completions: {} }

    cache.completions[key] = {
      response,
      timestamp: Date.now(),
      hits: 0,
    }

    // LRU eviction: keep only 100 entries
    const entries = Object.entries(cache.completions)
    if (entries.length > 100) {
      // Sort by timestamp, keep newest 100
      entries.sort((a: any, b: any) => b[1].timestamp - a[1].timestamp)
      cache.completions = Object.fromEntries(entries.slice(0, 100))
    }

    await chrome.storage.local.set({ cache })
  } catch (error) {
    console.error("Cache write error:", error)
  }
}

async function updateTokenUsage(tokensUsed: {
  prompt: number
  completion: number
  total: number
}): Promise<void> {
  try {
    const result = await chrome.storage.local.get(["usage"])
    const usage = result.usage || {
      daily: {},
      total: { promptTokens: 0, completionTokens: 0, requests: 0 },
    }

    // Update total
    usage.total.promptTokens += tokensUsed.prompt
    usage.total.completionTokens += tokensUsed.completion
    usage.total.requests += 1

    // Update daily
    const today = new Date().toISOString().split("T")[0]
    if (!usage.daily[today]) {
      usage.daily[today] = {
        promptTokens: 0,
        completionTokens: 0,
        requests: 0,
        cost: 0,
      }
    }
    usage.daily[today].promptTokens += tokensUsed.prompt
    usage.daily[today].completionTokens += tokensUsed.completion
    usage.daily[today].requests += 1

    // Estimate cost (approximate rates for Codestral)
    const costPerPromptToken = 0.001 / 1000 // $1 per 1M tokens
    const costPerCompletionToken = 0.003 / 1000
    usage.daily[today].cost +=
      tokensUsed.prompt * costPerPromptToken +
      tokensUsed.completion * costPerCompletionToken

    await chrome.storage.local.set({ usage })
  } catch (error) {
    console.error("Usage tracking error:", error)
  }
}
