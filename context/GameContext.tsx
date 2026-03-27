"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  GameState,
  UserPreferences,
  QuestData,
  TasteProfile,
  CuratorSecret,
  ArtDNA,
  ChallengeResult,
} from "@/lib/types";
import {
  loadState,
  saveState,
  getDefaultState,
  addChallengeResult,
  clearState,
} from "@/lib/game-state";

interface GameContextValue {
  state: GameState;
  setPreferences: (prefs: UserPreferences) => void;
  setQuest: (quest: QuestData, tasteProfile: TasteProfile) => void;
  completeStop: (objectId: number) => void;
  recordChallengeResult: (result: ChallengeResult) => void;
  addCuratorSecret: (secret: CuratorSecret) => void;
  setArtDNA: (dna: ArtDNA) => void;
  reportLocation: (floor: string, gallery?: string, artworkId?: number) => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(() =>
    typeof window !== "undefined" ? loadState() : getDefaultState()
  );

  // Persist to localStorage on every state change
  useEffect(() => {
    saveState(state);
  }, [state]);

  const setPreferences = useCallback((prefs: UserPreferences) => {
    setState((s) => ({ ...s, preferences: prefs }));
  }, []);

  const setQuest = useCallback((quest: QuestData, tasteProfile: TasteProfile) => {
    setState((s) => ({
      ...s,
      quest,
      tasteProfile,
      // Increment visitCount each time a new quest is generated
      visitCount: s.visitCount + 1,
    }));
  }, []);

  const completeStop = useCallback((objectId: number) => {
    setState((s) => ({
      ...s,
      completedStops: s.completedStops.includes(objectId)
        ? s.completedStops
        : [...s.completedStops, objectId],
      currentStopIndex: Math.min(
        s.currentStopIndex + 1,
        (s.quest?.stops.length ?? 1) - 1
      ),
    }));
  }, []);

  const recordChallengeResult = useCallback((result: ChallengeResult) => {
    setState((s) => addChallengeResult(s, result));
  }, []);

  const addCuratorSecret = useCallback((secret: CuratorSecret) => {
    setState((s) => ({
      ...s,
      curatorSecrets: [...s.curatorSecrets, secret],
    }));
  }, []);

  const setArtDNA = useCallback((dna: ArtDNA) => {
    setState((s) => ({ ...s, artDNA: dna }));
  }, []);

  // Fire-and-forget location update to crowd API
  const reportLocation = useCallback(
    (floor: string, gallery?: string, artworkId?: number) => {
      fetch("/api/crowd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: state.sessionId,
          floor,
          gallery,
          artworkId,
        }),
      }).catch(() => {});
    },
    [state.sessionId]
  );

  const resetGame = useCallback(() => {
    clearState();
    setState(getDefaultState());
  }, []);

  return (
    <GameContext.Provider
      value={{
        state,
        setPreferences,
        setQuest,
        completeStop,
        recordChallengeResult,
        addCuratorSecret,
        setArtDNA,
        reportLocation,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside <GameProvider>");
  return ctx;
}
