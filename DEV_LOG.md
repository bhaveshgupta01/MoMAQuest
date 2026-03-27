# Art Detective — Dev Log
**MoMA Hackathon 2026 | NYU Team**

---

## Session 2 — 2026-03-27

### What changed: Visual Hunt game mechanic
Replaced the 3-tier challenge system (visual/context/interpretation MCQ) with a purpose-built game called **Visual Hunt**.

**New flow per painting stop:**
1. Claude Vision generates 6 objects: ~3-4 actually present in the painting, ~2-3 plausible distractors
2. User sees a 2×3 grid of emoji tiles, selects what they can spot
3. Submit → tiles flip to reveal correct/wrong/missed with per-tile feedback
4. **Scoring:** +20 pts per correctly spotted object, +10 pts per correctly skipped absent object, multiplied by streak
5. **Follow-up question:** unlocks automatically after reveal — references something they found. +30 pts for answering. Can skip.
6. **Curator's Secret:** unlocked if they spotted ≥ 2 objects correctly
7. Hint system: each present object has a hint they can reveal (subtle, not a giveaway)

**Key design intent:** Can't cheat by reading the wall label — distractors are era/style-plausible, and the follow-up requires genuine connection between what they saw and its meaning.

**Files changed:**
- `lib/types.ts` — Replaced `Challenge`/`ChallengeSet` with `HuntObject` + `VisualHuntChallenge`; updated `ChallengeResult` (objectsSpotted, followUpAnswer)
- `lib/prompts.ts` — Replaced `CHALLENGE_SYSTEM` + `buildChallengeUserMessage` with `VISUAL_HUNT_SYSTEM` + `buildVisualHuntUserMessage`
- `lib/game-state.ts` — Updated points constants (hit/skip/followUp) and streak logic
- `app/api/challenges/route.ts` — Returns `{ hunt }` instead of `{ challenges }`
- `components/challenges/VisualHuntCard.tsx` — New component (hunt → revealed → followup → done phases)
- `app/quest/[objectId]/page.tsx` — Uses `VisualHuntCard` instead of `ChallengeCard`
- Deleted `components/challenges/ChallengeCard.tsx`

Build: ✓ 0 errors

---

## Session 1 — 2026-03-27

### What was built
Full Next.js 14 PWA scaffold with complete feature implementation.

### Infrastructure
- **Supabase project**: `moma-quest` (ID: `xuiobzkmrzemszwrzaqi`, region: us-east-1)
- **Tables created**:
  - `visitor_sessions` — one row per browser session (session_id, created_at, last_seen)
  - `visitor_locations` — tracks which floor/gallery each visitor is at (upserted, 1 row per session)
  - `floor_crowd_counts` view — aggregates active visitors per floor (30-min window)
- **RLS**: enabled with open anon read/insert/update policies for real-time crowd tracking

### Files created

#### `lib/`
| File | Purpose |
|------|---------|
| `types.ts` | All TypeScript interfaces (MoMAObject, QuestData, ChallengeSet, GameState, etc.) |
| `supabase.ts` | Supabase client (anon key) |
| `moma-api.ts` | MoMA REST API wrapper (getRandomOnView, getObjectDetails, searchObjects, getImageAsBase64) |
| `claude.ts` | Claude API wrapper (callClaude<T>, imageBlock helper) |
| `prompts.ts` | All AI prompt templates (QUEST_SYSTEM, CHALLENGE_SYSTEM, ART_DNA_SYSTEM, TALK_SYSTEM) |
| `game-state.ts` | Points logic, rewards thresholds, localStorage persistence helpers |
| `crowd-control.ts` | Supabase crowd read/write, floor bias algorithm for quest generation |

#### `app/api/`
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/quest` | POST | preferences → quest (MoMA API + crowd + Claude) |
| `/api/challenges` | POST | objectId → 3 challenges + curator secret (MoMA API + Claude Vision) |
| `/api/art-dna` | POST | results + score → Art DNA card (Claude) |
| `/api/talk` | POST | chat messages → painting conversation (Claude) |
| `/api/moma/random` | GET | Proxy: random on-view artworks |
| `/api/moma/object/[id]` | GET | Proxy: artwork details |
| `/api/crowd` | GET/POST | Read floor counts / update visitor location |

#### `context/` + `hooks/`
- `GameContext.tsx` — full game state (preferences, quest, scores, rewards, crowd reporting)
- `hooks/useGameState.ts` — derived state (nextReward, progressPercent, isQuestComplete)
- `hooks/useMoMAApi.ts` — artwork detail fetching hook

#### `components/`
- `ui/`: Button, Card, ProgressDots, PointsAnimation
- `onboarding/`: PreferenceSelector (multi/single select cards)
- `quest/`: QuestMap (vertical stop list with timeline + thumbnails)
- `challenges/`: ChallengeCard (MC + open-ended), CuratorSecret (locked/reveal)
- `rewards/`: ArtDNACard (shareable), CouponCard
- `scanner/`: QRScanner (html5-qrcode, dynamic import)
- `chat/`: PaintingChat (conversation UI, streaming-style typing indicator)

#### `app/` (pages)
| Page | Route |
|------|-------|
| Landing | `/` |
| Onboarding (3 steps) | `/onboarding` |
| Quest map | `/quest` |
| Painting stop + challenges | `/quest/[objectId]` |
| Results + Art DNA | `/results` |
| QR scanner | `/scan` |
| Talk to painting | `/talk/[objectId]` |

### Key decisions
1. **Crowd management via Supabase** instead of localStorage mock — real-time floor counts visible across all devices
2. **Claude Vision used at every painting stop** — image fetched server-side, converted to base64, included in challenge generation call
3. **Floor bias in quest generation** — artworks sorted by crowd count before Claude prompt so AI naturally picks less-crowded floors
4. **Location reporting is fire-and-forget** — won't block UI if Supabase is slow
5. **PWA manifest added** — installable on iOS/Android from browser, no app store

### Environment variables (in .env.local)
```
ANTHROPIC_API_KEY=sk-ant-api03-...
MOMA_API_TOKEN=202d9d02-...
NEXT_PUBLIC_SUPABASE_URL=https://xuiobzkmrzemszwrzaqi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### To run locally
```bash
npm run dev
# → http://localhost:3000
```

### Next steps / TODO
- [ ] Add PWA icons (icon-192.png, icon-512.png) to `/public/`
- [ ] Test MoMA API token validity (token may expire in 24h — implement static JSON fallback)
- [ ] Deploy to Vercel (add env vars in Vercel dashboard)
- [ ] Generate actual QR codes for demo paintings (encode `{"objectId": <id>}`)
- [ ] Add leaderboard page (read top scores from Supabase)
- [ ] Stretch: real-time crowd heatmap on quest map using Supabase Realtime

---
