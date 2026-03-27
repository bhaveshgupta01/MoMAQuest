"use client";

import { useEffect, useState } from "react";

interface PointsAnimationProps {
  points: number;
  streak?: boolean;
  onDone?: () => void;
}

export function PointsAnimation({ points, streak, onDone }: PointsAnimationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 1800);
    return () => clearTimeout(t);
  }, [onDone]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
      <div
        className="animate-bounce text-center"
        style={{ animation: "pointsPop 1.8s ease-out forwards" }}
      >
        <div className="text-5xl font-black text-black">+{points}</div>
        {streak && (
          <div className="text-lg text-orange-500 font-bold mt-1">🔥 Streak bonus!</div>
        )}
      </div>
      <style>{`
        @keyframes pointsPop {
          0% { opacity: 0; transform: scale(0.5) translateY(20px); }
          30% { opacity: 1; transform: scale(1.2) translateY(-10px); }
          60% { opacity: 1; transform: scale(1) translateY(-20px); }
          100% { opacity: 0; transform: scale(0.8) translateY(-60px); }
        }
      `}</style>
    </div>
  );
}
