# Contributing to Monaco AI Autocomplete

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

### Prerequisites

- [Bun](https://bun.sh) v1.0 or higher
- Node.js 18+ (for compatibility)
- Chrome browser for testing

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/monaco-autocomplete.git
cd monaco-autocomplete

# Install dependencies
bun install

# Build the core package
bun run build:core

# Start development mode
bun run dev
```

### Project Structure

```
monaco-ai-autocomplete/
├── packages/
│   ├── core/                    # Publishable npm package
│   │   ├── src/
│   │   │   ├── monaco/          # Monaco integration
│   │   │   ├── types/           # TypeScript types
│   │   │   └── utils/           # Utilities
│   │   └── package.json
│   │
│   └── extension/               # Chrome extension
│       ├── entrypoints/
│       │   ├── background.ts    # Service worker
│       │   ├── content.ts       # Content script
│       │   ├── injected.ts      # Page script
│       │   └── popup/           # React UI
│       └── wxt.config.ts
```

## Development Workflow

### Making Changes

1. **Create a branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Core package: `packages/core/src/`
   - Extension: `packages/extension/entrypoints/`

3. **Test your changes**

   ```bash
   # Rebuild core if needed
   bun run build:core

   # Load extension in Chrome
   # Navigate to chrome://extensions
   # Load unpacked: packages/extension/.output/chrome-mv3
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: description of your changes"
   ```

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:

```
feat: add support for multi-edit navigation
fix: prevent duplicate editor initialization
docs: update installation instructions
refactor: simplify completion provider logic
```

### Testing

#### Manual Testing

1. **Test on Godbolt**
   - Navigate to https://godbolt.org
   - Write code and verify completions appear
   - Test keyboard shortcuts (Tab, Esc, Ctrl+Space)

2. **Test on StackBlitz**
   - Navigate to https://stackblitz.com
   - Verify Monaco detection works
   - Test completions

3. **Test Edge Cases**
   - Multiple editors on same page
   - Dynamically created editors
   - Network errors
   - Invalid API key

#### Extension Testing Checklist

- [ ] Completions appear within 500ms
- [ ] Tab accepts completion
- [ ] Esc dismisses completion
- [ ] API key saves correctly
- [ ] Token usage updates
- [ ] Cache works (instant repeat completions)
- [ ] Works on multiple sites
- [ ] No console errors

### Code Style

- Use TypeScript strict mode
- Use functional programming patterns
- Prefer const over let
- Use async/await over promises
- Add JSDoc comments for public APIs
- Keep functions small and focused

Example:

```typescript
/**
 * Extracts code context around cursor position
 * @param model - Monaco editor model
 * @param position - Cursor position
 * @returns Code prefix, suffix, and offset
 */
export function extractContext(
  model: any,
  position: any,
): { prefix: string; suffix: string; offset: number } {
  // Implementation
}
```

## Pull Request Process

1. **Update documentation** if needed
2. **Test thoroughly** on multiple sites
3. **Update CHANGELOG.md** with your changes
4. **Create pull request** with clear description
5. **Link related issues** if applicable

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Tested on Godbolt
- [ ] Tested on StackBlitz
- [ ] Tested edge cases
- [ ] No console errors

## Screenshots (if applicable)

## Checklist

- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] CHANGELOG updated
```

## Areas for Contribution

### High Priority

- [ ] Multi-edit support with Alt+[/] navigation
- [ ] Firefox extension support
- [ ] Context-aware trigger improvements
- [ ] Better error handling and user feedback
- [ ] Automated tests

### Nice to Have

- [ ] Site-specific adapters (better context extraction)
- [ ] Statistics export feature
- [ ] Custom prompt templates
- [ ] Ollama local model support
- [ ] VSCode extension

### Documentation

- [ ] More code examples
- [ ] Video tutorials
- [ ] API documentation improvements
- [ ] Troubleshooting guide

## Architecture Guidelines

### Core Package

- Keep it framework-agnostic
- No dependencies on Chrome APIs
- Export clear, typed interfaces
- Support both ESM and CJS if possible

### Extension

- Keep background worker lightweight
- Minimize message passing
- Use efficient caching strategies
- Handle errors gracefully

### Communication

- Page → Content → Background (one direction)
- Background responds via callback
- Use request IDs for tracking

## Questions?

- Open a [Discussion](https://github.com/yourusername/monaco-autocomplete/discussions)
- Check [existing issues](https://github.com/yourusername/monaco-autocomplete/issues)
- Read the [documentation](README.md)

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn
- Follow the project's technical direction

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
