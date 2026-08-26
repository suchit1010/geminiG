import "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[opacity,transform,background-color,color,border-color] duration-150 ease-out active:not-disabled:scale-[0.96] disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-accent text-accent-fg hover:opacity-90",
			secondary: "border border-border bg-surface text-fg hover:bg-surface-2",
			ghost: "text-muted hover:bg-surface-2 hover:text-fg",
			danger: "bg-fail text-fg hover:opacity-90"
		},
		size: {
			default: "h-11 rounded-md px-4 text-sm",
			sm: "h-9 rounded-sm px-3 text-sm",
			lg: "h-12 rounded-md px-5 text-sm",
			icon: "size-11 rounded-md"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
function LoopMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 72 72",
		className,
		"aria-hidden": "true",
		fill: "none",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "36",
				cy: "36",
				r: "22",
				stroke: "currentColor",
				strokeWidth: "1.4"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "36",
				cy: "14",
				r: "4.2",
				fill: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "55.05",
				cy: "47",
				r: "4.2",
				fill: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "16.95",
				cy: "47",
				r: "4.2",
				fill: "currentColor"
			})
		]
	});
}
var STARTERS = [
	{
		id: "work-week",
		label: "Put the week in order",
		audience: "Anyone with a job",
		goal: "Turn this scatter of notes into a week I can actually run — calendar blocks, a send-ready status, and the three things that will slip if I ignore them.",
		dump: `Slack dump + sticky notes, Monday 9:14

- Priya: “can you send the Q3 recap before Thursday standup? include the churn number from finance, they said 4.2% not 3.8”
- Mom texted: dentist Thu 4:30, confirm or lose the slot
- Jira: PAY-441 still open, “retry webhook on 500”, assigned to me since last Wed
- Notion: “write hiring scorecard for support lead” — blank page, interview is Friday 11am
- Email from Nordic Goods: they want a one-pager on the new billing export before they expand seats. No deadline. Sales said “this week would be huge”
- I promised Sam a 20-min 1:1 and never booked it
- Personal: car inspection expires the 29th
- Half-written status I never sent:

“This week we shipped the invoice CSV. Two enterprise accounts unblocked. Churn… wait for finance. Hiring still in screening.”

I have 3 real workdays. I keep rewriting the same list.`
	},
	{
		id: "client-reply",
		label: "Answer the messy inquiry",
		audience: "Freelancers & small teams",
		goal: "A send-ready reply, a scoped proposal, and a calendar hold — without sounding desperate or vague.",
		dump: `From: lina@harborandco.co
Subject: Website / maybe brand / timeline??

hi! we found you through a friend’s wedding site (the one with the linen textures?). we run a small ceramics studio in portland, 4 people. our current site is squarespace from 2021 and it looks like a placeholder. we need:

- shop that doesn’t fight with instagram
- a lookbook / editorial page for the new glaze line (oct drop)
- maybe packaging inserts? not sure if that’s you

budget is “not nothing but not agency” — last designer quoted 28k and we froze. we can do photos. we cannot do copy. we launch the glaze line first week of october and we are already late. can you talk thursday or friday? mornings better, west coast.

also our domain is harborandco.co but instagram is @harbor.clay — people get confused.

— Lina

My notes: I charge 6–9k for a marketing site + 1.5k shop setup. I have a slot starting Sep 8. I don’t do packaging as a default. I can intro a print person. I should not overpromise October if copy isn’t ready.`
	},
	{
		id: "study-pack",
		label: "Build a study pack",
		audience: "Students",
		goal: "A study pack I can use tonight: the real ideas, a quiz that bites, and what will show up on the exam.",
		dump: `Lecture 6 — Markets & failure (I typed this in class, it’s a mess)

Prof kept saying “pareto isn’t fairness”. Competitive market: many buyers/sellers, goods are the same, free entry? I missed the fourth one. Price is a signal. Surplus = willingness to pay minus price for buyers, price minus cost for sellers.

Externalities: when someone else pays. Factory smoke. Also vaccines = positive. Pigouvian tax = tax equal to external cost. He drew MSC above MC. Coase: if property rights + low transaction costs, people bargain. Then he said Coase fails when lots of people (air).

Public goods: nonrival + nonexcludable. Free rider. Lighthouse vs Netflix (Netflix is excludable). Common resources: fish, rival but not excludable → tragedy.

He said “exam will ask you to classify a good and pick a policy, not recite definitions.”

Practice he shouted at the end:
1. Why isn’t a city park a pure public good on Saturday?
2. If a tax is smaller than the external cost, what happens to quantity vs optimum?

I don’t have the textbook. Test is Thursday. I understand 60% and I’m bluffing the rest.`
	},
	{
		id: "household",
		label: "Run the household",
		audience: "Home & family",
		goal: "One weekly ops pack: what to pay, what to book, what to send, and what can wait.",
		dump: `Kitchen counter pile + texts

- Electric bill: $186, due the 2nd. Autopay failed last month (card expired). New card is in the drawer, not in the portal.
- Landlord email: “window in the back bedroom still leaking after last ‘fix’. photos please this week or I close the ticket.”
- School: permission slip for the science museum, Fri 8:15 bus, $12 cash or check to “PS 41”. Signed by a parent. Maya needs a packed lunch, no peanuts.
- Pharmacy: Dr. Chen refill for the blood pressure med — 2 pills left. They want us to call, portal is down.
- Saturday: Nico’s birthday party 2–4, we said yes, gift not bought. He’s into insects and drawing. Budget $25.
- I told my sister I’d send the flight options for Thanksgiving (we host). Nobody has booked. 3 adults 2 kids. I am the default brain and I am tired.
- Car: inspection light has been on 11 days.

Do not give me a pep talk. Give me a sequence.`
	},
	{
		id: "job-hunt",
		label: "Ship the application",
		audience: "Anyone changing work",
		goal: "A tailored application pack: a letter that sounds like me, bullets they can paste, and the 5 questions I should expect.",
		dump: `Role: Operations Manager, Northwind Health (Series B, 80 people)
Posted: “own the weekly operating rhythm, vendor onboarding, and the glue between clinical ops and the product team. 5+ years. Comfortable in spreadsheets and in rooms with doctors. Not a people-manager of a huge team — more player-coach.”

Me:
- 7 years ops at a 40-person dental group: scheduling, insurance follow-up, two clinic openings
- Built a simple Notion + Slack standup that cut no-show rate 18% → 11%
- Not a software person. I can live in Google Sheets. I led 3 front-desk hires.
- Left because the group sold and the new PE calendar was inhuman
- I want a company that still talks to patients
- Weakness they will smell: I have never worked “startup” and I don’t have SQL

JD also wants: “experience with HIPAA-ish judgment” (I handled charts, I was not the privacy officer) and “OKRs” (we didn’t call them that; we had monthly targets).

I keep writing “I am passionate about healthcare operations.” It sounds like everyone else. I have 90 minutes tonight.`
	},
	{
		id: "hard-talk",
		label: "Prepare the hard talk",
		audience: "Anyone avoiding a conversation",
		goal: "A talk I can actually have: opening lines, the ask, what I’ll do if it goes sideways, and what I will not say.",
		dump: `I need to tell my cofounder, Dev, that the launch date is fake.

We told the angel update “beta Oct 1”. Engineering is me + a contractor. The contractor vanished for 9 days. Auth still breaks on Safari. Dev has been taking sales calls and saying yes to a pilot with a 40-clinic group. I found out from a calendar invite, not from him.

I am not quitting. I am not screaming. I have been rewriting this in my notes app:

“I feel like you’re selling a product we don’t have and I’m the one who looks like the blocker.”

That’s an attack. I need him to: (1) pause the 40-clinic pilot, (2) tell the angel the real date (mid-Nov if we cut scope), (3) stop adding calls without a 15-min sync.

He hates being embarrassed. He will say I’m not ambitious. We have to share a slack with the angel tomorrow at 4pm.

I want to walk in with a one-page reality check, not a speech.`
	}
];
var work = STARTERS[0];
var SAMPLE_ID = "gnt_sample_work_week";
function sampleWorkWeek() {
	const createdAt = Date.now() - 252e4;
	return {
		id: SAMPLE_ID,
		createdAt,
		updatedAt: createdAt + 9e4,
		status: "passed",
		round: 2,
		maxRounds: 3,
		dump: work.dump,
		goal: work.goal,
		domain: "Work + life ops",
		objective: "A three-day week that can actually be run: holds on the calendar, a send-ready status, and the three things that slip if ignored.",
		qualityBar: [
			"Every artifact has a time, owner, and a next verb — not a vibe.",
			"Churn is 4.2%, not 3.8%. Thursday standup is the status deadline.",
			"Personal holds (dentist, inspection) sit on the same page as work, or they will lose."
		],
		plan: [
			{
				id: "j1",
				title: "Calendar the next three days",
				why: "The dump is a pile. A week only exists if it has clocks."
			},
			{
				id: "j2",
				title: "Send-ready Thursday status",
				why: "Priya asked before standup. A draft that still needs numbers is not done."
			},
			{
				id: "j3",
				title: "The three slip risks",
				why: "Hiring scorecard, PAY-441, and Nordic one-pager will vanish behind the recap."
			}
		],
		artifacts: [
			{
				id: "a1",
				jobId: "j1",
				kind: "plan",
				title: "Three-day run of show",
				body: `Tue
• 09:00–09:25 — PAY-441: reproduce the 500, write the retry note, or park a blocker with a name.
• 09:30–10:15 — Hiring scorecard v1 for Friday’s support-lead interview (must exist before you walk in).
• 12:40 — Book Sam, 20 min, this week. If the calendar is empty, send two windows today.
• 16:00 — Dentist: confirm Thursday 16:30 or release the slot. Do this before standup prep.
• 16:20 — Car inspection: book any slot on or before the 29th. Ten minutes. It will not get easier.

Wed
• 09:00–10:30 — Nordic Goods one-pager: what the billing export does, who it is for, what “this week” can honestly ship.
• 11:00–12:00 — Q3 recap draft with finance’s 4.2% churn. No placeholders.
• 15:00 — 1:1 with Sam if Tuesday did not land.

Thu
• 08:45 — Read the recap once out loud. If a number is still “wait for finance”, it does not ship.
• 09:30 — Standup. Recap is already sent, not presented from memory.
• 16:30 — Dentist. Phone on mute. Work is not allowed to eat this.

Do not add a fourth “important” thing until PAY-441, the scorecard, and Nordic have a next verb on this page.`
			},
			{
				id: "a2",
				jobId: "j2",
				kind: "message",
				title: "Thursday standup recap — send as-is",
				body: `Subject: Q3 recap for Thursday standup

Priya —

Sending this ahead of standup so we are not negotiating numbers in the room.

Shipped
• Invoice CSV export is live. Two enterprise accounts that were blocked on billing files are unblocked.

Churn
• 4.2% for the period (finance, not the 3.8% that was in the earlier draft).

Open
• PAY-441 (webhook retry on 500) — still mine. Target: reproduce today, patch or a named blocker by Wednesday EOD.
• Support-lead hire: first interview Friday 11:00. Scorecard will be in the doc before then.
• Nordic Goods asked for a one-pager on the billing export before they expand seats. Draft Wednesday; I will not promise a date on the thread until it exists.

I will not speak to churn as “about four percent.” It is 4.2.

— me`
			},
			{
				id: "a3",
				jobId: "j3",
				kind: "checklist",
				title: "The three things that slip",
				body: `1. PAY-441 — webhook 500 retry
   Done when: a comment on the ticket names either the patch or the person who owns the remaining 500.
   If ignored: it is still “mine since last Wednesday” on Thursday, in public.

2. Support-lead scorecard
   Done when: a one-page scorecard exists before Friday 11:00, with must-haves vs nice-to-haves, so the interview is not vibes.
   If ignored: you walk into Friday empty and the hire slips a month.

3. Nordic Goods one-pager
   Done when: a single page they can forward internally — what the export is, what it is not, and the honest date.
   If ignored: sales already said “this week would be huge.” Silence reads as no.

Not on this list, still real
• Confirm dentist Thu 16:30.
• Book inspection before the 29th.
• Book Sam.

Those three are on the calendar page so they are not “personal, therefore optional.”`
			},
			{
				id: "a4",
				jobId: "j3",
				kind: "email",
				title: "Nordic Goods — hold the week without overpromising",
				body: `Subject: Billing export one-pager — this week

Hi —

Thanks for the note on the billing export. I can do a one-pager you can forward: what the CSV contains, which accounts it unblocked, and what “expanding seats” would actually use.

I will send a draft Wednesday. If that misses your internal thread, tell me the real deadline and I will say yes or no against it — I will not leave a floating “this week.”

If useful, I can join a 20-minute walkthrough after the page exists. I will not schedule that until you have something to look at.

Best`
			}
		],
		traces: [
			{
				id: "t1",
				at: createdAt + 1e3,
				agent: "lead",
				title: "Objective locked",
				detail: "A three-day week that can actually be run: holds on the calendar, a send-ready status, and the three things that slip if ignored."
			},
			{
				id: "t2",
				at: createdAt + 4e3,
				agent: "lead",
				title: "Calendar the next three days",
				detail: "The dump is a pile. A week only exists if it has clocks."
			},
			{
				id: "t3",
				at: createdAt + 8e3,
				agent: "builder",
				title: "Built Three-day run of show",
				detail: "plan · 218 words"
			},
			{
				id: "t4",
				at: createdAt + 12e3,
				agent: "builder",
				title: "Built Thursday standup recap — send as-is",
				detail: "message · 164 words"
			},
			{
				id: "t5",
				at: createdAt + 16e3,
				agent: "critic",
				title: "Verdict fail · 71",
				detail: "Round 1 recap still hedged churn and the Nordic note had no Wednesday date."
			},
			{
				id: "t6",
				at: createdAt + 8e4,
				agent: "builder",
				title: "Rebuilt recap and Nordic hold",
				detail: "message + email · critic asked for a number and a day"
			},
			{
				id: "t7",
				at: createdAt + 88e3,
				agent: "critic",
				title: "Verdict pass · 88",
				detail: "4.2% is in the recap. Nordic has a Wednesday draft. Dentist is on the clock."
			}
		],
		critic: {
			overall: 88,
			verdict: "pass",
			largestGap: "Round 1 still sounded like a status someone would rewrite. Round 2 put 4.2% in the recap, a Wednesday on Nordic, and the dentist on the same clock as standup.",
			nextAction: "Accept the pack. Confirm the dentist. Send the recap before Thursday morning.",
			notes: [
				{
					jobId: "j1",
					score: 90,
					gap: "None material. Personal holds are on the same page as PAY-441.",
					evidence: "16:00 — Dentist: confirm Thursday 16:30 or release the slot."
				},
				{
					jobId: "j2",
					score: 88,
					gap: "Could name the standup time if Priya’s invite has one. Not a rewrite.",
					evidence: "Churn is 4.2% for the period (finance, not the 3.8%)."
				},
				{
					jobId: "j3",
					score: 86,
					gap: "Nordic still needs the actual one-pager on Wednesday — this is the hold, not the page.",
					evidence: "I will send a draft Wednesday."
				}
			]
		},
		error: null
	};
}
var MAX_MISSIONS = 24;
function now() {
	return Date.now();
}
function newMissionId() {
	return `gnt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
var useGauntlet = create()(persist((set, get) => ({
	hasHydrated: false,
	missions: {},
	setHasHydrated: (v) => set({ hasHydrated: v }),
	installSample: () => {
		const sample = sampleWorkWeek();
		set({ missions: {
			...get().missions,
			[SAMPLE_ID]: sample
		} });
		return sample;
	},
	createMission: ({ dump, goal }) => {
		const id = newMissionId();
		const ts = now();
		const mission = {
			id,
			createdAt: ts,
			updatedAt: ts,
			status: "draft",
			round: 0,
			maxRounds: 3,
			dump: dump.trim(),
			goal: goal.trim(),
			domain: "",
			objective: "",
			qualityBar: [],
			plan: [],
			artifacts: [],
			traces: [],
			critic: null,
			error: null
		};
		const missions = {
			...get().missions,
			[id]: mission
		};
		const ids = Object.values(missions).sort((a, b) => b.createdAt - a.createdAt).map((m) => m.id);
		if (ids.length > MAX_MISSIONS) for (const extra of ids.slice(MAX_MISSIONS)) delete missions[extra];
		set({ missions });
		return mission;
	},
	patchMission: (id, patch) => {
		const current = get().missions[id];
		if (!current) return;
		set({ missions: {
			...get().missions,
			[id]: {
				...current,
				...patch,
				updatedAt: now()
			}
		} });
	},
	applyRound: (id, result) => {
		const current = get().missions[id];
		if (!current) return;
		const round = current.round + 1;
		const passed = result.critic.verdict === "pass";
		const needsHuman = result.critic.verdict === "needs_human";
		const status = passed ? "passed" : needsHuman ? "needs_human" : round >= current.maxRounds ? "idle" : "idle";
		set({ missions: {
			...get().missions,
			[id]: {
				...current,
				updatedAt: now(),
				round,
				status,
				domain: result.domain,
				objective: result.objective,
				qualityBar: result.qualityBar,
				plan: result.plan,
				artifacts: result.artifacts,
				critic: result.critic,
				traces: [...current.traces, ...result.traces],
				error: null
			}
		} });
	},
	killMission: (id) => {
		const current = get().missions[id];
		if (!current) return;
		set({ missions: {
			...get().missions,
			[id]: {
				...current,
				status: "killed",
				updatedAt: now()
			}
		} });
	},
	deleteMission: (id) => {
		const missions = { ...get().missions };
		delete missions[id];
		set({ missions });
	}
}), {
	name: "gauntlet-missions-v1",
	partialize: (s) => ({ missions: s.missions }),
	onRehydrateStorage: () => (state) => {
		state?.setHasHydrated(true);
	}
}));
function listMissions(missions) {
	return Object.values(missions).sort((a, b) => b.updatedAt - a.updatedAt);
}
//#endregion
export { listMissions as a, cn as i, LoopMark as n, useGauntlet as o, STARTERS as r, Button as t };
