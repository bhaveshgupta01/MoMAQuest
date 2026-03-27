"use client";

import Link from "next/link";
import { PaintingImage } from "@/components/ui/PaintingImage";
import { QuestStop } from "@/lib/types";

interface QuestMapProps {
  stops: QuestStop[];
  completedIds: number[];
  currentIndex: number;
}

export function QuestMap({ stops, completedIds, currentIndex }: QuestMapProps) {
  return (
    <div className="flex flex-col gap-4">
      {stops.map((stop, i) => {
        const done = completedIds.includes(stop.objectID);
        const isCurrent = i === currentIndex;
        const locked = i > currentIndex && !done;

        return (
          <div key={stop.objectID} className="flex gap-3">
            {/* Timeline */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  done
                    ? "bg-primary text-primary-foreground"
                    : isCurrent
                    ? "bg-primary text-primary-foreground ring-4 ring-secondary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {done ? "✓" : i + 1}
              </div>
              {i < stops.length - 1 && (
                <div
                  className={`w-0.5 flex-1 mt-1 min-h-[2rem] ${
                    done ? "bg-primary/40" : "bg-border"
                  }`}
                />
              )}
            </div>

            {/* Card */}
            <Link
              href={locked ? "#" : `/quest/${stop.objectID}`}
              className={`flex-1 mb-4 ${locked ? "pointer-events-none opacity-40" : ""}`}
            >
              <div
                className={`rounded-2xl border p-4 flex gap-3 transition-all ${
                  isCurrent
                    ? "border-primary bg-secondary/30 shadow-sm"
                    : done
                    ? "border-border bg-muted/30"
                    : "border-border bg-white"
                }`}
              >
                <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-muted">
                  <PaintingImage
                    src={stop.thumbnail}
                    alt={stop.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm leading-tight text-foreground truncate">
                    {stop.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {stop.artist} · {stop.year}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">{stop.currentLocation}</p>
                  {isCurrent && (
                    <p className="text-xs text-accent mt-2 italic line-clamp-2">
                      {stop.teaser}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
