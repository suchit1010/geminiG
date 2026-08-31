import { CheckCircle2, Eye, EyeOff, ExternalLink, Key, LoaderCircle, ShieldCheck, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGauntlet } from "@/lib/gauntlet/store";
import { verifyApiKeyServerFn } from "@/lib/gauntlet/verify-key";

type Props = {
  onClose: () => void;
};

export function ApiKeyModal({ onClose }: Props) {
  const currentKey = useGauntlet((s) => s.apiKey);
  const setApiKey = useGauntlet((s) => s.setApiKey);
  const [value, setValue] = useState(currentKey);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [verification, setVerification] = useState<{
    tested: boolean;
    ok: boolean;
    latencyMs?: number;
    model?: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleTestKey = async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      toast.error("Please enter an API key first.");
      return;
    }

    setTesting(true);
    setVerification(null);
    try {
      const res = await verifyApiKeyServerFn({ data: { apiKey: trimmed } });
      setVerification({ tested: true, ...res });
      if (res.ok) {
        toast.success(`Key verified! (${res.latencyMs}ms · ${res.model || "Gemini Flash"})`);
      } else {
        toast.error(res.error || "Key verification failed.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Verification request failed";
      setVerification({ tested: true, ok: false, error: msg });
      toast.error(msg);
    } finally {
      setTesting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    setApiKey(trimmed);
    toast.success(trimmed ? "Gemini API key saved securely!" : "Gemini API key cleared.");
    onClose();
  };

  const handleClear = () => {
    setValue("");
    setApiKey("");
    setVerification(null);
    toast.info("Gemini API key removed.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-bg/85 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-labelledby="api-key-title"
        className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl transition-all"
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
              <Key className="size-4" />
            </div>
            <div>
              <h2 id="api-key-title" className="font-display text-lg tracking-tight text-fg">
                Google Gemini API Key
              </h2>
              <p className="font-mono text-[11px] text-muted">
                Direct Gemini 3.5 & 2.0 Flash access for multi-agent execution
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
                Gemini API Key
              </label>
              {currentKey && (
                <span className="font-mono text-[11px] text-pass flex items-center gap-1">
                  <CheckCircle2 className="size-3" />
                  Active in Browser
                </span>
              )}
            </div>

            <div className="relative mt-1.5 flex items-center">
              <Input
                type={showKey ? "text" : "password"}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setVerification(null);
                }}
                placeholder="AIzaSy..."
                className="pr-20 font-mono text-sm"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 rounded p-1 text-muted hover:text-fg"
                title={showKey ? "Hide key" : "Show key"}
              >
                {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <p className="mt-1 text-[11px] text-muted">
              Must be a standard Google AI Studio key starting with <code className="text-accent font-mono">AIzaSy...</code>
            </p>
          </div>

          {/* Live Verification Status Card */}
          {verification?.tested && (
            <div
              className={`rounded-lg border p-3 text-xs ${
                verification.ok
                  ? "border-pass/40 bg-pass/10 text-pass"
                  : "border-fail/40 bg-fail/10 text-fail"
              }`}
            >
              <div className="flex items-center justify-between font-mono">
                <span className="flex items-center gap-1.5 font-medium">
                  {verification.ok ? <CheckCircle2 className="size-3.5" /> : <X className="size-3.5" />}
                  {verification.ok ? "Connection Verified" : "Verification Failed"}
                </span>
                {verification.latencyMs !== undefined && (
                  <span className="text-[11px] opacity-80">{verification.latencyMs}ms latency</span>
                )}
              </div>
              <p className="mt-1 text-[11px] opacity-90 leading-relaxed">
                {verification.ok
                  ? `Model verified: ${verification.model || "Gemini Flash"}. Ready for multi-agent loops & embeddings.`
                  : verification.error}
              </p>
            </div>
          )}

          {/* Security & Isolation Callout */}
          <div className="rounded-lg border border-border/80 bg-surface-2 p-3 text-xs text-muted space-y-1.5">
            <div className="flex items-center gap-1.5 font-medium text-fg">
              <ShieldCheck className="size-3.5 text-accent" />
              <span>Production Security Isolation</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Your key is saved in browser storage (<code className="font-mono text-fg">localStorage</code>) and sent exclusively over HTTPS to TanStack Start server functions. Keys are never logged in telemetry or transmitted to third parties.
            </p>
          </div>

          {/* Get Key Link & Test Button */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-accent underline hover:opacity-80"
            >
              Get a free API key at Google AI Studio
              <ExternalLink className="size-3" />
            </a>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleTestKey}
              disabled={testing || !value.trim()}
              className="text-xs"
            >
              {testing ? (
                <>
                  <LoaderCircle className="size-3 animate-spin mr-1.5" />
                  Testing Key…
                </>
              ) : (
                "Test Connection"
              )}
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            {currentKey ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-xs text-fail hover:bg-fail/10 hover:text-fail"
              >
                <Trash2 className="size-3.5 mr-1" />
                Clear Stored Key
              </Button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-accent text-accent-fg hover:bg-accent/90">
                Save & Apply
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
