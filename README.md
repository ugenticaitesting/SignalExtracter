# Signal Extracter

AI-powered signal extraction from emails, Slack messages, and meeting notes. Paste any text, and Claude extracts the most important action item, people mentioned, and an urgency score — saved and displayed in a live feed.

**Stack:** Next.js (App Router) · TypeScript (strict) · Supabase Postgres · Anthropic Claude API · Tailwind CSS

---

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [Anthropic](https://console.anthropic.com) API key

---

## 1. Database setup

In the Supabase SQL editor, run the following scripts in order.

**Create the table:**

```sql
CREATE TABLE "Texts" (
  "id"                    uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  "original_text"         text          NOT NULL,
  "extracted_action_item" text,
  "people_mentioned"      text[],
  "urgency_score"         smallint      CHECK (urgency_score BETWEEN 1 AND 10),
  "timestamp"             timestamptz   DEFAULT now() NOT NULL
);

CREATE INDEX idx_texts_timestamp_desc ON "Texts" ("timestamp" DESC);
```

**Enable Row Level Security:**

```sql
ALTER TABLE "Texts" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read"
  ON "Texts" FOR SELECT USING (true);

CREATE POLICY "Allow public insert"
  ON "Texts" FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update"
  ON "Texts" FOR UPDATE USING (true) WITH CHECK (true);
```

---

## 2. Environment variables

Copy the example file and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Open `.env.local` and set:

```env
# Supabase — Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Anthropic — console.anthropic.com/account/keys
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 3. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How it works

**Signal Input** — paste any text and hit Submit. The app calls `POST /api/extract`, which sends the text to Claude and extracts:

- Single most important action item
- List of people mentioned by name
- Urgency score 1–10 (10 = highest)

The result is saved to Supabase and appears instantly at the top of the feed.

**Signal Feed** — all past submissions pulled from Supabase, ordered newest first. Hover any card to reveal the pencil icon and edit the original text.

---

## Project structure

```
app/
├── api/extract/route.ts       # POST handler — Claude → Supabase
├── components/
│   ├── SignalInput.tsx         # Text input form
│   └── SignalFeed.tsx          # Live feed with inline editing
├── lib/supabase.ts             # Supabase client + data helpers
├── types.ts                    # Shared TypeScript interfaces
└── page.tsx                    # Root page
```
