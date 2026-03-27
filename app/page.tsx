"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useGame } from "@/context/GameContext";

export default function LandingPage() {
  const { state, resetGame } = useGame();
  const hasActiveQuest =
    !!state.quest &&
    state.completedStops.length < (state.quest.stops.length ?? 0);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Floating background shapes */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-40 animate-gentle-float"
          style={{
            background: "hsl(348 32% 92%)",
            filter: "blur(48px)",
            ["--r" as string]: "-8deg",
          }}
        />
        <div
          className="absolute top-1/3 -left-20 w-56 h-56 rounded-full opacity-25 animate-gentle-float"
          style={{
            background: "hsl(160 38% 22%)",
            filter: "blur(56px)",
            animationDelay: "2s",
            ["--r" as string]: "6deg",
          }}
        />
        <div
          className="absolute bottom-1/4 right-0 w-48 h-48 rounded-full opacity-30 animate-gentle-float"
          style={{
            background: "hsl(345 48% 28%)",
            filter: "blur(64px)",
            animationDelay: "4s",
            ["--r" as string]: "3deg",
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative flex-1 flex flex-col justify-center px-7 py-16">
        {/* Display emoji */}
        <div className="text-5xl mb-8 animate-fade-in-up">🔍</div>

        {/* Label */}
        <p
          className="text-[0.65rem] tracking-[0.25em] uppercase text-accent mb-3 animate-fade-in-up"
          style={{ animationDelay: "60ms" }}
        >
          Museum of Modern Art
        </p>

        {/* Heading */}
        <h1
          className="font-display text-[2.8rem] leading-[1.1] text-foreground mb-5 animate-fade-in-up"
          style={{ animationDelay: "120ms" }}
        >
          Every painting hides a secret
        </h1>

        {/* Description */}
        <p
          className="text-base leading-relaxed text-muted-foreground mb-10 max-w-xs animate-fade-in-up"
          style={{ animationDelay: "180ms" }}
        >
          Pick 5–7 paintings. Solve challenges. Unlock curator secrets.
          Earn rewards on your personalized AI-powered MoMA adventure.
        </p>

        {/* CTA buttons */}
        <div
          className="flex flex-col gap-3 w-full animate-fade-in-up"
          style={{ animationDelay: "240ms" }}
        >
          {hasActiveQuest ? (
            <>
              <Link href="/quest" className="block w-full">
                <button className="w-full bg-primary text-primary-foreground rounded-full px-7 py-3.5 font-semibold text-base transition-all hover:bg-primary/90 active:scale-95">
                  Continue my quest →
                </button>
              </Link>
              <Link href="/how-it-works" className="block w-full">
                <button className="w-full border border-border rounded-full px-7 py-3.5 font-semibold text-base text-foreground transition-all hover:bg-secondary active:scale-95">
                  How it works
                </button>
              </Link>
              <button
                onClick={resetGame}
                className="text-sm text-muted-foreground underline mt-1"
              >
                Start over
              </button>
            </>
          ) : (
            <>
              <Link href="/onboarding" className="block w-full">
                <button className="w-full bg-primary text-primary-foreground rounded-full px-7 py-3.5 font-semibold text-base transition-all hover:bg-primary/90 active:scale-95">
                  Start your quest →
                </button>
              </Link>
              <Link href="/how-it-works" className="block w-full">
                <button className="w-full border border-border rounded-full px-7 py-3.5 font-semibold text-base text-foreground transition-all hover:bg-secondary active:scale-95">
                  How it works
                </button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="relative px-6 pb-6 text-center">
        <p className="text-xs text-muted-foreground/50">NYU Team · MoMA Hackathon 2026</p>
      </div>
    </div>
  );
}
