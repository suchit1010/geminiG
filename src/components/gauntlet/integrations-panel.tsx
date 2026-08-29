/**
 * IntegrationsPanel — Connected Tools & OAuth Management Drawer
 *
 * Allows user to manage and connect external platforms (Google Workspace, Slack, Jira, Notion).
 * Provides one-click sync to ingest recent context into Loki Neural Memory.
 */

import { Check, CheckCircle2, Globe, Mail, MessageSquare, Plug, RefreshCw, Sparkles, X, Layers, CheckSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMemory } from "@/lib/memory";

type IntegrationItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  status: "connected" | "disconnected";
  icon: React.ComponentType<{ className?: string }>;
  scopes: string[];
};

export function IntegrationsPanel({ onClose }: { onClose: () => void }) {
  const addEntry = useMemory((s) => s.addEntry);
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([
    {
      id: "google",
      name: "Google Workspace",
      category: "Email & Calendar",
      description: "Live Gmail drafts, Calendar event holds, and Google Tasks sync.",
      status: "connected",
      icon: Mail,
      scopes: ["gmail.compose", "calendar.events", "tasks"],
    },
    {
      id: "slack",
      name: "Slack",
      category: "Team Chat",
      description: "Ingest channel threads & unread DMs into neural memory.",
      status: "disconnected",
      icon: MessageSquare,
      scopes: ["channels:read", "chat:write"],
    },
    {
      id: "jira",
      name: "Jira Cloud",
      category: "Project Tracking",
      description: "Sync assigned sprint tickets, blockers, and issue updates.",
      status: "disconnected",
      icon: CheckSquare,
      scopes: ["read:jira-work", "write:jira-work"],
    },
  ]);

  const [syncingId, setSyncingId] = useState<string | null>(null);

  function toggleConnect(id: string) {
    setIntegrations((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === "connected" ? "disconnected" : "connected";
          if (nextStatus === "connected") {
            toast.success(`${item.name} connected successfully.`);
          } else {
            toast.info(`${item.name} disconnected.`);
          }
          return { ...item, status: nextStatus };
        }
        return item;
      }),
    );
  }

  async function handleSyncContext(item: IntegrationItem) {
    setSyncingId(item.id);
    try {
      // Simulate live sync into Loki memory
      await new Promise((r) => setTimeout(r, 800));

      const now = new Date().toISOString();
      if (item.id === "slack") {
        addEntry({
          id: `mem_slack_${Date.now()}`,
          userId: "dev-user",
          createdAt: now,
          updatedAt: now,
          rawText: "Slack: #infra-alerts: Staging DB upgrade scheduled for Saturday 02:00 UTC. Team lead Leo approved.",
          processedSummary: "Staging database upgrade approved for Saturday 02:00 UTC by Leo.",
          domain: "professional",
          embeddingVector: null,
          missionId: null,
          sourceType: "slack",
          tags: ["slack", "infra", "staging"],
          isArchived: false,
        });
      } else if (item.id === "jira") {
        addEntry({
          id: `mem_jira_${Date.now()}`,
          userId: "dev-user",
          createdAt: now,
          updatedAt: now,
          rawText: "Jira PROJ-102: API rate limit refactor assigned to you. Due Wednesday.",
          processedSummary: "PROJ-102 API rate limit refactor due Wednesday.",
          domain: "professional",
          embeddingVector: null,
          missionId: null,
          sourceType: "jira",
          tags: ["jira", "task", "api"],
          isArchived: false,
        });
      } else {
        addEntry({
          id: `mem_google_${Date.now()}`,
          userId: "dev-user",
          createdAt: now,
          updatedAt: now,
          rawText: "Google Calendar: Sync sprint review meeting with VP of Product on Thursday 14:00.",
          processedSummary: "Sprint review with VP of Product on Thursday 14:00.",
          domain: "professional",
          embeddingVector: null,
          missionId: null,
          sourceType: "calendar",
          tags: ["calendar", "meeting", "sprint"],
          isArchived: false,
        });
      }

      toast.success(`Pulled fresh context from ${item.name} into Neural Memory!`);
    } finally {
      setSyncingId(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-surface-2 text-accent border border-border">
              <Plug className="size-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-fg tracking-tight">
                Connected Tools & Integrations
              </h3>
              <p className="font-mono text-xs text-muted">
                Jarvis orchestration across your entire workflow stack
              </p>
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose} className="size-8 p-0 text-subtle hover:text-fg">
            <X className="size-4" />
          </Button>
        </div>

        {/* Integration List */}
        <div className="space-y-3.5">
          {integrations.map((item) => {
            const Icon = item.icon;
            const isConnected = item.status === "connected";
            return (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-border/80 bg-bg/50 p-4 transition-all hover:border-border-strong"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border ${
                      isConnected
                        ? "border-pass/30 bg-pass/10 text-pass"
                        : "border-border bg-surface-2 text-muted"
                    }`}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-sm font-semibold text-fg">{item.name}</h4>
                      <Badge variant={isConnected ? "pass" : "default"} className="text-[10px]">
                        {isConnected ? "Connected" : "Not Linked"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted leading-relaxed">{item.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.scopes.map((s) => (
                        <span
                          key={s}
                          className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[9px] text-subtle border border-border/40"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant={isConnected ? "secondary" : "default"}
                    onClick={() => toggleConnect(item.id)}
                    className="h-8 text-xs px-3"
                  >
                    {isConnected ? "Disconnect" : "Connect"}
                  </Button>
                  {isConnected && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => void handleSyncContext(item)}
                      disabled={syncingId === item.id}
                      className="h-7 text-[11px] px-2 text-accent hover:text-fg"
                    >
                      {syncingId === item.id ? (
                        <RefreshCw className="mr-1 size-3 animate-spin" />
                      ) : (
                        <Sparkles className="mr-1 size-3" />
                      )}
                      Sync Context
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-subtle">
          <span>All integrations protected by Zero-Client Confirm Gate</span>
          <Button size="sm" variant="secondary" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
