import type { InlineCompletionProvider } from "./completion-provider"
import type {
  MonacoDisposable,
  MonacoCodeEditor,
  MonacoStandaloneEditor,
  MonacoNamespace,
} from "../types"

export class KeybindingManager {
  private disposables: MonacoDisposable[] = []
  private monaco: MonacoNamespace
  private editor: MonacoStandaloneEditor
  private completionProvider: Pick<InlineCompletionProvider, "clearSuggestion">

  constructor(
    monaco: MonacoNamespace,
    editor: MonacoStandaloneEditor,
    completionProvider: Pick<InlineCompletionProvider, "clearSuggestion">,
  ) {
    this.monaco = monaco
    this.editor = editor
    this.completionProvider = completionProvider
  }

  enable(): void {
    this.registerKeybindings()
  }

  disable(): void {
    this.disposables.forEach((d) => d.dispose())
    this.disposables = []
  }

  dispose(): void {
    this.disable()
  }

  private getFocusedEditor(): MonacoStandaloneEditor {
    if (this.monaco.editor?.getEditors) {
      const focused = this.monaco.editor
        .getEditors()
        .find((e: MonacoCodeEditor) => e.hasTextFocus())
      if (focused) return focused as MonacoStandaloneEditor
    }
    return this.editor
  }

  private registerKeybindings(): void {
    // Ensure inline suggestions are enabled for this editor.
    this.editor.updateOptions({
      inlineSuggest: { enabled: true },
      quickSuggestions: true,
      suggestOnTriggerCharacters: true,
      tabCompletion: "on",
    })

    // 1) Only commit inline suggestion when it is visible
    const tabCommit = this.editor.addCommand(
      this.monaco.KeyCode.Tab,
      () => {
        this.getFocusedEditor().trigger(
          "keyboard",
          "editor.action.inlineSuggest.commit",
          {},
        )
      },
      "inlineSuggestionVisible",
    )
    if (tabCommit) {
      // Monaco does not expose a command-dispose API; keep a placeholder disposable
      this.disposables.push({ dispose: () => {} })
    }

    // 2) For all other cases, fall back to the default tab / indent behaviour
    const tabDefault = this.editor.addCommand(
      this.monaco.KeyCode.Tab,
      () => {
        this.getFocusedEditor().trigger("keyboard", "tab", {})
      },
      "!inlineSuggestionVisible",
    )
    if (tabDefault) {
      this.disposables.push({ dispose: () => {} })
    }

    // Escape: Clear suggestion
    const escapeAction = this.editor.addCommand(
      this.monaco.KeyCode.Escape,
      () => {
        this.completionProvider.clearSuggestion()
      },
    )
    if (escapeAction) {
      this.disposables.push({ dispose: () => {} })
    }

    // Ctrl+K: Manual trigger
    const triggerAction = this.editor.addCommand(
      this.monaco.KeyMod.CtrlCmd | this.monaco.KeyCode.KeyK,
      () => {
        this.getFocusedEditor().trigger(
          "keyboard",
          "editor.action.inlineSuggest.trigger",
          {},
        )
      },
    )
    if (triggerAction) {
      this.disposables.push({ dispose: () => {} })
    }
  }
}
