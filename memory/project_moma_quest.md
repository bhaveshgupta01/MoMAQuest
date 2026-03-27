---
name: MoMA Quest Project State
description: Art Detective app for MoMA Hackathon 2026 — current stack, infra, and key decisions
type: project
---

AI-powered museum companion PWA for MoMA Hackathon 2026 (NYU Team).

**Why:** Hackathon project solving museum fatigue with personalized AI quests, gamified challenges, and real crowd management.

**How to apply:** Reference this when working on any feature — understand the full context before suggesting changes.

## Stack
- Next.js 14 App Router + TypeScript + Tailwind CSS
- Claude API (claude-sonnet-4-20250514) with Vision
- MoMA Collection API (token: in .env.local)
- Supabase for real-time crowd management
- Framer Motion + html5-qrcode + uuid

## Supabase
- Project: `moma-quest`, ID: `xuiobzkmrzemszwrzaqi`, region: us-east-1
- Tables: `visitor_sessions`, `visitor_locations`, view: `floor_crowd_counts`
- Anon key in .env.local as NEXT_PUBLIC_SUPABASE_ANON_KEY

## Key architecture decisions
1. Crowd data via Supabase (not localStorage) — real cross-device visibility
2. Claude Vision at every painting stop — image fetched server-side, base64 in API call
3. Floor bias: artworks sorted by crowd count before passing to Claude for quest generation
4. Location reporting is fire-and-forget (won't block UI)
5. PWA manifest in /public/manifest.json — installable without app store

## Routes
- `/` landing, `/onboarding` 3-step preferences, `/quest` map, `/quest/[objectId]` challenges
- `/results` Art DNA + rewards, `/scan` QR scanner, `/talk/[objectId]` painting chat

## API routes (all in /app/api/)
- POST /api/quest — preferences → quest
- POST /api/challenges — objectId → 3 challenges + curator secret
- POST /api/art-dna — results → Art DNA
- POST /api/talk — chat
- GET /api/moma/random, GET /api/moma/object/[id] — MoMA proxies
- GET/POST /api/crowd — crowd read/write

## Outstanding TODOs
- PWA icons (icon-192.png, icon-512.png) needed in /public/
- Deploy to Vercel with env vars
- QR codes for demo paintings
- Leaderboard page
- Supabase Realtime for live crowd heatmap
