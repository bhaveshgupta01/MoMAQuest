"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGame } from "@/context/GameContext";
import { PaintingImage } from "@/components/ui/PaintingImage";
import { QRScanner } from "@/components/scanner/QRScanner";

// The Starry Night — Van Gogh — MoMA objectID 79802
const DEMO_PAINTING = {
  objectId: 79802,
  title: "The Starry Night",
  artist: "Vincent van Gogh",
  year: "1889",
  thumbnail: "https://www.moma.org/media/W1siZiIsIjQ1ODk3MCJdLFsicCIsImNvbnZlcnQiLCItcXVhbGl0eSA5MCAtcmVzaXplIDIwMDB4MjAwMFx1MDAzZSJdXQ.jpg?sha=9bef5c0f63a0e876",
};

type ScanState = "idle" | "scanning" | "found";

export default function ScanPage() {
  const router = useRouter();
  const { state } = useGame();
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [showQR, setShowQR] = useState(false);

  const stops = state.quest?.stops ?? [];
  const completed = new Set(state.completedStops);
  const sorted = [...stops].sort((a, b) => {
    const aDone = completed.has(a.objectID) ? 1 : 0;
    const bDone = completed.has(b.objectID) ? 1 : 0;
    return aDone - bDone || a.order - b.order;
  });

  function handleNFCTap() {
    setScanState("scanning");
    setTimeout(() => setScanState("found"), 1800);
  }

  function handleEnterPainting() {
    router.push(`/quest/${DEMO_PAINTING.objectId}`);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-5 pt-10 pb-5 border-b border-zinc-100">
        <Link href="/quest" className="text-sm text-zinc-400 mb-5 inline-flex items-center gap-1">
          ← Back to quest
        </Link>
        <p className="text-[0.65rem] tracking-[0.25em] uppercase text-accent mb-1">NFC · Art Detective</p>
        <h1 className="font-display text-3xl text-foreground leading-tight">Tap a painting</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Hold your phone to the NFC plaque next to any artwork to begin.
        </p>
      </div>

      {/* NFC Demo Panel */}
      <div className="px-5 py-6 flex flex-col items-center">

        {scanState === "idle" && (
          <>
            {/* Phone + plaque animation */}
            <div className="relative flex flex-col items-center mb-8 select-none">
              {/* Ripple rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 rounded-full border-2 border-primary/15 animate-ping-slow" />
                <div className="absolute w-32 h-32 rounded-full border-2 border-primary/25 animate-ping-slow" style={{ animationDelay: "0.4s" }} />
              </div>

              {/* Plaque */}
              <div className="w-36 h-24 rounded-xl bg-zinc-800 border-4 border-zinc-600 shadow-lg flex flex-col items-center justify-center gap-1.5 z-10">
                <div className="w-8 h-8 rounded-full border-2 border-zinc-400 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-zinc-400" />
                </div>
                <p className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase">NFC</p>
              </div>

              {/* Phone */}
              <div className="mt-4 w-14 h-24 rounded-2xl bg-zinc-900 border-2 border-zinc-600 shadow-xl flex items-center justify-center z-10">
                <div className="w-8 h-14 rounded-lg bg-zinc-800 flex items-center justify-center">
                  <span className="text-lg">🔍</span>
                </div>
              </div>

              {/* Tap hint arrow */}
              <div className="mt-2 flex flex-col items-center gap-0.5">
                <div className="w-0.5 h-4 bg-primary/40 rounded-full animate-bounce" />
                <p className="text-xs text-primary/60 font-medium">tap</p>
              </div>
            </div>

            <button
              onClick={handleNFCTap}
              className="w-full max-w-xs bg-primary text-primary-foreground rounded-full py-4 font-semibold text-base transition-all hover:bg-primary/90 active:scale-95 shadow-md"
            >
              Demo: Tap to painting plaque
            </button>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              In the real experience, just hold your phone to the plaque — no tapping required.
            </p>
          </>
        )}

        {scanState === "scanning" && (
          <div className="flex flex-col items-center gap-5 py-8">
            {/* Scanning animation */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
              <div className="absolute inset-2 rounded-full border-4 border-primary/40 animate-ping" style={{ animationDelay: "0.15s" }} />
              <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                <span className="text-2xl">📡</span>
              </div>
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Reading plaque…</p>
              <p className="text-sm text-muted-foreground mt-1">Identifying artwork</p>
            </div>
          </div>
        )}

        {scanState === "found" && (
          <div className="w-full flex flex-col items-center gap-5">
            {/* Found painting card */}
            <div className="w-full rounded-3xl border-2 border-primary/30 bg-secondary/20 overflow-hidden shadow-sm">
              <div className="relative w-full h-52 bg-zinc-100">
                <PaintingImage
                  src={DEMO_PAINTING.thumbnail}
                  alt={DEMO_PAINTING.title}
                  fill
                  className="object-cover"
                />
                {/* Overlay label */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <p className="font-display text-2xl text-white leading-tight">{DEMO_PAINTING.title}</p>
                  <p className="text-sm text-white/80 mt-0.5">{DEMO_PAINTING.artist}, {DEMO_PAINTING.year}</p>
                </div>
              </div>
              <div className="px-4 py-3 flex items-center gap-2">
                <span className="text-emerald-500 text-lg">✓</span>
                <p className="text-sm font-semibold text-foreground">Painting identified!</p>
                <p className="text-xs text-muted-foreground ml-auto">MoMA collection</p>
              </div>
            </div>

            <button
              onClick={handleEnterPainting}
              className="w-full bg-primary text-primary-foreground rounded-full py-4 font-semibold text-base transition-all hover:bg-primary/90 active:scale-95"
            >
              Start the challenge →
            </button>

            <button
              onClick={() => setScanState("idle")}
              className="text-sm text-muted-foreground underline"
            >
              Scan a different painting
            </button>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="px-5 flex items-center gap-3 py-2">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">or find in your quest</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Quest stops list */}
      {sorted.length > 0 && (
        <div className="px-5 py-4 space-y-3">
          {sorted.map((stop) => {
            const isDone = completed.has(stop.objectID);
            return (
              <button
                key={stop.objectID}
                onClick={() => router.push(`/quest/${stop.objectID}`)}
                className={`w-full flex gap-3 items-center rounded-2xl border p-3 text-left transition-all active:scale-[0.98] ${
                  isDone
                    ? "border-emerald-200 bg-emerald-50 opacity-60"
                    : "border-border bg-white shadow-sm hover:border-primary/40"
                }`}
              >
                <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-zinc-100">
                  <PaintingImage src={stop.thumbnail} alt={stop.title} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground leading-tight truncate">{stop.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{stop.currentLocation}</p>
                </div>
                <div className="shrink-0">
                  {isDone ? (
                    <span className="text-emerald-500 text-base">✓</span>
                  ) : (
                    <span className="text-primary text-sm font-bold">→</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* QR toggle */}
      <div className="px-5 pb-6 mt-2">
        <button
          onClick={() => setShowQR((v) => !v)}
          className="w-full py-3 rounded-2xl border border-dashed border-zinc-300 text-sm text-zinc-400 hover:border-zinc-400 transition-colors"
        >
          {showQR ? "Hide camera" : "📷 Scan QR code instead"}
        </button>
        {showQR && (
          <div className="mt-4">
            <Suspense fallback={<div className="text-zinc-400 text-sm text-center py-4">Loading camera…</div>}>
              <QRScanner />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
}
