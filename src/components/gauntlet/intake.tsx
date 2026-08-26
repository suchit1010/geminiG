import { ImagePlus, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Attachment } from "@/lib/gauntlet/types";

type Props = {
  initialDump: string;
  initialGoal: string;
  onClose: () => void;
  onRun: (dump: string, goal: string, attachments: Attachment[]) => void;
};

const MAX_IMAGES = 4;
const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB per image

function fileToAttachment(file: File): Promise<Attachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1] ?? "";
      resolve({
        id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        mimeType: file.type,
        data: base64,
        preview: dataUrl,
      });
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function Intake({ initialDump, initialGoal, onClose, onRun }: Props) {
  const dumpId = useId();
  const goalId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dump, setDump] = useState(initialDump);
  const [goal, setGoal] = useState(initialGoal);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter(
      (f) => f.type.startsWith("image/") && f.size <= MAX_IMAGE_SIZE,
    );
    if (imageFiles.length === 0) return;

    const remaining = MAX_IMAGES - attachments.length;
    const toProcess = imageFiles.slice(0, remaining);

    const newAttachments = await Promise.all(toProcess.map(fileToAttachment));
    setAttachments((prev) => [...prev, ...newAttachments].slice(0, MAX_IMAGES));
  }, [attachments.length]);

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length) {
        void addFiles(e.dataTransfer.files);
      }
    },
    [addFiles],
  );

  const ready = dump.trim().length >= 20;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-bg/70"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-labelledby="intake-title"
        className="relative z-10 flex max-h-[92dvh] w-full max-w-2xl flex-col rounded-t-xl border border-border bg-surface sm:rounded-xl"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 id="intake-title" className="font-display text-xl tracking-tight">
              The dump
            </h2>
            <p className="text-sm text-muted">
              Paste the mess — or drop a photo of your notes. Gemini reads both.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X />
          </Button>
        </div>
        <form
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!ready) return;
            onRun(dump, goal, attachments);
          }}
        >
          <div className="grid gap-2">
            <label htmlFor={goalId} className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
              What done looks like
            </label>
            <Input
              id={goalId}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Optional. Example: a send-ready email and a checklist for Thursday."
              maxLength={500}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor={dumpId} className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
              Notes, emails, half-thoughts
            </label>
            <Textarea
              id={dumpId}
              value={dump}
              onChange={(e) => setDump(e.target.value.slice(0, 8000))}
              placeholder="Paste the pile. Slack threads, landlord emails, lecture notes, a conversation you keep rewriting."
              className="min-h-56 font-mono text-[13px] leading-relaxed"
            />
            <p className="text-right font-mono text-[11px] tabular-nums text-subtle">
              {dump.trim().length}/8000
            </p>
          </div>

          {/* Image Upload Area */}
          <div className="grid gap-2">
            <label className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
              Photos of notes, whiteboards, screenshots
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`flex min-h-20 flex-wrap items-center gap-3 rounded-lg border-2 border-dashed px-4 py-3 transition-colors ${
                dragOver
                  ? "border-accent bg-accent/5"
                  : "border-border hover:border-border-strong"
              }`}
            >
              {attachments.map((att) => (
                <div key={att.id} className="group relative">
                  <img
                    src={att.preview}
                    alt="Attached"
                    className="size-16 rounded-md border border-border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeAttachment(att.id)}
                    className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-fail text-bg opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              {attachments.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex size-16 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border text-muted transition-colors hover:border-accent hover:text-fg"
                >
                  <ImagePlus className="size-5" />
                  <span className="text-[10px]">Add</span>
                </button>
              )}
              {attachments.length === 0 && (
                <p className="text-sm text-muted">
                  Drop images here or click + to add (max {MAX_IMAGES})
                </p>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) {
                  void addFiles(e.target.files);
                  e.target.value = "";
                }
              }}
            />
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!ready}>
              Run the loop
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
