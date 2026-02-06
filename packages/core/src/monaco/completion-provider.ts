import type {
  CompletionRequest,
  InlineCompletionsProviderCompat,
  LLMClient,
  MonacoCancellationToken,
  MonacoDisposable,
  MonacoStandaloneEditor,
  MonacoInlineCompletion,
  MonacoInlineCompletionContext,
  MonacoInlineCompletions,
  MonacoModel,
  MonacoNamespace,
  MonacoPosition,
} from "../types"
import { debounce, extractContext } from "../utils"

export class InlineCompletionProvider {
  private lastSuggestion: string | null = null
  private disposables: MonacoDisposable[] = []
  private monaco: MonacoNamespace
  private editor: MonacoStandaloneEditor
  private llmClient: LLMClient
  private debounceMs: number
  private isEnabled: boolean = true

  constructor(
    monaco: MonacoNamespace,
    editor: MonacoStandaloneEditor,
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
    items: MonacoInlineCompletion[],
  ): MonacoInlineCompletions {
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
        model: MonacoModel,
        position: MonacoPosition,
        context: MonacoInlineCompletionContext,
        token: MonacoCancellationToken,
      ): Promise<MonacoInlineCompletions> => {
        if (model !== this.editor.getModel()) {
          return this.createInlineCompletionResult([])
        }

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
      freeInlineCompletions: (completions: MonacoInlineCompletions) => {
        // Compatibility method
      },
      disposeInlineCompletions: (completions: MonacoInlineCompletions) => {
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
