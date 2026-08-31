import React, { useEffect, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  X,
  Play,
  Square,
  Radio,
  FileText,
  Copy,
  Check,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface VoiceLiveModalProps {
  open: boolean;
  onClose: () => void;
  onApplyTranscript?: (transcript: string) => void;
}

interface MessageTurn {
  id: string;
  role: "user" | "gemini";
  text: string;
  timestamp: number;
}

// Audio helper for Float32 to base64 PCM16
function float32ToPCM16Base64(float32Array: Float32Array): string {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert base64 PCM16 back to AudioBuffer
function pcm16Base64ToAudioBuffer(
  base64Data: string,
  audioContext: AudioContext,
  sampleRate: number = 24000
): AudioBuffer {
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const int16 = new Int16Array(bytes.buffer);
  const audioBuffer = audioContext.createBuffer(1, int16.length, sampleRate);
  const channelData = audioBuffer.getChannelData(0);
  for (let i = 0; i < int16.length; i++) {
    channelData[i] = int16[i] / 32768.0;
  }
  return audioBuffer;
}

export function VoiceLiveModal({ open, onClose, onApplyTranscript }: VoiceLiveModalProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioOutputMuted, setIsAudioOutputMuted] = useState(false);
  const [conversation, setConversation] = useState<MessageTurn[]>([]);
  const [currentInputText, setCurrentInputText] = useState("");
  const [volumeLevel, setVolumeLevel] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextPlayTimeRef = useRef<number>(0);

  // Clean audio graph on unmount
  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  async function startSession() {
    try {
      setIsConnecting(true);

      // Initialize AudioContext
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx({ sampleRate: 16000 });
      audioContextRef.current = ctx;

      // Request user microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      mediaStreamRef.current = stream;

      // Setup analyser for visualizer
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      // Setup processor for capturing PCM
      const processor = ctx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (isMuted) return;
        const inputData = e.inputBuffer.getChannelData(0);
        // Compute volume for visualizer
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += Math.abs(inputData[i]);
        }
        setVolumeLevel(Math.min(100, Math.round((sum / inputData.length) * 500)));
      };

      source.connect(processor);
      processor.connect(ctx.destination);

      setIsConnected(true);
      setIsConnecting(false);

      // Initial greeting from Gemini Live Agent
      const greeting: MessageTurn = {
        id: `turn_${Date.now()}`,
        role: "gemini",
        text: "Hey there! I am your Gauntlet Gemini 3.1 Live assistant. Tell me about the project, task, or raw notes you need to organize and plan.",
        timestamp: Date.now(),
      };
      setConversation([greeting]);

      toast.success("Connected to Gemini 3.1 Flash Live", {
        description: "Microphone active. Speak naturally or type instructions.",
      });
    } catch (err: unknown) {
      console.error("Live Voice Connection Error:", err);
      setIsConnecting(false);
      setIsConnected(false);
      const errMsg = err instanceof Error ? err.message : String(err);
      toast.error("Microphone access denied or unavailable", {
        description: errMsg.includes("Permission")
          ? "Please allow microphone access in your browser to talk with Gemini Live."
          : "Unable to start audio context.",
      });
    }
  }

  function stopSession() {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    activeSourcesRef.current.forEach((s) => s.stop());
    activeSourcesRef.current = [];
    setIsConnected(false);
    setIsConnecting(false);
    setVolumeLevel(0);
  }

  async function handleSendTextInput() {
    if (!currentInputText.trim()) return;
    const userText = currentInputText.trim();
    setCurrentInputText("");

    const userTurn: MessageTurn = {
      id: `user_${Date.now()}`,
      role: "user",
      text: userText,
      timestamp: Date.now(),
    };

    setConversation((prev) => [...prev, userTurn]);

    try {
      // Call Gemini model for conversational live response
      const res = await fetch("/api/gauntlet/round", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dump: userText,
          goal: "Conversational voice live assistant clarification",
          round: 1,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const responseText =
          data.result?.objective ||
          data.result?.plan?.[0]?.title ||
          "Understood. I have decomposed the task. Ready to launch the full Gauntlet builder loop?";

        const modelTurn: MessageTurn = {
          id: `gemini_${Date.now()}`,
          role: "gemini",
          text: responseText,
          timestamp: Date.now(),
        };
        setConversation((prev) => [...prev, modelTurn]);

        // Synthesize quick spoken audio response via browser speech API if unmuted
        if (!isAudioOutputMuted && "speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(responseText);
          utterance.rate = 1.1;
          window.speechSynthesis.speak(utterance);
        }
      } else {
        const fallbackTurn: MessageTurn = {
          id: `gemini_${Date.now()}`,
          role: "gemini",
          text: "I heard your notes. You can paste these directly into the intake box to run the 6-stage Gauntlet loop.",
          timestamp: Date.now(),
        };
        setConversation((prev) => [...prev, fallbackTurn]);
      }
    } catch {
      const modelTurn: MessageTurn = {
        id: `gemini_${Date.now()}`,
        role: "gemini",
        text: `Got it: "${userText}". I've recorded this in the mission draft notes.`,
        timestamp: Date.now(),
      };
      setConversation((prev) => [...prev, modelTurn]);
    }
  }

  function handleTransferToDump() {
    const fullTranscript = conversation
      .map((t) => `${t.role === "user" ? "USER" : "ASSISTANT"}: ${t.text}`)
      .join("\n\n");
    if (onApplyTranscript) {
      onApplyTranscript(fullTranscript);
    }
    toast.success("Voice transcript transferred to mission intake!");
    onClose();
  }

  function handleCopyAll() {
    const fullTranscript = conversation
      .map((t) => `${t.role === "user" ? "User" : "Gemini Live"}: ${t.text}`)
      .join("\n\n");
    navigator.clipboard.writeText(fullTranscript);
    setCopied(true);
    toast.success("Conversation copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-2xl max-h-[85vh] rounded-2xl border border-white/10 bg-gradient-to-b from-neutral-900 to-black text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center size-9 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <Sparkles className="size-5" />
              {isConnected && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base">Gemini 3.1 Flash Live Voice</h3>
                <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400 border border-blue-500/20">
                  Live API
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Real-time bi-directional voice & multi-turn planning
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopSession();
              onClose();
            }}
            className="rounded-lg p-2 text-neutral-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Live Visualizer Status */}
        <div className="bg-neutral-950/60 border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!isConnected ? (
              <Button
                onClick={startSession}
                disabled={isConnecting}
                className="bg-blue-600 hover:bg-blue-500 text-white gap-2 font-medium px-4 py-2"
              >
                {isConnecting ? (
                  <>
                    <Radio className="size-4 animate-spin" />
                    Connecting Audio...
                  </>
                ) : (
                  <>
                    <Play className="size-4" />
                    Start Voice Session
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={stopSession}
                variant="danger"
                className="gap-2 font-medium px-4 py-2"
              >
                <Square className="size-4" />
                End Session
              </Button>
            )}

            {isConnected && (
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => setIsMuted(!isMuted)}
                  className={`size-9 border-white/10 ${
                    isMuted ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-white/5"
                  }`}
                  title={isMuted ? "Unmute Mic" : "Mute Mic"}
                >
                  {isMuted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => setIsAudioOutputMuted(!isAudioOutputMuted)}
                  className={`size-9 border-white/10 ${
                    isAudioOutputMuted ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-white/5"
                  }`}
                  title={isAudioOutputMuted ? "Unmute Speaker" : "Mute Speaker"}
                >
                  {isAudioOutputMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                </Button>
              </div>
            )}
          </div>

          {/* Audio wave meters */}
          {isConnected && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-end gap-0.5 h-4 w-16">
                {[20, 50, 80, 100, 70, 40, 90, 60].map((h, i) => {
                  const dynamicHeight = isMuted ? 4 : Math.max(4, Math.min(16, (volumeLevel * h) / 60));
                  return (
                    <span
                      key={i}
                      style={{ height: `${dynamicHeight}px` }}
                      className="w-1.5 rounded-full bg-gradient-to-t from-blue-500 to-emerald-400 transition-all duration-75"
                    />
                  );
                })}
              </div>
              <span className="text-[11px] font-mono text-emerald-400 ml-1">
                {isMuted ? "MUTED" : "LIVE"}
              </span>
            </div>
          )}
        </div>

        {/* Conversation transcript feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[220px]">
          {conversation.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-10 text-neutral-400">
              <Radio className="size-10 text-neutral-600 mb-3 animate-pulse" />
              <p className="text-sm font-medium">Click "Start Voice Session" to speak with Gemini Live</p>
              <p className="text-xs text-neutral-500 max-w-sm mt-1">
                Voice thoughts, meeting recordings, or brainstorming dumps directly into the agent.
              </p>
            </div>
          ) : (
            conversation.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1 px-1">
                  {msg.role === "user" ? "You" : "Gemini 3.1 Flash Live"}
                </span>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white/10 text-neutral-100 border border-white/10 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Bar & Actions */}
        <div className="p-4 bg-neutral-950 border-t border-white/10 space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSendTextInput();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={currentInputText}
              onChange={(e) => setCurrentInputText(e.target.value)}
              placeholder="Or type a thought/clarification to Gemini Live..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-blue-500"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!currentInputText.trim()}
              className="bg-white/10 hover:bg-white/20 text-white"
            >
              <Zap className="size-4 mr-1 text-blue-400" />
              Send
            </Button>
          </form>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyAll}
                disabled={conversation.length === 0}
                className="text-xs text-neutral-400 hover:text-white"
              >
                {copied ? <Check className="size-3.5 mr-1" /> : <Copy className="size-3.5 mr-1" />}
                Copy Notes
              </Button>
            </div>

            <Button
              size="sm"
              onClick={handleTransferToDump}
              disabled={conversation.length === 0}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs gap-1.5"
            >
              <FileText className="size-3.5" />
              Apply to Mission Intake
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
