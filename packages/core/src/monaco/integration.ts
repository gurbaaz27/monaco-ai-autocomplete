import type * as Monaco from "monaco-editor"
import type { LLMClient, MonacoAutocompleteConfig } from '../types';
import { InlineCompletionProvider } from './completion-provider';
import { EditManager } from './edit-manager';
import { KeybindingManager } from './keybindings';

export class MonacoAutocomplete {
  private monaco: typeof import("monaco-editor");
  private editor: Monaco.editor.IStandaloneCodeEditor;
  private llmClient: LLMClient;
  private config: Required<MonacoAutocompleteConfig>;

  private completionProvider: InlineCompletionProvider;
  private editManager: EditManager;
  private keybindingManager: KeybindingManager;

  private isEnabled: boolean = false;

  constructor(options: {
    monaco: typeof import("monaco-editor");
    editor: Monaco.editor.IStandaloneCodeEditor;
    llmClient: LLMClient;
    config?: MonacoAutocompleteConfig;
  }) {
    this.monaco = options.monaco;
    this.editor = options.editor;
    this.llmClient = options.llmClient;
    this.config = {
      debounceMs: options.config?.debounceMs ?? 250,
      maxTokens: options.config?.maxTokens ?? 128,
      temperature: options.config?.temperature ?? 0.2
    };

    this.completionProvider = new InlineCompletionProvider(
      this.monaco,
      this.editor,
      this.llmClient,
      this.config.debounceMs
    );

    this.editManager = new EditManager(this.monaco, this.editor);
    this.keybindingManager = new KeybindingManager(
      this.monaco,
      this.editor,
      this.completionProvider
    );
  }

  enable(): void {
    if (this.isEnabled) return;

    this.isEnabled = true;
    this.completionProvider.enable();
    this.keybindingManager.enable();
  }

  disable(): void {
    if (!this.isEnabled) return;

    this.isEnabled = false;
    this.completionProvider.disable();
    this.keybindingManager.disable();
    this.editManager.clearEdits();
  }

  dispose(): void {
    this.disable();
    this.completionProvider.dispose();
    this.editManager.dispose();
    this.keybindingManager.dispose();
  }

  getEditManager(): EditManager {
    return this.editManager;
  }
}
