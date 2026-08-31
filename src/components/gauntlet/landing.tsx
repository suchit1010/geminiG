import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Key, Plug, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LoopMark } from "@/components/gauntlet/loop-mark";
import { STARTERS } from "@/lib/gauntlet/starters";
import { listMissions, useGauntlet } from "@/lib/gauntlet/store";
import { AlertPanel } from "@/components/gauntlet/alert-panel";
import { Intake } from "@/components/gauntlet/intake";
import { IntegrationsPanel } from "@/components/gauntlet/integrations-panel";
import { MemorySidebar } from "@/components/gauntlet/memory-sidebar";
import { KnowledgeGraphView } from "@/components/gauntlet/knowledge-graph-view";
import { ServerProxyModal } from "@/components/gauntlet/server-proxy-modal";
import { ApiKeyModal } from "@/components/gauntlet/api-key-modal";
import type { Attachment } from "@/lib/gauntlet/types";

const STEPS = [
  {
    agent: "Lead",
    copy: "Reads the mess, names the job, splits it into pieces that can be judged.",
    tag: "Agent 1 · Gemini 3.5 Flash",
  },
  {
    agent: "Builders",
    copy: "Produce the actual work — emails, briefs, checklists, talk tracks — finished, not outlined.",
    tag: "Agent 2 · Gemini 3.5 Flash",
  },
  {
    agent: "Critic",
    copy: "Inspects the real artifacts with fresh eyes. If a tired human would still rewrite it, the loop continues.",
    tag: "Agent 3 · Gemini 3.5 Flash",
  },
];

export function Landing() {
  const navigate = useNavigate();
  const apiKey = useGauntlet((s) => s.apiKey);
  const hasHydrated = useGauntlet((s) => s.hasHydrated);
  const missionsMap = useGauntlet((s) => s.missions);
  const createMission = useGauntlet((s) => s.createMission);
  const installSample = useGauntlet((s) => s.installSample);
  const [open, setOpen] = useState(false);
  const [prefill, setPrefill] = useState<{ dump: string; goal: string } | null>(
    null,
  );

  const [proxyOpen, setProxyOpen] = useState(false);
  const [integrationsOpen, setIntegrationsOpen] = useState(false);
  const [apiKeyOpen, setApiKeyOpen] = useState(false);

  useEffect(() => {
    if (useGauntlet.persist.hasHydrated()) {
      useGauntlet.getState().setHasHydrated(true);
    }
  }, []);

  const recent = hasHydrated ? listMissions(missionsMap).slice(0, 4) : [];

  function startBlank() {
    setPrefill(null);
    setOpen(true);
  }

  function startStarter(id: string) {
    const s = STARTERS.find((x) => x.id === id);
    if (!s) return;
    setPrefill({ dump: s.dump, goal: s.goal });
    setOpen(true);
  }

  function launch(dump: string, goal: string, attachments: Attachment[]) {
    const mission = createMission({ dump, goal, attachments });
    setOpen(false);
    void navigate({ to: "/mission/$id", params: { id: mission.id } });
  }

  return (
    <div className="min-h-dvh bg-bg">
      <header className="flex items-center justify-between px-5 py-5 md:px-10">
        <div className="flex items-center gap-2 text-fg">
          <LoopMark className="size-7 text-accent" />
          <span className="font-display text-lg tracking-tight">Gauntlet</span>
          <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted">
            <Sparkles className="size-3" />
            Powered by Gemini
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setApiKeyOpen(true)}
            className={`flex items-center gap-1.5 border bg-surface-2 hover:bg-surface ${
              apiKey ? "border-pass/30 text-fg" : "border-warn/40 text-warn"
            }`}
          >
            <Key className={`size-3.5 ${apiKey ? "text-pass" : "text-warn"}`} />
            <span className="font-mono text-xs">{apiKey ? "API Key Active" : "Set API Key"}</span>
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIntegrationsOpen(true)}
            className="flex items-center gap-1.5 border-border bg-surface-2 hover:bg-surface text-fg"
          >
            <Plug className="size-3.5 text-accent" />
            <span className="font-mono text-xs">Tools & APIs</span>
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setProxyOpen(true)}
            className="flex items-center gap-2 border-pass/30 bg-surface-2 hover:bg-surface"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pass opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-pass" />
            </span>
            <span className="font-mono text-xs text-fg">Server Proxy Active</span>
          </Button>
          <Button size="sm" onClick={startBlank}>
            Start a mission
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-24 md:px-10">
        <section className="grid gap-10 pb-16 pt-6 md:grid-cols-[1.2fr_0.8fr] md:items-end md:pb-24 md:pt-10">
          <div>
            <p className="stagger-in mb-5 text-xs font-medium uppercase tracking-[0.18em] text-muted">
              A multi-agent work engine · Google Gemini
            </p>
            <h1
              className="stagger-in font-display text-3xl font-medium leading-[1.08] tracking-tight text-fg"
              style={{ animationDelay: "40ms" }}
            >
              Drop the mess.
              <br />
              Walk away.
            </h1>
            <p
              className="stagger-in mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg"
              style={{ animationDelay: "80ms" }}
            >
              Most AI waits for the next prompt. Gauntlet takes a messy job from
              work, school, home, or a conversation you have been avoiding —
              then three Gemini agents plan, build, and criticize until the work is
              actually done. Drop a photo of your sticky notes or paste the chaos.
            </p>
            <div
              className="stagger-in mt-8 flex flex-wrap gap-3"
              style={{ animationDelay: "120ms" }}
            >
              <Button size="lg" onClick={startBlank}>
                Run a mission
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => {
                  const sample = installSample();
                  void navigate({ to: "/mission/$id", params: { id: sample.id } });
                }}
              >
                Open a recorded loop
              </Button>
            </div>
          </div>

          <ol className="grid gap-3">
            {STEPS.map((step, i) => (
              <li
                key={step.agent}
                className="stagger-in rounded-xl border border-border bg-surface p-4 md:p-5"
                style={{ animationDelay: `${160 + i * 60}ms` }}
              >
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">
                    0{i + 1} · {step.agent}
                  </p>
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-subtle">
                    {step.tag}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-fg">{step.copy}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Neural Memory Layer Dashboard */}
        <section className="mb-16 border-t border-border pt-10">
          <AlertPanel className="mb-8" />

          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
                Loki Engine · Persistent Memory
              </p>
              <h2 className="font-display text-2xl tracking-tight text-fg mt-1">
                Continuous Life & Work Memory Stream
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-muted">
                Dump micro-thoughts, context, and tasks throughout the day. Loki summarizes, embeds, and discovers relationships between people, projects, and events.
              </p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
            <MemorySidebar className="min-h-[440px]" />
            <KnowledgeGraphView className="min-h-[440px]" />
          </div>
        </section>

        <section id="starters" className="scroll-mt-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl tracking-tight">
                Built for a whole life, not a job title
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-muted">
                Pick a dump. Edit it. Run the loop. Same engine whether you are
                a student, a parent, a freelancer, or someone who has to have
                the hard talk on Thursday.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {STARTERS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => startStarter(s.id)}
                className="group flex min-h-[11rem] flex-col rounded-xl border border-border bg-surface p-5 text-left transition-[background-color,border-color] duration-150 hover:border-border-strong hover:bg-surface-2"
              >
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
                  {s.audience}
                </span>
                <span className="mt-3 font-display text-xl tracking-tight text-fg">
                  {s.label}
                </span>
                <span className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
                  {s.goal}
                </span>
                <span className="mt-auto flex items-center gap-1 pt-4 text-sm text-fg">
                  Open this dump
                  <ArrowUpRight className="size-3.5 opacity-60 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </button>
            ))}
          </div>
        </section>

        {recent.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl tracking-tight">Recent missions</h2>
            <ul className="mt-5 grid gap-2">
              {recent.map((m) => (
                <li key={m.id}>
                  <Link
                    to="/mission/$id"
                    params={{ id: m.id }}
                    className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface px-4 py-3.5 transition-colors duration-150 hover:bg-surface-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-fg">
                        {m.objective || m.goal || "Untitled mission"}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-subtle">
                        {m.domain || "Unclassified"} · Round {m.round}/{m.maxRounds} ·{" "}
                        {m.status}
                      </p>
                    </div>
                    <ScoreChip score={m.critic?.overall} status={m.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-20 border-t border-border pt-10">
          <div className="flex flex-wrap items-center gap-6">
            <p className="max-w-2xl text-sm leading-relaxed text-muted">
              Three Gemini 3.5 Flash agents in a self-correcting loop. A lead decomposes,
              builders produce, a critic scores. Drop your mess — text or photos — and
              walk away with finished, copy-paste-ready work.
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
              <img
                src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690b6.svg"
                alt="Gemini"
                className="size-5"
              />
              <span className="text-xs font-medium text-muted">
                Built with Google Gemini 3.5 Flash
              </span>
            </div>
          </div>
        </section>
      </main>

      {open && (
        <Intake
          initialDump={prefill?.dump ?? ""}
          initialGoal={prefill?.goal ?? ""}
          onClose={() => setOpen(false)}
          onRun={launch}
        />
      )}

      {proxyOpen && <ServerProxyModal onClose={() => setProxyOpen(false)} />}
      {integrationsOpen && <IntegrationsPanel onClose={() => setIntegrationsOpen(false)} />}
      {apiKeyOpen && <ApiKeyModal onClose={() => setApiKeyOpen(false)} />}
    </div>
  );
}

function ScoreChip({
  score,
  status,
}: {
  score?: number;
  status: string;
}) {
  if (status === "running") {
    return <span className="font-mono text-xs text-warn">running</span>;
  }
  if (typeof score !== "number") {
    return <span className="font-mono text-xs text-subtle">{status}</span>;
  }
  const tone =
    score >= 82 ? "text-pass" : score >= 60 ? "text-warn" : "text-fail";
  return (
    <span className={`shrink-0 font-mono text-sm tabular-nums ${tone}`}>
      {score}
    </span>
  );
}
