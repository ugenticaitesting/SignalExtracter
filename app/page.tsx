"use client";

import { useEffect, useState } from "react";
import SignalInput from "@/app/components/SignalInput";
import SignalFeed from "@/app/components/SignalFeed";
import { fetchSignals } from "@/app/lib/supabase";
import type { Signal } from "@/app/types";

export default function Home() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetchSignals()
      .then(setSignals)
      .catch((err) =>
        setLoadError(err instanceof Error ? err.message : "Failed to load signals")
      );
  }, []);

  function handleSignalCreated(newSignal: Signal) {
    setSignals((prev) => [newSignal, ...prev]);
  }

  function handleSignalUpdated(updated: Signal) {
    setSignals((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">
          Signal Extracter
        </h1>
        <p className="text-sm text-zinc-500">
          AI-powered extraction of action items, people, and urgency.
        </p>
      </header>

      <main className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-8">
        <SignalInput onSignalCreated={handleSignalCreated} />

        {loadError && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            Failed to load feed: {loadError}
          </div>
        )}

        <SignalFeed signals={signals} onSignalUpdated={handleSignalUpdated} />
      </main>
    </div>
  );
}
