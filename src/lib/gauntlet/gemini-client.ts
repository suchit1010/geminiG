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

export const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const FALLBACK_MODELS = [
  "gemini-3.5-flash",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];
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
      error: "Gemini API key not found. Please click 'Set API Key' in the header to enter your key.",
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

  let lastError = "Failed to call Gemini API. Please check your network connection or API key.";

  for (const model of FALLBACK_MODELS) {
    const url = `${BASE_URL}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          // If model not found (404), continue to next fallback model
          if (res.status === 404) {
            lastError = friendlyError(res.status, errText);
            break;
          }

          // If rate limit (429), back off and switch to next model immediately
          if (res.status === 429) {
            lastError = friendlyError(res.status, errText);
            if (attempt === 0) {
              await new Promise((r) => setTimeout(r, 1200));
              continue;
            }
            break; // Switch to next model in fallback list
          }

          return { ok: false, error: friendlyError(res.status, errText) };
        }

        const json = (await res.json()) as GeminiAPIResponse;

        if (json.error) {
          return { ok: false, error: json.error.message ?? "Gemini API error" };
        }

        const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        if (!text) {
          return { ok: false, error: "Gemini returned an empty response. Click 'Retry Loop' to try again." };
        }

        return { ok: true, text };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Network error calling Gemini";
        lastError = msg;
      }
    }
  }

  return { ok: false, error: lastError };
}

/**
 * Fast verification probe to check if a Gemini API key is active and valid.
 */
export async function verifyGeminiKey(
  apiKey: string,
): Promise<{ ok: boolean; latencyMs?: number; model?: string; error?: string }> {
  const trimmed = apiKey.trim();
  if (!trimmed) {
    return { ok: false, error: "API key cannot be blank." };
  }

  if (trimmed.startsWith("AQ.")) {
    return {
      ok: false,
      error: "Keys starting with 'AQ.' are Google Cloud Vertex AI enterprise tokens (ACCESS_TOKEN_TYPE_UNSUPPORTED on AI Studio). Please generate a standard Gemini API key starting with 'AIzaSy...' from https://aistudio.google.com/apikey",
    };
  }

  const start = Date.now();
  for (const model of FALLBACK_MODELS) {
    const url = `${BASE_URL}/${model}:generateContent?key=${encodeURIComponent(trimmed)}`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": trimmed,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: "ping" }] }],
          generationConfig: { maxOutputTokens: 5, temperature: 0 },
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        if (res.status === 404) continue;
        return { ok: false, error: friendlyError(res.status, errText) };
      }

      const latencyMs = Date.now() - start;
      return { ok: true, latencyMs, model };
    } catch (err) {
      const cause = (err as { cause?: { code?: string } })?.cause;
      const detail = cause?.code ? ` (${cause.code})` : "";
      const msg = err instanceof Error ? err.message : "Network error verifying Gemini API key";
      const friendlyMsg = msg === "fetch failed"
        ? `Network connection to Google Gemini API failed${detail}. Please check your internet connection or proxy.`
        : `${msg}${detail}`;
      return { ok: false, error: friendlyMsg };
    }
  }

  return { ok: false, error: "Could not reach Gemini service. Please verify your API key and network connection." };
}

/**
 * Robust JSON Extractor and Auto-Repair.
 * Handles pure JSON, fenced markdown (```json), unclosed brackets, and trailing commas.
 */
export function extractJson(text: string): unknown {
  if (!text || typeof text !== "string") {
    throw new Error("No text content returned from Gemini");
  }

  const trimmed = text.trim();

  // 1. Direct JSON parse
  try {
    return JSON.parse(trimmed);
  } catch {
    // try next strategy
  }

  // 2. Extract from markdown code fences
  const fenceRegex = /```(?:json)?\s*([\s\S]*?)```/gi;
  let match: RegExpExecArray | null;
  while ((match = fenceRegex.exec(trimmed)) !== null) {
    const candidate = match[1]?.trim();
    if (candidate) {
      try {
        return JSON.parse(candidate);
      } catch {
        // try next
      }
      try {
        return repairAndParseJson(candidate);
      } catch {
        // try next
      }
    }
  }

  // 3. Extract between outer object braces { ... }
  const startBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (startBrace !== -1 && lastBrace > startBrace) {
    const candidate = trimmed.slice(startBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      // try next
    }
    try {
      return repairAndParseJson(candidate);
    } catch {
      // try next
    }
  }

  // 4. Extract between outer array brackets [ ... ]
  const startBracket = trimmed.indexOf("[");
  const lastBracket = trimmed.lastIndexOf("]");
  if (startBracket !== -1 && lastBracket > startBracket) {
    const candidate = trimmed.slice(startBracket, lastBracket + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      // try next
    }
    try {
      return repairAndParseJson(candidate);
    } catch {
      // try next
    }
  }

  // 5. Attempt auto-repair on full text
  return repairAndParseJson(trimmed);
}

function repairAndParseJson(str: string): unknown {
  let cleaned = str
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  // Remove trailing commas before closing braces/brackets
  cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");

  // Fix literal unescaped linebreaks inside strings
  /* eslint-disable-next-line no-control-regex */
  cleaned = cleaned.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, "");

  return JSON.parse(cleaned);
}

function friendlyError(status: number, errText: string): string {
  const lower = errText.toLowerCase();
  if (lower.includes("access_token_type_unsupported") || lower.includes("api_key_service_blocked") || lower.includes("unauthenticated") || status === 401) {
    return "This key was rejected by Google AI Studio (ACCESS_TOKEN_TYPE_UNSUPPORTED). Keys starting with 'AQ.' are Google Cloud Vertex AI enterprise tokens. Please generate a standard Gemini API key (starts with 'AIzaSy...') from https://aistudio.google.com/apikey";
  }
  if (status === 403 || lower.includes("permission") || lower.includes("api key") || lower.includes("unregistered") || lower.includes("auth")) {
    return "Invalid or unauthorized Gemini API key. Please generate a key starting with 'AIzaSy...' from https://aistudio.google.com/apikey";
  }
  if (status === 429 || lower.includes("quota") || lower.includes("rate") || lower.includes("resource_exhausted")) {
    return "Gemini rate limit or quota exceeded. Please wait a few seconds and click 'Retry Loop'.";
  }
  if (status === 400 && lower.includes("safety")) {
    return "Input triggered Gemini's content safety filters. Please adjust the text and retry.";
  }
  if (status === 503 || status === 500) {
    return "Gemini service temporarily overloaded. Click 'Retry Loop' to try again.";
  }
  return `Gemini API returned error (${status}). Click 'Retry Loop' or verify your network connection.`;
}


