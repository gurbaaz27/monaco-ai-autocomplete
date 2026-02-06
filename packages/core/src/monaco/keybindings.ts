import type * as Monaco from "monaco-editor"
import type { InlineCompletionProvider } from "./completion-provider"

export class KeybindingManager {
  private disposables: Monaco.IDisposable[] = [];
  private monaco: typeof import("monaco-editor");
  private editor: Monaco.editor.IStandaloneCodeEditor;
  private completionProvider: Pick<InlineCompletionProvider, "clearSuggestion">;

  constructor(
    monaco: typeof import("monaco-editor"),
    editor: Monaco.editor.IStandaloneCodeEditor,
    completionProvider: Pick<InlineCompletionProvider, "clearSuggestion">,
  ) {
    this.monaco = monaco;
    this.editor = editor;
    this.completionProvider = completionProvider;
  }

  enable(): void {
    this.registerKeybindings();
  }

  disable(): void {
    this.disposables.forEach(d => d.dispose());
    this.disposables = [];
  }

  dispose(): void {
    this.disable();
  }

  private registerKeybindings(): void {
    // Tab: Accept inline suggestion
    const tabAction = this.editor.addCommand(
      this.monaco.KeyCode.Tab,
      () => {
        this.editor.trigger('autocomplete', 'editor.action.inlineSuggest.commit', {});
      },
      'inlineSuggestionVisible'
    );
    if (tabAction) {
      this.disposables.push({ dispose: () => {} });
    }

    // Escape: Clear suggestion
    const escapeAction = this.editor.addCommand(
      this.monaco.KeyCode.Escape,
      () => {
        this.completionProvider.clearSuggestion();
      }
    );
    if (escapeAction) {
      this.disposables.push({ dispose: () => {} });
    }

    // Ctrl+Space: Manual trigger
    const triggerAction = this.editor.addCommand(
      this.monaco.KeyMod.CtrlCmd | this.monaco.KeyCode.Space,
      () => {
        this.editor.trigger('autocomplete', 'editor.action.inlineSuggest.trigger', {});
      }
    );
    if (triggerAction) {
      this.disposables.push({ dispose: () => {} });
    }
  }
}
