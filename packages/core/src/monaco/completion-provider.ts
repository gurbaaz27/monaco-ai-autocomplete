import type * as Monaco from "monaco-editor"
import type { CompletionRequest, LLMClient } from "../types"
import { debounce, extractContext } from "../utils"

type MonacoModule = typeof import("monaco-editor")
type InlineCompletionsProviderCompat =
  Monaco.languages.InlineCompletionsProvider & {
    // Monaco has changed this API across versions; accept both when present.
    freeInlineCompletions?: (
      completions: Monaco.languages.InlineCompletions,
    ) => void
    disposeInlineCompletions?: (
      completions: Monaco.languages.InlineCompletions,
    ) => void
  }

export class InlineCompletionProvider {
  private lastSuggestion: string | null = null
  private disposables: Monaco.IDisposable[] = []
  private monaco: MonacoModule
  private editor: Monaco.editor.IStandaloneCodeEditor
  private llmClient: LLMClient
  private debounceMs: number
  private isEnabled: boolean = true

  constructor(
    monaco: MonacoModule,
    editor: Monaco.editor.IStandaloneCodeEditor,
    llmClient: LLMClient,
    debounceMs: number = 250,
  ) {
    this.monaco = monaco
    this.editor = editor
    this.llmClient = llmClient
    this.debounceMs = debounceMs
  }

  enable(): void {
    this.isEnabled = true
    this.registerProvider()
    this.registerChangeListener()
  }

  disable(): void {
    this.isEnabled = false
    this.lastSuggestion = null
  }

  dispose(): void {
    this.isEnabled = false
    this.disposables.forEach((d) => d.dispose())
    this.disposables = []
  }

  private createInlineCompletionResult(
    items: Monaco.languages.InlineCompletion[],
  ): Monaco.languages.InlineCompletions {
    return {
      items,
      enableForwardStability: true,
    }
  }

  private registerProvider(): void {
    const model = this.editor.getModel()
    if (!model) return

    const languageId = model.getLanguageId()
    const providerImpl: InlineCompletionsProviderCompat = {
      provideInlineCompletions: async (
        model: Monaco.editor.ITextModel,
        position: Monaco.Position,
        context: Monaco.languages.InlineCompletionContext,
        token: Monaco.CancellationToken,
      ): Promise<Monaco.languages.InlineCompletions> => {
        if (!this.isEnabled || !this.lastSuggestion) {
          return this.createInlineCompletionResult([])
        }

        if (token.isCancellationRequested) {
          console.log("Cancellation requested")
          return this.createInlineCompletionResult([])
        }

        return this.createInlineCompletionResult([
          {
            insertText: this.lastSuggestion,
            range: new this.monaco.Range(
              position.lineNumber,
              position.column,
              position.lineNumber,
              position.column,
            ),
          },
        ])
      },
      freeInlineCompletions: (
        completions: Monaco.languages.InlineCompletions,
      ) => {
        // Compatibility method
      },
      disposeInlineCompletions: (
        completions: Monaco.languages.InlineCompletions,
      ) => {
        // Compatibility method
      },
    }

    const provider = this.monaco.languages.registerInlineCompletionsProvider(
      languageId,
      providerImpl,
    )

    this.disposables.push(provider)
  }

  private registerChangeListener(): void {
    const debouncedFetch = debounce(
      this.fetchCompletion.bind(this),
      this.debounceMs,
    )

    const listener = this.editor.onDidChangeModelContent(() => {
      if (!this.editor.hasTextFocus()) return
      if (!this.isEnabled) return
      debouncedFetch()
    })

    this.disposables.push(listener)
  }

  private async fetchCompletion(): Promise<void> {
    const model = this.editor.getModel()
    const position = this.editor.getPosition()

    if (!model || !position) {
      this.lastSuggestion = null
      return
    }

    try {
      const { prefix, suffix, offset } = extractContext(model, position)
      const languageId = model.getLanguageId()

      const request: CompletionRequest = {
        prefix,
        suffix,
        languageId,
        cursorOffset: offset,
      }

      const response = await this.llmClient(request)

      if (response.text) {
        this.lastSuggestion = response.text
        // Trigger inline completion update
        this.editor.trigger(
          "autocomplete",
          "editor.action.inlineSuggest.trigger",
          {},
        )
      } else {
        this.lastSuggestion = null
      }
    } catch (error) {
      console.error("Failed to fetch completion:", error)
      this.lastSuggestion = null
    }
  }

  clearSuggestion(): void {
    this.lastSuggestion = null
  }
}
