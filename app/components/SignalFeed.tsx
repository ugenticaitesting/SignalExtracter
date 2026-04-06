"use client";

import { useState } from "react";
import type { Signal } from "@/app/types";
import { updateSignalText } from "@/app/lib/supabase";

interface SignalFeedProps {
  signals: Signal[];
  onSignalUpdated: (updated: Signal) => void;
}

function UrgencyBadge({ score }: { score: number | null }) {
  if (score === null) return null;

  const color =
    score >= 8
      ? "bg-red-100 text-red-700"
      : score >= 5
      ? "bg-amber-100 text-amber-700"
      : "bg-green-100 text-green-700";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}
    >
      {score}/10
    </span>
  );
}

function PencilIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
    </svg>
  );
}

function formatDate(ts: string) {
  return new Date(ts).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

interface SignalCardProps {
  signal: Signal;
  onSignalUpdated: (updated: Signal) => void;
}

function SignalCard({ signal, onSignalUpdated }: SignalCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(signal.original_text);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!draft.trim() || draft === signal.original_text) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updated = await updateSignalText(signal.id, draft.trim());
      onSignalUpdated(updated);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setDraft(signal.original_text);
    setError(null);
    setIsEditing(false);
  }

  return (
    <li className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      {/* Header row */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <time className="text-xs text-zinc-400">
          {formatDate(signal.timestamp)}
        </time>

        <div className="flex items-center gap-2">
          {/* Pencil — hidden until card is hovered */}
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              title="Edit text"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-zinc-700"
            >
              <PencilIcon />
            </button>
          )}

          <UrgencyBadge score={signal.urgency_score} />
        </div>
      </div>

      {/* Original text — view or edit */}
      {isEditing ? (
        <div className="mb-4 flex flex-col gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            autoFocus
            className="w-full resize-y rounded-xl border border-zinc-300 bg-zinc-50 p-3 text-sm text-zinc-800 outline-none focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-100"
          />
          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}
          <div className="flex gap-2 self-end">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !draft.trim()}
              className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <p className="mb-4 line-clamp-3 text-sm text-zinc-600 italic">
          &ldquo;{signal.original_text}&rdquo;
        </p>
      )}

      <div className="flex flex-col gap-2 text-sm">
        {signal.extracted_action_item && (
          <div className="flex gap-2">
            <span className="shrink-0 font-medium text-zinc-500">Action:</span>
            <span className="text-zinc-800">{signal.extracted_action_item}</span>
          </div>
        )}

        {signal.people_mentioned && signal.people_mentioned.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="shrink-0 font-medium text-zinc-500">People:</span>
            {signal.people_mentioned.map((name) => (
              <span
                key={name}
                className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-700"
              >
                {name}
              </span>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}

export default function SignalFeed({ signals, onSignalUpdated }: SignalFeedProps) {
  return (
    <section className="w-full">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900">
        Signal Feed
        <span className="ml-2 text-sm font-normal text-zinc-400">
          ({signals.length} {signals.length === 1 ? "entry" : "entries"})
        </span>
      </h2>

      {signals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 px-6 py-12 text-center text-sm text-zinc-400">
          No signals yet. Submit your first one above.
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {signals.map((signal) => (
            <SignalCard
              key={signal.id}
              signal={signal}
              onSignalUpdated={onSignalUpdated}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
