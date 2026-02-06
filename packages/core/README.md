# @monaco-autocomplete/core

Core package for AI-powered Monaco Editor autocompletion. This package provides the integration layer between Monaco Editor and LLM APIs.

## Installation

```bash
npm install @monaco-autocomplete/core
# or
bun add @monaco-autocomplete/core
```

## Peer Dependencies

Requires `monaco-editor` >= 0.45.0

## Usage

### Basic Setup

```typescript
import { MonacoAutocomplete } from '@monaco-autocomplete/core';
import * as monaco from 'monaco-editor';

// Create your Monaco editor
const editor = monaco.editor.create(document.getElementById('container'), {
  value: 'console.log("Hello");',
  language: 'javascript'
});

// Initialize autocomplete
const autocomplete = new MonacoAutocomplete({
  monaco: monaco,
  editor: editor,
  llmClient: async (request) => {
    // Call your LLM API
    const response = await fetch('https://api.example.com/complete', {
      method: 'POST',
      body: JSON.stringify(request)
    });
    const data = await response.json();
    return { text: data.completion };
  },
  config: {
    debounceMs: 250,      // Delay before triggering
    maxTokens: 128,       // Max completion tokens
    temperature: 0.2      // LLM temperature
  }
});

// Enable autocomplete
autocomplete.enable();
```

### API Reference

#### `MonacoAutocomplete`

Main class for Monaco integration.

**Constructor Options:**
```typescript
{
  monaco: any;              // Monaco instance (window.monaco)
  editor: any;              // Monaco editor instance
  llmClient: LLMClient;     // Function to call your LLM
  config?: {
    debounceMs?: number;    // Default: 250
    maxTokens?: number;     // Default: 128
    temperature?: number;   // Default: 0.2
  }
}
```

**Methods:**
- `enable()` - Start providing completions
- `disable()` - Temporarily disable
- `dispose()` - Clean up all resources

**Example:**
```typescript
const autocomplete = new MonacoAutocomplete({
  monaco,
  editor,
  llmClient: myLLMClient
});

autocomplete.enable();

// Later...
autocomplete.disable();  // Temporarily stop
autocomplete.enable();   // Resume

// Cleanup
autocomplete.dispose();
```

#### `LLMClient` Type

Function signature for your LLM integration:

```typescript
type LLMClient = (request: CompletionRequest) => Promise<CompletionResponse>;

interface CompletionRequest {
  prefix: string;        // Code before cursor (~4000 chars)
  suffix: string;        // Code after cursor (~1000 chars)
  languageId: string;    // Monaco language ID (e.g., 'javascript')
  cursorOffset: number;  // Cursor position in file
}

interface CompletionResponse {
  text?: string;         // The completion text
  tokensUsed?: {         // Optional usage tracking
    prompt: number;
    completion: number;
    total: number;
  };
  cached?: boolean;      // Optional cache indicator
}
```

### Advanced Usage

#### Custom LLM Client

```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const llmClient = async (request) => {
  const prompt = `Complete this code:\n${request.prefix}`;

  const result = await generateText({
    model: openai('gpt-4'),
    prompt,
    maxTokens: 128
  });

  return {
    text: result.text,
    tokensUsed: {
      prompt: result.usage.promptTokens,
      completion: result.usage.completionTokens,
      total: result.usage.totalTokens
    }
  };
};
```

#### FIM (Fill-In-Middle) Format

For models supporting FIM:

```typescript
const llmClient = async (request) => {
  const prompt = `<fim_prefix>${request.prefix}<fim_suffix>${request.suffix}<fim_middle>`;

  const result = await generateText({
    model: codestral,
    prompt
  });

  return { text: result.text };
};
```

#### Managing Multiple Editors

```typescript
const editors = monaco.editor.getEditors();
const instances = [];

for (const editor of editors) {
  const autocomplete = new MonacoAutocomplete({
    monaco,
    editor,
    llmClient
  });
  autocomplete.enable();
  instances.push(autocomplete);
}

// Cleanup all
instances.forEach(instance => instance.dispose());
```

## Features

- ✅ **Inline completions** - Ghost text that doesn't disrupt editing
- ✅ **Smart debouncing** - Reduces API calls
- ✅ **Context extraction** - Sends relevant code to LLM
- ✅ **Keyboard shortcuts** - Tab to accept, Esc to dismiss
- ✅ **Multi-editor support** - Handle multiple editors on one page
- ✅ **Language-aware** - Respects Monaco language IDs

## Keyboard Shortcuts

Default keybindings:

- **Tab** - Accept inline suggestion
- **Esc** - Clear suggestion
- **Ctrl/Cmd+Space** - Manual trigger

## Utilities

### `extractContext`

Utility function to extract code context from a Monaco model:

```typescript
import { extractContext } from '@monaco-autocomplete/core';

const model = editor.getModel();
const position = editor.getPosition();

const { prefix, suffix, offset } = extractContext(model, position);
```

### `debounce`

Simple debounce utility:

```typescript
import { debounce } from '@monaco-autocomplete/core';

const debouncedFn = debounce(() => {
  console.log('Called after delay');
}, 250);
```

## Monaco Compatibility

This package is compatible with Monaco Editor versions:

- ✅ 0.45.0+
- ✅ 0.46.0+
- ✅ 0.47.0+
- ✅ Latest

Works with both AMD and ESM Monaco builds.

## Browser Support

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari 15+

## TypeScript

Full TypeScript support with exported types:

```typescript
import type {
  CompletionRequest,
  CompletionResponse,
  MonacoAutocompleteConfig,
  LLMClient
} from '@monaco-autocomplete/core';
```

## Examples

See the `/examples` directory for:

- Basic setup
- OpenAI integration
- Anthropic Claude integration
- OpenRouter integration
- Custom caching layer

## License

MIT

## Contributing

Issues and PRs welcome! Please see [CONTRIBUTING.md](../../CONTRIBUTING.md).
