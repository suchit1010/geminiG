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
  finishReason?: string;
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
      maxOutputTokens: req.maxOutputTokens ?? 8192,
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

      const candidate = json.candidates?.[0];
      const text = candidate?.content?.parts?.[0]?.text ?? "";
      const finishReason = candidate?.finishReason;

      if (!text) {
        return { ok: false, error: "Gemini returned an empty response. Try again." };
      }

      return { ok: true, text, finishReason };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error calling Gemini";
      lastError = msg;
    }
  }

  return { ok: false, error: lastError };
}

/**
 * Sanitize unescaped control characters (newlines, tabs) inside double-quoted string literals.
 */
export function sanitizeJsonString(raw: string): string {
  let result = "";
  let inString = false;
  let isEscaped = false;

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];

    if (isEscaped) {
      result += ch;
      isEscaped = false;
      continue;
    }

    if (ch === "\\") {
      result += ch;
      isEscaped = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      result += ch;
      continue;
    }

    if (inString) {
      if (ch === "\n") {
        result += "\\n";
      } else if (ch === "\r") {
        result += "\\r";
      } else if (ch === "\t") {
        result += "\\t";
      } else if (ch.charCodeAt(0) < 32) {
        // Drop or escape illegal unescaped ASCII control codes
        result += " ";
      } else {
        result += ch;
      }
    } else {
      result += ch;
    }
  }

  return result;
}

/**
 * Attempt to repair common LLM JSON syntax issues:
 * 1. Markdown code block wrapping
 * 2. Unclosed brackets / braces from truncated generation
 * 3. Trailing commas before closing braces/brackets
 */
export function repairJson(jsonStr: string): string {
  let s = jsonStr.trim();

  // Strip markdown code fences
  const fenced = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced?.[1]) {
    s = fenced[1].trim();
  } else if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?\s*/, "").replace(/```$/, "").trim();
  }

  // Find start of JSON structure
  const firstBrace = s.indexOf("{");
  const firstBracket = s.indexOf("[");
  let startIdx = -1;
  if (firstBrace !== -1 && firstBracket !== -1) {
    startIdx = Math.min(firstBrace, firstBracket);
  } else if (firstBrace !== -1) {
    startIdx = firstBrace;
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
  }

  if (startIdx === -1) return s;
  s = s.slice(startIdx);

  // Walk and balance brackets
  let inString = false;
  let isEscaped = false;
  const stack: string[] = [];
  let rootEndIdx = -1;

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (isEscaped) {
      isEscaped = false;
      continue;
    }
    if (ch === "\\") {
      isEscaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (ch === "{" || ch === "[") {
      stack.push(ch);
    } else if (ch === "}") {
      if (stack.length > 0 && stack[stack.length - 1] === "{") {
        stack.pop();
        if (stack.length === 0) {
          rootEndIdx = i;
          break;
        }
      }
    } else if (ch === "]") {
      if (stack.length > 0 && stack[stack.length - 1] === "[") {
        stack.pop();
        if (stack.length === 0) {
          rootEndIdx = i;
          break;
        }
      }
    }
  }

  if (rootEndIdx !== -1) {
    s = s.slice(0, rootEndIdx + 1);
  } else {
    // Truncated JSON recovery:
    if (inString) {
      s += '"';
    }
    // Clean trailing commas and dangling colons/keys
    s = s.replace(/,\s*$/, "").replace(/:\s*$/, ': ""');
    while (stack.length > 0) {
      const open = stack.pop();
      if (open === "{") s += "}";
      else if (open === "[") s += "]";
    }
  }

  // Remove trailing commas in objects and arrays
  s = s.replace(/,(\s*[}\]])/g, "$1");

  return s;
}

/**
 * Escape unescaped double quotes inside JSON string values.
 */
export function escapeInnerQuotes(raw: string): string {
  // Replace unescaped inner quotes in `"key": "value with "inner" quotes"`
  // Look for quotes that are not JSON structural quotes
  return raw.replace(/(:\s*"[^"]*?)"([^",}\]]+?)"([^"]*?")/g, '$1\\"$2\\"$3');
}

/**
 * Extract a JSON object from Gemini's text output with multi-tier recovery.
 */
export function extractJson(text: string): unknown {
  if (!text || typeof text !== "string") {
    throw new Error("Empty model response text");
  }

  const trimmed = text.trim();

  // Tier 1: Direct JSON parse
  try {
    return JSON.parse(trimmed);
  } catch {
    // Proceed
  }

  // Tier 2: Fenced extraction
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const rawCandidate = (fenced?.[1] ?? trimmed).trim();
  try {
    return JSON.parse(rawCandidate);
  } catch {
    // Proceed
  }

  // Tier 3: Sanitization of unescaped control chars (newlines, tabs, CR) + repair
  try {
    const sanitized = sanitizeJsonString(rawCandidate);
    try {
      return JSON.parse(sanitized);
    } catch {
      const repaired = repairJson(sanitized);
      return JSON.parse(repaired);
    }
  } catch {
    // Proceed
  }

  // Tier 4: Bracket balancing and repair on raw
  try {
    const repaired = repairJson(rawCandidate);
    return JSON.parse(repaired);
  } catch {
    // Proceed
  }

  // Tier 5: Quote escaping + Sanitization + Repair
  try {
    const quoteFixed = escapeInnerQuotes(rawCandidate);
    const sanitizedQuoteFixed = sanitizeJsonString(quoteFixed);
    const repaired = repairJson(sanitizedQuoteFixed);
    return JSON.parse(repaired);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`JSON parse failure: ${msg}`);
  }
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
