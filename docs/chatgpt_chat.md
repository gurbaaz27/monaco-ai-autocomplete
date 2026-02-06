# Conversation with ChatGPT

**Date:** 2026-02-05
**Source:** [chat.openai.com](https://chatgpt.com/c/69843557-04b8-83a9-9b21-de8a70f2c41b)

---

### **You**

i am using monaco text editor in my web-app. how to implement and show tab autocompletion in it.

---

### **ChatGPT**

To get Tab to accept / “autocomplete” in Monaco, you mainly need two things:

Provide completions (so the Suggest widget has items)

Turn on Tab completion (so Tab inserts the selected suggestion instead of a literal tab)

1) Enable Tab completion in editor options
Monaco exposes an editor option called tabCompletion with values "on" | "off" | "onlySnippets". [blutorange.github.io+1](https://blutorange.github.io/primefaces-monaco/typedoc/modules/monaco.editor.html?utm_source=chatgpt.com)

```ts
tsconst editor = monaco.editor.create(containerEl, {
  value: "",
  language: "javascript",

  // shows suggestion widget as you type
  quickSuggestions: true,
  suggestOnTriggerCharacters: true,

  // ✅ let Tab accept suggestions
  tabCompletion: "on",           // or "onlySnippets"

  // optional tuning (VS Code–ish behavior knobs)
  acceptSuggestionOnEnter: "on",
  acceptSuggestionOnCommitCharacter: true,
});
```

Notes:

tabCompletion: "on" → Tab can accept normal suggestions. [blutorange.github.io+1](https://blutorange.github.io/primefaces-monaco/typedoc/modules/monaco.editor.html?utm_source=chatgpt.com)

tabCompletion: "onlySnippets" → Tab completion only for snippet-type items. [blutorange.github.io+1](https://blutorange.github.io/primefaces-monaco/typedoc/modules/monaco.editor.html?utm_source=chatgpt.com)

acceptSuggestionOnEnter / acceptSuggestionOnCommitCharacter control whether Enter / commit characters accept suggestions. [GitHub+1](https://github.com/microsoft/monaco-editor/issues/709?utm_source=chatgpt.com)

2) Register a completion provider (your suggestions)
Example provider (works for custom languages too) using registerCompletionItemProvider: [Checkly+1](https://www.checklyhq.com/blog/customizing-monaco/?utm_source=chatgpt.com)

```ts
tsmonaco.languages.registerCompletionItemProvider("javascript", {
  triggerCharacters: [".", "("],
  provideCompletionItems: (model, position) => {
    const word = model.getWordUntilPosition(position);
    const range = new monaco.Range(
      position.lineNumber,
      word.startColumn,
      position.lineNumber,
      word.endColumn
    );

    return {
      suggestions: [
        {
          label: "log",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "console.log($1)",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
        {
          label: "TODO",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "// TODO: $1",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
      ],
    };
  },
});
```

If you want Tab to behave especially nicely, snippets + InsertAsSnippet is the sweet spot (Tab jumps snippet placeholders, etc.).

3) Show the suggestions list on demand (Ctrl+Space / programmatic)
Monaco already supports triggering suggestions (many apps advertise Ctrl+Space). [help.hackerearth.com](https://help.hackerearth.com/hc/en-us/articles/900000796563-the-monaco-editor?utm_source=chatgpt.com)
Programmatically:

```ts
tseditor.trigger("keyboard", "editor.action.triggerSuggest", {});
```

Common gotchas

If you’re embedding the editor inside a form and want Tab to move focus out sometimes, that’s controlled separately by tabFocusMode. If tabFocusMode is on, Tab will leave the editor instead of indenting/completing. (So keep it off if you want Tab completion.) [blutorange.github.io](https://blutorange.github.io/primefaces-monaco/typedoc/modules/monaco.editor.html?utm_source=chatgpt.com)

If Tab still inserts a literal tab: double-check tabCompletion is set to "on" and that the suggest widget actually has a selected item.

If you tell me what language mode you’re using (built-in like javascript/json or a custom language id), I can tailor the completion provider to your tokenizer/grammar and show how to make suggestions context-aware (after keywords, inside strings, etc.).

---

### **You**

so 2 things actually
1. i am creating a chrome extension basically, that would actually interact with the monaco text editor which exists on a website (some online ide)
2. when cursor is placed at a position, i want to generate tab auto completion using ai (something which cursor does)

---

### **ChatGPT**

Got it — you’re basically trying to do Cursor-style AI tab completion from a Chrome extension, on a page that already embeds Monaco (online IDE). That’s doable, but the key constraints are:

Content scripts can’t directly access window.monaco or the editor instances because of the isolated world.

You need to inject a script into the page context to talk to Monaco.

Your extension should do AI calls in the background/service worker, then pass results back to the injected page script, which displays them as inline ghost text and accepts them with Tab.

Below is a practical architecture + implementation outline.

Architecture that works reliably
1) Content script (runs on the IDE page)

Injects a “page script” into the page context.

Sets up a message bridge between:

the injected page script ↔ content script

content script ↔ background/service worker

2) Injected page script (runs in the page JS world)

Finds Monaco editor instance(s).

Hooks cursor/typing events to request completions.

Registers an Inline Completions Provider (ghost text) OR a normal completion provider.

Binds Tab to accept the suggestion.

3) Background/service worker

Calls your AI endpoint (OpenAI / your server).

Returns completion text.

This mirrors how Copilot-like systems are built: the editor UI stays in-page; AI calls happen outside.

Step A — Inject into the page context (required)
content-script.js

```js
js// 1) Inject a script tag so we can access window.monaco/editor instances
const s = document.createElement("script");
s.src = chrome.runtime.getURL("page-bridge.js");
s.onload = () => s.remove();
(document.head || document.documentElement).appendChild(s);

// 2) Relay messages from page -> background and back
window.addEventListener("message", async (event) => {
  if (event.source !== window) return;
  if (!event.data || event.data.type !== "AI_COMPLETION_REQUEST") return;

  const { requestId, payload } = event.data;

  const result = await chrome.runtime.sendMessage({
    type: "AI_COMPLETION_REQUEST",
    requestId,
    payload,
  });

  window.postMessage({
    type: "AI_COMPLETION_RESPONSE",
    requestId,
    result,
  }, "*");
});
```

This is the bridge that lets the page script ask for AI completions and receive them.

Step B — Call AI from background (service worker)
background.js

```js
jschrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type !== "AI_COMPLETION_REQUEST") return;

  (async () => {
    const { payload } = msg;

    // payload example: { prefix, suffix, languageId }
    const completion = await fetch("https://your-api.example.com/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(r => r.json());

    sendResponse({ ok: true, text: completion.text || "" });
  })().catch(err => {
    sendResponse({ ok: false, error: String(err) });
  });

  return true; // keep channel open for async sendResponse
});
```

Tip: If the IDE page has strict CSP, doing fetch from the page might fail. Background fetch avoids that.

Step C — In the page script: hook Monaco + show “ghost text”
The best UX match for Cursor is Inline Completions (ghost text), not the normal suggest widget.
page-bridge.js (injected into the page context)

```js
js(function () {
  function waitForMonaco(timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const t = setInterval(() => {
        if (window.monaco?.editor) {
          clearInterval(t);
          resolve(window.monaco);
        } else if (Date.now() - start > timeoutMs) {
          clearInterval(t);
          reject(new Error("Monaco not found"));
        }
      }, 200);
    });
  }

  function getActiveEditor(monaco) {
    // Many sites store editor refs differently; this is the most common workable heuristic:
    // Try to find the editor whose DOM has focus.
    const editors = monaco.editor.getEditors ? monaco.editor.getEditors() : [];
    if (editors.length) {
      const active = editors.find(ed => ed.hasTextFocus?.());
      return active || editors[0];
    }

    // Fallback: try to find from known internal storage (not guaranteed)
    return null;
  }

  // Simple request/response via window.postMessage
  let seq = 0;
  function requestAICompletion(payload) {
    const requestId = `req_${Date.now()}_${++seq}`;

    return new Promise((resolve) => {
      const handler = (event) => {
        if (event.source !== window) return;
        if (event.data?.type !== "AI_COMPLETION_RESPONSE") return;
        if (event.data?.requestId !== requestId) return;

        window.removeEventListener("message", handler);
        resolve(event.data.result);
      };

      window.addEventListener("message", handler);

      window.postMessage({
        type: "AI_COMPLETION_REQUEST",
        requestId,
        payload,
      }, "*");
    });
  }

  function getContext(model, position, maxChars = 4000) {
    const full = model.getValue();
    const offset = model.getOffsetAt(position);

    const prefix = full.slice(Math.max(0, offset - maxChars), offset);
    const suffix = full.slice(offset, Math.min(full.length, offset + 1000));
    return { prefix, suffix };
  }

  waitForMonaco().then((monaco) => {
    const editor = getActiveEditor(monaco);
    if (!editor) return;

    const model = editor.getModel();
    if (!model) return;

    // ---- Inline completion state
    let lastSuggestion = "";
    let lastAt = 0;
    let inFlight = false;

    // Register inline completion provider
    const disposable = monaco.languages.registerInlineCompletionsProvider(
      model.getLanguageId(),
      {
        provideInlineCompletions: async (model, position, context, token) => {
          // Return the latest computed suggestion as ghost text
          if (!lastSuggestion) return { items: [], dispose: () => {} };

          return {
            items: [{
              insertText: lastSuggestion,
              range: new monaco.Range(
                position.lineNumber,
                position.column,
                position.lineNumber,
                position.column
              ),
            }],
            dispose: () => {},
          };
        },
        freeInlineCompletions: () => {}
      }
    );

    // Tell Monaco to use Tab for inline suggestions
    editor.updateOptions({
      tabCompletion: "on",
      inlineSuggest: { enabled: true },
      quickSuggestions: true,
      suggestOnTriggerCharacters: true,
    });

    // Add a Tab command to accept inline suggestion if present
    editor.addCommand(monaco.KeyCode.Tab, () => {
      editor.trigger("keyboard", "editor.action.inlineSuggest.commit", {});
    });

    // Debounced completion trigger (Cursor-like)
    async function triggerCompletion() {
      const now = Date.now();
      if (inFlight) return;
      if (now - lastAt < 250) return; // throttle
      lastAt = now;

      const pos = editor.getPosition();
      if (!pos) return;

      // Don’t trigger on empty / huge / etc. (tune)
      const { prefix, suffix } = getContext(model, pos);

      inFlight = true;
      const res = await requestAICompletion({
        prefix,
        suffix,
        languageId: model.getLanguageId(),
      });
      inFlight = false;

      if (!res?.ok) {
        lastSuggestion = "";
        return;
      }

      // Normalize: only insert the delta (like Cursor)
      const text = (res.text || "").replace(/\\r\\n/g, "\\n");
      lastSuggestion = text;

      // Ask Monaco to render the inline suggestion
      editor.trigger("keyboard", "editor.action.inlineSuggest.trigger", {});
    }

    // Trigger on typing/cursor changes
    const d1 = editor.onDidChangeCursorPosition(() => triggerCompletion());
    const d2 = editor.onDidChangeModelContent(() => triggerCompletion());

    // Optional: trigger on demand with Ctrl+Space
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, () => {
      triggerCompletion();
    });

    // Cleanup if needed later:
    // disposable.dispose(); d1.dispose(); d2.dispose();
  }).catch(() => {});
})();
```

Why inline suggestions?
Because it gives the “ghost text” experience and then Tab commits it — exactly what Cursor/VS Code Copilot style uses.

Important caveats with “Monaco on someone else’s site”

Finding the actual editor instance

Some IDEs wrap Monaco and may not expose monaco.editor.getEditors().

Sometimes Monaco is in an iframe. Your extension must inject into the iframe too (match patterns + "all_frames": true in manifest).

If you can’t get editors programmatically, you can still often grab them via:

focused DOM node → walk up to find .monaco-editor → map to editor instance (harder)

site-specific global variable (common in internal IDEs)

Keybinding conflicts

The site might already override Tab or use custom keybindings.

Your addCommand(Tab, ...) may not win. In that case you can:

bind a different key (e.g. Alt+Right), or

intercept keydown on .monaco-editor DOM and stop propagation when inline suggest is visible.

Latency

To feel “Cursor-like”, you want:

throttle/debounce

caching by (prefixTail, languageId)

cancel if user types more (token cancellation isn’t fully yours, but you can ignore stale responses)

Security

Don’t send full file contents. Send a window around the cursor.

Strip secrets if needed.

Minimal “Cursor-like” behavior checklist

✅ Ghost text appears automatically while typing (inline suggestions)

✅ Tab accepts suggestion

✅ Suggestions update as cursor moves/typing

✅ Throttle + ignore stale responses

✅ Works from extension via injected page script + background AI calls

If you tell me:

which online IDE/site you’re targeting, and

whether it uses iframes,

…I can suggest the most reliable way to locate the editor instance on that specific page (that’s usually the only “site-specific” part).

---

### **You**

great, this works, 2 doubts:- 
1. now in the editor i am only able to use tab to accept autocomplete suggestion. any way that i am also able to use tab for normal code writing as well (indentation space purposes etc.)?
2. what are the best autocomplete suggestion llm models or services out there i can use to integrate the api part. Should be budget-friendly as well

---

### **ChatGPT**

1) Keep Tab for indentation and accept AI inline suggestions
Right now you’ve overridden Tab unconditionally, so it always commits the inline suggestion. The clean fix is:

Only bind Tab when an inline suggestion is visible

Let Monaco’s default Tab behavior handle indentation otherwise

Monaco supports addCommand(keybinding, handler, context?) where context is a context-key expression. [materiahq.github.io](https://materiahq.github.io/ngx-monaco-editor/api-reference/interfaces/IKeyboardEvent.html?utm_source=chatgpt.com)
✅ Best approach: context-gated Tab binding

```js
js// Accept inline suggestion ONLY when it is visible
editor.addCommand(monaco.KeyCode.Tab, () => {
  editor.trigger("keyboard", "editor.action.inlineSuggest.commit", {});
}, "inlineSuggestionVisible");
```

When inlineSuggestionVisible is true → Tab commits ghost text

Otherwise → Monaco’s normal Tab indentation runs (because your command doesn’t apply)

That’s the same pattern used in VS Code-like keybinding systems (contextual keybindings).
Optional: keep Suggest-widget behavior too
If you also use the suggest widget (dropdown), you might want Tab to accept that when it’s open. In many Monaco/VSCode setups the context key is suggestWidgetVisible. If it exists on your target page, this works:

```js
jseditor.addCommand(monaco.KeyCode.Tab, () => {
  editor.trigger("keyboard", "acceptSelectedSuggestion", {});
}, "suggestWidgetVisible");
```

If acceptSelectedSuggestion doesn’t exist in that build, you can keep Enter for the widget and Tab only for inline.
Important note
Don’t use addCommand(Tab, handler) without a context; that will “steal” Tab everywhere.

2) Budget-friendly LLMs/services for “Cursor-like” tab autocomplete
For AI code autocomplete you care about: latency, cost, reliability, and code quality. In practice, you’ll likely want a fast cheap model for most keystrokes, and optionally a stronger model on-demand (Ctrl+Space / manual trigger).
Here are the most budget-friendly options that are also commonly used for code-completion workloads today:
OpenAI (easy + strong quality, predictable API)

GPT-4.1 nano / mini are often good for autocomplete because they’re relatively cheap and fast, and can handle long context. OpenAI lists token pricing for these models on their pricing pages. [OpenAI Platform+1](https://platform.openai.com/docs/pricing?utm_source=chatgpt.com)

GPT-4.1 family supports very large context windows (useful if you sometimes send larger surrounding code). [OpenAI](https://openai.com/index/gpt-4-1/?utm_source=chatgpt.com)

When to use

Use nano/mini for “every few keystrokes” inline suggestions.

Optionally use a bigger model only when the user explicitly asks for a larger completion.

Google Gemini (very cost-efficient “flash” tier)
If you want very low cost and high speed, Gemini’s “Flash” tier is usually positioned for that. Their official pricing docs are here. [Google AI for Developers](https://ai.google.dev/gemini-api/docs/pricing?utm_source=chatgpt.com)
(Exact model choices and rates depend on the current Gemini lineup, but the “Flash” family is generally the budget/speed option.)
When to use

Great for high-frequency autocomplete calls.

DeepSeek API (often very aggressive pricing)
DeepSeek publishes pricing in their API docs. [DeepSeek API Docs](https://api-docs.deepseek.com/quick_start/pricing?utm_source=chatgpt.com)
They’ve also been known to do major discounting/off-peak pricing strategies. [Reuters](https://www.reuters.com/technology/chinas-deepseek-cuts-off-peak-pricing-by-up-75-2025-02-26/?utm_source=chatgpt.com)
When to use

If you’re optimizing hard for cost and can tolerate experimenting a bit more with prompt/quality tradeoffs.

Practical recommendation (what I’d implement)
Tiered strategy (best UX + cost):

Default inline (automatic): fast cheap model (OpenAI nano/mini, Gemini Flash, or DeepSeek)

Manual “big completion” (Ctrl+Space or button): stronger model (OpenAI larger model / Gemini Pro / etc.)

This prevents you from paying “premium tokens” on every cursor move.

Extra tips to make autocomplete feel Cursor-like without blowing budget

Send only a window around the cursor (e.g., last 2–6k chars prefix + ~1k suffix)

Debounce + throttle (you already do)

Cache by (languageId, prefixTailHash) for a few seconds

Stop requesting when user is rapidly typing

Prefer “completion-only” output (no explanations), to reduce output tokens

If you tell me which provider you’re leaning toward (OpenAI / Gemini / DeepSeek) I can give you a tight prompt format that produces clean “insert-only” completions (and avoids the model returning commentary), plus a good caching + stale-response strategy for extensions.

---

### **You**

Great. about the addCommand with context, how do i first remove the previous registered command so that i can test this?

---

### **ChatGPT**

In Monaco, editor.addCommand(...) returns a command id, and there isn’t a public “removeCommand(id)” API. So you “remove” it by one of these practical approaches:
Option A (recommended): Don’t register the bad Tab command in the first place
If you can edit the injected script, just delete the unconditional Tab binding and replace it with the context-gated one:

```js
js// ❌ remove this (unconditional)
// editor.addCommand(monaco.KeyCode.Tab, () => {
//   editor.trigger("keyboard", "editor.action.inlineSuggest.commit", {});
// });

// ✅ add this (context-gated)
editor.addCommand(
  monaco.KeyCode.Tab,
  () => editor.trigger("keyboard", "editor.action.inlineSuggest.commit", {}),
  "inlineSuggestionVisible"
);
```

If you’re iterating in an extension, that’s usually the easiest: update the script + reload the extension + refresh the page.

Option B: Override the old Tab command by adding a better one (works most of the time)
Monaco picks the command with the highest priority in conflicts. You can register another Tab command that only fires when inlineSuggestionVisible, and then separately handle indentation.

```js
js// 1) Only commit inline suggestion when visible
editor.addCommand(monaco.KeyCode.Tab, () => {
  editor.trigger("keyboard", "editor.action.inlineSuggest.commit", {});
}, "inlineSuggestionVisible");

// 2) For all other cases, explicitly call the default tab/indent action
editor.addCommand(monaco.KeyCode.Tab, () => {
  editor.trigger("keyboard", "tab", {}); // sometimes works depending on build
}, "!inlineSuggestionVisible");
```

Caveat: the "tab" command id is not guaranteed across all Monaco builds (some sites bundle Monaco differently). If "tab" doesn’t work, use Option C.

Option C: Use a keydown DOM listener to “un-steal” Tab
Even if you can’t remove the original command, you can intercept Tab at the DOM layer and decide whether to stop it.

```js
jsconst domNode = editor.getDomNode();
domNode.addEventListener("keydown", (e) => {
  if (e.key !== "Tab") return;

  // if inline suggestion is visible, let Monaco handle it (commit command)
  const inlineVisible = editor._contextKeyService?.getContextKeyValue?.("inlineSuggestionVisible");
  if (inlineVisible) return;

  // otherwise, don't let your previous command run
  // (stop propagation so Monaco keybinding handler doesn't see it)
  e.stopImmediatePropagation();

  // manually indent (insert tab or indent line/selection)
  editor.trigger("keyboard", "editor.action.indentLines", {});
}, true);
```

Caveats:

This uses an internal-ish access (_contextKeyService). It often works, but isn’t officially stable.

Also, editor.action.indentLines might behave differently depending on selection and settings, but it’s a solid default action.

Option D: Dispose and recreate the editor instance (most reliable “reset”)
If you control editor creation, this is the clean “reset everything” approach:

```js
jsconst model = editor.getModel();
editor.dispose();
editor = monaco.editor.create(container, { model, ...options });
```

But on a third-party online IDE, you usually don’t control the lifecycle, so this is often not feasible.

Best practical advice for your extension workflow
Because you’re injecting code, the simplest is:

keep a global guard so you don’t register twice

reload page or re-inject cleanly

Example:

```js
jsif (!window.__myExtTabBindingInstalled) {
  window.__myExtTabBindingInstalled = true;

  editor.addCommand(monaco.KeyCode.Tab, () => {
    editor.trigger("keyboard", "editor.action.inlineSuggest.commit", {});
  }, "inlineSuggestionVisible");
}
```

If you share the exact code you currently use to register the Tab command (and whether you’re using inline suggestions or the suggest widget), I’ll give you a drop-in snippet that:

works on most Monaco bundles,

keeps indentation,

accepts inline suggestion on Tab,

and avoids double-registration when you reload the extension.

---

### **You**

great. !inlineSuggestionVisible worked.
But i am observing something in console, whenever i accept the suggestion with tab, or click somewhere else to not accept the tab, i see this error in console
this.provider.disposeInlineCompletions is not a function

---

### **ChatGPT**

That console error is a Monaco API version mismatch issue.
Some Monaco builds call the cleanup hook named:

disposeInlineCompletions(completions, reason) (newer API, VS Code/Monaco aligned) [Fossies](https://fossies.org/linux/vscode/src/vs/monaco.d.ts?utm_source=chatgpt.com)

…but a lot of examples on the internet use the older hook:

freeInlineCompletions(arg) [GitHub](https://github.com/microsoft/monaco-editor/discussions/3917?utm_source=chatgpt.com)

So when you register a provider that only implements freeInlineCompletions, this Monaco build tries to call disposeInlineCompletions and you get:

this.provider.disposeInlineCompletions is not a function

Fix: implement both cleanup methods (compat shim)
Just add disposeInlineCompletions to your provider, and keep freeInlineCompletions too (harmless). Also: make sure you return a result object that has a dispose() method.

```js
jsmonaco.languages.registerInlineCompletionsProvider(model.getLanguageId(), {
  async provideInlineCompletions(model, position, context, token) {
    // ... your logic
    const result = {
      items: lastSuggestion
        ? [{
            insertText: lastSuggestion,
            range: new monaco.Range(
              position.lineNumber,
              position.column,
              position.lineNumber,
              position.column
            ),
          }]
        : [],
      // ✅ Some builds expect the returned object to be disposable
      dispose() {},
    };

    return result;
  },

  // ✅ Newer Monaco/VS Code-style cleanup hook
  disposeInlineCompletions(completions, reason) {
    // completions is whatever provideInlineCompletions returned
    completions?.dispose?.();
  },

  // ✅ Older Monaco cleanup hook (keep for compatibility)
  freeInlineCompletions(completions) {
    completions?.dispose?.();
  },
});
```

That should eliminate the error when:

you commit with Tab, or

you dismiss suggestions by moving the cursor/clicking elsewhere (which triggers disposal).

If you still see it
It usually means you’re registering the provider in a way that’s not the one Monaco expects (e.g., wrong object shape returned from provideInlineCompletions). The snippet above covers the common expectation: { items: [...], dispose() {} }. [Fossies+1](https://fossies.org/linux/vscode/src/vs/monaco.d.ts?utm_source=chatgpt.com)
If you paste your exact provider object (the registerInlineCompletionsProvider(...) block), I can point to the exact line causing the mismatch.

---

### **You**

great. now suggest the DeepSeek way of code autocompletion approach

---

### **ChatGPT**

Here’s the DeepSeek-style (Cursor-like) code autocomplete approach that fits what you’re building: Fill-In-the-Middle (FIM) with prefix + suffix → model returns the missing text at the cursor.
DeepSeek’s API is OpenAI-compatible, and it has a FIM Completion (Beta) endpoint specifically for this use case. [DeepSeek API Docs+1](https://api-docs.deepseek.com/?utm_source=chatgpt.com)

Why use DeepSeek FIM for tab autocomplete
Normal chat completions are “continue the text”. Cursor-like autocomplete needs “complete between prefix and suffix”. DeepSeek’s FIM Completion (Beta) is designed exactly for that. [DeepSeek API Docs](https://api-docs.deepseek.com/guides/fim_completion?utm_source=chatgpt.com)
Also, pricing is very competitive (and DeepSeek supports caching pricing tiers). [DeepSeek API Docs](https://api-docs.deepseek.com/quick_start/pricing?utm_source=chatgpt.com)

The DeepSeek endpoints you’ll use
FIM Completion (recommended for Cursor-like)

Base URL: https://api.deepseek.com/beta

Endpoint: POST /completions

Model: deepseek-chat (supports FIM beta per docs)

Max tokens for FIM completion is 4K. [DeepSeek API Docs+1](https://api-docs.deepseek.com/guides/fim_completion?utm_source=chatgpt.com)

Standard Chat (fallback / bigger “generate”)

Base URL: https://api.deepseek.com

Endpoint: POST /chat/completions

Models: deepseek-chat, deepseek-reasoner [DeepSeek API Docs+1](https://api-docs.deepseek.com/quick_start/pricing?utm_source=chatgpt.com)

DeepSeek says the API format is compatible with OpenAI, and you can also use https://api.deepseek.com/v1 for OpenAI SDK compatibility. [DeepSeek API Docs](https://api-docs.deepseek.com/?utm_source=chatgpt.com)

What to send from your extension (best practice)
From the editor, capture:

prefix: ~2k–8k chars before cursor

suffix: ~0–1k chars after cursor (helps a lot for correctness)

languageId: e.g. javascript, python

Then call the DeepSeek FIM endpoint. The service worker/background is the best place to do it (avoids CSP issues on the IDE page).

Example: DeepSeek FIM request (service worker / background)

```js
jsasync function deepseekFimComplete({ prefix, suffix, temperature = 0.2, max_tokens = 128 }) {
  const resp = await fetch("https://api.deepseek.com/beta/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      prefix,           // text before cursor
      suffix,           // text after cursor (optional but recommended)
      max_tokens,       // keep small for tab-complete
      temperature,      // low = more stable
      // You can add stop sequences to prevent rambling:
      stop: ["\\n\\n\\n"]  // optional; tune per language
    }),
  });

  if (!resp.ok) throw new Error(`DeepSeek error ${resp.status}`);
  const data = await resp.json();

  // Depending on their response shape, you'll extract the text from the completion.
  // Commonly: data.choices[0].text (OpenAI-style completion)
  return (data.choices?.[0]?.text ?? "").replace(/\\r\\n/g, "\\n");
}
```

Notes:

The DeepSeek docs explicitly say FIM is at base_url=https://api.deepseek.com/beta and POST /completions. [DeepSeek API Docs+1](https://api-docs.deepseek.com/guides/fim_completion?utm_source=chatgpt.com)

Keep max_tokens small (like 32–256) so this stays “autocomplete”, not “generate a whole function”.

Quality tricks (so it feels like Cursor)

Return only insertable text

Strip leading whitespace that duplicates what’s already there

If your model outputs the suffix again, trim it (simple overlap check)

Throttle + ignore stale responses

Send request id with cursor position + model version

If user typed since request started, discard the response

Cache for a few seconds

Key: hash(prefix_tail + "|" + suffix_head + "|" + language)

DeepSeek pricing mentions cache hit/miss tiers; caching on your side also reduces calls. [DeepSeek API Docs](https://api-docs.deepseek.com/quick_start/pricing?utm_source=chatgpt.com)

Trigger rules

Don’t request on every cursor move; prefer:

after onDidChangeModelContent with debounce 150–300ms

on . ( { = newline

or on-demand (Ctrl+Space) for slower completions

Pricing + model choice on DeepSeek
DeepSeek’s pricing page lists token pricing for deepseek-chat / deepseek-reasoner, including cache hit/miss rates and output rates. [DeepSeek API Docs](https://api-docs.deepseek.com/quick_start/pricing?utm_source=chatgpt.com)
For tab autocomplete:

Use deepseek-chat + FIM (fast, cheaper than reasoning mode for this)

Avoid deepseek-reasoner for inline suggestions (overkill + slower)

One more thing: upcoming coding-focused model
Reuters reported DeepSeek may launch a next-gen model focused on coding (reported for mid-Feb 2026), but that’s not something you can rely on until it’s actually in the API docs. [Reuters](https://www.reuters.com/technology/deepseek-launch-new-ai-model-focused-coding-february-information-reports-2026-01-09/?utm_source=chatgpt.com)

If you paste one real completion payload you’re sending today (prefix length + suffix length + language), I can recommend concrete defaults (debounce, max_tokens, stop sequences, and trimming logic) so it’s stable and cheap.

---

### **You**

okay. cursor tab autocompletion doesnt only inserts code at cursor position, it also analyses if current line (or next 2-3 lines, depends) require a modification/deletion as well, and the tab allows you to apply modification/deletion as well. it also lets you jump to next place where similar change might occur. how do i go about doing something like that in monaco

---

### **ChatGPT**

What you’re describing is closer to “AI-powered quick fix / refactor with preview + apply + next” than plain autocomplete.
In Monaco terms, you typically combine:

An edit plan returned by the LLM (multiple edits: insert/replace/delete)

Preview UI (decorations / widgets / optional diff)

Apply + navigate commands (Tab = apply current, then jump to next)

Below is a solid approach that works well in Monaco on third-party sites.

1) Change your “completion” output to a list of edits
Instead of returning a single string, have the model return structured edits.
Recommended response format (JSON)
Ask the LLM to return something like:

```json
json{
  "edits": [
    {
      "startOffset": 12034,
      "endOffset": 12034,
      "text": "foo()"
    },
    {
      "startOffset": 12110,
      "endOffset": 12125,
      "text": ""
    },
    {
      "startOffset": 12200,
      "endOffset": 12230,
      "text": "betterName"
    }
  ],
  "labels": ["Insert call", "Delete unused var", "Rename symbol"]
}
```

startOffset/endOffset are model offsets (easiest to apply reliably)

text: "" means deletion

replace = [startOffset,endOffset) + new text

include multiple edits (current line + next few lines + other occurrences)

Why offsets? Because Monaco makes it easy:

model.getPositionAt(offset) to turn offsets into positions

editor.executeEdits(...) to apply them

2) Preview: show “this will change” with decorations (ghost + strike)
Monaco inline suggestions are great for single insertion, but for replace/delete preview you’ll want decorations.
A simple “edit preview” decoration strategy

Highlight the to-be-changed range (background)

Show a small inline badge/marker

Optionally show replacement text in a hover / content widget

```js
jsfunction offsetsToRange(model, startOffset, endOffset, monaco) {
  const startPos = model.getPositionAt(startOffset);
  const endPos = model.getPositionAt(endOffset);
  return new monaco.Range(
    startPos.lineNumber, startPos.column,
    endPos.lineNumber, endPos.column
  );
}

let decorationIds = [];

function renderEditPreview(editor, monaco, model, edits) {
  const newDecorations = edits.map((e, idx) => {
    const range = offsetsToRange(model, e.startOffset, e.endOffset, monaco);

    return {
      range,
      options: {
        isWholeLine: false,
        className: "ai-edit-range", // style with CSS
        hoverMessage: { value: "AI suggestion:\\n\\n```text\\n" + (e.text || "(delete)") + "\\n```" },
        after: e.text
          ? { content: " ⇢ " + truncate(e.text, 60), inlineClassName: "ai-edit-after" }
          : { content: " ⇢ (delete)", inlineClassName: "ai-edit-delete" },
      },
    };
  });

  decorationIds = editor.deltaDecorations(decorationIds, newDecorations);
}

function truncate(s, n) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
```

CSS (inject once)

```css
css.ai-edit-range { background: rgba(120, 180, 255, 0.18); border-radius: 3px; }
.ai-edit-after { opacity: 0.7; }
.ai-edit-delete { opacity: 0.7; text-decoration: line-through; }
```

This gives you a lightweight “preview” without needing a full diff viewer.

Want it to look exactly like Cursor’s inline diff (green inserts/red deletes)?
You can go further with view zones + content widgets to render a mini inline diff block, but decorations get you 80% fast.

3) Apply the current edit (Tab) and keep indentation when no edit is active
You already fixed Tab indentation with context gating. Now extend it:

Maintain a list of pending AI edits

Track a “current edit index”

If cursor is inside/near a pending edit → Tab applies that edit

Then jump to the next edit

Applying edits

```js
jsfunction applyEdit(editor, monaco, model, edit, source = "ai") {
  const range = offsetsToRange(model, edit.startOffset, edit.endOffset, monaco);

  editor.executeEdits(source, [{
    range,
    text: edit.text,
    forceMoveMarkers: true,
  }]);

  // move cursor to end of inserted text
  const endPos = model.getPositionAt(edit.startOffset + (edit.text?.length ?? 0));
  editor.setPosition(endPos);
  editor.revealPositionInCenter(endPos);
}
```

Find “current” edit under cursor

```js
jsfunction findEditAtCursor(editor, monaco, model, edits) {
  const pos = editor.getPosition();
  if (!pos) return -1;
  const offset = model.getOffsetAt(pos);

  return edits.findIndex(e =>
    offset >= e.startOffset && offset <= e.endOffset
  );
}
```

Tab handler logic

```js
jslet pendingEdits = [];
let currentEditIndex = -1;

editor.addCommand(monaco.KeyCode.Tab, () => {
  const model = editor.getModel();
  if (!model || pendingEdits.length === 0) return;

  const idx = findEditAtCursor(editor, monaco, model, pendingEdits);
  const useIdx = idx !== -1 ? idx : currentEditIndex;

  if (useIdx === -1) return;

  const edit = pendingEdits[useIdx];
  applyEdit(editor, monaco, model, edit);

  // remove the applied edit from the list (and re-render preview)
  pendingEdits.splice(useIdx, 1);
  currentEditIndex = Math.min(useIdx, pendingEdits.length - 1);

  renderEditPreview(editor, monaco, model, pendingEdits);

  // jump to next edit if exists
  if (pendingEdits[currentEditIndex]) {
    const nextStart = model.getPositionAt(pendingEdits[currentEditIndex].startOffset);
    editor.setPosition(nextStart);
    editor.revealPositionInCenter(nextStart);
  }
}, "hasAiEdits && !inlineSuggestionVisible"); // your own context key if you set one
```

Key idea: Only consume Tab when you actually have an AI edit to apply; otherwise indentation works normally.

4) “Jump to next place where similar change might occur”
That’s just navigation over pendingEdits.
Bind keys like:

Alt+] = next

Alt+[ = previous

Esc = dismiss all previews

```js
jsfunction goToEdit(editor, model, monaco, edits, idx) {
  if (idx < 0 || idx >= edits.length) return;
  const p = model.getPositionAt(edits[idx].startOffset);
  editor.setPosition(p);
  editor.revealPositionInCenter(p);
}

editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.BracketRight, () => {
  const model = editor.getModel();
  if (!model || pendingEdits.length === 0) return;
  currentEditIndex = (currentEditIndex + 1) % pendingEdits.length;
  goToEdit(editor, model, monaco, pendingEdits, currentEditIndex);
});

editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.BracketLeft, () => {
  const model = editor.getModel();
  if (!model || pendingEdits.length === 0) return;
  currentEditIndex = (currentEditIndex - 1 + pendingEdits.length) % pendingEdits.length;
  goToEdit(editor, model, monaco, pendingEdits, currentEditIndex);
});

editor.addCommand(monaco.KeyCode.Escape, () => {
  pendingEdits = [];
  currentEditIndex = -1;
  decorationIds = editor.deltaDecorations(decorationIds, []);
});
```

5) How to ask the LLM for these multi-edits
Give it:

prefix (a few thousand chars)

suffix (a bit after cursor)

optionally: full current line + next N lines (helps “modify next lines” behavior)

instruction: return JSON edits with offsets relative to the full document

Two practical ways:
A) Offset-based edits (best, but you must provide the full document or a stable mapping)
If you send only a window (prefix/suffix), offsets become window-relative. That’s fine if you convert to absolute offset:

absolute cursor offset = absCursorOffset

model returns window offsets relative to prefix+suffix

convert to absolute: abs = absCursorOffset - prefix.length + windowOffset

B) Range-based with “anchor text”
Model returns: { "anchorBefore": "...", "anchorAfter":"...", "replacement":"..." }
Then you locate anchors in the model text and compute ranges. More robust when you don’t want to send lots of text, but more code.

6) If you want it to feel very Cursor-like
Cursor’s “inline diff” look is essentially:

highlight deletions in red strike-through

show insertions in green ghost blocks

show a small toolbar: Accept (Tab) / Reject (Esc) / Next

In Monaco you can approximate that with:

Decorations (range highlights + inline before/after text)

Content widget anchored near cursor for the toolbar UI

Optional: View zones for multi-line inserted blocks

The 80/20 implementation path

Keep your current inline suggestion for simple cases

Add the “multi-edit mode” when AI returns more than just an insert

Show multi-edit previews via decorations

Tab applies current edit; Alt+] jumps next; Esc cancels

This gets you close to Cursor without needing complex diff rendering.

If you share how you currently build the AI prompt + what context you send (prefix/suffix sizes), I can give you a tight “LLM → JSON edits” prompt that produces stable, parseable edits (and avoids the model returning prose).

---
