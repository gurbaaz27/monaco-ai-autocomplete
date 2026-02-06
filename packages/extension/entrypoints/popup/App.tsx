import { useState, useEffect } from "react"
import ReactDOM from "react-dom/client"
import {
  Zap,
  Settings2,
  Eye,
  EyeOff,
  Check,
  ExternalLink,
  Activity,
  ChevronDown,
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Select } from "../../components/ui/select"
import { Slider } from "../../components/ui/slider"
import { Switch } from "../../components/ui/switch"
import "./globals.css"

interface UsageData {
  daily: Record<
    string,
    {
      promptTokens: number
      completionTokens: number
      requests: number
      cost: number
    }
  >
  total: {
    promptTokens: number
    completionTokens: number
    requests: number
  }
}

interface Config {
  apiKey: string
  model: string
  temperature: number
  maxTokens: number
  enabled: boolean
}

const MODELS = [
  { value: "mistralai/codestral-latest", label: "Codestral", tag: "fast" },
  {
    value: "anthropic/claude-3.5-sonnet",
    label: "Claude 3.5 Sonnet",
    tag: "quality",
  },
  { value: "openai/gpt-4-turbo", label: "GPT-4 Turbo", tag: null },
  {
    value: "meta-llama/llama-3.1-70b-instruct",
    label: "Llama 3.1 70B",
    tag: "open",
  },
  { value: "deepseek/deepseek-coder", label: "DeepSeek Coder", tag: "cheap" },
  {
    value: "arcee-ai/trinity-large-preview:free",
    label: "Trinity Large Preview",
    tag: "free",
  },
]

function App() {
  const [config, setConfig] = useState<Config>({
    apiKey: "",
    model: "mistralai/codestral-latest",
    temperature: 0.2,
    maxTokens: 128,
    enabled: true,
  })
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [showApiKey, setShowApiKey] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeSection, setActiveSection] = useState<"stats" | "config">(
    "stats",
  )

  useEffect(() => {
    loadConfig()
    loadUsage()
  }, [])

  const loadConfig = async () => {
    const result = await chrome.storage.sync.get([
      "apiKey",
      "model",
      "temperature",
      "maxTokens",
      "enabled",
    ])
    setConfig({
      apiKey: result.apiKey || "",
      model: result.model || "mistralai/codestral-latest",
      temperature: result.temperature ?? 0.2,
      maxTokens: result.maxTokens ?? 128,
      enabled: result.enabled ?? true,
    })
  }

  const loadUsage = async () => {
    const result = await chrome.storage.local.get(["usage"])
    setUsage(
      result.usage || {
        daily: {},
        total: { promptTokens: 0, completionTokens: 0, requests: 0 },
      },
    )
  }

  const saveConfig = async () => {
    await chrome.storage.sync.set({
      apiKey: config.apiKey,
      model: config.model,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      enabled: config.enabled,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const today = new Date().toISOString().split("T")[0]
  const todayUsage = usage?.daily[today] || {
    promptTokens: 0,
    completionTokens: 0,
    requests: 0,
    cost: 0,
  }
  const totalTokens = todayUsage.promptTokens + todayUsage.completionTokens
  const currentModel = MODELS.find((m) => m.value === config.model)

  return (
    <div className="w-[380px] min-h-[520px] bg-background dot-grid">
      {/* Header */}
      <div className="relative border-b border-border/60 px-5 py-4">
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(187_80%_48%/0.04)] to-transparent" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-[hsl(187_80%_48%/0.12)] flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              {config.enabled && (
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background" />
              )}
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground tracking-tight text-mono">
                monaco.ai
              </h1>
              <p className="text-[10px] text-muted-foreground tracking-wider uppercase">
                {config.enabled ? "Active" : "Paused"}
              </p>
            </div>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(enabled) => setConfig({ ...config, enabled })}
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-border/60">
        <button
          onClick={() => setActiveSection("stats")}
          className={`flex-1 py-2.5 text-xs font-medium tracking-wide transition-colors relative ${
            activeSection === "stats"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            Usage
          </span>
          {activeSection === "stats" && (
            <div className="absolute bottom-0 left-4 right-4 h-px bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveSection("config")}
          className={`flex-1 py-2.5 text-xs font-medium tracking-wide transition-colors relative ${
            activeSection === "config"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <Settings2 className="w-3.5 h-3.5" />
            Config
          </span>
          {activeSection === "config" && (
            <div className="absolute bottom-0 left-4 right-4 h-px bg-primary" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {activeSection === "stats" ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              <StatCard label="Tokens" value={totalTokens.toLocaleString()} />
              <StatCard
                label="Requests"
                value={todayUsage.requests.toString()}
              />
              <StatCard label="Cost" value={`$${todayUsage.cost.toFixed(3)}`} />
            </div>

            {/* Token Breakdown */}
            <div className="rounded-lg border border-border/60 glow-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Token budget
                </span>
                <span className="text-mono text-xs text-foreground">
                  {totalTokens.toLocaleString()} / 10,000
                </span>
              </div>
              <div className="h-1 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-[hsl(var(--accent))] transition-all duration-500"
                  style={{
                    width: `${Math.min((totalTokens / 10000) * 100, 100)}%`,
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-[11px] text-muted-foreground">
                    Prompt:{" "}
                    <span className="text-mono text-foreground">
                      {todayUsage.promptTokens}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent))]" />
                  <span className="text-[11px] text-muted-foreground">
                    Output:{" "}
                    <span className="text-mono text-foreground">
                      {todayUsage.completionTokens}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Active Model */}
            <div className="rounded-lg border border-border/60 p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Model
                </span>
                <p className="text-sm font-medium text-mono">
                  {currentModel?.label || config.model}
                </p>
              </div>
              {currentModel?.tag && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium uppercase tracking-wider">
                  {currentModel.tag}
                </span>
              )}
            </div>
          </>
        ) : (
          <>
            {/* API Key */}
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-xs text-muted-foreground">
                API Key
              </Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  value={config.apiKey}
                  onChange={(e) =>
                    setConfig({ ...config, apiKey: e.target.value })
                  }
                  placeholder="sk-or-v1-..."
                  className="pr-10 text-mono text-xs bg-secondary/50 border-border/60 focus:glow-border-active"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showApiKey ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-primary/80 hover:text-primary flex items-center gap-1 transition-colors"
              >
                Get a key at openrouter.ai
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Model */}
            <div className="space-y-2">
              <Label htmlFor="model" className="text-xs text-muted-foreground">
                Model
              </Label>
              <Select
                id="model"
                value={config.model}
                onChange={(e) =>
                  setConfig({ ...config, model: e.target.value })
                }
                className="text-xs text-mono bg-secondary/50 border-border/60"
              >
                {MODELS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                    {m.tag ? ` (${m.tag})` : ""}
                  </option>
                ))}
              </Select>
            </div>

            {/* Max Tokens */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="maxTokens"
                  className="text-xs text-muted-foreground"
                >
                  Max tokens
                </Label>
                <span className="text-mono text-xs text-primary">
                  {config.maxTokens}
                </span>
              </div>
              <Slider
                id="maxTokens"
                min={32}
                max={512}
                step={16}
                value={config.maxTokens}
                onValueChange={(maxTokens) =>
                  setConfig({ ...config, maxTokens })
                }
              />
            </div>

            {/* Temperature */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="temperature"
                  className="text-xs text-muted-foreground"
                >
                  Temperature
                </Label>
                <span className="text-mono text-xs text-primary">
                  {config.temperature.toFixed(1)}
                </span>
              </div>
              <Slider
                id="temperature"
                min={0}
                max={1}
                step={0.1}
                value={config.temperature}
                onValueChange={(temperature) =>
                  setConfig({ ...config, temperature })
                }
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>deterministic</span>
                <span>creative</span>
              </div>
            </div>

            {/* Save */}
            <Button
              onClick={saveConfig}
              className="w-full mt-2"
              disabled={saved}
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Saved
                </>
              ) : (
                "Save configuration"
              )}
            </Button>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-border/40 px-5 py-3">
        <p className="text-[10px] text-muted-foreground text-center tracking-wide">
          Tab to accept &middot; Esc to dismiss &middot; Ctrl+Space to trigger
        </p>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 glow-border p-3 text-center space-y-1">
      <p className="text-mono text-base font-semibold text-foreground">
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById("root")!)
root.render(<App />)
