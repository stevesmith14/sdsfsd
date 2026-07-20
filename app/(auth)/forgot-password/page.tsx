"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Mail, ArrowLeft, Send, CheckCircle2, AlertCircle } from "lucide-react";
import RecallifyLogo from "@/components/RecallifyLogo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (data.success) {
        setSent(true);
      } else {
        setError(data.error || "Failed to process request. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative bg-bg-root flex items-center justify-center p-6 overflow-hidden select-none">
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/[0.08] rounded-full blur-[140px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-amber-800/[0.05] rounded-full blur-[140px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[380px] relative z-10 space-y-6"
      >
        {/* Header Navigation */}
        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-text-muted hover:text-text-primary mb-6 transition-colors text-[10px] font-bold uppercase tracking-[0.15em] group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to Sign In
          </Link>

          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center justify-center mb-4 relative">
              <RecallifyLogo size={48} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight leading-none" style={{ fontFamily: 'var(--font-display)' }}>Reset Password</h1>
          <p className="text-text-secondary text-[13px] mt-2 font-medium">We'll send you a secure recovery link</p>
        </div>

        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 md:p-8 bg-bg-surface border border-border rounded-xl shadow-sm text-center space-y-6"
            >
              <div className="flex justify-center select-none">
                <div className="w-12 h-12 bg-success-muted border border-success/15 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h2 className="text-base font-bold text-text-primary tracking-tight leading-none" style={{ fontFamily: 'var(--font-display)' }}>Email Sent</h2>
                <p className="text-text-secondary text-[13px] leading-relaxed font-medium">
                  We've sent a password reset link to:
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-glow border border-primary/15 rounded-lg text-[13px] font-bold text-text-primary">
                  <Mail className="w-3.5 h-3.5 text-primary-light" />
                  <span>{email}</span>
                </div>
                <p className="text-text-muted text-[11px] font-medium leading-relaxed pt-2">
                  Please activate this link within 1 hour. Check your spam folder if it doesn't arrive.
                </p>
              </div>

              <div className="pt-4 border-t border-border">
                <Link
                  href="/login"
                  className="text-[11px] font-bold text-text-muted hover:text-text-primary uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Return to sign in →
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 md:p-8 bg-bg-surface border border-border rounded-xl shadow-sm space-y-5"
            >
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="flex items-start gap-2 bg-error-muted border border-error/15 text-error p-3.5 rounded-lg text-[12px] font-semibold tracking-wide"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">
                    Email Address
                  </label>
                  <div className="relative flex items-center group">
                    <Mail className="absolute left-3 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none" />
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      placeholder="name@example.com"
                      className="input-premium w-full pl-9 h-11 text-[13px] font-medium"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="btn-primary w-full h-11 flex items-center justify-center gap-1.5 mt-2 uppercase text-[12px] font-bold tracking-wider cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-bg-root/30 border-t-bg-root rounded-full animate-spin" />
                  ) : (
                    <>
                      Send Reset Link <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </main>
  );
}
