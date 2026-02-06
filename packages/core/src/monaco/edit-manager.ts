import type { EditPlan } from '../types';
import type * as Monaco from "monaco-editor"

type MonacoModule = typeof import("monaco-editor")

export class EditManager {
  private monaco: MonacoModule;
  private editor: Monaco.editor.IStandaloneCodeEditor;
  private pendingEdits: EditPlan | null = null;
  private currentEditIndex: number = 0;
  private decorations: string[] = [];

  constructor(monaco: MonacoModule, editor: Monaco.editor.IStandaloneCodeEditor) {
    this.monaco = monaco;
    this.editor = editor;
  }

  setPendingEdits(editPlan: EditPlan): void {
    this.pendingEdits = editPlan;
    this.currentEditIndex = 0;
    this.renderPreview();
  }

  clearEdits(): void {
    this.pendingEdits = null;
    this.currentEditIndex = 0;
    this.clearDecorations();
  }

  nextEdit(): void {
    if (!this.pendingEdits || this.pendingEdits.edits.length === 0) return;

    this.currentEditIndex = (this.currentEditIndex + 1) % this.pendingEdits.edits.length;
    this.renderPreview();
  }

  previousEdit(): void {
    if (!this.pendingEdits || this.pendingEdits.edits.length === 0) return;

    this.currentEditIndex = this.currentEditIndex - 1;
    if (this.currentEditIndex < 0) {
      this.currentEditIndex = this.pendingEdits.edits.length - 1;
    }
    this.renderPreview();
  }

  applyCurrentEdit(): void {
    if (!this.pendingEdits || this.pendingEdits.edits.length === 0) return;

    const edit = this.pendingEdits.edits[this.currentEditIndex];
    const range = new this.monaco.Range(
      edit.range.startLine,
      edit.range.startColumn,
      edit.range.endLine,
      edit.range.endColumn
    );

    this.editor.executeEdits('autocomplete', [{
      range,
      text: edit.text
    }]);

    // Remove applied edit
    this.pendingEdits.edits.splice(this.currentEditIndex, 1);

    if (this.pendingEdits.edits.length === 0) {
      this.clearEdits();
    } else {
      if (this.currentEditIndex >= this.pendingEdits.edits.length) {
        this.currentEditIndex = 0;
      }
      this.renderPreview();
    }
  }

  hasPendingEdits(): boolean {
    return this.pendingEdits !== null && this.pendingEdits.edits.length > 0;
  }

  private renderPreview(): void {
    this.clearDecorations();

    if (!this.pendingEdits || this.pendingEdits.edits.length === 0) return;

    const decorations: Monaco.editor.IModelDeltaDecoration[] = [];

    this.pendingEdits.edits.forEach((edit, index) => {
      const range = new this.monaco.Range(
        edit.range.startLine,
        edit.range.startColumn,
        edit.range.endLine,
        edit.range.endColumn
      );

      const isCurrent = index === this.currentEditIndex;

      decorations.push({
        range,
        options: {
          className: isCurrent ? 'monaco-autocomplete-edit-current' : 'monaco-autocomplete-edit',
          hoverMessage: {
            value: isCurrent ? `**Edit ${index + 1}/${this.pendingEdits!.edits.length}** (Press Tab to apply)` : `Edit ${index + 1}`
          }
        }
      });
    });

    this.decorations = this.editor.deltaDecorations([], decorations);
  }

  private clearDecorations(): void {
    if (this.decorations.length > 0) {
      this.decorations = this.editor.deltaDecorations(this.decorations, []);
    }
  }

  dispose(): void {
    this.clearEdits();
  }
}
