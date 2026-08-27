/**
 * LEAD AGENT — Decomposes messy dump into a structured plan & extracted entities.
 *
 * Emits:
 *   - domain classification
 *   - sharp objective
 *   - quality bar
 *   - 2–4 plan items
 *   - extracted_entities with verbatim source_span (used by Action Safety Gate)
 */

import { callGemini, extractJson } from "../gemini-client";
import type { GeminiPart } from "../gemini-client";
import type { ExtractedEntity } from "../types";

export type LeadOutput = {
  domain: string;
  objective: string;
  qualityBar: string[];
  plan: { id: string; title: string; why: string }[];
  entities: ExtractedEntity[];
};

const LEAD_SYSTEM = `You are the LEAD agent of Gauntlet, a work-finishing system.

Your job: read a messy human dump (notes, emails, half-thoughts) and decompose it into a clear plan AND extract all grounded entities.

Rules:
- Infer the life context from the dump (work, freelance, school, home, job hunt, a hard conversation, or mixed).
- Domain: a short label like "Work ops", "Freelance reply", "Student prep", "Household admin", "Hard conversation".
- Objective: one sentence — what must be true when the entire job is done.
- Quality bar: 3-5 inspectable tests a critic can check.
- Plan: 2-4 independently judgeable pieces. Each has a short id (j1, j2, ...), a title, and a "why" explaining what it solves.
- ENTITIES (Crucial for Action Safety Gate): Extract all concrete facts mentioned in the dump:
  - type: "recipient" (names/emails/handles), "datetime" (days/times/deadlines), "amount" (dollar values/metrics), "action_item" (explicit tasks/tickets).
  - value: normalized string value.
  - source_span: VERBATIM exact substring from the user's raw notes where this fact appears.
- Use only facts in the dump. Never invent entities.

Return ONLY a JSON object:
{
  "domain": "short label",
  "objective": "one sentence",
  "qualityBar": ["test 1", "test 2", "test 3"],
  "plan": [{"id":"j1","title":"...","why":"..."}],
  "entities": [{"type":"recipient|datetime|amount|action_item","value":"...","source_span":"..."}]
}`;

const LEAD_SCHEMA = {
  type: "object",
  properties: {
    domain: { type: "string" },
    objective: { type: "string" },
    qualityBar: { type: "array", items: { type: "string" } },
    plan: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          why: { type: "string" },
        },
        required: ["id", "title", "why"],
      },
    },
    entities: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string" },
          value: { type: "string" },
          source_span: { type: "string" },
        },
        required: ["type", "value", "source_span"],
      },
    },
  },
  required: ["domain", "objective", "qualityBar", "plan", "entities"],
};

export async function runLead(opts: {
  dump: string;
  goal: string;
  attachments?: { mimeType: string; data: string }[];
  previousPlan?: LeadOutput;
  apiKey?: string;
}): Promise<{ ok: true; result: LeadOutput } | { ok: false; error: string }> {
  const parts: GeminiPart[] = [];

  // Add image attachments first (multimodal)
  if (opts.attachments?.length) {
    for (const att of opts.attachments) {
      parts.push({ inlineData: { mimeType: att.mimeType, data: att.data } });
    }
  }

  let userText = `Decompose this job and extract all verifiable entities.\n\nGOAL: ${opts.goal || "Infer the job from the dump and finish it."}\n\nDUMP:\n${opts.dump}`;
  if (opts.previousPlan) {
    userText += `\n\nPREVIOUS PLAN (refine, don't restart):\n${JSON.stringify(opts.previousPlan)}`;
  }
  parts.push({ text: userText });

  const res = await callGemini(
    {
      systemInstruction: LEAD_SYSTEM,
      contents: [{ role: "user", parts }],
      temperature: 0.3,
      maxOutputTokens: 4096,
      responseSchema: LEAD_SCHEMA,
    },
    opts.apiKey,
  );

  if (!res.ok) return { ok: false, error: res.error! };

  try {
    const raw = extractJson(res.text!) as Record<string, unknown>;
    const plan = Array.isArray(raw.plan)
      ? raw.plan.slice(0, 4).map((p: Record<string, unknown>, i: number) => ({
          id: String(p?.id ?? `j${i + 1}`),
          title: String(p?.title ?? "Untitled").slice(0, 120),
          why: String(p?.why ?? "").slice(0, 280),
        }))
      : [];

    const rawEntities = Array.isArray(raw.entities) ? raw.entities : [];
    const entities: ExtractedEntity[] = rawEntities.map((e: Record<string, unknown>) => {
      const typeStr = String(e?.type || "action_item");
      const validTypes = ["recipient", "datetime", "amount", "action_item"] as const;
      const type = validTypes.includes(typeStr as (typeof validTypes)[number])
        ? (typeStr as (typeof validTypes)[number])
        : "action_item";

      return {
        type,
        value: String(e?.value ?? "").slice(0, 160),
        source_span: String(e?.source_span ?? e?.value ?? "").slice(0, 200),
      };
    });

    if (plan.length === 0) {
      return { ok: false, error: "Lead agent returned no plan items. Try a clearer dump." };
    }

    return {
      ok: true,
      result: {
        domain: String(raw.domain ?? "General").slice(0, 48),
        objective: String(raw.objective ?? "").slice(0, 280),
        qualityBar: (Array.isArray(raw.qualityBar) ? raw.qualityBar : [])
          .map((x: unknown) => String(x).slice(0, 160))
          .slice(0, 5),
        plan,
        entities,
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Parse error";
    console.error("[Lead Agent] Parse error:", msg, "Raw text:", res.text?.slice(0, 300));
    return { ok: false, error: `Could not parse Lead agent output (${msg}). Try again.` };
  }
}
