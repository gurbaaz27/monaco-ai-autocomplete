import { MonacoAutocomplete } from "@monaco-autocomplete/core"
import type {
  CompletionRequest,
  CompletionResponse,
} from "@monaco-autocomplete/core"

export default defineUnlistedScript(() => {
  console.log("Monaco AI Autocomplete injected script loaded")

  // Wait for Monaco to be available
  waitForMonaco()
    .then((monaco) => {
      console.log("Monaco detected, initializing autocomplete")
      initializeAutocomplete(monaco)
    })
    .catch((error) => {
      console.error("Failed to initialize Monaco autocomplete:", error)
    })
})

async function waitForMonaco(timeout: number = 15000): Promise<any> {
  const startTime = Date.now()

  return new Promise((resolve, reject) => {
    const check = () => {
      if ((window as any).monaco) {
        resolve((window as any).monaco)
        return
      }

      if (Date.now() - startTime > timeout) {
        reject(new Error("Monaco editor not found"))
        return
      }

      setTimeout(check, 100)
    }

    check()
  })
}

async function initializeAutocomplete(monaco: any): Promise<void> {
  // Find all Monaco editors
  const editors = await findMonacoEditors(monaco)
  console.log(`Found ${editors.length} Monaco editor(s)`)

  for (const editor of editors) {
    setupEditor(monaco, editor)
  }

  // Watch for dynamically created editors
  observeNewEditors(monaco)
}

async function findMonacoEditors(monaco: any): Promise<any[]> {
  const editors: any[] = []

  // Method 1: monaco.editor.getEditors()
  if (monaco.editor?.getEditors) {
    const editorList = monaco.editor.getEditors()
    editors.push(...editorList)
  }

  // Method 2: DOM traversal (fallback)
  if (editors.length === 0) {
    document.querySelectorAll(".monaco-editor").forEach((el) => {
      // Try to get editor instance from DOM node
      const editorInstance = getEditorFromDomNode(el)
      if (editorInstance && !editors.includes(editorInstance)) {
        editors.push(editorInstance)
      }
    })
  }

  return editors
}

function getEditorFromDomNode(domNode: Element): any {
  // Monaco stores editor instance on DOM node
  const anyNode = domNode as any

  // Try common property names
  if (anyNode._editor) return anyNode._editor
  if (anyNode.editor) return anyNode.editor

  // Check for Monaco's internal property
  const keys = Object.keys(anyNode)
  for (const key of keys) {
    if (key.startsWith("_") && anyNode[key]?.getModel) {
      return anyNode[key]
    }
  }

  return null
}

function setupEditor(monaco: any, editor: any): void {
  console.log("Setting up autocomplete for editor")

  const autocomplete = new MonacoAutocomplete({
    monaco,
    editor,
    llmClient: createLLMClient(),
    config: {
      debounceMs: 250,
      maxTokens: 128,
      temperature: 0.2,
    },
  })

  autocomplete.enable()

  // Store reference for cleanup
  ;(editor as any)._monacoAutocomplete = autocomplete
}

function createLLMClient() {
  return async (request: CompletionRequest): Promise<CompletionResponse> => {
    return sendCompletionRequest(request)
  }
}

async function sendCompletionRequest(
  request: CompletionRequest,
): Promise<CompletionResponse> {
  const requestId = Math.random().toString(36).substring(7)

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup()
      reject(new Error("Completion request timeout"))
    }, 60000)

    const handler = (event: MessageEvent) => {
      if (
        event.data?.type === "COMPLETION_RESPONSE" &&
        event.data.requestId === requestId
      ) {
        cleanup()

        if (event.data.error) {
          reject(new Error(event.data.error))
        } else {
          resolve(event.data.payload)
        }
      }
    }

    const cleanup = () => {
      clearTimeout(timeout)
      window.removeEventListener("message", handler)
    }

    window.addEventListener("message", handler)

    console.log("Sending completion request to content script", request)

    // Send request to content script
    window.postMessage(
      {
        type: "COMPLETION_REQUEST",
        requestId,
        payload: request,
      },
      "*",
    )
  })
}

function observeNewEditors(monaco: any): void {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          // Check if it's a Monaco editor
          if (node.classList.contains("monaco-editor")) {
            const editor = getEditorFromDomNode(node)
            if (editor && !(editor as any)._monacoAutocomplete) {
              console.log("New Monaco editor detected")
              setupEditor(monaco, editor)
            }
          }

          // Check descendants
          node.querySelectorAll(".monaco-editor").forEach((el) => {
            const editor = getEditorFromDomNode(el)
            if (editor && !(editor as any)._monacoAutocomplete) {
              console.log("New Monaco editor detected (descendant)")
              setupEditor(monaco, editor)
            }
          })
        }
      })
    }
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })
}
