# Monaco AI Autocomplete

AI-powered autocompletion for Monaco editors on any webpage. Works on Godbolt, StackBlitz, and other Monaco-based editors.

## Features

- 🤖 **AI-powered completions** using OpenRouter API
- ⚡ **Fast inline suggestions** with ghost text (Cursor-style UX)
- 🎯 **Works anywhere** Monaco is used (Godbolt, StackBlitz, etc.)
- 💾 **Smart caching** reduces API calls and costs
- 📊 **Usage tracking** shows token consumption and costs
- 🔧 **Customizable** model, temperature, and token limits

## Project Structure

This is a monorepo containing:

- **`packages/core`** - Reusable npm package for Monaco integration
- **`packages/extension`** - Chrome extension built with wxt.dev

## Quick Start

### Installation

```bash
# Install dependencies
bun install

# Build everything
bun run build
```

### Development

```bash
# Watch mode for both packages
bun run dev
```

This will:
1. Watch and rebuild the core package on changes
2. Start the extension dev server with hot reload

### Loading the Extension

1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `packages/extension/.output/chrome-mv3`

### Configuration

1. Click the extension icon in Chrome
2. Enter your OpenRouter API key (get one at [openrouter.ai/keys](https://openrouter.ai/keys))
3. Choose your preferred model (default: Mistral Codestral)
4. Adjust settings as needed
5. Click "Save Settings"

### Usage

1. Navigate to a page with Monaco editor (e.g., [godbolt.org](https://godbolt.org))
2. Start typing code
3. Ghost text suggestions will appear automatically
4. Press **Tab** to accept
5. Press **Esc** to dismiss

## Keyboard Shortcuts

- **Tab** - Accept inline suggestion
- **Ctrl/Cmd+Space** - Manual trigger
- **Esc** - Clear suggestion

## Architecture

### Communication Flow

```
Page (Monaco Editor)
      ↓ (window.postMessage)
Content Script
      ↓ (chrome.runtime.sendMessage)
Background Worker
      ↓ (OpenRouter API)
LLM Response
```

### Core Package

The `@monaco-autocomplete/core` package provides:

- `MonacoAutocomplete` - Main integration class
- `InlineCompletionProvider` - Ghost text rendering
- `EditManager` - Multi-edit support (future)
- `KeybindingManager` - Keyboard shortcuts

Example usage:

```typescript
import { MonacoAutocomplete } from '@monaco-autocomplete/core';

const autocomplete = new MonacoAutocomplete({
  monaco: window.monaco,
  editor: monacoEditor,
  llmClient: async (request) => {
    // Your LLM client implementation
    return { text: "completion" };
  },
  config: {
    debounceMs: 250,
    maxTokens: 128,
    temperature: 0.2
  }
});

autocomplete.enable();
```

## Supported Sites

Works on any site using Monaco Editor:

- ✅ [Godbolt Compiler Explorer](https://godbolt.org)
- ✅ [StackBlitz](https://stackblitz.com)
- ✅ [Repl.it](https://repl.it)
- ✅ [Monaco Playground](https://microsoft.github.io/monaco-editor/playground.html)
- ✅ Any custom Monaco implementation

## Configuration Options

### Models

The extension supports various models via OpenRouter:

- **Mistral Codestral** (Recommended) - Fast, code-optimized
- **Claude 3.5 Sonnet** - High quality, slower
- **GPT-4 Turbo** - OpenAI's best
- **Llama 3.1 70B** - Open source, fast
- **DeepSeek Coder** - Code-specialized

### Settings

- **Max Tokens** (32-512) - Controls completion length
- **Temperature** (0-1) - Controls randomness (lower = more deterministic)
- **Debounce** (250ms) - Delay before triggering completions

## Cost Tracking

The extension tracks:

- Daily/total token usage
- Request counts
- Estimated costs (based on model pricing)

All data is stored locally in Chrome storage.

## Development

### Building Individual Packages

```bash
# Build core package only
bun run build:core

# Build extension only
bun run build:ext
```

### Creating Production Build

```bash
# Build and create .zip
cd packages/extension
bun run build
bun run zip
```

The packaged extension will be in `.output/chrome-mv3.zip`.

## Technical Details

- **Runtime**: Bun
- **Framework**: wxt.dev (extension), React (popup)
- **Build**: tsup (core), Vite (extension)
- **LLM**: Vercel AI SDK + OpenRouter
- **Language**: TypeScript

## Roadmap

- [ ] Multi-edit support with Alt+[/] navigation
- [ ] Firefox support
- [ ] Context-aware triggers
- [ ] Site-specific adapters
- [ ] Statistics export
- [ ] Custom prompt templates

## Contributing

Contributions welcome! Please read the [Contributing Guide](CONTRIBUTING.md) first.

## License

MIT

## Credits

Built with [wxt.dev](https://wxt.dev), [Monaco Editor](https://microsoft.github.io/monaco-editor/), and [OpenRouter](https://openrouter.ai).
