"use client";

import { ArtDNA } from "@/lib/types";
import { Button } from "@/components/ui/Button";

interface ArtDNACardProps {
  dna: ArtDNA;
  totalScore: number;
}

export function ArtDNACard({ dna, totalScore }: ArtDNACardProps) {
  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: "My MoMA Art DNA",
        text: dna.share_text,
        url: window.location.origin,
      });
    } else {
      navigator.clipboard.writeText(dna.share_text);
      alert("Copied to clipboard!");
    }
  }

  return (
    <div className="rounded-3xl bg-black text-white p-6 space-y-4">
      <div className="text-center">
        <div className="text-4xl mb-2">🎨</div>
        <p className="text-xs uppercase tracking-widest text-zinc-400 mb-1">Your Art DNA</p>
        <h2 className="text-2xl font-black">{dna.art_persona}</h2>
        <p className="text-zinc-300 text-sm mt-1 italic">{dna.tagline}</p>
      </div>

      <div className="border-t border-zinc-700 pt-4">
        <p className="text-xs uppercase tracking-widest text-zinc-400 mb-2">Strengths</p>
        <div className="flex flex-wrap gap-2">
          {dna.strengths.map((s) => (
            <span
              key={s}
              className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-200 text-xs font-medium"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-zinc-900 p-4">
        <p className="text-xs uppercase tracking-widest text-zinc-400 mb-1">Art Soulmate</p>
        <p className="font-bold text-white">{dna.art_soulmate.artist}</p>
        <p className="text-sm text-zinc-400 mt-1">{dna.art_soulmate.why}</p>
      </div>

      <div>
        <p className="text-xs uppercase tracking-widest text-zinc-400 mb-1">Next Visit</p>
        <p className="text-sm text-zinc-300">{dna.next_visit_recommendation}</p>
      </div>

      <div className="border-t border-zinc-700 pt-4 text-center">
        <p className="text-3xl font-black text-white mb-1">{totalScore} pts</p>
        <p className="text-xs text-zinc-400">Art Detective Score</p>
      </div>

      <Button onClick={handleShare} variant="secondary" size="lg">
        Share my Art DNA ↗
      </Button>
    </div>
  );
}
