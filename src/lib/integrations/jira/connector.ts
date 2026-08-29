/**
 * Jira Tool Connector Stub
 *
 * Implements the ToolConnector plugin contract for Atlassian Jira Cloud:
 * - Assigned tickets & sprint status ingestion
 * - Issue creation & comment dispatch
 */

import type { ConnectorStatus, DispatchAction, IngestedContextItem, ToolConnector } from "../connector";

export class JiraConnector implements ToolConnector {
  id = "jira";
  name = "Jira Cloud";
  description = "Ingest assigned sprint issues, blockers, and update ticket statuses.";
  category = "project_management" as const;
  iconName = "CheckSquare";
  status: ConnectorStatus = "disconnected";
  scopes = ["read:jira-work", "write:jira-work", "read:jira-user"];

  async connect(): Promise<{ ok: boolean; authUrl?: string; error?: string }> {
    this.status = "connected";
    return {
      ok: true,
      authUrl: "https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=demo",
    };
  }

  async disconnect(): Promise<{ ok: boolean }> {
    this.status = "disconnected";
    return { ok: true };
  }

  async ingest(since?: string): Promise<{ ok: boolean; items: IngestedContextItem[]; error?: string }> {
    const items: IngestedContextItem[] = [
      {
        externalId: "jira_issue_PROJ-441",
        sourceType: "jira",
        title: "PROJ-441: Refactor auth token refresh loop",
        body: "Assigned to You · Priority: High · Status: In Progress · Due: Tomorrow 18:00",
        domain: "professional",
        author: "Jira System",
        timestamp: new Date().toISOString(),
      },
    ];
    return { ok: true, items };
  }

  async dispatch(action: DispatchAction): Promise<{ ok: boolean; externalId?: string; error?: string }> {
    if (action.type !== "jira_issue") {
      return { ok: false, error: "Unsupported action type for Jira connector" };
    }
    return { ok: true, externalId: `JIRA-${Math.floor(Math.random() * 900 + 100)}` };
  }
}
