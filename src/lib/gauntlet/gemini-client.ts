/**
 * Gemini REST API client for Gauntlet.
 * Uses Gemini 2.0 Flash via the generativelanguage.googleapis.com REST endpoint.
 * Server-side only — called from TanStack Start server functions.
 */

export type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

export type GeminiContent = {
  role: "user" | "model";
  parts: GeminiPart[];
};

export type GeminiResponseSchema = {
  type: string;
  properties?: Record<string, unknown>;
  required?: string[];
  items?: unknown;
  [key: string]: unknown;
};

export type GeminiRequest = {
  systemInstruction: string;
  contents: GeminiContent[];
  temperature?: number;
  maxOutputTokens?: number;
  responseSchema?: GeminiResponseSchema;
};

type GeminiAPIResponse = {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
    finishReason?: string;
  }[];
  error?: { message?: string; code?: number };
};

const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const FALLBACK_MODELS = [DEFAULT_GEMINI_MODEL, "gemini-2.5-flash", "gemini-2.0-flash"];
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

export function getGeminiApiKey(): string | null {
  return process.env.GEMINI_API_KEY ?? null;
}

/**
 * Call Gemini generateContent with structured JSON output.
 */
export async function callGemini(
  req: GeminiRequest,
  customApiKey?: string,
): Promise<{
  ok: boolean;
  text?: string;
  error?: string;
}> {
  const apiKey = customApiKey || getGeminiApiKey();
  if (!apiKey) {
    return {
      ok: false,
      error: "Gemini API key not found. Please set GEMINI_API_KEY or enter your API key in the app.",
    };
  }

  const body: Record<string, unknown> = {
    systemInstruction: {
      parts: [{ text: req.systemInstruction }],
    },
    contents: req.contents,
    generationConfig: {
      temperature: req.temperature ?? 0.4,
      maxOutputTokens: req.maxOutputTokens ?? 4096,
      responseMimeType: "application/json",
      ...(req.responseSchema ? { responseSchema: req.responseSchema } : {}),
    },
  };

  let lastError = "Failed to call Gemini API";

  for (const model of FALLBACK_MODELS) {
    const url = `${BASE_URL}/${model}:generateContent?key=${apiKey}`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        // If model not found (404), continue to next fallback model
        if (res.status === 404) {
          lastError = friendlyError(res.status, errText);
          continue;
        }
        return { ok: false, error: friendlyError(res.status, errText) };
      }

      const json = (await res.json()) as GeminiAPIResponse;

      if (json.error) {
        return { ok: false, error: json.error.message ?? "Gemini API error" };
      }

      const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      if (!text) {
        return { ok: false, error: "Gemini returned an empty response. Try again." };
      }

      return { ok: true, text };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error calling Gemini";
      lastError = msg;
    }
  }

  return { ok: false, error: lastError };
}

/**
 * Extract a JSON object from Gemini's text output.
 * Handles fenced code blocks and raw JSON.
 */
export function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced?.[1] ?? trimmed;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("No JSON object in model output");
  return JSON.parse(raw.slice(start, end + 1));
}

function friendlyError(status: number, errText: string): string {
  const lower = errText.toLowerCase();
  if (status === 403 || lower.includes("permission") || lower.includes("api key")) {
    return "Invalid or missing Gemini API key. Check your GEMINI_API_KEY environment variable.";
  }
  if (status === 429 || lower.includes("quota") || lower.includes("rate")) {
    return "Gemini rate limit hit. Wait a moment and run the loop again.";
  }
  if (status === 400 && lower.includes("safety")) {
    return "Content was blocked by Gemini's safety filters. Try adjusting the dump.";
  }
  return `Gemini API error (${status}). Wait a moment and try again.`;
}
