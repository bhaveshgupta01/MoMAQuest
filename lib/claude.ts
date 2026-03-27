import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const MODEL = "gemini-2.5-flash";

interface AIConfig {
  system: string;
  messages: Array<{ role: string; content: unknown }>;
  maxTokens?: number;
  thinkingBudget?: number; // tokens for reasoning; 0 = off, higher = better for complex tasks
}

type ImagePart = { type: "image"; source: { data: string; media_type: string } };
type TextPart  = { type: "text";  text: string };

function toContents(messages: Array<{ role: string; content: unknown }>) {
  return messages.map((m) => {
    const role = m.role === "assistant" ? "model" : "user";
    const content = m.content;

    if (typeof content === "string") {
      return { role, parts: [{ text: content }] };
    }

    if (Array.isArray(content)) {
      const parts = (content as Array<ImagePart | TextPart>).map((c) => {
        if (c.type === "image") {
          return { inlineData: { data: c.source.data, mimeType: c.source.media_type } };
        }
        return { text: c.text };
      });
      return { role, parts };
    }

    return { role, parts: [{ text: String(content) }] };
  });
}

function sanitiseAndParse<T>(raw: string): T {
  // Replace smart/curly quotes Gemini occasionally emits (invalid in JSON)
  let text = raw
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .trim();

  // Strip markdown code fences if present
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }

  // Extract the outermost { } or [ ]
  const start = text.search(/[\[{]/);
  if (start !== -1) {
    const isArr = text[start] === "[";
    const end = isArr ? text.lastIndexOf("]") : text.lastIndexOf("}");
    if (end > start) text = text.slice(start, end + 1);
  }

  return JSON.parse(text) as T;
}

// JSON-mode generation — used by quest, challenges, art-dna routes
export async function callClaude<T = unknown>(config: AIConfig): Promise<T> {
  const response = await ai.models.generateContent({
    model: MODEL,
    config: {
      systemInstruction: config.system,
      responseMimeType: "application/json",
      maxOutputTokens: Math.max(config.maxTokens ?? 4096, 4096),
      thinkingConfig: { thinkingBudget: config.thinkingBudget ?? 0 },
    },
    contents: toContents(config.messages),
  });

  const text = response.text ?? "";
  return sanitiseAndParse<T>(text);
}

// Plain-text generation — used by talk route
export async function callGeminiText(config: AIConfig): Promise<string> {
  const response = await ai.models.generateContent({
    model: MODEL,
    config: {
      systemInstruction: config.system,
      maxOutputTokens: config.maxTokens ?? 500,
      thinkingConfig: { thinkingBudget: 0 },
    },
    contents: toContents(config.messages),
  });

  return response.text ?? "";
}

// Build a vision content block (converted in toContents above)
export function imageBlock(base64: string, mediaType = "image/jpeg") {
  return {
    type: "image"  as const,
    source: { type: "base64" as const, media_type: mediaType, data: base64 },
  };
}
