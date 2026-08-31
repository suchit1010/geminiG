/**
 * Server function to verify Gemini API Key
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { verifyGeminiKey } from "./gemini-client";

export const verifyApiKeyServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        apiKey: z.string().min(1, "API key is required"),
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<{ ok: boolean; latencyMs?: number; model?: string; error?: string }> => {
    return await verifyGeminiKey(data.apiKey);
  });
