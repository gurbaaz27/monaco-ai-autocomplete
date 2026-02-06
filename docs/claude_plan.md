Perfect! I've created a comprehensive implementation plan for your AI-powered Monaco
autocomplete Chrome extension. The plan covers:

Key Highlights:

Architecture:

- Monorepo with Bun workspaces (core npm package + extension + future frontend)
- Clean separation: Core logic is reusable, extension handles Chrome-specific parts
- Message flow: Injected script → Content script → Background worker

Tech Stack:

- Core: TypeScript, Monaco integration, FIM completion logic
- Extension: wxt.dev framework, React popup, OpenRouter + Vercel AI SDK
- LLM: Mistral Codestral (FIM) via OpenRouter, fallback to other models

MVP Features:

- Inline ghost text completion (Cursor-style)
- Tab to accept, Esc to dismiss
- Token usage tracking
- API key configuration
- Clean, minimal UI with Inter font

Implementation Phases:

1. Phase 1: Basic inline completion (Start here)
2. Phase 2: Multi-edit support (Future)
3. Phase 3: Polish & optimization (Future)

The plan includes detailed code examples, file structure, storage schema, build configuration,
and end-to-end verification steps.

──────────────────────────────────────────────────────────────────────────────────────────────────
Ready to code?

Here is Claude's plan:
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
Implementation Plan: AI-Powered Monaco Autocomplete Chrome Extension

Overview

Build a Chrome extension using wxt.dev that adds Cursor-style AI autocompletion to Monaco
editors on any webpage (e.g., Godbolt Compiler Explorer). Core logic will be packaged as a
reusable npm package for independent distribution.

Project Structure

monaco-ai-autocomplete/
├── package.json # Root workspace (private: true)
├── bun.lockb
├── packages/
│ ├── core/ # Publishable npm package
│ │ ├── src/
│ │ │ ├── index.ts
│ │ │ ├── monaco/
│ │ │ │ ├── integration.ts # Main orchestrator class
│ │ │ │ ├── completion-provider.ts # Inline ghost text
│ │ │ │ ├── edit-manager.ts # Multi-edit preview
│ │ │ │ └── keybindings.ts # Tab/Alt+[]/Esc
│ │ │ ├── llm/
│ │ │ │ ├── client.ts
│ │ │ │ └── cache.ts
│ │ │ ├── types/
│ │ │ └── utils/
│ │ ├── package.json
│ │ └── tsup.config.ts
│ │
│ ├── extension/ # Chrome extension (wxt.dev)
│ │ ├── entrypoints/
│ │ │ ├── background.ts # LLM API calls
│ │ │ ├── content.ts # Message bridge
│ │ │ ├── injected.ts # Monaco integration
│ │ │ └── popup/
│ │ │ ├── index.html
│ │ │ └── App.tsx # React UI
│ │ ├── wxt.config.ts
│ │ └── package.json
│ │
│ └── frontend/ # (Future) Next.js landing page

Architecture

Communication Flow

┌─────────────────────────────────────────┐
│ Page (Main World) │
│ ┌───────────────────────────────────┐ │
│ │ Injected Script (injected.ts) │ │
│ │ - Finds Monaco editors │ │
│ │ - Uses @core package │ │
│ │ - Renders ghost text │ │
│ └──────────┬────────────────────────┘ │
│ │ window.postMessage │
└─────────────┼────────────────────────────┘
│
┌─────────────▼────────────────────────────┐
│ Content Script (content.ts) │
│ - Message relay only │
└─────────────┬────────────────────────────┘
│ chrome.runtime.sendMessage
┌─────────────▼────────────────────────────┐
│ Background Worker (background.ts) │
│ - OpenRouter API calls │
│ - Token tracking │
│ - Response caching │
└──────────────────────────────────────────┘

Message Protocol

interface CompletionRequest {
prefix: string; // ~4000 chars before cursor
suffix: string; // ~1000 chars after cursor
languageId: string;
cursorOffset: number;
}

interface CompletionResponse {
text?: string; // Simple completion
edits?: EditPlan; // Multi-edit (Phase 2)
tokensUsed?: {
prompt: number;
completion: number;
total: number;
};
cached?: boolean;
}

Core Package API

Main Export (@monaco-autocomplete/core)

// packages/core/src/index.ts
export class MonacoAutocomplete {
constructor(config: {
editor: monaco.editor.IStandaloneCodeEditor;
llmClient: (request: CompletionRequest) => Promise<CompletionResponse>;
config?: {
debounceMs?: number;
maxTokens?: number;
temperature?: number;
};
});

enable(): void;
disable(): void;
dispose(): void;
}

// Usage in extension
const autocomplete = new MonacoAutocomplete({
editor: monacoEditor,
llmClient: async (req) => sendToBackground(req),
config: { debounceMs: 250 }
});

Key Classes

1.  Integration Orchestrator (monaco/integration.ts)

- Main class that coordinates all components
- Initializes completion provider, edit manager, keybindings
- Manages lifecycle (enable/disable/dispose)

2.  Inline Completion Provider (monaco/completion-provider.ts)

- Registers with Monaco's inline completions API
- Manages ghost text rendering
- Implements both disposeInlineCompletions and freeInlineCompletions for compatibility
- Debounces requests (250ms default)

3.  Edit Manager (monaco/edit-manager.ts)

- Manages multi-edit preview with decorations
- Tracks pending edits and current index
- Handles apply/next/previous/clear operations

4.  Keybindings (monaco/keybindings.ts)

- Tab: Accept inline suggestion (when inlineSuggestionVisible)
- Tab: Apply current edit (when pending edits exist)
- Alt+]: Next edit
- Alt+[: Previous edit
- Esc: Clear all pending edits
- Ctrl+Space: Manual trigger

Extension Implementation

1.  Injected Script (entrypoints/injected.ts)

Responsibilities:

- Wait for Monaco to load (waitForMonaco())
- Find all Monaco editor instances
- Initialize MonacoAutocomplete for each editor
- Set up MutationObserver for dynamically created editors
- Bridge completion requests to content script via postMessage

Key Functions:
// Wait for window.monaco
async function waitForMonaco(timeout = 15000): Promise<any>

// Find editors via monaco.editor.getEditors() or DOM traversal
function findMonacoEditors(): Promise<any[]>

// Send request and await response via postMessage
function sendCompletionRequest(request: CompletionRequest): Promise<CompletionResponse>

2.  Content Script (entrypoints/content.ts)

Responsibilities:

- Inject injected.ts into page using injectScript('/injected.js')
- Relay messages between page and background
- No Monaco interaction

Pattern:
export default defineContentScript({
matches: ['<all_urls>'],
runAt: 'document_end',
main() {
await injectScript('injected.js');

     // Bridge: Page → Background
     window.addEventListener('message', async (event) => {
       if (event.data?.type === 'COMPLETION_REQUEST') {
         const response = await chrome.runtime.sendMessage(event.data);
         window.postMessage({
           type: 'COMPLETION_RESPONSE',
           requestId: event.data.requestId,
           payload: response
         }, '*');
       }
     });

}
});

3.  Background Service Worker (entrypoints/background.ts)

Responsibilities:

- Handle LLM API calls using Vercel AI SDK + OpenRouter
- Manage API keys from chrome.storage.sync
- Track token usage and store in chrome.storage.local
- Implement request caching with LRU eviction
- Error handling with retry logic

LLM Integration:
import { generateText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

async function handleCompletionRequest(message) {
// Check cache first
const cached = await getFromCache(hashRequest(message.payload));
if (cached) return { success: true, data: cached };

// Get user config
const config = await chrome.storage.sync.get(['apiKey', 'model']);

// Call OpenRouter
const openrouter = createOpenRouter({ apiKey: config.apiKey });
const result = await generateText({
model: openrouter(config.model || 'mistralai/codestral-latest'),
prompt: buildPrompt(message.payload),
maxTokens: 128,
temperature: 0.2
});

// Track usage
await updateTokenUsage(result.usage);

// Cache result
await cacheResult(hashRequest(message.payload), result);

return { success: true, data: result };
}

Caching Strategy:

- Cache key: sha256(prefix_tail + '|' + suffix_head + '|' + languageId)
- Max age: 5 minutes
- Max size: 100 entries (LRU eviction)
- Store in memory + chrome.storage.local for persistence

4.  Popup UI (entrypoints/popup/App.tsx)

Features:

- Token usage display (today + total)
- API key input (password field)
- Model selector dropdown
- Temperature slider (0-1)
- Enable/disable toggle
- Minimal, clean design with Inter font

Components:

- TokenUsageCard: Show daily/total tokens, requests, estimated cost
- Settings: API key, model selection, temperature
- ModelSelector: Dropdown with popular models (Mistral Codestral default)

Storage Schema

chrome.storage.sync (synced, max 8KB):
{
config: {
apiKey: string;
model: string; // 'mistralai/codestral-latest'
temperature: number; // 0.2
maxTokens: number; // 128
enabled: boolean; // true
debounceMs: number; // 250
}
}

chrome.storage.local (local only, max 5MB):
{
usage: {
daily: {
'2026-02-05': {
promptTokens: number;
completionTokens: number;
requests: number;
cost: number; // Estimated USD
}
},
total: {
promptTokens: number;
completionTokens: number;
requests: number;
}
},
cache: {
completions: Record<string, {
response: CompletionResponse;
timestamp: number;
hits: number;
}>
}
}

Build Configuration

Core Package (packages/core/package.json)

{
"name": "@monaco-autocomplete/core",
"version": "0.1.0",
"type": "module",
"main": "./dist/index.js",
"types": "./dist/index.d.ts",
"exports": {
".": "./dist/index.js",
"./monaco": "./dist/monaco/index.js"
},
"scripts": {
"build": "tsup",
"dev": "tsup --watch"
},
"dependencies": {
"ai": "^3.4.33",
"@openrouter/ai-sdk-provider": "^0.0.5"
},
"peerDependencies": {
"monaco-editor": ">=0.45.0"
}
}

Extension (packages/extension/wxt.config.ts)

export default defineConfig({
manifest: {
name: 'Monaco AI Autocomplete',
description: 'AI-powered autocompletion for Monaco editors',
permissions: ['storage', 'activeTab'],
host_permissions: ['<all_urls>'],
web_accessible_resources: [
{
resources: ['injected.js', 'styles/injected.css'],
matches: ['<all_urls>']
}
]
},
modules: ['@wxt-dev/module-react']
});

Root Workspace (package.json)

{
"name": "monaco-autocomplete-monorepo",
"private": true,
"workspaces": ["packages/*"],
"scripts": {
"dev": "bun run --cwd packages/core dev & bun run --cwd packages/extension dev",
"build": "bun run --cwd packages/core build && bun run --cwd packages/extension build",
"build:core": "bun run --cwd packages/core build",
"build:ext": "bun run --cwd packages/extension build"
}
}

Extension Dependencies

{
"dependencies": {
"@monaco-autocomplete/core": "workspace:\*",
"ai": "^3.4.33",
"@openrouter/ai-sdk-provider": "^0.0.5",
"react": "^18.2.0",
"react-dom": "^18.2.0"
},
"devDependencies": {
"wxt": "^0.19.0",
"@wxt-dev/module-react": "^1.1.0",
"typescript": "^5.3.3"
}
}

Monaco Integration Details

Finding Monaco Editors

async function findMonacoEditors(): Promise<any[]> {
await waitForMonaco();
const editors = [];

// Method 1: monaco.editor.getEditors() (if available)
if (window.monaco?.editor?.getEditors) {
editors.push(...window.monaco.editor.getEditors());
}

// Method 2: DOM traversal
document.querySelectorAll('.monaco-editor').forEach(el => {
const editor = getEditorFromDomNode(el);
if (editor && !editors.includes(editor)) {
editors.push(editor);
}
});

return editors;
}

Context Extraction

function extractContext(model: any, position: any) {
const fullText = model.getValue();
const offset = model.getOffsetAt(position);

const prefix = fullText.slice(Math.max(0, offset - 4000), offset);
const suffix = fullText.slice(offset, Math.min(fullText.length, offset + 1000));

return { prefix, suffix, offset };
}

Inline Completion Registration

monaco.languages.registerInlineCompletionsProvider(languageId, {
async provideInlineCompletions(model, position, context, token) {
if (!lastSuggestion) return { items: [], dispose: () => {} };

     return {
       items: [{
         insertText: lastSuggestion,
         range: new monaco.Range(
           position.lineNumber,
           position.column,
           position.lineNumber,
           position.column
         )
       }],
       dispose: () => {}
     };

},

// Compatibility: support both cleanup methods
disposeInlineCompletions(completions) {
completions?.dispose?.();
},
freeInlineCompletions(completions) {
completions?.dispose?.();
}
});

Development Workflow

Initial Setup

# Initialize project

mkdir monaco-ai-autocomplete && cd monaco-ai-autocomplete
git init
bun init

# Install dependencies

bun install

# Build core package

cd packages/core
bun run build

# Start extension in dev mode

cd ../extension
bun run dev

Development Loop

# Terminal 1: Watch core package

cd packages/core && bun run dev

# Terminal 2: Run extension with hot reload

cd packages/extension && bun run dev

Testing

1.  Load unpacked extension from packages/extension/.output/chrome-mv3
2.  Navigate to https://godbolt.org
3.  Write code in editor
4.  Observe ghost text suggestions
5.  Press Tab to accept, Esc to dismiss

Production Build

# Build all packages

bun run build

# Create extension .zip

cd packages/extension && bun run zip

Implementation Phases

Phase 1: MVP (Core Autocomplete) - Start Here

Goal: Basic inline completion that works on Godbolt

Tasks:

1.  Set up monorepo with Bun workspaces
2.  Create core package with MonacoAutocomplete class
3.  Implement inline completion provider
4.  Create extension with background/content/injected scripts
5.  Integrate OpenRouter + Mistral Codestral
6.  Build minimal popup UI (API key + token usage)
7.  Test on Godbolt

Success Criteria:

- Type code in Godbolt → ghost text appears
- Tab accepts suggestion
- Token usage tracked in popup
- No errors in console

Phase 2: Multi-Edit Support (Future)

- LLM returns structured EditPlan
- Edit preview with decorations
- Alt+[/] navigation
- Enhanced UI

Phase 3: Polish & Optimization (Future)

- Improved caching
- Site-specific adapters
- Export statistics
- Context-aware triggers

Critical Implementation Files

1.  Core Package Entry - packages/core/src/index.ts

- Exports MonacoAutocomplete class

2.  Monaco Integration - packages/core/src/monaco/integration.ts

- Orchestrates completion provider, edit manager, keybindings
- Main class users instantiate

3.  Completion Provider - packages/core/src/monaco/completion-provider.ts

- Registers inline completions
- Manages ghost text state
- Debounces requests

4.  Injected Script - packages/extension/entrypoints/injected.ts

- Finds Monaco editors
- Instantiates MonacoAutocomplete
- Bridges to content script

5.  Background Worker - packages/extension/entrypoints/background.ts

- LLM API calls
- Token tracking
- Caching logic

6.  Content Bridge - packages/extension/entrypoints/content.ts

- Message relay between page and background

7.  Popup UI - packages/extension/entrypoints/popup/App.tsx

- Settings and usage display

Design Guidelines

UI Principles:

- Clean, minimal interface
- Inter font family
- Subtle colors (grays, light blues)
- Focus on readability
- No clutter - essential info only

Code Style:

- TypeScript strict mode
- Functional components (React)
- Clear separation of concerns
- Comprehensive error handling
- Meaningful variable names

Verification Steps

End-to-End Test

1.  Setup:

- Fresh Bun install
- Build core package
- Load extension in Chrome

2.  Test Godbolt:

- Navigate to https://godbolt.org
- Configure API key in popup
- Write: def fibonacci(n):
- Observe ghost text completion
- Press Tab to accept
- Verify token usage in popup

3.  Test Other Sites:

- Try on https://repl.it (Monaco-based)
- Try on https://stackblitz.com
- Verify editor detection works

4.  Test Edge Cases:

- Multiple editors on same page
- Dynamically created editors
- No API key set → graceful error
- Network error → fallback message
- Cache hit → instant response

5.  Verify Packaging:

- Build production bundle
- Check bundle size (<500KB total)
- Test zip creation
- Verify manifest.json correctness

Success Metrics

- ✅ Ghost text appears within 500ms
- ✅ Tab accepts completion correctly
- ✅ Works on 3+ Monaco sites
- ✅ Token usage accurate
- ✅ No console errors
- ✅ Extension loads <1s
- ✅ Core package builds to ESM

Key Technical Decisions

1.  Vercel AI SDK + OpenRouter: Unified interface, ~40KB bundle, flexible model switching
2.  Inline Completions API: Native Monaco ghost text, matches Cursor UX
3.  Page Script Injection: Required to access window.monaco in main world
4.  FIM over Chat: Better for code completion, lower token usage
5.  Local Caching: Reduce API calls, privacy-friendly, faster responses
6.  Monorepo with Bun: Shared TypeScript, fast builds, easy local development
7.  wxt.dev Framework: Simplifies manifest, build config, HMR support

Documentation Requirements

1.  Core Package README:

- Installation instructions
- API reference
- Usage examples
- Monaco compatibility

2.  Extension README:

- User installation guide
- Configuration options
- Supported sites
- Troubleshooting

3.  Monorepo README:

- Development setup
- Build commands
- Architecture overview
- Contributing guide

---

Next Steps After Approval:

1.  Initialize monorepo structure
2.  Set up core package with TypeScript
3.  Implement MonacoAutocomplete class
4.  Create extension scaffolding with wxt
5.  Integrate OpenRouter API
6.  Build minimal popup UI
7.  Test on Godbolt
