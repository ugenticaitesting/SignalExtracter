"use client";

import { useState } from "react";
import type { Signal, ExtractResponse } from "@/app/types";

interface SignalInputProps {
  onSignalCreated: (signal: Signal) => void;
}

export default function SignalInput({ onSignalCreated }: SignalInputProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const json: ExtractResponse = await res.json();

      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.error ?? "Something went wrong");
      }

      onSignalCreated(json.data);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="w-full rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-lg font-semibold text-zinc-900">
        Signal Input
      </h2>
      <p className="mb-4 text-sm text-zinc-500">
        Paste an email, Slack message, meeting note, or any text.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your text here…"
          rows={6}
          className="w-full resize-y rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-800 placeholder-zinc-400 outline-none transition focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-100"
          disabled={loading}
        />

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="self-end rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Extracting…" : "Submit"}
        </button>
      </form>
    </section>
  );
}
