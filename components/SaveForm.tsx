"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function SaveForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [mode, setMode] = useState<"link" | "note">("link");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "link" && !url) return;
    if (mode === "note" && !note) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "link"
            ? { type: "link", sourceUrl: url, rawContent: url }
            : { type: "note", rawContent: note, manualNote: note }
        ),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to save");

      setSuccess(true);
      setUrl("");
      setNote("");
      
      setTimeout(() => {
        setSuccess(false);
        router.push("/library");
      }, 1500);

    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-premium p-6 md:p-8 space-y-6">
      
      {/* Mode Selector */}
      <div className="flex p-1.5 bg-bg-root rounded-xl border border-border w-full max-w-[240px] mx-auto select-none">
        <button
          type="button"
          onClick={() => setMode("link")}
          disabled={loading || success}
          className={`flex-1 py-2 text-[12px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
            mode === "link"
              ? "bg-bg-surface text-primary shadow-sm border border-border"
              : "text-text-muted hover:text-text-primary border border-transparent"
          }`}
        >
          Link
        </button>
        <button
          type="button"
          onClick={() => setMode("note")}
          disabled={loading || success}
          className={`flex-1 py-2 text-[12px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
            mode === "note"
              ? "bg-bg-surface text-primary shadow-sm border border-border"
              : "text-text-muted hover:text-text-primary border border-transparent"
          }`}
        >
          Note
        </button>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-[12px] font-bold text-error bg-error-muted px-4 py-3 rounded-xl border border-error/20 text-center"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "link" ? (
          <div className="space-y-2">
            <input
              type="url"
              placeholder="https://example.com/article"
              required
              disabled={loading || success}
              className="input-premium w-full h-14 px-5 text-[14px] font-medium rounded-xl"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              autoFocus
            />
          </div>
        ) : (
          <div className="space-y-2">
            <textarea
              placeholder="Jot down a quick thought, idea, or finding..."
              required
              disabled={loading || success}
              className="input-premium w-full min-h-[140px] p-5 text-[14px] font-medium rounded-xl resize-y"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              autoFocus
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading || success || (mode === "link" ? !url : !note)}
          className={`btn-primary w-full h-14 rounded-xl flex items-center justify-center gap-2 text-[13px] font-bold uppercase tracking-widest transition-all ${
            success ? "bg-success" : ""
          }`}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : success ? (
            <>
              <CheckCircle2 className="w-4 h-4" /> Captured!
            </>
          ) : (
            <>
               Capture {mode === "link" ? "Link" : "Note"} <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
