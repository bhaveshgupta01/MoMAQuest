"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { PaintingImage } from "@/components/ui/PaintingImage";
import Link from "next/link";
import { useGame } from "@/context/GameContext";
import { VisualHuntCard } from "@/components/challenges/VisualHuntCard";
import { CuratorSecret } from "@/components/challenges/CuratorSecret";
import { PointsAnimation } from "@/components/ui/PointsAnimation";
import { Button } from "@/components/ui/Button";
import { VisualHuntChallenge, QuestStop } from "@/lib/types";
import { extractFloor } from "@/lib/crowd-control";

export default function PaintingStopPage({
  params,
}: {
  params: Promise<{ objectId: string }>;
}) {
  const { objectId } = use(params);
  const id = parseInt(objectId, 10);
  const router = useRouter();
  const { state, completeStop, recordChallengeResult, addCuratorSecret, reportLocation } =
    useGame();

  const [hunt, setHunt] = useState<VisualHuntChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [secretUnlocked, setSecretUnlocked] = useState(false);
  const [pointsFlash, setPointsFlash] = useState<{ pts: number; streak: boolean } | null>(null);
  const [huntDone, setHuntDone] = useState(false);

  const stop: QuestStop | undefined = state.quest?.stops.find((s) => s.objectID === id);

  // Compute the next uncompleted stop for the "Up next" teaser
  const stops = state.quest?.stops ?? [];
  const currentIndex = stops.findIndex((s) => s.objectID === id);
  const nextStop = stops
    .slice(currentIndex + 1)
    .find((s) => !state.completedStops.includes(s.objectID));

  // The connection narrative lives on the *current* stop, pointing toward nextStop
  const connectionToNext = currentIndex >= 0 ? stops[currentIndex]?.connection_to_next : undefined;

  // Report location to crowd system
  useEffect(() => {
    if (stop) {
      const floor = extractFloor(stop.currentLocation);
      reportLocation(floor, stop.currentLocation, id);
    }
  }, [stop, id, reportLocation]);

  // Fetch the visual hunt
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const r = await fetch("/api/challenges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            objectId: id,
            // Send stop metadata as fallback when MoMA API is unavailable
            stopMeta: stop ? {
              title: stop.title,
              artist: stop.artist,
              year: stop.year,
              location: stop.currentLocation,
            } : undefined,
          }),
        });
        const d = await r.json();
        if (d.hunt) setHunt(d.hunt);
        else setError("Couldn't load the challenge");
      } catch {
        setError("Network error — please try again");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  function handleHuntComplete(score: number, spotted: string[], unlockSecret: boolean) {
    const isStreak = state.streak >= 2;
    setPointsFlash({ pts: score, streak: isStreak });
    setSecretUnlocked(unlockSecret);
    setHuntDone(true);

    recordChallengeResult({
      objectId: id,
      paintingTitle: stop?.title ?? "Unknown",
      objectsSpotted: spotted,
      followUpAnswer: "",
      pointsEarned: score,
    });

    if (unlockSecret && hunt?.curator_secret) {
      addCuratorSecret(hunt.curator_secret);
    }
  }

  function handleFinishStop() {
    completeStop(id);
    router.push("/quest");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-zinc-200 border-t-black rounded-full animate-spin" />
        <p className="text-sm text-zinc-400">Loading your visual hunt…</p>
      </div>
    );
  }

  if (error || !hunt) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="text-zinc-500 mb-4">{error || "Something went wrong"}</p>
        <Button onClick={() => router.refresh()}>Try again</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Points flash */}
      {pointsFlash && (
        <PointsAnimation
          points={pointsFlash.pts}
          streak={pointsFlash.streak}
          onDone={() => setPointsFlash(null)}
        />
      )}

      {/* Header */}
      <div className="px-5 pt-8 pb-4 border-b border-zinc-100">
        <Link href="/quest" className="text-sm text-zinc-400 flex items-center gap-1 mb-4">
          ← Back to quest
        </Link>
        {stop && (
          <div className="flex gap-3 items-center">
            <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-zinc-100">
              <PaintingImage
                src={stop.thumbnail}
                alt={stop.title}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="font-black text-lg text-zinc-900 leading-tight">{stop.title}</h1>
              <p className="text-sm text-zinc-400">
                {stop.artist} · {stop.year}
              </p>
              <p className="text-xs text-zinc-300">{stop.currentLocation}</p>
            </div>
          </div>
        )}
      </div>

      {/* Return visit banner */}
      {state.visitCount > 1 && (
        <div className="px-5 py-2 bg-primary/10 border-b border-primary/20 flex items-center gap-2">
          <span className="text-base">🎉</span>
          <p className="text-xs font-semibold text-primary">
            Welcome back! You&apos;re earning <strong>2× points</strong> on this visit.
          </p>
        </div>
      )}

      {/* Score + streak bar */}
      <div className="px-5 py-3 flex items-center justify-between border-b border-border bg-muted/30" suppressHydrationWarning>
        <div>
          <p className="text-xs text-muted-foreground">Total score</p>
          <p className="font-display text-xl text-primary" suppressHydrationWarning>{state.totalScore} pts</p>
        </div>
        <div className="flex gap-4 items-center">
          {state.visitCount > 1 && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">All-time</p>
              <p className="text-sm font-semibold text-accent" suppressHydrationWarning>{state.allTimeScore} pts</p>
            </div>
          )}
          {state.streak >= 2 && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Streak</p>
              <p className="text-xl font-black text-orange-500" suppressHydrationWarning>🔥 ×{state.streak}</p>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-5 py-5 space-y-4 pb-6">
        {/* The visual hunt game */}
        <VisualHuntCard
          hunt={hunt}
          streak={state.streak}
          paintingTitle={stop?.title}
          nextStop={nextStop ? {
            title: nextStop.title,
            currentLocation: nextStop.currentLocation,
            connection_to_next: connectionToNext,
          } : undefined}
          onSubmit={handleHuntComplete}
          onNavigateNext={handleFinishStop}
        />

        {/* Curator's Secret — appears after hunt */}
        {huntDone && (
          <CuratorSecret secret={hunt.curator_secret} unlocked={secretUnlocked} />
        )}

        {/* Talk to painting — always available */}
        <Link href={`/talk/${id}`}>
          <button className="w-full py-3 rounded-2xl border border-zinc-200 text-sm text-zinc-500 hover:bg-zinc-50 transition-colors">
            💬 Talk to this painting
          </button>
        </Link>
      </div>

    </div>
  );
}
