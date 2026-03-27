"use client";

import Link from "next/link";
import { useGame } from "@/context/GameContext";

const STEPS = [
  {
    emoji: "🎨",
    title: "Tell us your taste",
    body: "Answer three quick questions — what you love, how long you have, and the vibe you want. No art history degree needed.",
  },
  {
    emoji: "🗺️",
    title: "Get your personal quest",
    body: "Our AI curator hand-picks 5–7 paintings just for you, builds a walking route across MoMA floors, and weaves them into a narrative arc.",
  },
  {
    emoji: "🔍",
    title: "Play the Visual Hunt",
    body: "Stand in front of each painting and tap what you can actually see. Can you find the hidden skull? The figure in blue? Spot them all for max points.",
  },
  {
    emoji: "🧠",
    title: "Answer the bonus question",
    body: "After the hunt, a deeper question asks you to connect what you saw to meaning. Your answer is scored by AI — the more you engage, the more you earn.",
  },
  {
    emoji: "🏛️",
    title: "Unlock curator secrets",
    body: "Score well and you unlock private-tour-level facts about each painting — stories that never make it onto the wall label.",
  },
  {
    emoji: "🎁",
    title: "Earn real rewards",
    body: "Your points unlock discount codes for the MoMA shop, café deals, and exclusive member perks. Come back for a second visit to earn 2× points.",
  },
];

export default function HowItWorksPage() {
  const { state } = useGame();
  const hasQuest = !!state.quest;

  return (
    <div className="min-h-screen flex flex-col px-5 pt-10 pb-8">
      {/* Header */}
      <Link href="/" className="text-sm text-zinc-400 flex items-center gap-1 mb-6">
        ← Back
      </Link>

      <p className="text-[0.65rem] tracking-[0.25em] uppercase text-accent mb-2">
        Art Detective · MoMA Quest
      </p>
      <h1 className="font-display text-4xl text-foreground mb-2 leading-tight">
        How it works
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        A personalized AI adventure through the museum — no audio guides, no boring labels.
      </p>

      {/* Steps */}
      <div className="space-y-4 flex-1">
        {STEPS.map((step, i) => (
          <div
            key={i}
            className="flex gap-4 rounded-2xl border border-border bg-secondary/30 p-4"
          >
            <div className="flex flex-col items-center gap-1 shrink-0">
              <span className="text-2xl">{step.emoji}</span>
              <span className="text-[10px] font-bold text-muted-foreground/60 tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm leading-snug mb-1">
                {step.title}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Scoring overview */}
      <div className="mt-6 rounded-2xl bg-primary/5 border border-primary/20 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-primary mb-3">
          Points breakdown
        </p>
        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Spot an object</span>
            <span className="font-semibold text-foreground">+20 pts</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Correct skip</span>
            <span className="font-semibold text-foreground">+10 pts</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bonus answer</span>
            <span className="font-semibold text-foreground">up to +30</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Streak ×3</span>
            <span className="font-semibold text-orange-500">×1.5 pts</span>
          </div>
          <div className="flex justify-between col-span-2">
            <span className="text-muted-foreground">Return visit</span>
            <span className="font-semibold text-accent">2× all points 🎉</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-6">
        {hasQuest ? (
          <Link href="/quest">
            <button className="w-full bg-primary text-primary-foreground rounded-full px-7 py-3.5 font-semibold text-base transition-all hover:bg-primary/90 active:scale-95">
              Back to my quest →
            </button>
          </Link>
        ) : (
          <Link href="/onboarding">
            <button className="w-full bg-primary text-primary-foreground rounded-full px-7 py-3.5 font-semibold text-base transition-all hover:bg-primary/90 active:scale-95">
              Start my quest →
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
