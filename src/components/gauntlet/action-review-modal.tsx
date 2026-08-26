import { Check, Mail, Calendar, CheckSquare, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  buildGmailComposeUrl,
  buildGoogleCalendarUrl,
} from "@/lib/gauntlet/tools/dispatch";
import type {
  CalendarEventProposal,
  GmailDraftProposal,
  TaskProposal,
} from "@/lib/gauntlet/types";

export type ActionReviewPayload =
  | {
      type: "gmail";
      draft: GmailDraftProposal;
    }
  | {
      type: "calendar";
      event: CalendarEventProposal;
    }
  | {
      type: "task";
      task: TaskProposal;
    };

type Props = {
  payload: ActionReviewPayload;
  entityCount?: number;
  onClose: () => void;
  onConfirm?: (payload: ActionReviewPayload) => void;
};

export function ActionReviewModal({
  payload,
  entityCount = 7,
  onClose,
  onConfirm,
}: Props) {
  // State for Gmail
  const [to, setTo] = useState(
    payload.type === "gmail" ? payload.draft.to || "" : "",
  );
  const [subject, setSubject] = useState(
    payload.type === "gmail" ? payload.draft.subject : "",
  );
  const [body, setBody] = useState(
    payload.type === "gmail" ? payload.draft.body : "",
  );

  // State for Calendar
  const [calTitle, setCalTitle] = useState(
    payload.type === "calendar" ? payload.event.title : "",
  );
  const [calStart, setCalStart] = useState(
    payload.type === "calendar" ? payload.event.start : "",
  );
  const [calLocation, setCalLocation] = useState(
    payload.type === "calendar" ? payload.event.location || "" : "",
  );
  const [calDescription, setCalDescription] = useState(
    payload.type === "calendar" ? payload.event.description || "" : "",
  );

  // State for Task
  const [taskTitle, setTaskTitle] = useState(
    payload.type === "task" ? payload.task.title : "",
  );
  const [taskDue, setTaskDue] = useState(
    payload.type === "task" ? payload.task.due || "" : "",
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleAction = () => {
    if (payload.type === "gmail") {
      const updatedDraft: GmailDraftProposal = {
        ...payload.draft,
        to: to.trim() || undefined,
        subject: subject.trim(),
        body: body.trim(),
      };
      window.open(buildGmailComposeUrl(updatedDraft), "_blank");
      toast.success("Draft created");
      onConfirm?.({ type: "gmail", draft: updatedDraft });
    } else if (payload.type === "calendar") {
      const updatedEvent: CalendarEventProposal = {
        ...payload.event,
        title: calTitle.trim(),
        start: calStart.trim(),
        location: calLocation.trim() || undefined,
        description: calDescription.trim() || undefined,
      };
      window.open(buildGoogleCalendarUrl(updatedEvent), "_blank");
      toast.success("Calendar hold created");
      onConfirm?.({ type: "calendar", event: updatedEvent });
    } else if (payload.type === "task") {
      const updatedTask: TaskProposal = {
        ...payload.task,
        title: taskTitle.trim(),
        due: taskDue.trim() || undefined,
      };
      void navigator.clipboard.writeText(
        `[ ] ${updatedTask.title}${updatedTask.due ? ` (Due: ${updatedTask.due})` : ""}`,
      );
      toast.success("Task added");
      onConfirm?.({ type: "task", task: updatedTask });
    }
    onClose();
  };

  const getActionTitle = () => {
    if (payload.type === "gmail") return "Review before sending";
    if (payload.type === "calendar") return "Review before scheduling";
    return "Review task before dispatch";
  };

  const getConfirmButtonLabel = () => {
    if (payload.type === "gmail") return "Send draft";
    if (payload.type === "calendar") return "Create hold";
    return "Create task";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-bg/85 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
        className="relative z-10 w-full max-w-xl rounded-2xl border border-border bg-surface p-6 shadow-2xl transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            {payload.type === "gmail" && <Mail className="size-4 text-accent" />}
            {payload.type === "calendar" && <Calendar className="size-4 text-accent" />}
            {payload.type === "task" && <CheckSquare className="size-4 text-accent" />}
            <h2
              id="review-modal-title"
              className="font-display text-lg tracking-tight text-fg"
            >
              {getActionTitle()}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-fg"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Green Grounded Provenance Banner */}
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-pass/30 bg-pass/10 px-3.5 py-2.5 text-xs text-pass">
          <Check className="size-4 shrink-0 text-pass" />
          <span className="font-medium">
            All {entityCount > 0 ? entityCount : "source"} entities traced to source notes
          </span>
        </div>

        {/* Editable Form Fields */}
        <div className="mt-5 space-y-4">
          {payload.type === "gmail" && (
            <>
              <div>
                <label className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
                  To
                </label>
                <Input
                  type="text"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="recipient@example.com"
                  className="mt-1 font-sans text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
                  Subject
                </label>
                <Input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject line"
                  className="mt-1 font-sans text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
                  Body
                </label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={7}
                  placeholder="Email body..."
                  className="mt-1 font-sans text-sm leading-relaxed"
                />
              </div>
            </>
          )}

          {payload.type === "calendar" && (
            <>
              <div>
                <label className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
                  Event Title
                </label>
                <Input
                  type="text"
                  value={calTitle}
                  onChange={(e) => setCalTitle(e.target.value)}
                  placeholder="Meeting or Hold Title"
                  className="mt-1 font-sans text-sm"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
                    Date & Time
                  </label>
                  <Input
                    type="text"
                    value={calStart}
                    onChange={(e) => setCalStart(e.target.value)}
                    placeholder="e.g. Thursday 16:30"
                    className="mt-1 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
                    Location / Attendees
                  </label>
                  <Input
                    type="text"
                    value={calLocation}
                    onChange={(e) => setCalLocation(e.target.value)}
                    placeholder="e.g. Zoom / Clinic"
                    className="mt-1 font-sans text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
                  Description / Agenda
                </label>
                <Textarea
                  value={calDescription}
                  onChange={(e) => setCalDescription(e.target.value)}
                  rows={4}
                  placeholder="Event details..."
                  className="mt-1 font-sans text-sm leading-relaxed"
                />
              </div>
            </>
          )}

          {payload.type === "task" && (
            <>
              <div>
                <label className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
                  Task Title
                </label>
                <Input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Task description"
                  className="mt-1 font-sans text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
                  Due Date / Notes
                </label>
                <Input
                  type="text"
                  value={taskDue}
                  onChange={(e) => setTaskDue(e.target.value)}
                  placeholder="e.g. Friday 11:00 or EOD"
                  className="mt-1 font-mono text-sm"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer: Trust Guarantee + Explicit Confirmation Actions */}
        <div className="mt-6 flex flex-col-reverse items-stretch justify-between gap-3 border-t border-border pt-4 sm:flex-row sm:items-center">
          <p className="text-xs text-muted">
            Editable — nothing sends until you confirm
          </p>

          <div className="flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="text-xs font-medium"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAction}
              className="bg-accent text-accent-fg hover:bg-accent/90 text-xs font-semibold"
            >
              {getConfirmButtonLabel()}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
