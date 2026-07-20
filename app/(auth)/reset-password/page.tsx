"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Lock, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff, XCircle } from "lucide-react";
import RecallifyLogo from "@/components/RecallifyLogo";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!token) {
      setTokenError("No reset token found. Please request a new reset link.");
    }
  }, [token]);

  useEffect(() => {
    if (!success) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [success, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        const msg = data.error || "";
        if (msg.toLowerCase().includes("expired")) {
          setError("This reset link has expired. Please request a new one.");
        } else if (msg.toLowerCase().includes("invalid")) {
          setError("This reset link is invalid or has already been used.");
        } else {
          setError(msg || "Failed to reset password. Please try again.");
        }
      }
    } catch (err) {
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (tokenError) {
    return (
      <div className="p-6 md:p-8 bg-bg-surface border border-border rounded-xl shadow-sm text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-red-500/5 border border-red-500/15 rounded-full flex items-center justify-center">
            <XCircle className="w-6 h-6 text-red-400" />
          </div>
        </div>
        <div className="space-y-2 select-none">
          <h2 className="text-base font-bold text-white tracking-tight">Invalid Link</h2>
          <p className="text-text-secondary text-xs font-medium">{tokenError}</p>
        </div>
        <Link
          href="/forgot-password"
          className="btn-premium inline-flex items-center justify-center gap-1.5 h-10 px-6 uppercase text-xs font-semibold tracking-wider cursor-pointer"
        >
          Request New Link <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 md:p-8 bg-bg-surface border border-border rounded-xl shadow-sm text-center space-y-6"
      >
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-emerald-500/5 border border-emerald-500/15 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
        </div>
        <div className="space-y-2 select-none">
          <h2 className="text-base font-bold text-white tracking-tight">Access Restored</h2>
          <p className="text-text-secondary text-xs font-medium">
            Your secure key credentials have been updated.
          </p>
        </div>
        <div className="space-y-3 pt-4 border-t border-border/60 select-none">
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
            Redirecting in {countdown}s...
          </p>
          <Link
            href="/login"
            className="text-[10px] font-bold text-primary-light hover:text-white uppercase tracking-wider transition-colors cursor-pointer block"
          >
            Go to Login Now →
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-bg-surface border border-border rounded-xl shadow-sm space-y-5">
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex items-start gap-2.5 bg-red-500/5 border border-red-500/15 text-red-400 p-3.5 rounded-lg text-[11px] font-semibold tracking-wide"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span>{error}</span>
              {(error.includes("expired") || error.includes("invalid")) && (
                <div>
                  <Link
                    href="/forgot-password"
                    className="underline underline-offset-4 hover:text-white transition-colors"
                  >
                    Request new link
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1 select-none">
            New Secret Key
          </label>
          <div className="relative flex items-center group">
            <Lock className="absolute left-3 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Min. 8 characters"
              className="input-premium w-full pl-9 pr-9 h-10 text-xs font-medium"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-text-muted hover:text-white transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1 select-none">
            Confirm Secret Key
          </label>
          <div className="relative flex items-center group">
            <Lock className="absolute left-3 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none" />
            <input
              type={showConfirm ? "text" : "password"}
              required
              placeholder="Re-enter secret key"
              className={`input-premium w-full pl-9 pr-9 h-10 text-xs font-medium ${
                confirmPassword && password !== confirmPassword
                  ? "border-red-500/50 focus:border-red-500 focus:box-shadow-none"
                  : confirmPassword && password === confirmPassword
                  ? "border-emerald-500/50 focus:border-emerald-500 focus:box-shadow-none"
                  : ""
              }`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 text-text-muted hover:text-white transition-colors cursor-pointer"
            >
              {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="text-[9px] text-red-500 font-bold ml-1 uppercase tracking-tight select-none">Mismatch detected</p>
          )}
          {confirmPassword && password === confirmPassword && (
            <p className="text-[9px] text-emerald-500 font-bold ml-1 uppercase tracking-tight select-none">✓ Matches</p>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="btn-premium w-full h-10 flex items-center justify-center gap-1.5 mt-2 uppercase text-xs font-semibold tracking-wider cursor-pointer"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Update Key <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen relative bg-bg-root flex items-center justify-center p-6 overflow-hidden select-none">
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/25 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/15 rounded-full blur-[140px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[380px] relative z-10 space-y-6"
      >
        {/* Branding header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center justify-center mb-4 relative">
              <RecallifyLogo size={48} />
            </div>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight mb-1.5 leading-tight">
            Finalize Reset
          </h1>
          <p className="text-text-secondary text-xs font-medium">
            Update your account with a new secure key.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="p-10 bg-bg-surface border border-border rounded-xl flex justify-center">
              <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>

        <div className="text-center">
            <span className="text-[9px] text-text-muted font-semibold uppercase tracking-wider">Recallify Security Protocol</span>
        </div>
      </motion.div>
    </main>
  );
}
