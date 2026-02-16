"use client";

import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

type Status = { backend: string; database: string; llm: string } | null;

export default function StatusPage() {
  const [status, setStatus] = useState<Status>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function fetchStatus() {
      try {
        const res = await fetch(`${API_BASE}/api/status`);
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        if (!cancelled) setStatus(data);
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to fetch status",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchStatus();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p className="text-[var(--muted)]">Loading status…</p>;
  if (error) {
    return (
      <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-400">
        Could not reach backend.
      </div>
    );
  }

  const items = [
    {
      label: "Backend",
      value: status?.backend === "ok" ? "Ok" : (status?.backend ?? "—"),
      ok: status?.backend?.toLowerCase() === "ok",
    },
    {
      label: "Database",
      value:
        status?.database === "connected"
          ? "Connected"
          : (status?.database ?? "—"),
      ok: status?.database?.toLowerCase() === "connected",
    },
    {
      label: "LLM (OpenRouter)",
      value: status?.llm ?? "—",
      ok: status?.llm === "Connected",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[var(--muted)]">Status</h1>
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] divide-y divide-[var(--border)]">
        {items.map(({ label, value, ok }) => (
          <div
            key={label}
            className="flex items-center justify-between px-4 py-3"
          >
            <span className="text-[var(--muted)]">{label}</span>
            <span className={ok ? "text-green-400" : "text-amber-400"}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
