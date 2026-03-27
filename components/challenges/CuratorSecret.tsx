"use client";

import { useState } from "react";
import { CuratorSecret as CuratorSecretType } from "@/lib/types";

interface CuratorSecretProps {
  secret: CuratorSecretType;
  unlocked: boolean;
}

export function CuratorSecret({ secret, unlocked }: CuratorSecretProps) {
  const [revealed, setRevealed] = useState(false);

  if (!unlocked) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-zinc-200 p-5 text-center">
        <div className="text-3xl mb-2">🔒</div>
        <p className="text-sm text-zinc-500">
          Get 2/3 challenges right to unlock the Curator&apos;s Secret
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border-2 border-amber-300 bg-amber-50 p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🏛️</span>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
          Curator&apos;s Secret — Unlocked!
        </span>
      </div>
      {!revealed ? (
        <button
          className="w-full text-sm font-semibold text-amber-800 underline"
          onClick={() => setRevealed(true)}
        >
          Tap to reveal the secret…
        </button>
      ) : (
        <div>
          <p className="font-bold text-amber-900 mb-2">{secret.title}</p>
          <p className="text-sm text-amber-800 leading-relaxed">{secret.content}</p>
          {secret.source_hint && (
            <p className="text-xs text-amber-600 mt-3 italic">Source: {secret.source_hint}</p>
          )}
        </div>
      )}
    </div>
  );
}
