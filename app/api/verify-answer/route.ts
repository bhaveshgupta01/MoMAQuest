import { NextRequest, NextResponse } from "next/server";
import { callClaude } from "@/lib/claude";

const VERIFY_SYSTEM = `You are a museum educator scoring a visitor's reflection answer. Grade honestly but generously.
- Score 30: genuine insight, personal connection, or references something specific they observed
- Score 15: sincere attempt with some relevant thought
- Score 0: off-topic, single word, "I don't know", or clearly copy-pasted/random

Respond with JSON only: {"score": 0|15|30, "feedback": "one encouraging sentence referencing their answer"}`;

export async function POST(req: NextRequest) {
  try {
    const { question, answer, sampleAnswer, paintingTitle } = await req.json();

    if (!question || !answer || !paintingTitle) {
      return NextResponse.json({ score: 0, feedback: "No answer provided." });
    }

    const result = await callClaude<{ score: number; feedback: string }>({
      system: VERIFY_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Painting: "${paintingTitle}"
Question: ${question}
Visitor's answer: "${answer}"
Sample answer for reference (do not reveal to visitor): ${sampleAnswer}`,
        },
      ],
      maxTokens: 200,
      thinkingBudget: 0,
    });

    const score = [0, 15, 30].includes(result.score) ? result.score : 15;
    return NextResponse.json({ score, feedback: result.feedback ?? "Nice observation!" });
  } catch (err) {
    console.error("[/api/verify-answer]", err);
    return NextResponse.json({ score: 15, feedback: "Your answer shows genuine thought!" });
  }
}
