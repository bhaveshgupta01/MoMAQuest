"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useGame } from "@/context/GameContext";
import { ArtDNACard } from "@/components/rewards/ArtDNACard";
import { CouponCard } from "@/components/rewards/CouponCard";
import { Button } from "@/components/ui/Button";
import { ArtDNA } from "@/lib/types";
import { REWARDS } from "@/lib/game-state";

export default function ResultsPage() {
  const { state, setArtDNA } = useGame();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const unlockedRewards = REWARDS.filter((r) =>
    state.unlockedCoupons.includes(r.code)
  );

  useEffect(() => {
    if (state.artDNA || state.challengeResults.length === 0) return;

    async function generate() {
      setLoading(true);
      try {
        const r = await fetch("/api/art-dna", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            results: state.challengeResults,
            totalScore: state.totalScore,
          }),
        });
        const d = await r.json();
        if (d.artDNA) setArtDNA(d.artDNA);
        else setError("Couldn't generate your Art DNA");
      } catch {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    }
    generate();
  }, [state.artDNA, state.challengeResults, state.totalScore, setArtDNA]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5">
        <div className="w-12 h-12 rounded-full border-4 border-secondary border-t-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Analyzing your Art DNA…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-5 pt-10 pb-10 space-y-6">
      <div>
        <p className="text-[0.65rem] tracking-[0.25em] uppercase text-accent">Quest Complete</p>
        <h1 className="font-display text-3xl text-foreground mt-1">
          You scored{" "}
          <span className="text-primary font-display">{state.totalScore} pts</span>{" "}
          🎉
        </h1>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {state.artDNA && (
        <ArtDNACard dna={state.artDNA as ArtDNA} totalScore={state.totalScore} />
      )}

      {/* Unlocked rewards */}
      {unlockedRewards.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-accent uppercase tracking-widest mb-3">
            Your Rewards
          </h2>
          <div className="space-y-3">
            {unlockedRewards.map((r) => (
              <CouponCard key={r.code} reward={r} />
            ))}
          </div>
        </div>
      )}

      {/* Curator's secrets collected */}
      {state.curatorSecrets.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-accent uppercase tracking-widest mb-3">
            Curator&apos;s Secrets Collected
          </h2>
          <div className="space-y-3">
            {state.curatorSecrets.map((s, i) => (
              <div key={i} className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
                <p className="font-bold text-amber-900 text-sm">{s.title}</p>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">{s.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <Link href="/">
        <Button size="lg" variant="secondary">
          Start a new quest
        </Button>
      </Link>
    </div>
  );
}
