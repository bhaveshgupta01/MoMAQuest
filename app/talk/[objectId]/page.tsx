"use client";

import { use } from "react";
import Link from "next/link";
import { useGame } from "@/context/GameContext";
import { PaintingChat } from "@/components/chat/PaintingChat";

export default function TalkPage({
  params,
}: {
  params: Promise<{ objectId: string }>;
}) {
  const { objectId } = use(params);
  const id = parseInt(objectId, 10);
  const { state } = useGame();
  const stop = state.quest?.stops.find((s) => s.objectID === id);

  const title = stop?.title ?? "this painting";
  const artist = stop?.artist ?? "the artist";

  return (
    <div className="min-h-screen flex flex-col px-5 pt-10 pb-6">
      <Link
        href={`/quest/${objectId}`}
        className="text-sm text-zinc-400 mb-4 inline-flex items-center gap-1"
      >
        ← Back
      </Link>
      <h1 className="text-xl font-black text-zinc-900 mb-1">Talk to the Painting</h1>
      <p className="text-sm text-zinc-400 mb-5">
        {title} · {artist}
      </p>
      <div className="flex-1">
        <PaintingChat title={title} artist={artist} />
      </div>
    </div>
  );
}
