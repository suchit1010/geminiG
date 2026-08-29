/**
 * Slack Tool Connector Stub
 *
 * Implements the ToolConnector plugin contract for Slack workspace sync:
 * - Channel & DM context ingestion
 * - Message dispatch behind confirm-before-send gate
 */

import type { ConnectorStatus, DispatchAction, IngestedContextItem, ToolConnector } from "../connector";

export class SlackConnector implements ToolConnector {
  id = "slack";
  name = "Slack";
  description = "Sync unread DMs, threads, and dispatch drafted channel messages.";
  category = "communication" as const;
  iconName = "MessageSquare";
  status: ConnectorStatus = "disconnected";
  scopes = ["channels:read", "chat:write", "im:read", "im:write"];

  async connect(): Promise<{ ok: boolean; authUrl?: string; error?: string }> {
    // In demo / preview mode, marks connector active
    this.status = "connected";
    return {
      ok: true,
      authUrl: "https://slack.com/oauth/v2/authorize?client_id=demo&scope=channels:read,chat:write",
    };
  }

  async disconnect(): Promise<{ ok: boolean }> {
    this.status = "disconnected";
    return { ok: true };
  }

  async ingest(since?: string): Promise<{ ok: boolean; items: IngestedContextItem[]; error?: string }> {
    // Returns simulated active unread items to seed memory graph if connected
    const items: IngestedContextItem[] = [
      {
        externalId: "slack_msg_101",
        sourceType: "slack",
        title: "#core-eng: Deployment blocker discussion",
        body: "Sarah: We need to freeze merges until the database migration is verified on staging.",
        domain: "professional",
        author: "Sarah",
        timestamp: new Date().toISOString(),
      },
    ];
    return { ok: true, items };
  }

  async dispatch(action: DispatchAction): Promise<{ ok: boolean; externalId?: string; error?: string }> {
    if (action.type !== "slack_message") {
      return { ok: false, error: "Unsupported action type for Slack connector" };
    }
    // Simulate dispatching message to channel
    return { ok: true, externalId: `slack_ts_${Date.now()}` };
  }
}
