import type * as MonacoNS from "monaco-editor"

/**
 * Shared Monaco types so consumers (like the browser extension) can depend
 * on the same shapes without importing from "monaco-editor" directly.
 */

// The Monaco module namespace (what lives on window.monaco)
export type MonacoNamespace = typeof import("monaco-editor")

// Core editor / model primitives. The integration expects a standalone editor
// (what `monaco.editor.create` returns).
export type MonacoStandaloneEditor = MonacoNS.editor.IStandaloneCodeEditor
export type MonacoCodeEditor = MonacoNS.editor.ICodeEditor
export type MonacoModel = MonacoNS.editor.ITextModel
export type MonacoPosition = MonacoNS.IPosition
export type MonacoCancellationToken = MonacoNS.CancellationToken
export type MonacoDisposable = MonacoNS.IDisposable
export type MonacoModelDeltaDecoration = MonacoNS.editor.IModelDeltaDecoration

// Inline completion primitives
export type MonacoInlineCompletion = MonacoNS.languages.InlineCompletion
export type MonacoInlineCompletions = MonacoNS.languages.InlineCompletions
export type MonacoInlineCompletionContext =
  MonacoNS.languages.InlineCompletionContext

// Compatibility wrapper for different Monaco inline completion cleanup APIs
export type InlineCompletionsProviderCompat =
  MonacoNS.languages.InlineCompletionsProvider & {
    // Some Monaco builds call freeInlineCompletions(...)
    freeInlineCompletions?: (completions: MonacoInlineCompletions) => void
    // Others call disposeInlineCompletions(...)
    disposeInlineCompletions?: (completions: MonacoInlineCompletions) => void
  }
