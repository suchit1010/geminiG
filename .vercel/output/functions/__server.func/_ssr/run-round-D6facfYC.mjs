import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { a as object, i as number, n as array, o as string, t as _enum } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/run-round-D6facfYC.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var ARTIFACT_KINDS = [
	"email",
	"document",
	"checklist",
	"brief",
	"message",
	"plan",
	"script"
];
var previousSchema = object({
	domain: string(),
	objective: string(),
	qualityBar: array(string()),
	plan: array(object({
		id: string(),
		title: string(),
		why: string()
	})),
	artifacts: array(object({
		id: string(),
		jobId: string(),
		kind: string(),
		title: string(),
		body: string()
	})),
	critic: object({
		overall: number(),
		verdict: _enum([
			"pass",
			"fail",
			"needs_human"
		]),
		largestGap: string(),
		nextAction: string(),
		notes: array(object({
			jobId: string(),
			score: number(),
			gap: string(),
			evidence: string()
		}))
	}).nullable()
}).optional();
var inputSchema = object({
	dump: string().min(20).max(8e3),
	goal: string().max(500),
	round: number().int().min(1).max(3),
	previous: previousSchema
});
var SYSTEM = `You are Gauntlet, a work agent that finishes messy human jobs.

You are not a chatbot. You produce finished artifacts a competent adult can send, print, or follow tonight.

Roles you must play in one JSON response:
1. LEAD — name the domain, write a sharp objective, set a quality bar, split the job into 2–4 independently judgeable pieces.
2. BUILDERS — for each piece, produce a complete artifact. Full emails. Full one-pagers. Numbered checklists with times. No outlines. No "you should consider". Do the work.
3. CRITIC — a different mind. Inspect the actual artifact text, not the builder's intent. Score 0–100. Fail anything vague, sycophantic, missing a name/date/ask, or that a tired human would still have to rewrite.

Rules:
- Infer the life context from the dump (work, freelance, school, home, job hunt, a hard conversation, or mixed). Do not force a corporate frame onto a household or student dump.
- Use only facts in the dump. Invented numbers, companies, or promises are a critic fail. If a fact is missing, put a clearly marked [NEED: …] and route that to needs_human only if the whole job is blocked.
- Voice: plain, specific, adult. No pep talk. No emoji. No hashtags.
- Artifacts must be copy-paste ready.
- On later rounds, keep what already scored ≥80 and rebuild only the weak pieces. Raise quality; do not start over.
- Pass only if overall ≥ 82 AND a busy human would not need to rewrite.
- needs_human if a real-world action requires a credential, a signature, money, or a fact that is not in the dump.

Return ONLY a JSON object with this shape:
{
  "domain": "short label",
  "objective": "one sentence: what must be true when this is done",
  "qualityBar": ["inspectable test 1", "test 2", "test 3"],
  "plan": [{"id":"j1","title":"…","why":"…"}],
  "artifacts": [{"id":"a1","jobId":"j1","kind":"email|document|checklist|brief|message|plan|script","title":"…","body":"markdown, complete"}],
  "critic": {
    "overall": 0,
    "verdict": "pass|fail|needs_human",
    "notes": [{"jobId":"j1","score":0,"gap":"…","evidence":"quote from the artifact"}],
    "largestGap": "the single biggest miss",
    "nextAction": "what round N+1 should fix, or 'accept' if pass"
  }
}`;
function friendlyApiError(status, errText) {
	const lower = errText.toLowerCase();
	if (status === 403 || lower.includes("spending-limit") || lower.includes("credits")) return "The live agent is out of credits in this environment. Open the recorded loop to walk a finished control room, then retry when credits are back.";
	if (status === 429) return "The agent is busy. Wait a moment and run the loop again.";
	return "The agent could not run. Wait a moment and try the loop again.";
}
function extractJson(text) {
	const trimmed = text.trim();
	const raw = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1] ?? trimmed;
	const start = raw.indexOf("{");
	const end = raw.lastIndexOf("}");
	if (start < 0 || end <= start) throw new Error("No JSON object in model output");
	return JSON.parse(raw.slice(start, end + 1));
}
function asKind(value) {
	const s = String(value ?? "document");
	return ARTIFACT_KINDS.includes(s) ? s : "document";
}
function coerceResult(raw) {
	if (!raw || typeof raw !== "object") throw new Error("Invalid model payload");
	const o = raw;
	const planIn = Array.isArray(o.plan) ? o.plan : [];
	const artIn = Array.isArray(o.artifacts) ? o.artifacts : [];
	const criticIn = o.critic && typeof o.critic === "object" ? o.critic : {};
	const notesIn = Array.isArray(criticIn.notes) ? criticIn.notes : [];
	const plan = planIn.slice(0, 4).map((item, i) => {
		const p = item ?? {};
		return {
			id: String(p.id ?? `j${i + 1}`),
			title: String(p.title ?? "Untitled job").slice(0, 120),
			why: String(p.why ?? "").slice(0, 280)
		};
	});
	const artifacts = artIn.slice(0, 4).map((item, i) => {
		const a = item ?? {};
		const jobId = String(a.jobId ?? plan[i]?.id ?? `j${i + 1}`);
		return {
			id: String(a.id ?? `a${i + 1}`),
			jobId,
			kind: asKind(a.kind),
			title: String(a.title ?? "Untitled").slice(0, 140),
			body: String(a.body ?? "").slice(0, 12e3)
		};
	});
	const notes = notesIn.map((item) => {
		const n = item ?? {};
		return {
			jobId: String(n.jobId ?? ""),
			score: Math.max(0, Math.min(100, Number(n.score) || 0)),
			gap: String(n.gap ?? "").slice(0, 400),
			evidence: String(n.evidence ?? "").slice(0, 400)
		};
	});
	const verdictRaw = String(criticIn.verdict ?? "fail");
	const verdict = verdictRaw === "pass" || verdictRaw === "needs_human" ? verdictRaw : "fail";
	const overall = Math.max(0, Math.min(100, Number(criticIn.overall) || 0));
	const ts = Date.now();
	const traces = [
		{
			id: `t-${ts}-lead`,
			at: ts,
			agent: "lead",
			title: "Objective locked",
			detail: String(o.objective ?? "").slice(0, 400)
		},
		...plan.map((p, i) => ({
			id: `t-${ts}-plan-${i}`,
			at: ts + i + 1,
			agent: "lead",
			title: p.title,
			detail: p.why
		})),
		...artifacts.map((a, i) => ({
			id: `t-${ts}-b-${i}`,
			at: ts + 20 + i,
			agent: "builder",
			title: `Built ${a.title}`,
			detail: `${a.kind} · ${a.body.trim().split(/\s+/).length} words`
		})),
		{
			id: `t-${ts}-c`,
			at: ts + 40,
			agent: "critic",
			title: `Verdict ${verdict} · ${overall}`,
			detail: String(criticIn.largestGap ?? "").slice(0, 400)
		}
	];
	return {
		domain: String(o.domain ?? "General").slice(0, 48),
		objective: String(o.objective ?? "").slice(0, 280),
		qualityBar: (Array.isArray(o.qualityBar) ? o.qualityBar : []).map((x) => String(x).slice(0, 160)).slice(0, 5),
		plan,
		artifacts,
		critic: {
			overall,
			verdict,
			notes,
			largestGap: String(criticIn.largestGap ?? "").slice(0, 400),
			nextAction: String(criticIn.nextAction ?? "").slice(0, 400)
		},
		traces
	};
}
var runGauntletRound_createServerFn_handler = createServerRpc({
	id: "3d85df9ddc6867ebfe876e8c66dbefb0a411172dad05dfd4acef1bcb95f1e9c1",
	name: "runGauntletRound",
	filename: "src/lib/gauntlet/run-round.ts"
}, (opts) => runGauntletRound.__executeServer(opts));
var runGauntletRound = createServerFn({ method: "POST" }).validator((data) => inputSchema.parse(data)).handler(runGauntletRound_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "AI is not available in this environment."
	};
	const userPayload = {
		round: data.round,
		goal: data.goal || "Infer the job from the dump and finish it.",
		dump: data.dump,
		previous: data.previous ?? null
	};
	const res = await fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "grok-4.5",
			temperature: .4,
			max_tokens: 3500,
			response_format: { type: "json_object" },
			messages: [{
				role: "system",
				content: SYSTEM
			}, {
				role: "user",
				content: data.round === 1 ? `Finish this job.\n\n${JSON.stringify(userPayload)}` : `Round ${data.round}. The critic already failed the last pass. Rebuild only the weak pieces. Keep high-scoring artifacts.\n\n${JSON.stringify(userPayload)}`
			}]
		})
	});
	if (!res.ok) {
		const errText = await res.text().catch(() => "");
		return {
			ok: false,
			error: friendlyApiError(res.status, errText)
		};
	}
	const text = (await res.json()).choices?.[0]?.message?.content ?? "";
	try {
		const result = coerceResult(extractJson(text));
		if (result.artifacts.length === 0) return {
			ok: false,
			error: "The agent returned no artifacts. Try a clearer dump."
		};
		return {
			ok: true,
			result
		};
	} catch {
		return {
			ok: false,
			error: "The agent returned something we could not read. Run the loop again."
		};
	}
});
//#endregion
export { runGauntletRound_createServerFn_handler };
