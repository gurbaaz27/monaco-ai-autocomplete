import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"

interface CompletionRequest {
  prefix: string
  suffix: string
}

function buildFIMPrompt(request: CompletionRequest): string {
  // FIM (Fill-In-Middle) format
  // Format: <prefix>CODE_BEFORE<suffix>CODE_AFTER<middle>
  return `<fim_prefix>${request.prefix}<fim_suffix>${request.suffix}<fim_middle>`
}

const system = `You are a fill-in-the-middle code completion engine.

You will be given a code PREFIX and a code SUFFIX. Your job is to generate ONLY the code that belongs between them.

Output rules (must follow exactly):
- Output ONLY the missing code (the middle). Do NOT repeat the PREFIX or the SUFFIX.
- Do NOT include markdown fences (\`\`\`), language tags, comments about what you did, or any explanation.
- Do NOT include phrases like "Here is", "Sure", or "This code".
- Preserve indentation/style consistent with the PREFIX/SUFFIX.
- If the correct completion is empty, output an empty string (no whitespace, no newline).`

const fim = buildFIMPrompt({
  prefix:
    "def fib(n):\n    if n <= 0:\n        return 0\n    elif n == 1:\n        return 1\n    else:\n",
  suffix: "\n\nprint(fib(10))\n",
})

const prompt = `Fill in the missing code between PREFIX and SUFFIX.

Return ONLY the missing code now:
${fim}`

console.log(prompt)

const openrouter = createOpenRouter({ apiKey: Bun.env.OPENROUTER_API_KEY })
const result = await generateText({
  model: openrouter("arcee-ai/trinity-large-preview:free"),
  system,
  prompt,
  maxOutputTokens: 128,
  temperature: 0.2,
  stopSequences: ["```", "<fim_prefix>", "<fim_suffix>", "<fim_middle>"],
})

console.log(result)
console.log(result.text)
