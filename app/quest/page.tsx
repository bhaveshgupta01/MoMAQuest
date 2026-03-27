"use client";

import Link from "next/link";
import { useGame } from "@/context/GameContext";
import { QuestMap } from "@/components/quest/QuestMap";
import { Button } from "@/components/ui/Button";
import { ProgressDots } from "@/components/ui/ProgressDots";
export default function QuestPage() {
  const { state } = useGame();
  const { quest, completedStops, currentStopIndex, totalScore, streak } = state;

  if (!quest) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="text-muted-foreground mb-4">No quest found. Let&apos;s build one!</p>
        <Link href="/onboarding">
          <Button>Start a quest</Button>
        </Link>
      </div>
    );
  }

  const allDone = completedStops.length >= quest.stops.length;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-5 pt-10 pb-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[0.65rem] tracking-[0.25em] uppercase text-accent mb-0.5">Your Quest</p>
            <h1 className="font-display text-3xl text-foreground leading-tight">{quest.quest_title}</h1>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl text-primary">{totalScore}</p>
            <p className="text-xs text-muted-foreground">points</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <ProgressDots
            total={quest.stops.length}
            completed={completedStops.length}
            current={currentStopIndex}
          />
          <div className="flex gap-3 text-xs text-muted-foreground">
            <span>⏱ {quest.estimated_time}</span>
            {streak >= 2 && <span className="text-orange-500">🔥 ×{streak}</span>}
          </div>
        </div>
      </div>

      {/* Narrative */}
      <div className="px-5 py-3 bg-secondary/20 border-b border-border">
        <p className="text-sm text-muted-foreground italic leading-relaxed">{quest.quest_narrative}</p>
      </div>

      {/* Quest map */}
      <div className="flex-1 px-5 py-5 overflow-y-auto">
        <QuestMap
          stops={quest.stops}
          completedIds={completedStops}
          currentIndex={currentStopIndex}
        />
      </div>

      {/* Footer actions */}
      <div className="px-5 pb-8 pt-2 border-t border-border space-y-2">
        <Link href="/scan">
          <Button size="lg" variant="secondary">
            📷 Scan QR at painting
          </Button>
        </Link>
        {allDone && (
          <Link href="/results">
            <Button size="lg">See my Art DNA →</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
