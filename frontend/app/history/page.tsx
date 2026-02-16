"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

type HistoryItem = {
  _id: string;
  question: string;
  answer: string;
  references: {
    filePath: string;
    startLine: number;
    endLine: number;
    snippet: string;
  }[];
  createdAt: string;
};

export default function HistoryPage() {
  const [projectId, setProjectId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [expandedSnippets, setExpandedSnippets] = useState<Set<string>>(
    new Set(),
  );

  async function loadHistory() {
    if (!projectId.trim()) {
      setError("Enter a project ID");
      return;
    }
    setError("");
    setLoading(true);
    setHasLoaded(true);

    try {
      const url = `${API_BASE}/api/history/${encodeURIComponent(projectId.trim())}`;
      const res = await fetch(url);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to load history: ${res.status}`);
      }

      const data = await res.json();
      setHistory(data.history ?? []);
    } catch (err) {
      console.error("Error loading history:", err);
      setError(err instanceof Error ? err.message : "Failed to load");
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }

  const toggleSnippet = (itemId: string, refIndex: number) => {
    const key = `${itemId}-${refIndex}`;
    const newExpanded = new Set(expandedSnippets);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedSnippets(newExpanded);
  };

  const getFileIcon = (filePath: string) => {
    if (filePath.endsWith(".ts") || filePath.endsWith(".tsx")) return "📘";
    if (filePath.endsWith(".js") || filePath.endsWith(".jsx")) return "📙";
    if (filePath.endsWith(".json")) return "📋";
    if (filePath.endsWith(".md")) return "📝";
    if (filePath.includes("model")) return "🗄️";
    if (filePath.includes("controller")) return "🎮";
    if (filePath.includes("service")) return "⚙️";
    if (filePath.includes("route")) return "🛣️";
    if (filePath.includes("config")) return "⚙️";
    return "📄";
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[var(--muted)]">History</h1>
      <p className="text-[var(--muted)]">Last 10 Q&A for a project.</p>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Project ID"
          value={projectId}
          onChange={(e) => {
            setProjectId(e.target.value);
            setHasLoaded(false);
            setError("");
          }}
          className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--muted)] placeholder-[var(--muted)]"
        />
        <button
          onClick={loadHistory}
          disabled={loading}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Loading…" : "Load"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {hasLoaded && !loading && !error && history.length === 0 && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 text-center">
          <p className="text-[var(--muted)]">
            No history found for this project.
          </p>
          <p className="text-xs text-[var(--muted)] mt-2">
            Try asking some questions in the Q&A page first.
          </p>
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-6">
          {history.map((item) => (
            <div
              key={item._id}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--card)]/50">
                <p className="text-sm font-medium text-[var(--accent)]">
                  Q: {item.question}
                </p>
                <p className="text-xs text-[var(--muted)] mt-1">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="px-4 py-3 border-b border-[var(--border)]">
                <h3 className="text-xs font-medium text-[var(--muted)] mb-2">
                  Answer:
                </h3>
                <div className="prose prose-invert prose-sm max-w-none text-[var(--muted)]">
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        return (
                          <code
                            className={`${className} bg-[var(--card)] rounded px-1 py-0.5 text-[var(--accent)]`}
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                      pre({ node, children }) {
                        return (
                          <pre className="bg-[var(--card)] rounded-lg p-4 overflow-x-auto text-sm border border-[var(--border)]">
                            {children}
                          </pre>
                        );
                      },
                      h1({ node, children }) {
                        return (
                          <h1 className="text-xl font-bold text-[var(--muted)] mt-3 mb-2">
                            {children}
                          </h1>
                        );
                      },
                      h2({ node, children }) {
                        return (
                          <h2 className="text-lg font-semibold text-[var(--muted)] mt-2 mb-1">
                            {children}
                          </h2>
                        );
                      },
                      h3({ node, children }) {
                        return (
                          <h3 className="text-md font-medium text-[var(--muted)] mt-1 mb-1">
                            {children}
                          </h3>
                        );
                      },
                      ul({ node, children }) {
                        return (
                          <ul className="list-disc list-inside space-y-1 text-[var(--muted)]">
                            {children}
                          </ul>
                        );
                      },
                      ol({ node, children }) {
                        return (
                          <ol className="list-decimal list-inside space-y-1 text-[var(--muted)]">
                            {children}
                          </ol>
                        );
                      },
                      a({ node, href, children }) {
                        return (
                          <a
                            href={href}
                            className="text-[var(--accent)] hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {children}
                          </a>
                        );
                      },
                      blockquote({ node, children }) {
                        return (
                          <blockquote className="border-l-4 border-[var(--border)] pl-4 italic text-[var(--muted)]">
                            {children}
                          </blockquote>
                        );
                      },
                    }}
                  >
                    {item.answer}
                  </ReactMarkdown>
                </div>
              </div>

              {/* References */}
              {item.references?.length > 0 && (
                <div className="px-4 py-3">
                  <h3 className="text-xs font-medium text-[var(--muted)] mb-2">
                    References ({item.references.length}):
                  </h3>
                  <div className="space-y-2">
                    {item.references.map((ref, refIndex) => (
                      <div
                        key={refIndex}
                        className="rounded-lg border border-[var(--border)] bg-[var(--card)]/50 overflow-hidden"
                      >
                        <div className="px-3 py-2 flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-lg flex-shrink-0">
                              {getFileIcon(ref.filePath)}
                            </span>
                            <span className="font-mono text-xs text-[var(--accent)] truncate">
                              {ref.filePath}
                            </span>
                            <span className="text-xs text-[var(--muted)] flex-shrink-0">
                              (L{ref.startLine}-{ref.endLine})
                            </span>
                          </div>
                          <button
                            onClick={() => toggleSnippet(item._id, refIndex)}
                            className="text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors flex-shrink-0 ml-2"
                          >
                            {expandedSnippets.has(`${item._id}-${refIndex}`)
                              ? "▼ Hide"
                              : "▶ Show"}{" "}
                            snippet
                          </button>
                        </div>

                        {expandedSnippets.has(`${item._id}-${refIndex}`) && (
                          <pre className="code-block m-0 rounded-none text-[var(--text)] p-3 overflow-x-auto text-xs border-t border-[var(--border)]">
                            <code>{ref.snippet}</code>
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
