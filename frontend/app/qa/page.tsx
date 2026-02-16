"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

type Reference = {
  filePath: string;
  startLine: number;
  endLine: number;
  snippet: string;
};

function QAContent() {
  const searchParams = useSearchParams();
  const [projectId, setProjectId] = useState(
    searchParams.get("projectId") || "",
  );
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [answer, setAnswer] = useState("");
  const [references, setReferences] = useState<Reference[]>([]);
  const [expandedSnippets, setExpandedSnippets] = useState<Set<number>>(
    new Set(),
  );

  useEffect(() => {
    const id = searchParams.get("projectId");
    if (id) setProjectId(id);
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setAnswer("");
    setReferences([]);
    const q = question.trim();
    if (!q) {
      setError("Enter a question");
      return;
    }
    if (!projectId.trim()) {
      setError(
        "Open a project from Home first (upload or GitHub), then use the link with projectId.",
      );
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: projectId.trim(), question: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ask failed");
      setAnswer(data.answer ?? "");
      setReferences(data.references ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ask failed");
    } finally {
      setLoading(false);
    }
  }

  const toggleSnippet = (index: number) => {
    const newExpanded = new Set(expandedSnippets);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
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
      <h1 className="text-2xl font-semibold text-[var(--muted)]">Q&A</h1>
      <p className="text-[var(--muted)]">
        Ask a question about your codebase. Answers are based only on indexed
        files.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Project ID (from Home)"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--muted)]"
        />
        <textarea
          placeholder="Your question…"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--muted)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Asking…" : "Ask"}
        </button>
      </form>

      {error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {answer && (
        <div className="space-y-6">
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
            <h2 className="text-sm font-medium text-[var(--muted)] mb-2">
              Answer
            </h2>
            <div className="prose prose-invert prose-sm max-w-none text-[var(--muted)]">
              <ReactMarkdown
                components={{
                  code({ className, children, ...props }) {
                    const isBlock = className?.startsWith("language-");

                    if (isBlock) {
                      return (
                        <code
                          className={`${className} block bg-[var(--card)] rounded-lg p-4 text-sm border border-[var(--border)] overflow-x-auto`}
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }

                    return (
                      <code
                        className="bg-[var(--card)] rounded px-1 py-0.5 text-[var(--accent)] text-sm"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },

                  pre({ children }) {
                    return (
                      <pre className="bg-[var(--card)] rounded-lg p-4 overflow-x-auto text-sm border border-[var(--border)]">
                        {children}
                      </pre>
                    );
                  },

                  h1({ children }) {
                    return (
                      <h1 className="text-2xl font-bold text-[var(--muted)] mt-4 mb-3">
                        {children}
                      </h1>
                    );
                  },

                  h2({ children }) {
                    return (
                      <h2 className="text-xl font-semibold text-[var(--muted)] mt-3 mb-2">
                        {children}
                      </h2>
                    );
                  },

                  h3({ children }) {
                    return (
                      <h3 className="text-lg font-medium text-[var(--muted)] mt-2 mb-1">
                        {children}
                      </h3>
                    );
                  },

                  ul({ children }) {
                    return (
                      <ul className="list-disc list-inside space-y-1 text-[var(--muted)]">
                        {children}
                      </ul>
                    );
                  },

                  ol({ children }) {
                    return (
                      <ol className="list-decimal list-inside space-y-1 text-[var(--muted)]">
                        {children}
                      </ol>
                    );
                  },

                  a({ href, children }) {
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

                  blockquote({ children }) {
                    return (
                      <blockquote className="border-l-4 border-[var(--border)] pl-4 italic text-[var(--muted)]">
                        {children}
                      </blockquote>
                    );
                  },
                }}
              >
                {answer}
              </ReactMarkdown>
            </div>
          </section>

          {references.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-[var(--muted)]">
                References ({references.length})
              </h2>
              {references.map((ref, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden"
                >
                  <div className="px-4 py-2 border-b border-[var(--border)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {getFileIcon(ref.filePath)}
                      </span>
                      <span className="font-mono text-sm text-[var(--accent)]">
                        {ref.filePath}
                      </span>
                      <span className="text-xs text-[var(--muted)]">
                        (L{ref.startLine}–{ref.endLine})
                      </span>
                    </div>
                    <button
                      onClick={() => toggleSnippet(index)}
                      className="text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
                    >
                      {expandedSnippets.has(index) ? "▼ Hide" : "▶ Show"}{" "}
                      snippet
                    </button>
                  </div>

                  {expandedSnippets.has(index) && (
                    <pre className="code-block m-0 rounded-none text-[var(--text)] p-4 overflow-x-auto">
                      <code>{ref.snippet}</code>
                    </pre>
                  )}
                </div>
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default function QAPage() {
  return (
    <Suspense fallback={<p className="text-[var(--muted)]">Loading…</p>}>
      <QAContent />
    </Suspense>
  );
}
