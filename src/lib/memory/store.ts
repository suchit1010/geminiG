/**
 * Loki Memory Store — Zustand state management
 *
 * Client-side state for:
 * - Active memory stream (recent entries)
 * - Knowledge graph cache (nodes + edges for current view)
 * - Pending alerts
 * - Domain filter toggle
 * - Ingestion loading state
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Alert,
  DomainFilter,
  KGEdge,
  KGNode,
  MemoryEntry,
} from "./types";

type MemoryState = {
  // ─── Stream ─────────────────────────────────────────
  entries: MemoryEntry[];
  domainFilter: DomainFilter;
  isIngesting: boolean;

  // ─── Knowledge Graph Cache ──────────────────────────
  nodes: KGNode[];
  edges: KGEdge[];

  // ─── Alerts ─────────────────────────────────────────
  pendingAlerts: Alert[];
  unreadAlertCount: number;

  // ─── Actions ────────────────────────────────────────
  setDomainFilter: (filter: DomainFilter) => void;
  setIngesting: (v: boolean) => void;

  // Entry management
  addEntry: (entry: MemoryEntry) => void;
  setEntries: (entries: MemoryEntry[]) => void;
  archiveEntry: (id: string) => void;

  // KG management
  setGraph: (nodes: KGNode[], edges: KGEdge[]) => void;
  upsertNodes: (nodes: KGNode[]) => void;
  upsertEdges: (edges: KGEdge[]) => void;

  // Alert management
  setAlerts: (alerts: Alert[]) => void;
  dismissAlert: (id: string) => void;
  markAlertActed: (id: string) => void;
};

const MAX_CACHED_ENTRIES = 100;

export const useMemory = create<MemoryState>()(
  persist(
    (set, get) => ({
      entries: [],
      domainFilter: "all",
      isIngesting: false,
      nodes: [],
      edges: [],
      pendingAlerts: [],
      unreadAlertCount: 0,

      setDomainFilter: (filter) => set({ domainFilter: filter }),
      setIngesting: (v) => set({ isIngesting: v }),

      addEntry: (entry) => {
        const entries = [entry, ...get().entries].slice(0, MAX_CACHED_ENTRIES);
        set({ entries });
      },

      setEntries: (entries) => set({ entries: entries.slice(0, MAX_CACHED_ENTRIES) }),

      archiveEntry: (id) => {
        set({
          entries: get().entries.map((e) =>
            e.id === id ? { ...e, isArchived: true } : e,
          ),
        });
      },

      setGraph: (nodes, edges) => set({ nodes, edges }),

      upsertNodes: (newNodes) => {
        const existing = get().nodes;
        const map = new Map(existing.map((n) => [n.id, n]));
        for (const n of newNodes) {
          map.set(n.id, n);
        }
        set({ nodes: Array.from(map.values()) });
      },

      upsertEdges: (newEdges) => {
        const existing = get().edges;
        const map = new Map(existing.map((e) => [e.id, e]));
        for (const e of newEdges) {
          map.set(e.id, e);
        }
        set({ edges: Array.from(map.values()) });
      },

      setAlerts: (alerts) =>
        set({
          pendingAlerts: alerts,
          unreadAlertCount: alerts.filter((a) => a.status === "pending").length,
        }),

      dismissAlert: (id) => {
        const alerts = get().pendingAlerts.map((a) =>
          a.id === id ? { ...a, status: "dismissed" as const } : a,
        );
        set({
          pendingAlerts: alerts,
          unreadAlertCount: alerts.filter((a) => a.status === "pending").length,
        });
      },

      markAlertActed: (id) => {
        const alerts = get().pendingAlerts.map((a) =>
          a.id === id ? { ...a, status: "acted" as const } : a,
        );
        set({
          pendingAlerts: alerts,
          unreadAlertCount: alerts.filter((a) => a.status === "pending").length,
        });
      },
    }),
    {
      name: "loki-memory-v1",
      partialize: (s) => ({
        domainFilter: s.domainFilter,
        // Don't persist the full entries/graph — those come from the server
        // Only persist filter preference and unread count
        unreadAlertCount: s.unreadAlertCount,
      }),
    },
  ),
);

/** Filtered entries based on current domain filter */
export function filteredEntries(
  entries: MemoryEntry[],
  filter: DomainFilter,
): MemoryEntry[] {
  if (filter === "all") return entries.filter((e) => !e.isArchived);
  return entries.filter((e) => e.domain === filter && !e.isArchived);
}
