import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link, x as require_jsx_runtime, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as object, i as number, n as array, o as string, t as _enum } from "../_libs/zod.mjs";
import { a as Copy, i as LoaderCircle, o as CircleStop, r as SquareArrowLeft, s as Check } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Route } from "./router-BAIh4B11.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { i as cn, n as LoopMark, o as useGauntlet, t as Button } from "./store-Dr7RRUaO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mission._id-BCQQ1c9F.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide", {
	variants: { variant: {
		default: "border-border text-muted",
		pass: "border-pass/30 text-pass",
		fail: "border-fail/30 text-fail",
		warn: "border-warn/30 text-warn",
		accent: "border-accent/30 text-fg"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
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
var runGauntletRound = createServerFn({ method: "POST" }).validator((data) => inputSchema.parse(data)).handler(createSsrRpc("3d85df9ddc6867ebfe876e8c66dbefb0a411172dad05dfd4acef1bcb95f1e9c1"));
var PHASES = [
	"Lead is reading the dump",
	"Splitting the job into pieces that can be judged",
	"Builders producing finished artifacts",
	"Critic inspecting the real output"
];
var KIND_LABEL = {
	email: "Email",
	document: "Document",
	checklist: "Checklist",
	brief: "Brief",
	message: "Message",
	plan: "Plan",
	script: "Talk track"
};
function MissionBoard({ id }) {
	const mission = useGauntlet((s) => s.missions[id]);
	const hasHydrated = useGauntlet((s) => s.hasHydrated);
	const patchMission = useGauntlet((s) => s.patchMission);
	const applyRound = useGauntlet((s) => s.applyRound);
	const killMission = useGauntlet((s) => s.killMission);
	const installSample = useGauntlet((s) => s.installSample);
	const navigate = useNavigate();
	const [phase, setPhase] = (0, import_react.useState)(0);
	const [activeId, setActiveId] = (0, import_react.useState)(null);
	const runningLock = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	(0, import_react.useEffect)(() => {
		if (useGauntlet.persist.hasHydrated()) useGauntlet.getState().setHasHydrated(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!hasHydrated || !mission) return;
		if (mission.status === "draft" && mission.round === 0 && !mission.error) runLoop(mission);
	}, [hasHydrated, mission?.id]);
	(0, import_react.useEffect)(() => {
		if (mission?.status !== "running") return;
		setPhase(0);
		const t = window.setInterval(() => {
			setPhase((p) => (p + 1) % PHASES.length);
		}, 2200);
		return () => window.clearInterval(t);
	}, [mission?.status]);
	(0, import_react.useEffect)(() => {
		if (!mission?.artifacts.length) return;
		setActiveId((current) => current ?? mission.artifacts[0]?.id ?? null);
	}, [mission?.artifacts]);
	async function runLoop(current) {
		if (runningLock.current.has(current.id)) return;
		if (current.round >= current.maxRounds) {
			toast.error("This mission hit the round cap.");
			return;
		}
		runningLock.current.add(current.id);
		patchMission(current.id, {
			status: "running",
			error: null
		});
		const nextRound = current.round + 1;
		try {
			const res = await runGauntletRound({ data: {
				dump: current.dump,
				goal: current.goal,
				round: nextRound,
				previous: current.round === 0 ? void 0 : {
					domain: current.domain,
					objective: current.objective,
					qualityBar: current.qualityBar,
					plan: current.plan,
					artifacts: current.artifacts,
					critic: current.critic
				}
			} });
			if (useGauntlet.getState().missions[current.id]?.status === "killed") return;
			if (!res.ok) {
				patchMission(current.id, {
					status: current.round === 0 ? "draft" : "idle",
					error: res.error
				});
				toast.error(res.error);
				return;
			}
			applyRound(current.id, res.result);
			if (res.result.critic.verdict === "pass") toast.success("Critic passed the work.");
			else if (res.result.critic.verdict === "needs_human") toast.message("The loop needs a human on one fact.");
		} finally {
			runningLock.current.delete(current.id);
		}
	}
	const active = (0, import_react.useMemo)(() => mission?.artifacts.find((a) => a.id === activeId) ?? mission?.artifacts[0], [mission, activeId]);
	if (!hasHydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-dvh items-center justify-center bg-bg text-muted",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-sm",
			children: "Loading mission…"
		})
	});
	if (!mission) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg px-6 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-2xl",
			children: "This mission is gone."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				children: "Back to Gauntlet"
			})
		})]
	});
	const running = mission.status === "running";
	const canContinue = !running && mission.status !== "killed" && mission.status !== "passed" && mission.round > 0 && mission.round < mission.maxRounds;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "sticky top-0 z-20 border-b border-border bg-bg/90 px-4 py-3 backdrop-blur-sm md:px-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-[1400px] items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex size-11 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-fg",
						"aria-label": "Back",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquareArrowLeft, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoopMark, { className: "hidden size-6 text-accent sm:block" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "line-clamp-2 font-display text-base tracking-tight md:line-clamp-1 md:text-lg",
							children: mission.objective || mission.goal || "New mission"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-mono text-[11px] uppercase tracking-wider text-subtle",
							children: [
								mission.domain || "Reading",
								" · Round ",
								mission.round,
								"/",
								mission.maxRounds
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
						status: mission.status,
						score: mission.critic?.overall
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid max-w-[1400px] gap-0 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_minmax(0,0.9fr)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "border-b border-border p-4 md:p-6 lg:border-b-0 lg:border-r",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-xs font-medium uppercase tracking-[0.16em] text-subtle",
							children: "Trace"
						}),
						running && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "shimmer mt-4 font-mono text-sm",
							children: PHASES[phase]
						}),
						mission.error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 grid gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm leading-relaxed text-fail",
								children: mission.error
							}), mission.error.includes("recorded loop") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: () => {
									const sample = installSample();
									navigate({
										to: "/mission/$id",
										params: { id: sample.id }
									});
								},
								children: "Open the recorded loop"
							})]
						}),
						mission.qualityBar.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs uppercase tracking-[0.14em] text-subtle",
								children: "Quality bar"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-2 grid gap-2",
								children: mission.qualityBar.map((bar) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
									className: "text-sm leading-relaxed text-muted",
									children: bar
								}, bar))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
							className: "mt-6 grid gap-4",
							children: [mission.traces.map((ev) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "border-l border-border pl-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
										children: ev.agent
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-fg",
										children: ev.title
									}),
									ev.detail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm leading-relaxed text-muted",
										children: ev.detail
									})
								]
							}, ev.id)), mission.traces.length === 0 && !running && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "text-sm text-muted",
								children: "The loop has not written a trace yet."
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "min-w-0 border-b border-border p-4 md:p-6 lg:border-b-0 lg:border-r",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-xs font-medium uppercase tracking-[0.16em] text-subtle",
							children: "Artifacts"
						}), active && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => copyText(formatArtifact(active)),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5" }), "Copy"]
						})]
					}), mission.artifacts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyWork, { running }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-2 overflow-x-auto pb-3",
						children: mission.artifacts.map((a) => {
							const note = mission.critic?.notes.find((n) => n.jobId === a.jobId);
							const selected = a.id === active?.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setActiveId(a.id),
								className: `min-h-11 shrink-0 rounded-md border px-3 text-sm transition-colors ${selected ? "border-accent bg-surface-2 text-fg" : "border-border bg-surface text-muted hover:text-fg"}`,
								children: [KIND_LABEL[a.kind], typeof note?.score === "number" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-2 font-mono text-xs tabular-nums",
									children: note.score
								})]
							}, a.id);
						})
					}), active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArtifactView, { artifact: active })] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "p-4 md:p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-xs font-medium uppercase tracking-[0.16em] text-subtle",
							children: "Critic"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex items-end gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-5xl tabular-nums leading-none tracking-tight",
								children: mission.critic ? mission.critic.overall : "—"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "pb-1 text-sm text-muted",
								children: "/ 100"
							})]
						}),
						mission.critic && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 text-sm leading-relaxed text-fg",
								children: mission.critic.largestGap
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-muted",
								children: mission.critic.nextAction
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-5 grid gap-3",
								children: mission.critic.notes.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "rounded-md border border-border bg-surface p-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono text-[11px] uppercase tracking-wider text-subtle",
												children: n.jobId
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `font-mono text-sm tabular-nums ${n.score >= 82 ? "text-pass" : n.score >= 60 ? "text-warn" : "text-fail"}`,
												children: n.score
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-sm text-fg",
											children: n.gap
										}),
										n.evidence && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-xs leading-relaxed text-muted",
											children: n.evidence
										})
									]
								}, n.jobId))
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 grid gap-2",
							children: [
								canContinue && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									onClick: () => void runLoop(mission),
									disabled: running,
									children: "Run another loop"
								}),
								mission.status === "draft" && !running && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									onClick: () => void runLoop(mission),
									children: "Start the loop"
								}),
								running && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									disabled: true,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), "Loop in motion"]
								}),
								mission.status === "passed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "secondary",
									onClick: () => copyText(mission.artifacts.map(formatArtifact).join("\n\n---\n\n")),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }), "Copy the pack"]
								}),
								mission.status !== "killed" && mission.status !== "passed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									onClick: () => {
										killMission(mission.id);
										toast.message("Mission stopped.");
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleStop, { className: "size-4" }), "Stop"]
								})
							]
						})
					]
				})
			]
		})]
	});
}
function EmptyWork({ running }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-64 items-center rounded-xl border border-dashed border-border px-6 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "max-w-sm text-sm leading-relaxed text-muted",
			children: running ? "Builders are writing the pack. Artifacts land here when the critic has something to inspect." : "No artifacts yet. Start the loop to produce the work."
		})
	});
}
function ArtifactView({ artifact }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-xl border border-border bg-surface p-5 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium uppercase tracking-[0.14em] text-subtle",
				children: KIND_LABEL[artifact.kind]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-2 font-display text-2xl tracking-tight",
				children: artifact.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 space-y-3 text-sm leading-relaxed text-fg",
				children: artifact.body.split(/\n{2,}/).map((block, i) => {
					const lines = block.split("\n");
					if (lines.every((l) => /^\s*([-*]|\d+\.)\s+/.test(l) || l.trim() === "")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "grid gap-1.5 pl-1",
						children: lines.filter((l) => l.trim()).map((l, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-2 size-1 shrink-0 rounded-full bg-muted" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: l.replace(/^\s*([-*]|\d+\.)\s+/, "") })]
						}, j))
					}, i);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "whitespace-pre-wrap",
						children: block
					}, i);
				})
			})
		]
	});
}
function StatusBadge({ status, score }) {
	if (status === "running") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "warn",
		children: "Running"
	});
	if (status === "passed") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
		variant: "pass",
		children: ["Passed ", score]
	});
	if (status === "needs_human") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "warn",
		children: "Needs you"
	});
	if (status === "killed") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "fail",
		children: "Stopped"
	});
	if (status === "idle" && typeof score === "number") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
		variant: score >= 70 ? "warn" : "fail",
		children: ["Score ", score]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "Ready" });
}
function formatArtifact(a) {
	return `# ${a.title}\n\n${a.body}`;
}
async function copyText(text) {
	try {
		await navigator.clipboard.writeText(text);
		toast.success("Copied.");
	} catch {
		toast.error("Could not copy.");
	}
}
function MissionPage() {
	const { id } = Route.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MissionBoard, { id });
}
//#endregion
export { MissionPage as component };
