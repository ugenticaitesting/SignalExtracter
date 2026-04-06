import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/app/lib/supabase";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.text !== "string" || body.text.trim() === "") {
    return Response.json({ error: "text is required" }, { status: 400 });
  }

  const rawText = body.text.trim();

  // --- Call Claude to extract signals ---
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `You are a signal extraction assistant. Given the text below, extract exactly three things and respond with ONLY valid JSON — no markdown fences, no explanation.

Return this exact shape:
{
  "action_item": "<single most important action item as a short sentence>",
  "people_mentioned": ["<name1>", "<name2>"],
  "urgency_score": <integer 1-10, where 10 is highest urgency>
}

Rules:
- action_item: one clear, concrete task or follow-up. If none, use null.
- people_mentioned: array of proper names only. If none, use [].
- urgency_score: honest 1-10 integer based on deadlines, tone, and stakes.

Text:
"""
${rawText}
"""`,
      },
    ],
  });

  const rawContent = message.content[0];
  if (rawContent.type !== "text") {
    return Response.json({ error: "Unexpected Claude response" }, { status: 500 });
  }

  let extracted: {
    action_item: string | null;
    people_mentioned: string[];
    urgency_score: number;
  };

  try {
    extracted = JSON.parse(rawContent.text);
  } catch {
    return Response.json(
      { error: "Failed to parse Claude response", raw: rawContent.text },
      { status: 500 }
    );
  }

  // --- Save to Supabase ---
  const { data, error } = await supabase
    .from("Texts")
    .insert({
      original_text: rawText,
      extracted_action_item: extracted.action_item ?? null,
      people_mentioned: extracted.people_mentioned ?? [],
      urgency_score: extracted.urgency_score ?? null,
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true, data }, { status: 201 });
}
