import { ExternalLink, Key, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGauntlet } from "@/lib/gauntlet/store";

type Props = {
  onClose: () => void;
};

export function ApiKeyModal({ onClose }: Props) {
  const currentKey = useGauntlet((s) => s.apiKey);
  const setApiKey = useGauntlet((s) => s.setApiKey);
  const [value, setValue] = useState(currentKey);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(value);
    toast.success(value.trim() ? "Gemini API key saved!" : "Gemini API key cleared.");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-labelledby="api-key-title"
        className="relative z-10 w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Key className="size-5 text-accent" />
            <h2 id="api-key-title" className="font-display text-lg tracking-tight text-fg">
              Google Gemini API Key
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
              API Key
            </label>
            <Input
              type="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="AIzaSy..."
              className="mt-1 font-mono text-sm"
              autoFocus
            />
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Your key is saved locally in your browser and used to call Gemini 3.5 Flash directly.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-accent underline hover:opacity-80"
            >
              Get a free API key at Google AI Studio
              <ExternalLink className="size-3" />
            </a>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save Key
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
