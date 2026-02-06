'use client';

import { Download, Key, Settings, Code2, Terminal, ExternalLink, ArrowLeft, Zap, Command } from 'lucide-react';
import Link from 'next/link';

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="px-2 py-1 text-mono text-xs bg-secondary rounded border border-border/60 text-foreground">
      {children}
    </kbd>
  );
}

function StepCard({
  step,
  icon: Icon,
  title,
  description,
  children,
}: {
  step: number;
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative group">
      <div className="absolute -left-12 top-6 text-mono text-4xl font-bold text-border/60 select-none hidden lg:block">
        {String(step).padStart(2, '0')}
      </div>
      <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-border">
        <div className="px-6 py-5 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background dot-grid">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-mono text-sm font-semibold tracking-tight">monaco.ai</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/#features"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Features
            </Link>
            <span className="text-xs text-primary font-medium">Docs</span>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-12">
        <div className="space-y-3">
          <p className="text-mono text-xs text-primary tracking-wider uppercase">Documentation</p>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Get started in 60 seconds
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg">
            Install the extension, add your API key, and start getting AI completions
            on any Monaco editor.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="lg:pl-16 space-y-6">
          <StepCard
            step={1}
            icon={Download}
            title="Install the extension"
            description="Add Monaco AI to Chrome"
          >
            <ol className="space-y-3 text-sm text-foreground/80">
              <li className="flex gap-3">
                <span className="text-mono text-primary text-xs mt-0.5">01</span>
                <span>Visit the Chrome Web Store</span>
              </li>
              <li className="flex gap-3">
                <span className="text-mono text-primary text-xs mt-0.5">02</span>
                <span>Click &quot;Add to Chrome&quot;</span>
              </li>
              <li className="flex gap-3">
                <span className="text-mono text-primary text-xs mt-0.5">03</span>
                <span>Confirm the installation prompt</span>
              </li>
            </ol>
            <button className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
              <Download className="w-3.5 h-3.5" />
              Chrome Web Store
            </button>
          </StepCard>

          <StepCard
            step={2}
            icon={Key}
            title="Get your API key"
            description="Free credits included with OpenRouter"
          >
            <ol className="space-y-3 text-sm text-foreground/80">
              <li className="flex gap-3">
                <span className="text-mono text-primary text-xs mt-0.5">01</span>
                <span>
                  Go to{' '}
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    openrouter.ai/keys
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-mono text-primary text-xs mt-0.5">02</span>
                <span>Create an account or sign in</span>
              </li>
              <li className="flex gap-3">
                <span className="text-mono text-primary text-xs mt-0.5">03</span>
                <span>Create a new key and copy it</span>
              </li>
            </ol>
            <div className="mt-5 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-xs text-muted-foreground">
                <span className="text-primary font-medium">Tip</span> — OpenRouter includes $5
                in free credits. Most completions cost &lt;$0.001.
              </p>
            </div>
          </StepCard>

          <StepCard
            step={3}
            icon={Settings}
            title="Configure the extension"
            description="Paste your key and pick a model"
          >
            <ol className="space-y-3 text-sm text-foreground/80">
              <li className="flex gap-3">
                <span className="text-mono text-primary text-xs mt-0.5">01</span>
                <span>Click the Monaco AI icon in your toolbar</span>
              </li>
              <li className="flex gap-3">
                <span className="text-mono text-primary text-xs mt-0.5">02</span>
                <span>Paste your API key</span>
              </li>
              <li className="flex gap-3">
                <span className="text-mono text-primary text-xs mt-0.5">03</span>
                <span>
                  Select a model — <span className="text-mono text-xs text-primary">Codestral</span>{' '}
                  recommended for speed
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-mono text-primary text-xs mt-0.5">04</span>
                <span>Save configuration</span>
              </li>
            </ol>
          </StepCard>

          <StepCard
            step={4}
            icon={Code2}
            title="Start coding"
            description="Try it on any Monaco editor"
          >
            <p className="text-sm text-foreground/80 mb-4">
              Navigate to any of these sites and start typing:
            </p>
            <div className="space-y-2">
              {[
                { name: 'Godbolt Compiler Explorer', url: 'https://godbolt.org' },
                { name: 'StackBlitz', url: 'https://stackblitz.com' },
                { name: 'Repl.it', url: 'https://repl.it' },
              ].map((site) => (
                <a
                  key={site.url}
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/50 transition-colors group"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                    {site.name}
                  </span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
            <div className="mt-5 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <p className="text-xs text-muted-foreground">
                <span className="text-emerald-400 font-medium">What to expect</span> — Ghost text
                appears as you type. Press <Kbd>Tab</Kbd> to accept, <Kbd>Esc</Kbd> to dismiss.
              </p>
            </div>
          </StepCard>
        </div>
      </section>

      {/* Keyboard Shortcuts */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="lg:pl-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <Command className="w-4 h-4 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Keyboard shortcuts</h2>
          </div>

          <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden divide-y divide-border/40">
            {[
              { action: 'Accept suggestion', keys: 'Tab' },
              { action: 'Dismiss suggestion', keys: 'Esc' },
              { action: 'Trigger manually', keys: 'Ctrl+Space' },
            ].map((shortcut) => (
              <div
                key={shortcut.action}
                className="flex items-center justify-between px-6 py-3.5"
              >
                <span className="text-sm text-foreground/80">{shortcut.action}</span>
                <Kbd>{shortcut.keys}</Kbd>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="lg:pl-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <Terminal className="w-4 h-4 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Troubleshooting</h2>
          </div>

          <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden divide-y divide-border/40">
            {[
              {
                q: 'No suggestions appearing?',
                items: [
                  'Check that the extension is enabled in the popup',
                  'Verify your API key is correct',
                  'Open DevTools (F12) and check for errors',
                  'Ensure the page has a Monaco editor',
                ],
              },
              {
                q: 'Suggestions too slow?',
                items: [
                  'Switch to Codestral (fastest model)',
                  'Reduce max tokens in settings',
                  'Check your connection',
                ],
              },
              {
                q: 'Costs too high?',
                items: [
                  'Use Codestral — $0.001/1K tokens',
                  'Lower max tokens to 64 or 32',
                  'Reduce temperature for deterministic output',
                ],
              },
            ].map((section) => (
              <div key={section.q} className="px-6 py-4">
                <h4 className="text-sm font-medium text-foreground mb-2">{section.q}</h4>
                <ul className="space-y-1.5">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="text-border mt-0.5">—</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="lg:pl-16">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-8">
            <h3 className="text-lg font-semibold text-foreground mb-2">Need help?</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Check the GitHub repository for issues, discussions, and examples.
            </p>
            <div className="flex gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
                GitHub
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border/60 text-foreground text-xs font-medium hover:bg-secondary/50 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
                Discussions
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-xs text-muted-foreground text-center">
            monaco.ai — Open source, privacy-first AI autocomplete
          </p>
        </div>
      </footer>
    </div>
  );
}
