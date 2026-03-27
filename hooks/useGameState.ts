"use client";

import { useGame } from "@/context/GameContext";
import { REWARDS } from "@/lib/game-state";

export function useGameState() {
  const game = useGame();
  const { state } = game;

  const nextReward = REWARDS.find(
    (r) => r.points > state.totalScore
  );
  const pointsToNextReward = nextReward
    ? nextReward.points - state.totalScore
    : 0;

  const progressPercent =
    state.quest && state.quest.stops.length > 0
      ? Math.round(
          (state.completedStops.length / state.quest.stops.length) * 100
        )
      : 0;

  const isQuestComplete =
    !!state.quest &&
    state.completedStops.length >= state.quest.stops.length;

  return {
    ...game,
    nextReward,
    pointsToNextReward,
    progressPercent,
    isQuestComplete,
  };
}
