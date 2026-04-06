# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server at localhost:3000
npm run build    # production build (also type-checks)
npm run lint     # ESLint via eslint-config-next
npx tsc --noEmit # type-check without building
```

There are no tests. There is no single-file lint command — `npm run lint` lints the whole project.

## Required environment variables

Copy `.env.local.example` to `.env.local` before running:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
ANTHROPIC_API_KEY
```

## Architecture

Single-page app with one API route. No auth, no routing beyond `/`.

**Data flow — submission:**
`SignalInput` (client) → `POST /api/extract` → Claude API (extract JSON) → Supabase insert → returns saved `Signal` row → prepended to local state in `page.tsx`

**Data flow — feed:**
`page.tsx` calls `fetchSignals()` on mount → renders `SignalFeed` → each `SignalCard` manages its own edit state → save calls `updateSignalText()` → Supabase `.update()` → parent replaces row in array via `onSignalUpdated`

**Key files:**
- `app/api/extract/route.ts` — the only backend. Calls Claude with a strict JSON-schema prompt, saves to Supabase `Texts` table.
- `app/lib/supabase.ts` — Supabase client singleton + `fetchSignals` / `updateSignalText` helpers.
- `app/types.ts` — `Signal` and `ExtractResponse` interfaces shared across client and server.
- `app/components/SignalFeed.tsx` — contains both `SignalFeed` and the `SignalCard` subcomponent (inline edit logic lives here).

## Supabase table

Table name: `"Texts"` (quoted, capital T). Columns: `id uuid`, `original_text text NOT NULL`, `extracted_action_item text`, `people_mentioned text[]`, `urgency_score smallint`, `timestamp timestamptz`. RLS is enabled — SELECT, INSERT, and UPDATE policies are all set to `USING (true)`.

## Claude prompt

The extraction prompt in `route.ts` instructs Claude to return **only** raw JSON (no markdown fences). If the shape changes (e.g. adding a new extracted field), update both the prompt and the Supabase insert in the same file, then update the `Signal` type in `types.ts`.
