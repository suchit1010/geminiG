import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link, x as require_jsx_runtime, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as ArrowUpRight, l as ArrowRight, t as X } from "../_libs/lucide-react.mjs";
import { a as listMissions, i as cn, n as LoopMark, o as useGauntlet, r as STARTERS, t as Button } from "./store-Dr7RRUaO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DuY3wngg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("flex h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-fg outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-subtle focus-visible:border-border-strong focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-40 w-full rounded-md border border-border bg-surface px-3 py-3 text-sm text-fg shadow-none outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-subtle focus-visible:border-border-strong focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	});
}
function Intake({ initialDump, initialGoal, onClose, onRun }) {
	const dumpId = (0, import_react.useId)();
	const goalId = (0, import_react.useId)();
	const [dump, setDump] = (0, import_react.useState)(initialDump);
	const [goal, setGoal] = (0, import_react.useState)(initialGoal);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [onClose]);
	const ready = dump.trim().length >= 20;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 flex items-end justify-center sm:items-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-label": "Close",
			className: "absolute inset-0 bg-bg/70",
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "dialog",
			"aria-labelledby": "intake-title",
			className: "relative z-10 flex max-h-[92dvh] w-full max-w-2xl flex-col rounded-t-xl border border-border bg-surface sm:rounded-xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between border-b border-border px-5 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "intake-title",
					className: "font-display text-xl tracking-tight",
					children: "The dump"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Paste the mess. Gauntlet will infer the job if you leave the goal blank."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					onClick: onClose,
					"aria-label": "Close",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-5",
				onSubmit: (e) => {
					e.preventDefault();
					if (!ready) return;
					onRun(dump, goal);
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: goalId,
							className: "text-xs font-medium uppercase tracking-[0.14em] text-subtle",
							children: "What done looks like"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: goalId,
							value: goal,
							onChange: (e) => setGoal(e.target.value),
							placeholder: "Optional. Example: a send-ready email and a checklist for Thursday.",
							maxLength: 500
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: dumpId,
								className: "text-xs font-medium uppercase tracking-[0.14em] text-subtle",
								children: "Notes, emails, half-thoughts"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: dumpId,
								value: dump,
								onChange: (e) => setDump(e.target.value.slice(0, 8e3)),
								placeholder: "Paste the pile. Slack threads, landlord emails, lecture notes, a conversation you keep rewriting.",
								className: "min-h-56 font-mono text-[13px] leading-relaxed"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-right font-mono text-[11px] tabular-nums text-subtle",
								children: [dump.trim().length, "/8000"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							onClick: onClose,
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: !ready,
							children: "Run the loop"
						})]
					})
				]
			})]
		})]
	});
}
var STEPS = [
	{
		agent: "Lead",
		copy: "Reads the mess, names the job, splits it into pieces that can be judged."
	},
	{
		agent: "Builders",
		copy: "Produce the actual work — emails, briefs, checklists, talk tracks — finished, not outlined."
	},
	{
		agent: "Critic",
		copy: "Inspects the real artifacts with fresh eyes. If a tired human would still rewrite it, the loop continues."
	}
];
function Landing() {
	const navigate = useNavigate();
	const hasHydrated = useGauntlet((s) => s.hasHydrated);
	const missionsMap = useGauntlet((s) => s.missions);
	const createMission = useGauntlet((s) => s.createMission);
	const installSample = useGauntlet((s) => s.installSample);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [prefill, setPrefill] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (useGauntlet.persist.hasHydrated()) useGauntlet.getState().setHasHydrated(true);
	}, []);
	const recent = hasHydrated ? listMissions(missionsMap).slice(0, 4) : [];
	function startBlank() {
		setPrefill(null);
		setOpen(true);
	}
	function startStarter(id) {
		const s = STARTERS.find((x) => x.id === id);
		if (!s) return;
		setPrefill({
			dump: s.dump,
			goal: s.goal
		});
		setOpen(true);
	}
	function launch(dump, goal) {
		const mission = createMission({
			dump,
			goal
		});
		setOpen(false);
		navigate({
			to: "/mission/$id",
			params: { id: mission.id }
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center justify-between px-5 py-5 md:px-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-fg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoopMark, { className: "size-7 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-lg tracking-tight",
						children: "Gauntlet"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					onClick: startBlank,
					children: "Start a mission"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-6xl px-5 pb-24 md:px-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "grid gap-10 pb-16 pt-6 md:grid-cols-[1.2fr_0.8fr] md:items-end md:pb-24 md:pt-10",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "stagger-in mb-5 text-xs font-medium uppercase tracking-[0.18em] text-muted",
								children: "A work agent for everyone"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "stagger-in font-display text-3xl font-medium leading-[1.08] tracking-tight text-fg",
								style: { animationDelay: "40ms" },
								children: [
									"Drop the mess.",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"Walk away."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "stagger-in mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg",
								style: { animationDelay: "80ms" },
								children: "Most AI waits for the next prompt. Gauntlet takes a messy job from work, school, home, or a conversation you have been avoiding — then plans, builds, and criticizes itself until the work is actually done."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "stagger-in mt-8 flex flex-wrap gap-3",
								style: { animationDelay: "120ms" },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "lg",
									onClick: startBlank,
									children: ["Run a mission", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "lg",
									variant: "secondary",
									onClick: () => {
										const sample = installSample();
										navigate({
											to: "/mission/$id",
											params: { id: sample.id }
										});
									},
									children: "Open a recorded loop"
								})]
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "grid gap-3",
							children: STEPS.map((step, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "stagger-in rounded-xl border border-border bg-surface p-4 md:p-5",
								style: { animationDelay: `${160 + i * 60}ms` },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-mono text-[11px] uppercase tracking-[0.16em] text-subtle",
									children: [
										"0",
										i + 1,
										" · ",
										step.agent
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-relaxed text-fg",
									children: step.copy
								})]
							}, step.agent))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						id: "starters",
						className: "scroll-mt-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-6 flex items-end justify-between gap-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-2xl tracking-tight",
								children: "Built for a whole life, not a job title"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 max-w-2xl text-sm text-muted",
								children: "Pick a dump. Edit it. Run the loop. Same engine whether you are a student, a parent, a freelancer, or someone who has to have the hard talk on Thursday."
							})] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
							children: STARTERS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => startStarter(s.id),
								className: "group flex min-h-[11rem] flex-col rounded-xl border border-border bg-surface p-5 text-left transition-[background-color,border-color] duration-150 hover:border-border-strong hover:bg-surface-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-medium uppercase tracking-[0.14em] text-subtle",
										children: s.audience
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-3 font-display text-xl tracking-tight text-fg",
										children: s.label
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-2 line-clamp-3 text-sm leading-relaxed text-muted",
										children: s.goal
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "mt-auto flex items-center gap-1 pt-4 text-sm text-fg",
										children: ["Open this dump", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-3.5 opacity-60 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" })]
									})
								]
							}, s.id))
						})]
					}),
					recent.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-16",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl tracking-tight",
							children: "Recent missions"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-5 grid gap-2",
							children: recent.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/mission/$id",
								params: { id: m.id },
								className: "flex items-center justify-between gap-4 rounded-lg border border-border bg-surface px-4 py-3.5 transition-colors duration-150 hover:bg-surface-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-sm text-fg",
										children: m.objective || m.goal || "Untitled mission"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-0.5 font-mono text-[11px] uppercase tracking-wider text-subtle",
										children: [
											m.domain || "Unclassified",
											" · Round ",
											m.round,
											"/",
											m.maxRounds,
											" ·",
											" ",
											m.status
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreChip, {
									score: m.critic?.overall,
									status: m.status
								})]
							}) }, m.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "mt-20 border-t border-border pt-10",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "max-w-2xl text-sm leading-relaxed text-muted",
							children: "You bring the friction — a week that will not sit still, a client who wrote in fragments, a conversation you keep rewriting. Gauntlet is the loop: a lead, builders, and a critic that will not pass work a tired human would still have to finish."
						})
					})
				]
			}),
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Intake, {
				initialDump: prefill?.dump ?? "",
				initialGoal: prefill?.goal ?? "",
				onClose: () => setOpen(false),
				onRun: launch
			})
		]
	});
}
function ScoreChip({ score, status }) {
	if (status === "running") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "font-mono text-xs text-warn",
		children: "running"
	});
	if (typeof score !== "number") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "font-mono text-xs text-subtle",
		children: status
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `shrink-0 font-mono text-sm tabular-nums ${score >= 82 ? "text-pass" : score >= 60 ? "text-warn" : "text-fail"}`,
		children: score
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landing, {});
}
//#endregion
export { Home as component };
