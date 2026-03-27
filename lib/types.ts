// ─── MoMA API Types ────────────────────────────────────────────────────────

export interface MoMAObject {
  objectNumber: string;
  objectID: number;
  title: string;
  role: string;
  displayName: string;
  alphaSort: string;
  artistID: number;
  displayDate: string;
  dated: string;
  dateBegin: number;
  dateEnd: number;
  accessionDate: string;
  medium: string;
  dimensions: string;
  department: string;
  classification: string;
  onView: number;
  provenance: string;
  description: string;
  objectStatusID: number;
  creditLine: string;
  imageID: string;
  thumbnail: string;
  fullImage: string;
  currentLocation: string;
  lastModifiedDate: string;
}

export interface MoMADetailedObject extends MoMAObject {
  prefix: string;
  suffix: string;
  departmentID: number;
  portfolio: string;
  edition: string;
  objRightsType: string;
  curatorApproved: number;
  exhibitions: {
    resultsCount: number;
    exhibitions: Array<{
      exhibitionID: number;
      exhibitionTitle: string;
      exhibitionDisplayDate: string;
      exhibitionBeginDate: string;
      exhibitionEndDate: string;
      locationString: string;
      objectCount: number;
      department: string;
      constituents: { constituents: Array<{ role: string; displayName: string }> };
    }>;
  };
  persons: {
    resultsCount: number;
    persons: Array<{
      artistID: number;
      displayName: string;
      role: string;
      displayDate: string;
      displayOrder: number;
    }>;
  };
  images: {
    resultsCount: number;
    images: Array<{
      fileName: string;
      thumbnail: string;
      fullImage: string;
      mediaType: string;
      description: string;
      primaryDisplay: number;
    }>;
  };
  titles: { titles: Array<{ title: string; titleType: string }> };
  dates: { dates: Array<{ eventType: string; dateText: string }> };
}

// ─── Visual Hunt Types ─────────────────────────────────────────────────────

export interface HuntObject {
  label: string;       // "a skull", "a hand", "a clock"
  emoji: string;       // "💀", "✋", "🕐"
  present: boolean;    // actually in the painting (from Claude Vision)
  hint?: string;       // where to look if user is stuck
}

export interface VisualHuntChallenge {
  painting_id: number;
  instruction: string;                // "Look closely — which of these can you spot?"
  objects: HuntObject[];              // 6 items: ~3-4 present, ~2-3 absent
  points_per_hit: number;             // points for correctly identifying a present object
  points_per_skip: number;            // points for correctly NOT selecting an absent object
  reveal_text: string;                // shown after submit
  follow_up: {
    question: string;                 // deeper question about something they found
    points: number;
    sample_answer: string;            // shown as "one perspective" after they answer
  };
  curator_secret: {
    title: string;
    content: string;
    source_hint?: string;
  };
}

// ─── Quest / AI Types ──────────────────────────────────────────────────────

export interface TasteProfile {
  primary_style: string;
  era_preference: string;
  mood: string;
  surprise_factor: string;
}

export interface QuestStop {
  order: number;
  objectID: number;
  title: string;
  artist: string;
  year: string;
  currentLocation: string;
  thumbnail: string;
  teaser: string;
  connection_to_next: string;
}

export interface QuestData {
  quest_title: string;
  taste_profile: TasteProfile;
  estimated_time: string;
  stops: QuestStop[];
  quest_narrative: string;
}

export interface CuratorSecret {
  title: string;
  content: string;
  source_hint?: string;
}

export interface ArtDNA {
  art_persona: string;
  tagline: string;
  strengths: string[];
  art_soulmate: { artist: string; why: string };
  next_visit_recommendation: string;
  share_text: string;
}

// ─── Game State ────────────────────────────────────────────────────────────

export interface UserPreferences {
  interests: string[];
  timeAvailable: string;
  vibe: string;
}

export interface ChallengeResult {
  objectId: number;
  paintingTitle: string;
  objectsSpotted: string[];   // labels of objects the user selected
  followUpAnswer: string;     // their open-ended follow-up answer (may be empty)
  pointsEarned: number;
}

export interface Reward {
  points: number;
  reward: string;
  code: string;
}

export interface GameState {
  sessionId: string;
  preferences: UserPreferences;
  tasteProfile: TasteProfile | null;
  quest: QuestData | null;
  completedStops: number[];
  currentStopIndex: number;
  totalScore: number;
  streak: number;
  challengeResults: ChallengeResult[];
  unlockedCoupons: string[];
  curatorSecrets: CuratorSecret[];
  artDNA: ArtDNA | null;
  // Return visit tracking — persists across quest resets
  visitCount: number;      // how many full quests started (0 = first visit)
  allTimeScore: number;    // cumulative across all visits
}

// ─── Crowd Control ─────────────────────────────────────────────────────────

export interface FloorCrowdCount {
  floor: string;
  visitor_count: number;
  last_updated: string;
}

export type CrowdLevel = "low" | "moderate" | "high";

export interface FloorCrowdSummary {
  floor: string;
  count: number;
  level: CrowdLevel;
}
