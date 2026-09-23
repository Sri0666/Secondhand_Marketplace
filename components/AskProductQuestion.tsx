"use client";

import { useState } from "react";

export function AskProductQuestion({ productId }: { productId: string }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function askQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!question.trim()) return;
    setLoading(true); setError(""); setAnswer("");
    try {
      const response = await fetch("/api/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, question: question.trim() }) });
      const payload = await response.json() as { answer?: string; error?: string };
      if (!response.ok || !payload.answer) throw new Error(payload.error || "Could not answer that question.");
      setAnswer(payload.answer);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Could not answer that question."); }
    finally { setLoading(false); }
  }
  return <section className="rounded-xl bg-mist p-4"><h2 className="font-semibold text-ink">Ask about this item</h2><p className="mt-1 text-sm text-slate-600">Answers use this listing’s recorded details only.</p><form onSubmit={askQuestion} className="mt-3 flex gap-2"><input aria-label="Question about this item" value={question} maxLength={500} onChange={(event) => setQuestion(event.target.value)} placeholder="Does it include a charger?" className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-moss focus:ring-2" /><button disabled={loading || !question.trim()} className="rounded-lg bg-moss px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Asking…" : "Ask"}</button></form>{answer && <p aria-live="polite" className="mt-3 rounded-lg bg-white p-3 text-sm leading-6 text-slate-700">{answer}</p>}{error && <p aria-live="polite" className="mt-3 text-sm text-red-700">{error}</p>}</section>;
}
