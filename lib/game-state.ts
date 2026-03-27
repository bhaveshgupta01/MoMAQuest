import { GameState, Reward, ChallengeResult } from "./types";
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "art-detective-state";

export const POINTS = {
  hit: 20,       // correctly spotted a present object
  skip: 10,      // correctly didn't select an absent object
  followUp: 30,  // answered the follow-up question
  streakMultiplier: 1.5,
  returnVisitMultiplier: 2.0,  // 2× all points on 2nd visit onwards
};

export const REWARDS: Reward[] = [
  { points: 50,  reward: "10% off MoMA Store",       code: "ARTDET10"  },
  { points: 100, reward: "Free coffee at MoMA Café", code: "ARTCAFE"   },
  { points: 200, reward: "15% off + free postcard",  code: "ARTDET15"  },
  { points: 500, reward: "Art Detective Badge",       code: "DETECTIVE" },
];

export function getDefaultState(visitCount = 0, allTimeScore = 0): GameState {
  return {
    sessionId: uuidv4(),
    preferences: { interests: [], timeAvailable: "", vibe: "" },
    tasteProfile: null,
    quest: null,
    completedStops: [],
    currentStopIndex: 0,
    totalScore: 0,
    streak: 0,
    challengeResults: [],
    unlockedCoupons: [],
    curatorSecrets: [],
    artDNA: null,
    visitCount,
    allTimeScore,
  };
}

export function loadState(): GameState {
  if (typeof window === "undefined") return getDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : getDefaultState();
  } catch {
    return getDefaultState();
  }
}

export function saveState(state: GameState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage quota exceeded — non-fatal
  }
}

// Reset current quest but preserve visit history so return-visit bonus carries over
export function clearState(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const prev: Partial<GameState> = raw ? JSON.parse(raw) : {};
    const fresh = getDefaultState(
      (prev.visitCount ?? 0),          // keep visit count
      (prev.allTimeScore ?? 0)          // keep all-time score
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// ─── Score helpers ─────────────────────────────────────────────────────────

export function calculatePoints(
  basePoints: number,
  streak: number
): number {
  const multiplier = streak >= 3 ? POINTS.streakMultiplier : 1;
  return Math.round(basePoints * multiplier);
}

export function getNewlyUnlockedRewards(
  prevScore: number,
  newScore: number,
  alreadyUnlocked: string[]
): Reward[] {
  return REWARDS.filter(
    (r) =>
      newScore >= r.points &&
      prevScore < r.points &&
      !alreadyUnlocked.includes(r.code)
  );
}

export function addChallengeResult(
  state: GameState,
  result: ChallengeResult
): GameState {
  const prevScore = state.totalScore;
  // Apply 2× multiplier for return visitors (visitCount > 0 = has done at least one quest before)
  const returnBonus = state.visitCount > 0 ? POINTS.returnVisitMultiplier : 1;
  const earned = Math.round(result.pointsEarned * returnBonus);
  const newScore = prevScore + earned;
  // Streak: keep going if they spotted at least 2 objects correctly
  const newStreak = result.objectsSpotted.length >= 2 ? state.streak + 1 : 0;

  const newlyUnlocked = getNewlyUnlockedRewards(
    prevScore,
    newScore,
    state.unlockedCoupons
  );

  return {
    ...state,
    totalScore: newScore,
    allTimeScore: state.allTimeScore + earned,
    streak: newStreak,
    challengeResults: [...state.challengeResults, { ...result, pointsEarned: earned }],
    unlockedCoupons: [
      ...state.unlockedCoupons,
      ...newlyUnlocked.map((r) => r.code),
    ],
  };
}
