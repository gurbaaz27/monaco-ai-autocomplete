# Quick Start Guide

Get Monaco AI Autocomplete running in 5 minutes!

## Step 1: Install Dependencies

```bash
bun install
```

## Step 2: Build the Project

```bash
bun run build
```

This builds both:
- Core package (`@monaco-autocomplete/core`)
- Chrome extension

## Step 3: Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Navigate to and select: `packages/extension/.output/chrome-mv3`

You should see "Monaco AI Autocomplete" in your extensions list!

## Step 4: Get OpenRouter API Key

1. Go to [openrouter.ai/keys](https://openrouter.ai/keys)
2. Sign up or log in
3. Create a new API key
4. Copy the key

## Step 5: Configure Extension

1. Click the Monaco AI Autocomplete icon in Chrome toolbar
2. Paste your API key in the "API Key" field
3. Select a model (Mistral Codestral recommended)
4. Click **Save Settings**

## Step 6: Test It!

1. Navigate to [godbolt.org](https://godbolt.org)
2. Start typing code:
   ```cpp
   int fibonacci(int n) {
   ```
3. Watch for ghost text suggestions to appear
4. Press **Tab** to accept, **Esc** to dismiss

## Troubleshooting

### "Monaco editor not found"

- The site doesn't use Monaco, or it loads later
- Try refreshing the page
- Check console for errors

### "API key not configured"

- Make sure you saved your API key in the popup
- Check that the extension is enabled (toggle in popup)

### No completions appearing

- Check Chrome DevTools console (F12) for errors
- Verify the extension icon shows enabled
- Try typing more code (needs context)

### "Failed to get completion"

- Check your OpenRouter API key is valid
- Verify you have credits on OpenRouter
- Check network tab for API errors

## What's Next?

- Try different models in settings
- Adjust temperature and max tokens
- Check token usage stats in popup
- Test on other sites (StackBlitz, Repl.it)

## Development Mode

Want to make changes?

```bash
# Terminal 1: Watch core package
cd packages/core && bun run dev

# Terminal 2: Watch extension
cd packages/extension && bun run dev
```

Now changes rebuild automatically!

## Keyboard Shortcuts

- **Tab** - Accept completion
- **Esc** - Dismiss completion
- **Ctrl/Cmd+Space** - Manual trigger

## Support

Issues? Check:
- [README.md](README.md) - Full documentation
- [CONTRIBUTING.md](CONTRIBUTING.md) - Development guide
- [GitHub Issues](https://github.com/yourusername/monaco-autocomplete/issues)

## Tips

1. **Start with Codestral** - Fast and cheap ($0.001/1K tokens)
2. **Lower temperature** - More predictable completions (0.2 recommended)
3. **Check usage** - Monitor costs in the popup
4. **Use caching** - Repeat completions are instant

## Supported Sites

✅ Godbolt Compiler Explorer
✅ StackBlitz
✅ Repl.it
✅ Monaco Playground
✅ Any Monaco-based editor

Enjoy coding with AI assistance! 🚀
