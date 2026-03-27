"use client";

interface ProgressDotsProps {
  total: number;
  completed: number;
  current: number;
}

export function ProgressDots({ total, completed, current }: ProgressDotsProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i < completed
              ? "w-3 h-3 bg-primary"
              : i === current
              ? "w-4 h-4 bg-primary/60 ring-2 ring-secondary"
              : "w-3 h-3 bg-border"
          }`}
        />
      ))}
    </div>
  );
}
