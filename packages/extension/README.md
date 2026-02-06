# Monaco AI Autocomplete - Chrome Extension

Chrome extension that adds AI-powered autocompletion to Monaco editors on any webpage.

## Installation

### From Source

1. Clone the repository
2. Install dependencies: `bun install`
3. Build: `bun run build`
4. Load `packages/extension/.output/chrome-mv3` in Chrome

### From Chrome Web Store

Coming soon!

## Setup

1. Get an API key from [OpenRouter](https://openrouter.ai/keys)
2. Click the extension icon
3. Enter your API key
4. Choose your preferred model
5. Click "Save Settings"

## Supported Sites

Works on any site using Monaco Editor:

- [Godbolt Compiler Explorer](https://godbolt.org)
- [StackBlitz](https://stackblitz.com)
- [Repl.it](https://repl.it)
- [Monaco Playground](https://microsoft.github.io/monaco-editor/playground.html)
- Any custom Monaco implementation

## Features

- **Inline ghost text** completions (Cursor-style)
- **Smart caching** reduces API costs
- **Token tracking** shows usage and estimated costs
- **Multiple models** supported via OpenRouter
- **Customizable** temperature and token limits

## Keyboard Shortcuts

- **Tab** - Accept completion
- **Esc** - Dismiss completion
- **Ctrl/Cmd+Space** - Manual trigger

## Privacy

- All data stored locally in Chrome
- API calls go directly to OpenRouter
- No telemetry or tracking
- Open source code

## Configuration

### Model Selection

Choose from:

- **Mistral Codestral** (Recommended) - Fast, optimized for code
- **Claude 3.5 Sonnet** - High quality
- **GPT-4 Turbo** - OpenAI's best
- **Llama 3.1 70B** - Open source
- **DeepSeek Coder** - Code-specialized

### Settings

- **Max Tokens** (32-512) - Completion length
- **Temperature** (0-1) - Randomness (lower = more deterministic)

## Cost Estimates

Approximate costs per 1000 completions:

- Mistral Codestral: ~$0.05
- Claude 3.5 Sonnet: ~$0.50
- GPT-4 Turbo: ~$1.00

Actual costs depend on context size and completion length.

## Troubleshooting

### Completions not appearing

1. Check that the extension is enabled (toggle in popup)
2. Verify your API key is set correctly
3. Check Chrome DevTools console for errors
4. Make sure the page has a Monaco editor

### High API costs

1. Reduce max tokens (try 64 or 32)
2. Use a cheaper model (Codestral recommended)
3. Increase debounce delay in code (future setting)

### Extension not loading

1. Check Chrome extensions page for errors
2. Try reloading the extension
3. Check for Chrome updates

## Development

### Build from source

```bash
# Install dependencies
bun install

# Development mode with hot reload
bun run dev

# Production build
bun run build

# Create .zip for distribution
bun run zip
```

### Project Structure

```
entrypoints/
├── background.ts      # LLM API calls, caching
├── content.ts         # Message relay
├── injected.ts        # Monaco integration
└── popup/
    ├── index.html
    ├── App.tsx        # React UI
    └── styles.css
```

### Testing

1. Load extension in Chrome (`chrome://extensions`)
2. Navigate to https://godbolt.org
3. Open DevTools console
4. Write code and observe completions

## Technical Details

- **Framework**: wxt.dev
- **LLM SDK**: Vercel AI SDK
- **API**: OpenRouter
- **UI**: React + vanilla CSS
- **Storage**: Chrome Storage API

## Permissions

- `storage` - Save settings and usage data
- `activeTab` - Inject into current tab
- `<all_urls>` - Work on any website with Monaco

## License

MIT

## Support

- [GitHub Issues](https://github.com/yourusername/monaco-autocomplete/issues)
- [Discussions](https://github.com/yourusername/monaco-autocomplete/discussions)

## Credits

Built with:
- [wxt.dev](https://wxt.dev) - Extension framework
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [OpenRouter](https://openrouter.ai) - LLM API
- [Vercel AI SDK](https://sdk.vercel.ai)
