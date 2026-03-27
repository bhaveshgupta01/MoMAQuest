# Art Detective — MoMA Quest
## Project Brief for Presentation
**MoMA Hackathon 2026 | NYU Team**

---

## 1. The Problem We Solved

Museums are exhausting. People walk in, glance at famous paintings for 10 seconds, read the wall label, and move on — without actually *looking*. At the same time, popular galleries get dangerously crowded while other floors sit empty.

**Art Detective** solves both:
- Makes visitors genuinely look at paintings through an AI-powered I Spy game
- Routes people to less-crowded floors in real time using a live crowd database

---

## 2. What It Is

A **Progressive Web App (PWA)** — installable directly from the browser on any phone (iOS or Android), no app store required. Visitors scan a QR code at the MoMA entrance, answer 3 quick questions, and get a personalized 5–7 painting quest with AI-generated challenges for each stop.

---

## 3. The User Flow

```
Arrive at MoMA
      ↓
Scan QR → open app in browser (no download needed)
      ↓
3-question onboarding (interests · time · vibe)
      ↓
AI generates personalized quest (5–7 painting stops)
  → considers crowd levels → routes to quieter floors
      ↓
Walk to Painting #1
      ↓
  ┌─ Visual Hunt ──────────────────────────────────────┐
  │  Claude Vision analyzes the actual painting image   │
  │  Generates 6 objects (3–4 present, 2–3 fake)       │
  │  User taps what they can actually SPOT              │
  │  → +20 pts per correct find                        │
  │  → +10 pts per correctly skipped fake              │
  │  → Tiles flip to reveal: ✓ spotted / missed / fake │
  └─────────────────────────────────────────────────────┘
      ↓
  Follow-up bonus question (+30 pts)
  — references something they just found —
  — can't be answered by reading the wall label —
      ↓
  Curator's Secret unlocked (if ≥2 objects found)
  — private-tour-level fact not on the wall label —
      ↓
  💬 "Talk to this painting" — AI persona of the painting
      ↓
Next stop (streak multiplier builds if doing well)
      ↓
All stops done → Art DNA card generated
  → Shareable personality profile ("The Restless Eye")
  → Unlocked coupons (café discount, audio tour, etc.)
```

---

## 4. The Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 16.2 (App Router) + TypeScript | Fast, PWA-ready, server components |
| Styling | Tailwind CSS v4 + Framer Motion | Design tokens in CSS, smooth animations |
| Fonts | Instrument Serif + DM Sans | Editorial museum feel |
| AI — quest generation | Google Gemini 2.5 Flash | Analyzes visitor prefs + crowd data → personalized route |
| AI — visual hunt | Google Gemini 2.5 Flash (Vision) | Looks at the actual painting image → generates specific objects |
| AI — painting chat | Google Gemini 2.5 Flash | Painting speaks in first person, references visible details |
| AI — Art DNA | Google Gemini 2.5 Flash | Generates shareable personality profile from visit data |
| Museum data | MoMA Collection API | Real on-view artworks, real locations, real thumbnails |
| Crowd management | Supabase (PostgreSQL) | Real-time tracking of which floor each visitor is on |
| Deployment | Vercel | Zero-config, edge functions, global CDN |

---

## 5. The AI Intelligence

### Quest Generation
Gemini receives:
- Visitor preferences (interests, time, vibe)
- Live crowd data (which floors are busy right now)
- 20 real on-view MoMA artworks with locations

It returns a curated 5–7 stop route with narrative connections between paintings, timed to the visitor's availability, biased toward less-crowded floors.

### Visual Hunt (the core game)
Gemini Vision receives the **actual painting image** (fetched from MoMA's servers) plus artwork metadata. It generates:
- 6 specific objects (e.g. "a figure in red", "a black crow") — not vague labels
- ~3–4 that are genuinely present, requiring careful looking
- ~2–3 plausible fakes for the era/style (so you can't just select all)
- Subtle hints for each present object
- A follow-up question connecting what they saw to its meaning
- A curator's secret — private-tour-level fact

**Anti-cheat design:** The follow-up question references something specific they had to physically spot in the painting. If they just guessed randomly, they can't answer it. Reading the wall label won't help either.

### Crowd Management
Every time a visitor enters a painting stop page, the app silently reports their floor to Supabase (fire-and-forget, never blocks the UI). Gemini uses this data when building the next quest — artworks on busy floors are ranked lower.

```
Visitor A arrives on Floor 5 → Supabase updated
Visitor B starts quest → Gemini sees Floor 5 is crowded → routes them to Floor 2 first
```

---

## 6. The Scoring System

| Action | Points |
|--------|--------|
| Correctly spot a present object | +20 pts |
| Correctly skip a fake object | +10 pts |
| Answer the follow-up question | +30 pts |
| Streak multiplier (3+ stops) | ×1.5 |

**Rewards** unlock at score thresholds (50, 100, 200, 500 pts):
- Café discount coupon
- Free audio guide upgrade
- Exclusive curator's notes PDF
- VIP next-visit priority access

---

## 7. Design Language

Inspired by editorial museum aesthetics:
- **Burgundy** — primary actions, selected states
- **Forest green** — accent labels, secondary info
- **Blush pink** — backgrounds, hover states
- **Instrument Serif** — display headings (classical, museum-feel)
- **DM Sans** — body text (modern, readable on phones)
- Framer Motion animations throughout — fade-in-up on load, floating paintings on hero

---

## 8. What Makes This Different

| Traditional museum app | Art Detective |
|------------------------|---------------|
| Static audio guide | AI conversation that responds to what YOU ask |
| Generic recommendations | Personalized to your interests + time available |
| Ignores crowds | Actively routes you away from crowded floors |
| Passive consumption | Game mechanics that force you to really look |
| Same for everyone | Different visual hunt for every painting, every visit |
| Requires download | Works instantly from any browser (PWA) |

---

## 9. The Database (Supabase)

Three tables/views in the cloud:

**`visitor_sessions`** — one row per browser session
```
session_id | created_at | last_seen
```

**`visitor_locations`** — upserted each time a visitor enters a painting stop
```
session_id | floor | gallery | artwork_id | updated_at
```

**`floor_crowd_counts`** (view) — aggregates active visitors per floor in a 30-minute window
```
floor | count | level (low/med/high)
```

Row Level Security enabled. Anonymous visitors can read and write (crowd tracking is privacy-safe — no personal data stored).

---

## 10. API Routes

| Route | What it does |
|-------|-------------|
| `POST /api/quest` | Takes visitor preferences → returns 5–7 stop personalized quest |
| `POST /api/challenges` | Takes objectId → fetches painting image → returns Visual Hunt via Gemini Vision |
| `POST /api/talk` | Streaming conversation with the painting as a character |
| `POST /api/art-dna` | Generates shareable Art DNA personality card |
| `GET /api/crowd` | Returns current floor crowd counts |
| `POST /api/crowd` | Updates visitor location (fire-and-forget) |
| `GET /api/moma/random` | Proxies MoMA API for random on-view artworks |
| `GET /api/moma/object/[id]` | Proxies MoMA API for artwork details |

---

## 11. Key Files for Demo

```
app/page.tsx              — Landing hero (floating shapes + CTA)
app/onboarding/page.tsx   — 3-step preference quiz
app/quest/page.tsx        — Quest map with all stops
app/quest/[objectId]/     — Painting stop + Visual Hunt game
app/results/page.tsx      — Art DNA card + rewards
components/challenges/VisualHuntCard.tsx  — The core game UI
lib/claude.ts             — Gemini API wrapper (all AI calls go through here)
lib/prompts.ts            — All AI prompt templates
lib/crowd-control.ts      — Supabase crowd tracking
```

---

## 12. What to Show in the Demo

**Recommended demo flow:**
1. Open `localhost:3000` on a phone (or phone-size browser window)
2. Tap "Start your quest →"
3. Select: Bold colors + symbolism → 90 min → Deep dive
4. Watch Gemini generate a personalized quest in ~5 seconds
5. Tap the first painting stop
6. Show the Visual Hunt tiles — tap a few objects
7. Hit "Reveal answers" — show the flip animation + scoring
8. Answer (or skip) the follow-up question
9. Show the Curator's Secret unlock
10. Go back to quest map, show crowd-aware routing explanation
11. Complete all stops → show Art DNA card

**Talking points:**
- "The AI actually looked at this painting — it didn't just know about it"
- "The distractors are era-appropriate, so you can't just guess randomly"
- "Every visitor gets a different route because crowd levels change in real time"
- "No download required — this opened from a QR code"

---

## 13. Team

NYU Team — MoMA Hackathon 2026

Built in 2 sessions over 1 day. Total code: ~3,000 lines across 30+ files.
