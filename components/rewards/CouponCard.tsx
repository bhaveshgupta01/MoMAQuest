"use client";

import { Reward } from "@/lib/types";

interface CouponCardProps {
  reward: Reward;
}

export function CouponCard({ reward }: CouponCardProps) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-black p-4 flex items-center justify-between gap-4">
      <div>
        <p className="font-bold text-zinc-900 text-sm">{reward.reward}</p>
        <p className="text-xs text-zinc-500 mt-0.5">Show at checkout</p>
      </div>
      <div className="bg-black text-white font-mono text-xs font-bold px-3 py-2 rounded-xl tracking-widest">
        {reward.code}
      </div>
    </div>
  );
}
