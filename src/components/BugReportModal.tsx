"use client";

import { useState } from "react";
import { X, Loader2, CheckCircle2, Bug } from "lucide-react";

export default function BugReportModal({ onClose }: { onClose: () => void }) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!description.trim()) {
      setError("Tell us what happened first.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/bug-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          page_url: window.location.pathname,
        }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError("Something went wrong — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-md rounded-3xl overflow-hidden"
        style={{ background: "#ffffff", border: "1px solid #e4e2de", boxShadow: "0 20px 60px rgba(0,53,39,0.14)" }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between" style={{ borderBottom: "1px solid #f5f3ef" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#cce6d9" }}>
              <Bug className="w-4 h-4" style={{ color: "#003527" }} />
            </div>
            <h3 className="font-bold text-base" style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", color: "#003527" }}>
              Report a bug
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-colors"
            style={{ background: "#f5f3ef", color: "#707974" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5">
          {submitted ? (
            <div className="flex flex-col items-center text-center gap-2 py-4">
              <CheckCircle2 className="w-8 h-8" style={{ color: "#2b6954" }} />
              <p className="font-semibold text-sm" style={{ color: "#003527" }}>Thanks — got it!</p>
              <p className="text-xs" style={{ color: "#707974" }}>
                We&apos;ll take a look. You can close this now.
              </p>
              <button
                onClick={onClose}
                className="mt-3 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #003527 0%, #064e3b 100%)" }}
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#404944" }}>
                What happened?
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. The grocery list didn't update after I checked off an item…"
                rows={5}
                autoFocus
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none"
                style={{ background: "#f5f3ef", border: "1px solid transparent", color: "#1b1c1a" }}
                onFocus={(e) => (e.target.style.borderColor = "#2b6954")}
                onBlur={(e) => (e.target.style.borderColor = "transparent")}
              />

              {error && (
                <p className="text-xs mt-2 px-1" style={{ color: "#ef4444" }}>{error}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #003527 0%, #064e3b 100%)", color: "#ffffff" }}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                ) : (
                  "Send Report"
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
