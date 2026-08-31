import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Key, Plug, Sparkles, Mic, Menu, Radio, X as CloseIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import { VoiceLiveModal } from "@/components/gauntlet/voice-live-modal";
import { FirebaseAuthButton } from "@/components/gauntlet/firebase-auth-button";
import { GeminiStar } from "@/components/gauntlet/gemini-logo";
import { useAuthUser } from "@/lib/auth/use-firebase-auth";
import { subscribeUserMissions, syncMissionToFirestore } from "@/lib/firestore-sync";
import { checkServerKeyStatusServerFn } from "@/lib/gauntlet/verify-key";
import { useSpotlight } from "@/lib/use-spotlight";
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
  const [voiceLiveOpen, setVoiceLiveOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasServerKey, setHasServerKey] = useState(false);

  const { user } = useAuthUser();
  const spotlight = useSpotlight();

  useEffect(() => {
    let mounted = true;
    checkServerKeyStatusServerFn()
      .then((res) => {
        if (mounted) setHasServerKey(res.hasServerKey);
      })
      .catch(() => {
        // pass
      });
    return () => {
      mounted = false;
    };
  }, []);

  const hasKey = Boolean(apiKey.trim() || hasServerKey);

  useEffect(() => {
    if (useGauntlet.persist.hasHydrated()) {
      useGauntlet.getState().setHasHydrated(true);
    }
  }, []);

  // Sync user missions from Cloud Firestore if signed in
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeUserMissions(user.uid, (remoteMissions) => {
      if (remoteMissions.length > 0) {
        const currentMissions = useGauntlet.getState().missions;
        const merged = { ...currentMissions };
        for (const m of remoteMissions) {
          merged[m.id] = m;
        }
        useGauntlet.setState({ missions: merged });
      }
    });
    return () => unsub();
  }, [user]);

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
    if (!hasKey) {
      toast.error("Gemini API key is required to launch missions.", {
        description: "Please set and test your Gemini key first.",
      });
      setApiKeyOpen(true);
      return;
    }
    const mission = createMission({ dump, goal, attachments });
    if (user) {
      void syncMissionToFirestore(mission, user.uid);
    }
    setOpen(false);
    toast.info("Mission queued", {
      description: "Starting 6-stage autonomous agent pipeline...",
      duration: 3000,
    });
    void navigate({ to: "/mission/$id", params: { id: mission.id } });
  }


  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-30 border-b border-border/40 bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <LoopMark className="size-6 text-accent" />
            <span className="font-display text-lg tracking-tight font-medium">Gauntlet</span>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-border/80 bg-surface-2/80 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted shadow-xs">
              <Sparkles className="size-3 text-cyan-400" />
              Gemini 3.5
            </span>
          </div>

          {/* Desktop action toolbar */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Live Voice Assistant Trigger */}
            <Button
              size="sm"
              onClick={() => setVoiceLiveOpen(true)}
              className="ai-studio-btn-glow flex items-center gap-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium shadow-sm transition-all"
            >
              <Mic className="size-3.5 text-blue-200 animate-pulse" />
              <span className="text-xs">Live Voice (Gemini 3.1)</span>
            </Button>

            {/* Firebase Auth Google Sign-in */}
            <FirebaseAuthButton />

            <Button
              size="sm"
              variant="secondary"
              onClick={() => setApiKeyOpen(true)}
              className="flex items-center gap-1.5 border border-border/80 bg-surface-2 hover:border-gemini-blue/40 hover:bg-surface-3 transition-colors"
            >
              <Key className={`size-3.5 ${apiKey ? "text-pass" : "text-accent"}`} />
              <span className="font-mono text-xs">{apiKey ? "API Key Active" : "Gemini Key"}</span>
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIntegrationsOpen(true)}
              className="flex items-center gap-1.5 border border-border/80 bg-surface-2 hover:border-gemini-purple/40 hover:bg-surface-3 transition-colors"
            >
              <Plug className="size-3.5 text-accent" />
              <span className="font-mono text-xs">Tools & APIs</span>
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => setProxyOpen(true)}
              className="flex items-center gap-2 border-pass/30 bg-surface-2 hover:bg-surface-3"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pass opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-pass" />
              </span>
              <span className="font-mono text-xs text-fg">Proxy</span>
            </Button>

            <Button
              size="sm"
              onClick={startBlank}
              className="ai-studio-btn-glow bg-accent text-accent-fg hover:bg-accent/90"
            >
              Start mission
            </Button>
          </div>

          {/* Mobile menu trigger & primary button */}
          <div className="flex lg:hidden items-center gap-2">
            <Button
              size="sm"
              onClick={() => setVoiceLiveOpen(true)}
              className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs px-2.5"
            >
              <Mic className="size-3" />
              <span className="hidden xs:inline">Voice</span>
            </Button>

            <Button size="sm" onClick={startBlank} className="text-xs px-3">
              Start
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="size-9"
            >
              {mobileMenuOpen ? <CloseIcon className="size-4" /> : <Menu className="size-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile dropdown drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border/60 bg-surface px-4 py-3 shadow-lg transition-all animate-in slide-in-from-top-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between py-1">
                <span className="text-xs text-muted">Authentication</span>
                <FirebaseAuthButton />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setApiKeyOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-1.5 text-xs"
                >
                  <Key className="size-3.5" />
                  API Key
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setIntegrationsOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-1.5 text-xs"
                >
                  <Plug className="size-3.5" />
                  Google APIs
                </Button>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setProxyOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 text-xs mt-1"
              >
                <span className="size-2 rounded-full bg-pass" />
                Server Proxy Status
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <section className="grid gap-10 pb-12 pt-8 md:grid-cols-[1.2fr_0.8fr] md:items-end md:pb-20 md:pt-14">
          <div>
            <p className="stagger-in mb-4 text-xs font-medium uppercase tracking-[0.18em] text-accent">
              Multi-Agent Autonomous Engine · Gemini 3.5 Flash
            </p>
            <h1
              className="stagger-in font-display text-3xl font-medium leading-[1.08] tracking-tight text-fg sm:text-4xl md:text-5xl"
              style={{ animationDelay: "40ms" }}
            >
              Drop the mess.
              <br />
              <span className="bg-gradient-to-r from-fg via-fg to-muted bg-clip-text text-transparent">
                Walk away.
              </span>
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
              className="stagger-in mt-8 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "120ms" }}
            >
              <Button
                size="lg"
                onClick={startBlank}
                className="ai-studio-btn-glow bg-accent text-accent-fg hover:bg-accent/90"
              >
                Run a mission
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setVoiceLiveOpen(true)}
                className="ai-studio-card border-gemini-blue/40 bg-gemini-blue/10 text-fg hover:border-gemini-blue/80 hover:bg-gemini-blue/20 transition-all gap-2"
                {...spotlight}
              >
                <Radio className="size-4 text-gemini-blue animate-pulse" />
                Speak Status Live
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => {
                  const sample = installSample();
                  void navigate({ to: "/mission/$id", params: { id: sample.id } });
                }}
                className="ai-studio-card border-pass/40 bg-surface-2 text-fg hover:border-pass transition-all"
                {...spotlight}
              >
                <Sparkles className="size-4 text-pass" />
                Live Demo (Score 91)
              </Button>
            </div>
          </div>

          <ol className="grid gap-3">
            {STEPS.map((step, i) => (
              <li
                key={step.agent}
                className="ai-studio-card stagger-in rounded-xl p-4 sm:p-5"
                style={{ animationDelay: `${160 + i * 60}ms` }}
                {...spotlight}
              >
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
                    0{i + 1} · {step.agent}
                  </p>
                  <span className="rounded-full border border-border/60 bg-surface-2 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-muted">
                    {step.tag}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-fg/90">{step.copy}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Neural Memory Layer Dashboard */}
        <section className="mb-16 border-t border-border/60 pt-10">
          <AlertPanel className="mb-8" />

          <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-400">
                Loki Engine · Persistent Memory Graph
              </p>
              <h2 className="font-display text-2xl tracking-tight text-fg mt-1 sm:text-3xl">
                Continuous Life & Work Memory Stream
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-muted">
                Dump micro-thoughts, context, and tasks throughout the day. Loki summarizes, embeds, and discovers relationships between people, projects, and events.
              </p>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <MemorySidebar className="min-h-[440px]" />
            <KnowledgeGraphView className="min-h-[440px]" />
          </div>
        </section>

        <section id="starters" className="scroll-mt-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
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
                className="ai-studio-card group flex min-h-[11rem] flex-col rounded-xl p-5 text-left transition-all"
                {...spotlight}
              >
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-subtle group-hover:text-accent transition-colors">
                  {s.audience}
                </span>
                <span className="mt-3 font-display text-xl tracking-tight text-fg">
                  {s.label}
                </span>
                <span className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
                  {s.goal}
                </span>
                <span className="mt-auto flex items-center gap-1 pt-4 text-sm font-medium text-fg group-hover:text-accent transition-colors">
                  Open this dump
                  <ArrowUpRight className="size-3.5 opacity-60 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                </span>
              </button>
            ))}
          </div>
        </section>

        {recent.length > 0 && (
          <section className="mt-16 border-t border-border/60 pt-10">
            <h2 className="font-display text-2xl tracking-tight">Recent missions</h2>
            <ul className="mt-5 grid gap-2">
              {recent.map((m) => (
                <li key={m.id}>
                  <Link
                    to="/mission/$id"
                    params={{ id: m.id }}
                    className="ai-studio-card flex items-center justify-between gap-4 rounded-lg p-4 transition-all"
                    {...spotlight}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-fg">
                        {m.objective || m.goal || "Untitled mission"}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-subtle">
                        {m.domain || "Unclassified"} · Round {m.round}/{m.maxRounds} ·{" "}
                        <span className={m.status === "passed" ? "text-pass" : "text-muted"}>
                          {m.status}
                        </span>
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
          <div className="flex flex-wrap items-center justify-between gap-6">
            <p className="max-w-2xl text-sm leading-relaxed text-muted">
              Three Gemini 3.5 Flash agents in a self-correcting loop. A lead decomposes,
              builders produce, a critic scores. Drop your mess — text or photos — and
              walk away with finished, copy-paste-ready work.
            </p>
            <div className="ai-studio-card flex items-center gap-3 rounded-xl px-4 py-2.5 shadow-sm" {...spotlight}>
              <GeminiStar className="size-6 shrink-0 drop-shadow-[0_0_10px_rgba(66,133,244,0.35)]" />
              <div className="flex items-center gap-2">
                <span className="font-display text-base font-semibold tracking-tight text-fg">
                  Gemini 3.5
                </span>
                <span className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-muted">
                  Flash
                </span>
              </div>
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
          onOpenVoiceStudio={() => setVoiceLiveOpen(true)}
        />
      )}

      {proxyOpen && <ServerProxyModal onClose={() => setProxyOpen(false)} />}
      {integrationsOpen && <IntegrationsPanel onClose={() => setIntegrationsOpen(false)} />}
      {apiKeyOpen && <ApiKeyModal onClose={() => setApiKeyOpen(false)} />}
      {voiceLiveOpen && (
        <VoiceLiveModal
          open={voiceLiveOpen}
          onClose={() => setVoiceLiveOpen(false)}
          onApplyTranscript={(transcript, goal) => {
            setPrefill({
              dump: transcript,
              goal: goal || "Organize and extract actionable plan from voice conversation",
            });
            setOpen(true);
          }}
          onLaunchDirectMission={(dump, goal) => {
            launch(dump, goal, []);
          }}
        />
      )}
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
    <span className={`shrink-0 font-mono text-sm tabular-nums font-semibold ${tone}`}>
      {score}
    </span>
  );
}

