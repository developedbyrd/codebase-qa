"use client";

import { useState } from "react";
import {
  Github,
  Upload,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Package,
} from "lucide-react";

const API_BASE =
  typeof window !== "undefined" && process.env.NEXT_PUBLIC_API_URL;

export default function HomePage() {
  const [githubUrl, setGithubUrl] = useState("");
  const [projectName, setProjectName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    projectId: string;
    name: string;
    fileCount: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"github" | "zip">("github");

  async function handleGithubSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    const url = githubUrl.trim();
    if (!url) {
      setError("Enter a GitHub repository URL");
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000);
    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          githubUrl: url,
          projectName: projectName.trim() || undefined,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setResult(data);
      setGithubUrl("");
      setProjectName("");
    } catch (err) {
      clearTimeout(timeoutId);
      const msg = err instanceof Error ? err.message : "Upload failed";
      const isAbort = err instanceof Error && err.name === "AbortError";
      const isNetwork =
        msg === "Failed to fetch" ||
        (err instanceof TypeError && err.message?.includes("fetch"));
      if (isAbort) {
        setError("Import is taking too long. Try a smaller repo or try again.");
      } else if (isNetwork) {
        setError(`Cannot reach backend at ${API_BASE}. Is it running?`);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleFileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    if (!file) {
      setError("Select a .zip file");
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);
    try {
      const form = new FormData();
      form.append("file", file);
      if (projectName.trim()) form.append("projectName", projectName.trim());
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        body: form,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setResult(data);
      setFile(null);
      setProjectName("");
    } catch (err) {
      clearTimeout(timeoutId);
      const msg = err instanceof Error ? err.message : "Upload failed";
      const isAbort = err instanceof Error && err.name === "AbortError";
      const isNetwork =
        msg === "Failed to fetch" ||
        (err instanceof TypeError && err.message?.includes("fetch"));
      if (isAbort) {
        setError("Upload is taking too long. Try a smaller zip or try again.");
      } else if (isNetwork) {
        setError(`Cannot reach backend at ${API_BASE}. Is it running?`);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-light tracking-tight text-[var(--text-primary)]">
          Codebase Q&A
          <span className="text-[var(--muted)] ml-2 font-light">
            with proof
          </span>
        </h1>
        <p className="text-[var(--muted)] text-sm max-w-2xl">
          Upload your codebase and ask questions. Get answers with precise file
          references and line numbers.
        </p>
      </div>

      {result && (
        <div className="rounded-lg border border-[var(--success)]/20 bg-[var(--success)]/5 p-6">
          <div className="flex items-start gap-4">
            <CheckCircle className="w-5 h-5 text-[var(--success)] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[var(--text-primary)] font-medium">
                {result.name}
              </p>
              <p className="text-sm text-[var(--muted)] mt-1">
                Successfully indexed {result.fileCount} file
                {result.fileCount !== 1 ? "s" : ""}
              </p>
              <a
                href={`/qa?projectId=${result.projectId}`}
                className="inline-flex items-center gap-2 text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] mt-4 group cursor-pointer"
              >
                Go to Q&A
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-[var(--error)]/20 bg-[var(--error)]/5 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[var(--error)] flex-shrink-0" />
            <p className="text-sm text-[var(--error)]">{error}</p>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/50 overflow-hidden">
        <div className="flex border-b border-[var(--border)]">
          <button
            onClick={() => setActiveTab("github")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative cursor-pointer
              ${
                activeTab === "github"
                  ? "text-[var(--text-primary)]"
                  : "text-[var(--muted)] hover:text-[var(--text-primary)]"
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Github className="w-4 h-4" />
              <span>GitHub Repository</span>
            </div>
            {activeTab === "github" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("zip")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative
              ${
                activeTab === "zip"
                  ? "text-[var(--text-primary)]"
                  : "text-[var(--muted)] hover:text-[var(--text-primary)]"
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Package className="w-4 h-4" />
              <span>Upload ZIP</span>
            </div>
            {activeTab === "zip" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)]" />
            )}
          </button>
        </div>

        <div className="p-6">
          {activeTab === "github" ? (
            <form onSubmit={handleGithubSubmit} className="space-y-4 cursor-pointer">
              <div className="space-y-2">
                <label className="text-sm text-[var(--muted)]">
                  Repository URL
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/owner/repo"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 
                           text-[var(--text-primary)] placeholder-[var(--muted-light)] text-sm
                           focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)]
                           transition-shadow"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[var(--muted)]">
                  Project name (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., My Project"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 
                           text-[var(--text-primary)] placeholder-[var(--muted-light)] text-sm
                           focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)]
                           transition-shadow"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white
                         hover:bg-[var(--accent-hover)] transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Importing repository...</span>
                  </>
                ) : (
                  <>
                    <Github className="w-4 h-4" />
                    <span classname="cursor-pointer">Import from GitHub</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleFileSubmit} className="space-y-4 cursor-pointer">
              <div className="space-y-2">
                <label className="text-sm text-[var(--muted)]">ZIP file</label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".zip"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-[var(--text-primary)]
                             file:mr-4 file:py-2 file:px-4
                             file:rounded-lg file:border-0
                             file:text-sm file:font-medium
                             file:bg-[var(--accent)] file:text-white
                             hover:file:bg-[var(--accent-hover)]
                             file:transition-colors file:cursor-pointer
                             cursor-pointer"
                  />
                </div>
                {file && (
                  <p className="text-xs text-[var(--muted)] mt-2">
                    Selected: {file.name} (
                    {(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[var(--muted)]">
                  Project name (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., My Project"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 
                           text-[var(--text-primary)] placeholder-[var(--muted-light)] text-sm
                           focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)]
                           transition-shadow"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !file}
                className="w-full rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white
                         hover:bg-[var(--accent-hover)] transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span classname="cursor-pointer">Upload ZIP</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="text-xs text-[var(--muted)] border-t border-[var(--border)] pt-6">
        <p className="mb-2">✨ Tips:</p>
        <ul className="space-y-1 list-disc list-inside opacity-60">
          <li>Large repositories may take a few minutes to process</li>
          <li>Maximum ZIP file size: 100MB</li>
          <li>Private repositories require authentication (coming soon)</li>
        </ul>
      </div>
    </div>
  );
}
