import { extractJson, repairJson, sanitizeJsonString } from "./gemini-client.ts";

console.log("=== Testing Gauntlet Resilient JSON Extraction & Repair ===");

// 1. Standard valid JSON
const t1 = `{"domain": "Freelance", "objective": "Win client", "artifacts": []}`;
const r1 = extractJson(t1) as Record<string, unknown>;
if (r1.domain !== "Freelance") throw new Error("Test 1 failed");
console.log("✅ Test 1 Passed: Standard JSON");

// 2. Fenced markdown block
const t2 = `Here is the output:
\`\`\`json
{
  "artifacts": [
    { "id": "a1", "title": "Cover Letter", "body": "Hi team" }
  ]
}
\`\`\`
Hope this helps!`;
const r2 = extractJson(t2) as { artifacts: { id: string }[] };
if (r2.artifacts[0].id !== "a1") throw new Error("Test 2 failed");
console.log("✅ Test 2 Passed: Markdown fenced JSON");

// 3. Unescaped newlines in JSON strings
const t3 = `{"title": "Note", "body": "Line 1
Line 2 with \ttabs and "quotes"
Line 3"}`;
const r3 = extractJson(t3) as { title: string; body: string };
if (r3.title !== "Note") throw new Error("Test 3 failed");
console.log("✅ Test 3 Passed: Raw unescaped newlines in string literals");

// 4. Truncated JSON (e.g. hitting MAX_TOKENS mid-generation)
const t4 = `{"artifacts": [{"id": "a1", "title": "Interview Prep", "body": "1. Question with {code: true}`;
const r4 = extractJson(t4) as { artifacts: { id: string }[] };
if (!Array.isArray(r4.artifacts) || r4.artifacts[0].id !== "a1") throw new Error("Test 4 failed");
console.log("✅ Test 4 Passed: Truncated JSON recovery");

// 5. Trailing commas in arrays and objects
const t5 = `{"items": ["apple", "banana",], "count": 2,}`;
const r5 = extractJson(t5) as { items: string[]; count: number };
if (r5.count !== 2 || r5.items.length !== 2) throw new Error("Test 5 failed");
console.log("✅ Test 5 Passed: Trailing commas");

console.log("\n🎉 ALL RESILIENT JSON TESTS PASSED.");
