"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Zap,
  Shield,
  Globe,
  Cpu,
  BarChart3,
  ArrowRight,
  Check,
  Github,
  Download,
  Terminal,
  Code2,
  ExternalLink,
} from "lucide-react"
import { Button } from "../components/ui/button"
import Link from "next/link"
import { GithubUrl } from "../lib/config"

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
}

export default function Home() {
  const [githubStars, setGithubStars] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchStars() {
      try {
        const repoPath = new URL(GithubUrl).pathname.replace(/^\/|\/$/g, "")
        const res = await fetch(`https://api.github.com/repos/${repoPath}`)
        if (!res.ok) return
        const data = await res.json()

        if (!cancelled && typeof data.stargazers_count === "number") {
          setGithubStars(data.stargazers_count)
        }
      } catch {
        // ignore errors
      }
    }

    fetchStars()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="min-h-screen bg-background noise">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-primary/15 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-mono text-sm font-semibold tracking-tight">
              monaco.ai
            </span>
          </Link>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
              <a
                href="#features"
                className="hover:text-foreground transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="hover:text-foreground transition-colors"
              >
                Pricing
              </a>
              <Link
                href="/docs"
                className="hover:text-foreground transition-colors"
              >
                Docs
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <a href={GithubUrl} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground gap-1.5"
                >
                  <Github className="w-4 h-4" />
                  {githubStars !== null && (
                    <span className="ml-0.5 text-xs text-mono text-muted-foreground/80">
                      {githubStars.toLocaleString()}
                    </span>
                  )}
                </Button>
              </a>
              <Button size="sm" className="gap-1.5 text-mono text-xs">
                <Download className="w-3.5 h-3.5" />
                Install
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 dot-grid opacity-40" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.03] blur-[100px]" />

        <motion.div
          className="relative max-w-6xl mx-auto px-6"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          <div className="max-w-3xl">
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 text-mono text-xs text-primary/80 tracking-wider uppercase mb-8 border border-primary/20 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Open source &middot; Privacy-first
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-8"
            >
              AI completions
              <br />
              <span className="text-mono">
                for every <span className="text-primary">Monaco</span>
                <br />
                editor.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="text-lg text-muted-foreground max-w-xl leading-relaxed mb-10"
            >
              Ghost text suggestions that feel native. Works on Godbolt,
              StackBlitz, and any page running Monaco -- powered by the model
              you choose.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Button size="lg" className="gap-2 text-mono text-sm h-12 px-6">
                Add to Chrome
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Link href="/docs">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-sm h-12 px-6 border-border/60"
                >
                  Read the docs
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Code Demo */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-20 glow-lg rounded-xl overflow-hidden"
          >
            <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
              {/* Editor chrome */}
              <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                  </div>
                  <span className="text-mono text-xs text-muted-foreground">
                    fibonacci.cpp
                  </span>
                </div>
                <span className="text-mono text-[11px] text-muted-foreground/60">
                  godbolt.org
                </span>
              </div>

              {/* Editor content */}
              <div className="p-6 text-mono text-sm leading-7 min-h-[240px]">
                <div className="flex">
                  <span className="w-8 text-right text-muted-foreground/40 select-none mr-6">
                    1
                  </span>
                  <span>
                    <span className="text-[#c678dd]">int</span>{" "}
                    <span className="text-[#61afef]">fibonacci</span>
                    <span className="text-muted-foreground">(</span>
                    <span className="text-[#c678dd]">int</span>{" "}
                    <span className="text-[#e06c75]">n</span>
                    <span className="text-muted-foreground">)</span>{" "}
                    <span className="text-muted-foreground">{"{"}</span>
                  </span>
                </div>
                <div className="flex">
                  <span className="w-8 text-right text-muted-foreground/40 select-none mr-6">
                    2
                  </span>
                  <span className="pl-6">
                    <span className="text-[#c678dd]">if</span>{" "}
                    <span className="text-muted-foreground">(</span>
                    <span className="text-[#e06c75]">n</span>{" "}
                    <span className="text-muted-foreground">&lt;=</span>{" "}
                    <span className="text-[#d19a66]">1</span>
                    <span className="text-muted-foreground">)</span>{" "}
                    <span className="text-[#c678dd]">return</span>{" "}
                    <span className="text-[#e06c75]">n</span>
                    <span className="text-muted-foreground">;</span>
                  </span>
                </div>
                <div className="flex">
                  <span className="w-8 text-right text-muted-foreground/40 select-none mr-6">
                    3
                  </span>
                  <span className="pl-6">
                    <span className="text-[#c678dd]">return</span>{" "}
                    <span className="text-[#61afef]">fibonacci</span>
                    <span className="text-muted-foreground">(</span>
                    <span className="text-[#e06c75]">n</span>{" "}
                    <span className="text-muted-foreground">-</span>{" "}
                    <span className="text-[#d19a66]">1</span>
                    <span className="text-muted-foreground">)</span>{" "}
                    <span className="text-muted-foreground">+</span>{" "}
                    <span className="text-[#61afef]">fibonacci</span>
                    <span className="text-muted-foreground">(</span>
                    <span className="text-[#e06c75]">n</span>{" "}
                    <span className="text-muted-foreground">-</span>{" "}
                    <span className="text-[#d19a66]">2</span>
                    <span className="text-muted-foreground">);</span>
                  </span>
                </div>
                <div className="flex">
                  <span className="w-8 text-right text-muted-foreground/40 select-none mr-6">
                    4
                  </span>
                  <span className="text-muted-foreground">{"}"}</span>
                </div>
                <div className="flex mt-2">
                  <span className="w-8 text-right text-muted-foreground/40 select-none mr-6">
                    5
                  </span>
                  <span />
                </div>
                <div className="flex">
                  <span className="w-8 text-right text-muted-foreground/40 select-none mr-6">
                    6
                  </span>
                  <span>
                    <span className="text-[#c678dd]">int</span>{" "}
                    <span className="text-[#61afef]">main</span>
                    <span className="text-muted-foreground">()</span>{" "}
                    <span className="text-muted-foreground">{"{"}</span>
                  </span>
                </div>
                <div className="flex">
                  <span className="w-8 text-right text-muted-foreground/40 select-none mr-6">
                    7
                  </span>
                  <span className="pl-6">
                    <span className="text-muted-foreground">
                      std::cout &lt;&lt;{" "}
                    </span>
                    <span className="cursor-blink" />
                    <span className="text-primary/40 italic">
                      {" "}
                      fibonacci(10) &lt;&lt; std::endl;
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-4 pl-14">
                  <span className="text-[10px] text-mono text-primary/60 bg-primary/5 border border-primary/10 rounded px-2 py-0.5">
                    Tab to accept
                  </span>
                  <span className="text-[10px] text-mono text-muted-foreground/40">
                    Esc to dismiss
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-28">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="mb-16">
              <span className="text-mono text-xs text-primary/70 tracking-wider uppercase">
                Features
              </span>
              <h2 className="text-4xl font-bold mt-3 tracking-tight">
                Built different.
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  transition={{ delay: i * 0.06 }}
                  className="group rounded-xl border border-border/50 bg-card/50 p-6 hover:glow-sm transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-5 group-hover:bg-primary/10 transition-colors">
                    <f.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="font-semibold mb-2 text-[15px]">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {f.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-28 border-y border-border/40">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="mb-16">
              <span className="text-mono text-xs text-primary/70 tracking-wider uppercase">
                Setup
              </span>
              <h2 className="text-4xl font-bold mt-3 tracking-tight">
                Three steps. One minute.
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {steps.map((step, i) => (
                <motion.div
                  key={step.title}
                  variants={fadeUp}
                  transition={{ delay: i * 0.1 }}
                  className="relative"
                >
                  <div className="text-mono text-6xl font-bold text-border/60 absolute -top-2 right-4">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="relative rounded-xl border border-border/50 bg-card/30 p-6 pt-8">
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                      <step.icon className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-28">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="mb-16">
              <span className="text-mono text-xs text-primary/70 tracking-wider uppercase">
                Pricing
              </span>
              <h2 className="text-4xl font-bold mt-3 tracking-tight">
                Pay for what you use. Nothing more.
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
              {/* Free */}
              <motion.div
                variants={fadeUp}
                className="rounded-xl border border-border/50 bg-card/30 p-8"
              >
                <span className="text-mono text-xs text-muted-foreground tracking-wider uppercase">
                  Extension
                </span>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-bold text-mono">$0</span>
                  <span className="text-muted-foreground ml-2">forever</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "Chrome extension",
                    "All features",
                    "Unlimited use",
                    "Open source",
                    "Community support",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full border-border/60">
                  Install free
                </Button>
              </motion.div>

              {/* API */}
              <motion.div
                variants={fadeUp}
                className="rounded-xl border border-primary/30 bg-card/30 p-8 relative glow-sm"
              >
                <span className="absolute top-4 right-4 text-mono text-[10px] text-primary bg-primary/10 rounded-full px-2.5 py-0.5 uppercase tracking-wider">
                  Recommended
                </span>
                <span className="text-mono text-xs text-muted-foreground tracking-wider uppercase">
                  API usage
                </span>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-bold text-mono">~$0.05</span>
                  <span className="text-muted-foreground ml-2">
                    /1k completions
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "OpenRouter API access",
                    "50+ models available",
                    "Codestral recommended",
                    "Pay-as-you-go",
                    "No commitment",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="w-full gap-2">
                    Get API key
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 border-t border-border/40">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="max-w-2xl"
          >
            <motion.h2
              variants={fadeUp}
              className="text-4xl font-bold tracking-tight mb-6"
            >
              Start completing smarter.
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg text-muted-foreground mb-8"
            >
              Install the extension, paste your API key, and let AI handle the
              boilerplate.
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap items-center gap-4"
            >
              <Button size="lg" className="gap-2 text-mono text-sm h-12 px-6">
                Add to Chrome
                <ArrowRight className="w-4 h-4" />
              </Button>
              <a href={GithubUrl} target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-6 gap-2 border-border/60"
                >
                  <Github className="w-4 h-4" />
                  Star on GitHub
                </Button>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center">
                  <Zap className="w-3 h-3 text-primary" />
                </div>
                <span className="text-mono text-sm font-semibold">
                  monaco.ai
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI code completions for Monaco editors. Open source,
                privacy-first.
              </p>
            </div>
            {footerSections.map((section) => (
              <div key={section.title}>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  {section.title}
                </h4>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-border/30 text-xs text-muted-foreground/60">
            &copy; {new Date().getFullYear()} Monaco AI. MIT License.
          </div>
        </div>
      </footer>
    </main>
  )
}

const features = [
  {
    icon: Zap,
    title: "Ghost text completions",
    description:
      "Inline suggestions that appear as you type. Accept with Tab, dismiss with Esc. Feels native.",
  },
  {
    icon: Cpu,
    title: "Choose your model",
    description:
      "Mistral Codestral, Claude, GPT-4, Llama, DeepSeek -- use whatever fits your workflow and budget.",
  },
  {
    icon: Shield,
    title: "Privacy-first",
    description:
      "All data stored locally in your browser. No telemetry, no tracking. Your code never touches our servers.",
  },
  {
    icon: Globe,
    title: "Works everywhere",
    description:
      "Godbolt, StackBlitz, Repl.it, CodeSandbox -- any webpage running a Monaco editor instance.",
  },
  {
    icon: Terminal,
    title: "Context-aware",
    description:
      "Sends surrounding code context (prefix + suffix) to the model for accurate FIM completions.",
  },
  {
    icon: BarChart3,
    title: "Usage tracking",
    description:
      "Real-time token counts, request logs, and cost estimation built into the extension popup.",
  },
]

const steps = [
  {
    icon: Download,
    title: "Install extension",
    description:
      "Add Monaco AI to Chrome from the Web Store. One click, no config files.",
  },
  {
    icon: Code2,
    title: "Paste API key",
    description:
      "Get a key from OpenRouter ($5 free credits), paste it in the popup settings.",
  },
  {
    icon: Zap,
    title: "Start coding",
    description:
      "Navigate to any Monaco editor. Ghost text appears as you type. That's it.",
  },
]

const footerSections = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Documentation", href: "/docs" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "GitHub", href: GithubUrl },
      { label: "npm package", href: "https://npmjs.com" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "MIT License", href: "/license" },
    ],
  },
]
