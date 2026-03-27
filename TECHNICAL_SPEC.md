# ART DETECTIVE — Technical Documentation for Development
## MoMA Hackathon 2026 | NYU Team

---

## 1. PROJECT OVERVIEW

**App Name:** Art Detective (working title — "MoMA Quest" also viable)

**One-liner:** An AI-powered museum companion that solves "where do I start?" with a personalized art quest, then gamifies each painting stop with detective challenges, unlocking curator secrets and real rewards.

**Challenge alignment:** Challenge 1 — reimagine the onsite visitor experience through design, technology, and communication to help visitors navigate, discover art that resonates, and feel connected before/during/after.

**Core insight:** "Museum fatigue" has been documented since 1916. Research shows visitor interest drops after 30 minutes. 60%+ of visitors report frustration with navigation. Expert recommendation: pick 3-5 things, skip the rest. But nobody does this because they don't know WHAT to pick. Our app automates this with AI.

---

## 2. USER JOURNEY (3 phases)

### Phase 1: Onboarding — "Where do I start?" (30-60 seconds)
1. User opens web app on phone (no app store download — mobile-responsive PWA)
2. Sees welcoming screen: "Welcome to MoMA. Let's build your perfect visit."
3. Answers 2-3 quick preference questions:
   - **Interest type** (multi-select): "What draws you in?" → options like "Bold colors & emotion", "Hidden details & symbolism", "Social media favorites", "Design & architecture", "Photography", "Weird & experimental", "The greatest hits"
   - **Time available** (single select): "How long are you staying?" → "Quick visit (45 min)", "A good explore (90 min)", "I've got all day"
   - **Vibe** (single select): "What kind of experience?" → "Surprise me", "Deep dive into a few pieces", "I want to see the icons", "Show me what's underrated"
4. App calls MoMA API to fetch on-view artworks, then sends preferences + artwork data to Claude API
5. Claude generates a **personalized quest**: 5-7 painting stops with a walking route optimized by floor/location
6. App also considers **crowd distribution** — if many users are being routed to Floor 5, bias some routes toward Floor 4 or Floor 2

### Phase 2: In-Gallery — Gamified Discovery (the core loop)
1. User sees their quest as a vertical list of stops with progress dots
2. At each stop, they **scan a QR code** OR **point camera at the painting** to activate it
3. App fetches painting details from MoMA API, then calls Claude to generate challenges
4. **3 challenge tiers appear as cards:**
   - **I Spy / Visual** (Easy, 10 pts): "Look closely — can you spot the [detail]?"
   - **Detective / Context** (Medium, 25 pts): "This was created the same year as [event]. Which one?"
   - **Curator / Interpretation** (Hard, 50 pts): Open-ended — share your interpretation, AI responds
5. Correct answers → point animation → **streak bonuses** (3 in a row = 1.5x multiplier)
6. Getting 2/3 right unlocks a **"Curator's Secret"** — a genuinely surprising fact about the piece
7. Optional: **"Talk to this painting"** button → opens a chat where Claude Vision analyzes the painting and answers questions conversationally

### Phase 3: Rewards + Post-Visit
1. **Point milestones unlock rewards:**
   - 50 pts → 10% off MoMA gift shop (coupon code displayed in app)
   - 100 pts → free coffee/drink at MoMA café  
   - 200 pts → 15% off gift shop + free postcard
   - 500 pts → "Art Detective" badge (shareable)
2. **"Your Art DNA" card** — AI-generated personality summary:
   - Art persona name (e.g., "The Emotional Abstractionist")
   - Tagline, strengths, artist soulmate match
   - Next-visit recommendation
   - Pre-written social share text
3. Leaderboard (daily/weekly) for competitive visitors
4. Share Art DNA card to Instagram/Twitter

---

## 3. TECH STACK

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | **Next.js 14+ (App Router)** with TypeScript | Mobile-first SSR, API routes built-in, fast deployment |
| Styling | **Tailwind CSS** | Rapid mobile UI, utility-first, no design system overhead |
| AI | **Anthropic Claude API** (claude-sonnet-4-20250514) | Vision capability for painting analysis, structured JSON output |
| Data | **MoMA Collection API** (REST, token-based) | Live artwork data, images, locations, exhibition history |
| QR Scanning | **html5-qrcode** npm package | Lightweight, browser-based, no native app needed |
| State | **React Context + localStorage** | No backend DB needed for hackathon demo |
| Deployment | **Vercel** | One-click deploy from GitHub, edge functions for API routes |
| Animation | **Framer Motion** (optional) | Swipe gestures, card transitions, point animations |

---

## 4. MOMA COLLECTION API REFERENCE

**Base URL:** `https://api.moma.org/api`
**Token:** `202d9d02-ede9-49a8-9ebb-4aa5bd3f2502`
**Auth:** Token passed as query parameter `?token=TOKEN`
**Format:** JSON (default)
**Note:** Token may be valid for 24 hours per the docs. Have a fallback plan (static JSON subset).

### 4.1 Endpoints

#### GET /objects/random — Get random on-view artworks
```
GET /api/objects/random?token={token}&onview=1
```
- `onview=1` filters to currently displayed works only
- Returns array of objects with thumbnail and full image URLs
- **Use for:** Onboarding quiz pool — fetch 10-15 random on-view works for the swipe/preference UI

#### GET /objects?searchtype={type}&search={query} — Search artworks
```
GET /api/objects?token={token}&searchtype={type}&search={query}
```
- `searchtype` options (experiment to discover): likely "title", "artist", "keyword", "department"
- **Use for:** Finding specific artworks, building curated pools by department/classification

#### GET /objects/{objectID} — Get detailed object info
```
GET /api/objects/{objectID}?token={token}
```
- Returns FULL details including: exhibitions history, persons (all artists/roles), components, titles, dates, and multiple images
- **Use for:** Challenge generation — feed rich metadata to Claude for better questions

#### GET /artists?search={query} — Search artists
```
GET /api/artists?search={query}&token={token}
```

#### GET /artists/{artistID} — Get artist details + all their works
```
GET /api/artists/{artistID}?token={token}
```
- Returns: artistID, displayName, beginDate, endDate, nationality, sex, objectCount, and full objects array
- **Use for:** "Talk to painting" feature — enrich Claude's knowledge of the artist

#### GET /exhibitions?search={query} — Search exhibitions
```
GET /api/exhibitions?search={query}&token={token}
```

### 4.2 Object Data Model (from API response)

The lightweight object model (from /random and /objects?search):
```typescript
interface MoMAObject {
  objectNumber: string;      // Accession number e.g., "472.1941"
  objectID: number;          // Internal ID — use for /objects/{id} lookups
  title: string;             // "The Starry Night"
  role: string;              // Artist's role
  displayName: string;       // "Vincent van Gogh"
  alphaSort: string;         // "Gogh, Vincent van"
  artistID: number;          // For /artists/{id} lookups
  displayDate: string;       // Display-formatted date
  dated: string;             // "1889"
  dateBegin: number;         // 1889
  dateEnd: number;           // 1889
  accessionDate: string;     // When MoMA acquired it
  medium: string;            // "Oil on canvas"
  dimensions: string;        // "29 × 36 1/4 in"
  department: string;        // "Painting & Sculpture"
  classification: string;    // "Painting"
  onView: number;            // Non-zero = currently on display
  provenance: string;        // Ownership history
  description: string;       // Curatorial description
  objectStatusID: number;
  creditLine: string;        // "Acquired through the Lillie P. Bliss Bequest"
  imageID: string;
  thumbnail: string;         // URL to thumbnail image
  fullImage: string;         // URL to full-resolution image
  currentLocation: string;   // Gallery location string
  lastModifiedDate: string;
}
```

The detailed object model (from /objects/{id}) adds:
```typescript
interface MoMADetailedObject extends MoMAObject {
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
  titles: {
    titles: Array<{
      title: string;
      titleType: string;
    }>;
  };
  dates: {
    dates: Array<{
      eventType: string;
      dateText: string;
    }>;
  };
}
```

### 4.3 API Wrapper Service

Create a service at `src/lib/moma-api.ts`:

```typescript
const MOMA_API_BASE = "https://api.moma.org/api";
const MOMA_TOKEN = process.env.MOMA_API_TOKEN; // "202d9d02-ede9-49a8-9ebb-4aa5bd3f2502"

export async function getRandomOnView(count: number = 10): Promise<MoMAObject[]> {
  // Call multiple times if needed — /random may return varying counts
  const res = await fetch(
    `${MOMA_API_BASE}/objects/random?token=${MOMA_TOKEN}&onview=1`
  );
  const data = await res.json();
  return data.objects || [];
}

export async function getObjectDetails(objectId: number): Promise<MoMADetailedObject | null> {
  const res = await fetch(
    `${MOMA_API_BASE}/objects/${objectId}?token=${MOMA_TOKEN}`
  );
  const data = await res.json();
  return data.objects?.[0] || null;
}

export async function searchObjects(searchType: string, query: string): Promise<MoMAObject[]> {
  const res = await fetch(
    `${MOMA_API_BASE}/objects?token=${MOMA_TOKEN}&searchtype=${searchType}&search=${encodeURIComponent(query)}`
  );
  const data = await res.json();
  return data.objects || [];
}

export async function getArtistWithWorks(artistId: number) {
  const res = await fetch(
    `${MOMA_API_BASE}/artists/${artistId}?token=${MOMA_TOKEN}`
  );
  return await res.json();
}
```

**IMPORTANT:** The MoMA API token may expire after 24 hours. Build a fallback: on first successful API call, cache a batch of on-view artworks to localStorage. If API fails, use cached data.

---

## 5. CLAUDE API INTEGRATION

**Model:** `claude-sonnet-4-20250514`
**API Key:** Store in `.env.local` as `ANTHROPIC_API_KEY`

### 5.1 Three Core AI Calls

#### Call 1: Quest Generator (onboarding → personalized route)

**When:** After user completes preference questions
**Input:** User preferences + batch of on-view artworks from MoMA API
**Output:** Ordered list of 5-7 painting stops with walking route

System prompt:
```
You are an expert MoMA curator and visitor experience designer. Your job is to analyze a visitor's preferences and create a personalized museum quest that:
1. Fights museum fatigue by limiting stops to 5-7 paintings
2. Creates a logical walking route that minimizes backtracking between floors
3. Balances familiar masterpieces with surprising discoveries
4. Builds a narrative arc — each painting connects thematically to the next
5. Considers crowd distribution — if possible, start on less-visited floors

Respond with valid JSON only. No markdown, no backticks, no preamble.
```

User message should include:
- The user's preference selections (interests, time, vibe)
- Full list of available on-view artworks with: objectID, title, displayName, dated, medium, department, classification, currentLocation, thumbnail
- The constraint to pick 5-7 and order by physical proximity

Expected JSON output:
```json
{
  "quest_title": "The Color Rebel's Journey",
  "taste_profile": {
    "primary_style": "bold expressionism",
    "era_preference": "mid-20th century",
    "mood": "emotional intensity",
    "surprise_factor": "You have a hidden love for minimalism"
  },
  "estimated_time": "75 minutes",
  "stops": [
    {
      "order": 1,
      "objectID": 79802,
      "title": "The Starry Night",
      "artist": "Vincent van Gogh",
      "year": "1889",
      "currentLocation": "Floor 5, Gallery 535",
      "thumbnail": "https://...",
      "teaser": "Everyone sees the swirls. But have you ever noticed what's hiding in the village below?",
      "connection_to_next": "Van Gogh's emotional intensity paved the way for our next stop..."
    }
  ],
  "quest_narrative": "From raw emotion to radical form-breaking, your quest traces how artists turned inner turmoil into visual revolution."
}
```

#### Call 2: Challenge Generator (at each painting stop)

**When:** User scans QR code or arrives at a painting
**Input:** Full object details from MoMA API (use the detailed endpoint) + optionally the painting image via `thumbnail` or `fullImage` URL
**Output:** 3 tiered challenges + curator's secret

System prompt:
```
You are the Art Detective challenge master at MoMA. A visitor just arrived at a painting. Generate 3 challenges that transform passive viewing into active discovery.

Rules:
- VISUAL challenge (10 pts): Must require LOOKING at the physical painting. Reference specific visual details — colors, composition, hidden elements, textures.
- CONTEXT challenge (25 pts): Connect to history, the artist's life, art movements, world events. Wrong answers must be plausible. Right answer should create an "oh wow" moment.
- INTERPRETATION challenge (50 pts): Open-ended, thought-provoking. No single right answer. The visitor shares their reading, you respond with multiple valid perspectives.

The curator_secret is the REWARD — it should be a genuinely surprising fact that even regular museumgoers don't know. Think private-tour-level insight.

Respond with valid JSON only.
```

User message should include ALL available metadata from the detailed object endpoint:
- title, displayName, dated, medium, dimensions, department, classification
- description (curatorial note)
- provenance (ownership history — can generate interesting challenge questions)
- creditLine
- exhibitions list (how many times it's been exhibited, famous exhibitions it was part of)
- currentLocation

If you can access the painting image (via `thumbnail` or `fullImage` URL from the API), include it as a vision input for more specific visual challenges. To do this:
1. Fetch the image URL from the API response
2. Download the image server-side in the API route
3. Convert to base64
4. Send to Claude as an image content block

Expected JSON output:
```json
{
  "painting_id": 79802,
  "challenges": [
    {
      "type": "visual",
      "difficulty": "easy",
      "points": 10,
      "emoji": "🔍",
      "question": "Detective, look closely at the village below the sky. How many buildings have lit windows?",
      "format": "multiple_choice",
      "options": ["3", "5", "7", "11"],
      "correct_index": 2,
      "hint": "Start counting from the church steeple and work outward...",
      "explanation": "Van Gogh painted exactly 7 lit windows, each one representing life continuing peacefully while the cosmos swirls above.",
      "fun_fact": "The village is actually based on a view from his asylum window, but he added the steeple from his hometown in the Netherlands."
    },
    {
      "type": "context",
      "difficulty": "medium",
      "points": 25,
      "emoji": "🕵️",
      "question": "Van Gogh painted The Starry Night in 1889. Which of these also happened that year?",
      "format": "multiple_choice",
      "options": [
        "The Eiffel Tower opened in Paris",
        "The first Olympic Games were held",
        "Einstein published his theory of relativity",
        "The telephone was invented"
      ],
      "correct_index": 0,
      "hint": "Think about what was happening in France that year...",
      "explanation": "The Eiffel Tower opened for the 1889 World's Fair in Paris — the same city where van Gogh had lived just a year earlier. He likely read about it in the newspapers delivered to his asylum.",
      "fun_fact": "Van Gogh never saw the finished Eiffel Tower in person, despite having lived in Paris from 1886-1888."
    },
    {
      "type": "interpretation",
      "difficulty": "hard",
      "points": 50,
      "emoji": "🎨",
      "question": "The sky takes up two-thirds of this painting while the village is small below. What do you think Van Gogh was saying about the relationship between humans and nature?",
      "format": "open_ended",
      "sample_perspectives": [
        "Art historians often read it as cosmic insignificance — nature's power dwarfing human existence",
        "Van Gogh himself wrote to his brother Theo that the night sky gave him hope, not fear — he saw the stars as destinations for the afterlife",
        "Some scholars argue the swirling forms reflect his mental state at the asylum, making the sky a projection of inner turbulence rather than an observation of nature"
      ],
      "discussion_prompt": "That's a thoughtful reading! Here's what makes this painting endlessly debatable: Van Gogh painted it from MEMORY during the day, not while looking at the actual night sky. So what you're seeing isn't observation — it's imagination filtered through emotion. Your interpretation of what that emotion was is as valid as any art historian's."
    }
  ],
  "curator_secret": {
    "title": "The painting that almost wasn't",
    "content": "Van Gogh considered The Starry Night a failure. In a letter to Theo, he dismissed it as a mere 'study' and never exhibited it. MoMA bought it in 1941 for a fraction of what it's worth today. The painting that millions consider his masterpiece was one he wanted to throw away.",
    "source_hint": "Letter 782 from Vincent to Theo van Gogh, June 1889"
  }
}
```

#### Call 3: Art DNA Generator (post-visit)

**When:** User completes their quest or manually triggers it
**Input:** All paintings visited, challenge answers, total score
**Output:** Shareable personality profile

System prompt:
```
You generate fun, shareable "Art DNA" personality profiles for museum visitors. Think BuzzFeed meets MoMA. The profile should feel personal, insightful, and share-worthy on social media. Respond with valid JSON only.
```

Expected JSON output:
```json
{
  "art_persona": "The Emotional Abstractionist",
  "tagline": "You don't just see art — you feel it vibrating in your chest.",
  "strengths": ["Emotional intelligence", "Spotting hidden symbolism", "Connecting art to its historical moment"],
  "art_soulmate": {
    "artist": "Mark Rothko",
    "why": "Like you, Rothko believed art should provoke a direct emotional response — no intellectualizing needed."
  },
  "next_visit_recommendation": "Find Rothko's 'No. 61 (Rust and Blue)' on Floor 4. Stand 18 inches away — that's how he wanted you to see it.",
  "share_text": "I'm The Emotional Abstractionist 🎨 Scored 285 pts as an Art Detective at @MuseumModernArt. My art soulmate is Rothko. What's yours?"
}
```

#### Stretch Goal Call: Talk to Painting

**When:** User taps "Talk to this painting" at any stop
**Input:** Painting metadata + conversation history + optionally camera image
**Output:** Conversational response grounded in art history

System prompt (per painting — see prompts.js for full version):
```
You are a knowledgeable, passionate art guide standing next to "[TITLE]" by [ARTIST] at MoMA. 
Keep responses under 100 words. Always reference something VISIBLE in the painting.
Ask the visitor what THEY see before telling them what to think.
You're the cool art professor, not the stuffy museum label.
```

### 5.2 Claude API Call Pattern

All Claude calls should follow this pattern in Next.js API routes:

```typescript
// src/lib/claude.ts
export async function callClaude(config: {
  system: string;
  messages: Array<{ role: string; content: any }>;
  maxTokens?: number;
}) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: config.maxTokens || 2000,
      system: config.system,
      messages: config.messages
    })
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.content
    .filter((block: any) => block.type === "text")
    .map((block: any) => block.text)
    .join("");

  // Strip markdown fences if present
  const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  return JSON.parse(cleaned);
}
```

### 5.3 Sending Images to Claude Vision

When the user points their camera at a painting OR when you want Claude to analyze a painting image from the MoMA API:

```typescript
// Server-side: fetch MoMA image and convert to base64
async function getImageAsBase64(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);
  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}

// Then in the Claude API call:
messages: [
  {
    role: "user",
    content: [
      {
        type: "image",
        source: {
          type: "base64",
          media_type: "image/jpeg",
          data: base64ImageData
        }
      },
      {
        type: "text",
        text: "Generate challenges for this painting..."
      }
    ]
  }
]
```

---

## 6. PROJECT STRUCTURE

```
art-detective/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with mobile viewport, fonts
│   │   ├── page.tsx                # Landing / welcome screen
│   │   ├── onboarding/
│   │   │   └── page.tsx            # Preference quiz (interest, time, vibe)
│   │   ├── quest/
│   │   │   ├── page.tsx            # Quest map view (list of stops + progress)
│   │   │   └── [objectId]/
│   │   │       └── page.tsx        # Individual painting stop (challenges)
│   │   ├── results/
│   │   │   └── page.tsx            # Art DNA + rewards + share
│   │   ├── scan/
│   │   │   └── page.tsx            # QR code scanner view
│   │   ├── talk/
│   │   │   └── [objectId]/
│   │   │       └── page.tsx        # Talk to painting chat (stretch goal)
│   │   └── api/
│   │       ├── quest/
│   │       │   └── route.ts        # POST: preferences → quest (calls MoMA API + Claude)
│   │       ├── challenges/
│   │       │   └── route.ts        # POST: objectId → challenges (calls MoMA API + Claude)
│   │       ├── art-dna/
│   │       │   └── route.ts        # POST: results → art DNA card (calls Claude)
│   │       ├── talk/
│   │       │   └── route.ts        # POST: chat messages → response (calls Claude)
│   │       └── moma/
│   │           ├── random/
│   │           │   └── route.ts    # GET: proxy to MoMA random on-view endpoint
│   │           └── object/
│   │               └── [id]/
│   │                   └── route.ts # GET: proxy to MoMA object detail endpoint
│   ├── lib/
│   │   ├── moma-api.ts             # MoMA API wrapper (all fetch calls)
│   │   ├── claude.ts               # Claude API wrapper (callClaude helper)
│   │   ├── prompts.ts              # All prompt templates (system + user messages)
│   │   ├── types.ts                # TypeScript interfaces for all data models
│   │   ├── game-state.ts           # Points, streaks, rewards logic
│   │   └── crowd-control.ts        # Route distribution logic
│   ├── components/
│   │   ├── ui/                     # Reusable UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── ProgressDots.tsx
│   │   │   └── PointsAnimation.tsx
│   │   ├── onboarding/
│   │   │   ├── PreferenceSelector.tsx  # Multi-select cards for interests
│   │   │   ├── TimeSelector.tsx        # Time picker
│   │   │   └── VibeSelector.tsx        # Vibe/mood picker
│   │   ├── quest/
│   │   │   ├── QuestMap.tsx            # Vertical list of stops
│   │   │   ├── StopCard.tsx            # Individual stop with teaser
│   │   │   └── FloorIndicator.tsx      # Floor grouping header
│   │   ├── challenges/
│   │   │   ├── ChallengeCard.tsx       # Single challenge (visual/context/interpretation)
│   │   │   ├── MultipleChoice.tsx      # MC answer UI
│   │   │   ├── OpenEndedInput.tsx      # Free text + AI response
│   │   │   ├── CuratorSecret.tsx       # Unlock reveal animation
│   │   │   └── PointsEarned.tsx        # Score increment animation
│   │   ├── rewards/
│   │   │   ├── CouponCard.tsx          # Coupon display with code
│   │   │   ├── ArtDNACard.tsx          # Shareable personality card
│   │   │   └── Leaderboard.tsx         # Top scores
│   │   ├── scanner/
│   │   │   └── QRScanner.tsx           # html5-qrcode wrapper
│   │   └── chat/
│   │       └── PaintingChat.tsx        # Chat interface for "talk to painting"
│   ├── context/
│   │   └── GameContext.tsx         # React Context for game state
│   └── hooks/
│       ├── useGameState.ts         # Points, streaks, completed stops
│       └── useMoMAApi.ts           # Data fetching hooks
├── public/
│   └── fonts/                      # Custom fonts if needed
├── .env.local                      # API keys (see below)
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 7. ENVIRONMENT VARIABLES

```env
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
MOMA_API_TOKEN=202d9d02-ede9-49a8-9ebb-4aa5bd3f2502
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**IMPORTANT:** The MoMA token goes in server-side env only (no `NEXT_PUBLIC_` prefix). All MoMA API calls must go through Next.js API routes to hide the token.

---

## 8. GAME STATE MANAGEMENT

```typescript
// src/lib/game-state.ts

interface GameState {
  // User profile
  preferences: {
    interests: string[];
    timeAvailable: string;
    vibe: string;
  };
  tasteProfile: TasteProfile | null;

  // Quest
  quest: QuestData | null;
  completedStops: number[];  // objectIDs of completed paintings
  currentStopIndex: number;

  // Scoring
  totalScore: number;
  streak: number;           // consecutive correct answers
  challengeResults: Array<{
    objectId: number;
    paintingTitle: string;
    visual: boolean;        // got it right?
    context: boolean;
    interpretation: string; // their open-ended answer
  }>;

  // Rewards
  unlockedCoupons: string[];
  curatorSecrets: Array<{
    objectId: number;
    title: string;
    content: string;
  }>;
}

// Points logic
const POINTS = {
  visual: 10,
  context: 25,
  interpretation: 50,  // always awarded for submitting an answer
  streakMultiplier: 1.5, // applied after 3+ consecutive correct
};

// Reward thresholds
const REWARDS = [
  { points: 50,  reward: "10% off MoMA Store", code: "ARTDET10" },
  { points: 100, reward: "Free coffee at MoMA Café", code: "ARTCAFE" },
  { points: 200, reward: "15% off + free postcard", code: "ARTDET15" },
  { points: 500, reward: "Art Detective Badge", code: "DETECTIVE" },
];
```

Persist to `localStorage` under key `"art-detective-state"`. Load on app mount, save after every state change.

---

## 9. CROWD CONTROL LOGIC

Simple but effective for the demo:

```typescript
// src/lib/crowd-control.ts

// Track which floors/rooms are being actively visited
// In production this would be a real-time database; for hackathon use localStorage + timestamps

interface CrowdData {
  floorCounts: Record<string, number>;  // "Floor 5": 12 active visitors
  lastUpdated: string;
}

// When generating a quest, bias toward less-crowded floors
function applyFloorBias(artworks: MoMAObject[], crowdData: CrowdData): MoMAObject[] {
  // Extract floor from currentLocation string
  // Sort to prefer artworks on less-crowded floors
  // This doesn't exclude popular floors entirely — just gives a slight preference
  return artworks.sort((a, b) => {
    const floorA = extractFloor(a.currentLocation);
    const floorB = extractFloor(b.currentLocation);
    const countA = crowdData.floorCounts[floorA] || 0;
    const countB = crowdData.floorCounts[floorB] || 0;
    return countA - countB; // prefer less crowded
  });
}

// Include crowd context in the Claude prompt for quest generation:
// "Current crowd levels: Floor 2 (low), Floor 4 (moderate), Floor 5 (high).
//  Prefer starting on less-crowded floors when possible."
```

For the hackathon demo, you can simulate this with fake crowd data. In production, each user's active quest floor would be reported to a shared database.

---

## 10. KEY IMPLEMENTATION DETAILS

### 10.1 QR Code Scanning
```bash
npm install html5-qrcode
```

Each QR code at a painting encodes the MoMA objectID: `{"objectId": 79802}`

```typescript
// src/components/scanner/QRScanner.tsx
import { Html5QrcodeScanner } from "html5-qrcode";

// On successful scan, parse the objectId and navigate:
// router.push(`/quest/${objectId}`)
```

For the demo: generate QR codes at https://www.qr-code-generator.com/ encoding the objectIDs of your demo paintings. Print them out.

### 10.2 Mobile-First Design Requirements

- All touch targets minimum 44x44px
- Bottom navigation bar (Quest Map | Scan | Score)
- Full-screen camera view for QR scanning
- Cards should be swipeable on challenge screens
- Animations for: points earned, streak counter, coupon unlock, curator secret reveal
- Dark mode support (museums are often dim)
- No horizontal scrolling ever

### 10.3 Image Handling

MoMA API returns `thumbnail` and `fullImage` URLs. Use Next.js `<Image>` component with the MoMA domain in `next.config.js`:

```javascript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.moma.org',
      },
    ],
  },
};
```

### 10.4 Error Handling & Fallbacks

- **MoMA API down/token expired:** Fall back to a pre-cached JSON of 30-40 on-view artworks
- **Claude API slow:** Show skeleton loaders for challenges; have 1-2 pre-generated challenge sets as instant fallback
- **QR scan fails:** Manual painting selection from quest list
- **No camera access:** Show quest list with "I'm here" button at each stop
- **Offline:** Cache quest data after generation; challenges need connectivity

### 10.5 Accessibility (for inclusion features mentioned)

- **Voice mode:** Add a "Read aloud" button on challenge cards using Web Speech API (`speechSynthesis`)
- **High contrast mode:** Toggle in settings
- **Large text option:** Scale factor applied via CSS custom property
- **Screen reader support:** All images need alt text (use painting title + artist), all interactive elements need aria-labels

---

## 11. API ROUTES IMPLEMENTATION

### POST /api/quest/route.ts (most complex route)
```
Input:  { interests: string[], timeAvailable: string, vibe: string }
Steps:
  1. Call MoMA API: GET /objects/random?onview=1 (multiple times to get ~30-50 works)
  2. Optionally: search for specific departments based on user interests
  3. Format artwork list for Claude prompt
  4. Call Claude with quest generator prompt
  5. Parse JSON response
  6. Return quest to client
Output: QuestData JSON
```

### POST /api/challenges/route.ts
```
Input:  { objectId: number }
Steps:
  1. Call MoMA API: GET /objects/{objectId} (detailed endpoint)
  2. Optionally: fetch the painting's thumbnail image, convert to base64
  3. Call Claude with challenge generator prompt (include image if available)
  4. Parse JSON response
  5. Return challenges to client
Output: ChallengesData JSON
```

### POST /api/art-dna/route.ts
```
Input:  { paintingsVisited: [...], challengeResults: [...], totalScore: number }
Steps:
  1. Call Claude with art DNA generator prompt
  2. Parse JSON response
  3. Return art DNA card to client
Output: ArtDNA JSON
```

### POST /api/talk/route.ts
```
Input:  { objectId: number, messages: [...], imageBase64?: string }
Steps:
  1. Call MoMA API: GET /objects/{objectId} for context
  2. Optionally: GET /artists/{artistId} for artist bio
  3. Build system prompt with painting + artist context
  4. Call Claude with conversation history
  5. Return response text
Output: { response: string }
```

---

## 12. DEMO PLAN (for judges)

Pre-prepare these for the live demo:
1. **5-6 printed QR codes** encoding objectIDs of known on-view paintings
2. **Pre-generated quest** in case of API latency during demo
3. **Screen recording backup** in case of wifi issues
4. **Pitch flow (3 minutes):**
   - Problem statement (30s): "200,000 works. Museum fatigue since 1916. 60% of visitors feel lost."
   - Solution demo (2 min): Open app → pick preferences → see personalized quest → scan QR → play challenges → unlock secret → see Art DNA
   - Impact (30s): "Revenue via coupons, engagement via gamification, crowd control via AI routing, accessibility via voice"

---

## 13. SETUP COMMANDS

```bash
# Create project
npx create-next-app@latest art-detective --typescript --tailwind --app --src-dir

cd art-detective

# Install dependencies
npm install html5-qrcode framer-motion

# Create env file
cat > .env.local << 'EOF'
ANTHROPIC_API_KEY=your-key-here
MOMA_API_TOKEN=202d9d02-ede9-49a8-9ebb-4aa5bd3f2502
EOF

# Start dev server
npm run dev
```

---

## 14. PRIORITY ORDER FOR DEVELOPMENT

Given < 6 hours, build in this exact order:

1. **[HOUR 0-0.5]** Project scaffold + env setup + MoMA API wrapper + test API calls work
2. **[HOUR 0.5-1.5]** Onboarding UI (preference selection screen) + quest generation API route
3. **[HOUR 1.5-2.5]** Quest map view + challenge generation API route + challenge cards UI
4. **[HOUR 2.5-3.5]** Game logic (points, streaks, correct/wrong) + curator secret reveal
5. **[HOUR 3.5-4.5]** Rewards/coupons + Art DNA generation + shareable card
6. **[HOUR 4.5-5.5]** QR scanner integration + polish + error handling
7. **[HOUR 5.5-6]** Demo prep + printed QR codes + pitch rehearsal

**If running behind:** Cut QR scanning (use manual "I'm here" buttons), cut Art DNA (show points only), cut talk-to-painting entirely. The core demo must show: preferences → personalized quest → challenges at one painting → curator secret unlock.

---

## 15. DESIGN DIRECTION

**Aesthetic:** Modern museum meets game UI. Think: MoMA's clean typography + Duolingo's reward dopamine. 

- **Colors:** Black/white base with a single accent (MoMA red #E4002B or a warm amber). Painting thumbnails provide all the color you need.
- **Typography:** Clean sans-serif. System fonts are fine for hackathon.
- **Cards:** Rounded corners, subtle shadows, generous padding
- **Animations:** Points counting up, streak fire emoji, card flip for curator secret reveal, confetti for coupon unlock
- **Bottom nav:** 3 tabs — Quest (map icon), Scan (camera icon), Profile (star icon)

The app should feel like a companion, not a replacement for the museum experience. The phone should come out briefly at each stop, then go back in the pocket while the visitor actually looks at the art.
