"use client";

import Link from "next/link";
import { useGame } from "@/context/GameContext";
import { REWARDS, POINTS } from "@/lib/game-state";
import { Button } from "@/components/ui/Button";

export default function RewardsPage() {
  const { state } = useGame();
  const isReturnVisitor = state.visitCount > 1;

  return (
    <div className="min-h-screen flex flex-col px-5 pt-10 pb-10 space-y-8">
      {/* Header */}
      <div>
        <p className="text-[0.65rem] tracking-[0.25em] uppercase text-accent">Your Library</p>
        <h1 className="font-display text-3xl text-foreground mt-1">Rewards & Progress</h1>
      </div>

      {/* Score summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-secondary/40 border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">This visit</p>
          <p className="font-display text-3xl text-primary">{state.totalScore}</p>
          <p className="text-xs text-muted-foreground">points</p>
        </div>
        <div className="rounded-2xl bg-muted/40 border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">All time</p>
          <p className="font-display text-3xl text-accent">{state.allTimeScore || state.totalScore}</p>
          <p className="text-xs text-muted-foreground">points</p>
        </div>
      </div>

      {/* Return visit bonus */}
      {isReturnVisitor ? (
        <div className="rounded-2xl bg-primary/10 border border-primary/25 p-4 flex gap-3 items-start">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="font-semibold text-primary text-sm">Return visitor — 2× points active!</p>
            <p className="text-xs text-muted-foreground mt-1">
              Every point you earn this visit counts double. Visit #{state.visitCount}.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-muted/40 border border-border p-4 flex gap-3 items-start">
          <span className="text-2xl">🔁</span>
          <div>
            <p className="font-semibold text-foreground text-sm">Come back for 2× points</p>
            <p className="text-xs text-muted-foreground mt-1">
              Complete a quest and return for your next visit — every point doubles automatically.
            </p>
          </div>
        </div>
      )}

      {/* Reward tiers */}
      <div>
        <h2 className="text-xs font-semibold text-accent uppercase tracking-widest mb-4">
          Reward Tiers
        </h2>
        <div className="space-y-3">
          {REWARDS.map((r) => {
            const unlocked = state.unlockedCoupons.includes(r.code);
            const progress = Math.min((state.totalScore / r.points) * 100, 100);
            return (
              <div
                key={r.code}
                className={`rounded-2xl border-2 p-4 transition-all ${
                  unlocked
                    ? "border-primary bg-secondary/30"
                    : "border-border bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{unlocked ? "✅" : "🔒"}</span>
                    <p className={`text-sm font-semibold ${unlocked ? "text-primary" : "text-foreground"}`}>
                      {r.reward}
                    </p>
                  </div>
                  {unlocked ? (
                    <span className="font-mono text-xs font-bold bg-primary text-primary-foreground px-3 py-1.5 rounded-xl tracking-widest">
                      {r.code}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">{r.points} pts</span>
                  )}
                </div>
                {!unlocked && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {state.totalScore}/{r.points} pts — {Math.round(progress)}% there
                    </p>
                  </div>
                )}
                {unlocked && (
                  <p className="text-xs text-muted-foreground mt-1">Show this code at checkout</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Curator secrets collected */}
      {state.curatorSecrets.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-accent uppercase tracking-widest mb-4">
            Curator Secrets Collected
          </h2>
          <div className="space-y-3">
            {state.curatorSecrets.map((s, i) => (
              <div key={i} className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
                <p className="font-semibold text-amber-900 text-sm">{s.title}</p>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">{s.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Points reference */}
      <div className="rounded-2xl bg-muted/40 border border-border p-4">
        <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-3">How points work</p>
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex justify-between"><span>Spot a real object</span><span className="font-semibold text-foreground">+{POINTS.hit} pts</span></div>
          <div className="flex justify-between"><span>Correctly skip a fake</span><span className="font-semibold text-foreground">+{POINTS.skip} pts</span></div>
          <div className="flex justify-between"><span>Answer bonus question</span><span className="font-semibold text-foreground">+30 pts</span></div>
          <div className="flex justify-between"><span>3+ stop streak</span><span className="font-semibold text-foreground">×{POINTS.streakMultiplier}</span></div>
          <div className="flex justify-between text-primary font-semibold"><span>Return visit bonus</span><span>×{POINTS.returnVisitMultiplier} all points</span></div>
        </div>
      </div>

      {/* CTA */}
      {!state.quest && (
        <Link href="/onboarding">
          <Button size="lg">Start a new quest →</Button>
        </Link>
      )}
      {state.quest && (
        <Link href="/quest">
          <Button size="lg">Back to my quest →</Button>
        </Link>
      )}
    </div>
  );
}
