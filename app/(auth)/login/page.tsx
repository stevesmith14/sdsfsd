"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import RecallifyLogo from "@/components/RecallifyLogo";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [resendTimer, setResendTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);

  const startResendTimer = () => {
    setResendTimer(45);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendTimer > 0 || resendLoading) return;
    setResendLoading(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (data.success) {
        setInfo("Verification email resent!");
        startResendTimer();
      } else {
        setError(data.error || "Failed to resend email");
      }
    } catch (err) {
      setError("Failed to resend email. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/");
      } else {
        setError(data.error || "Invalid login credentials");
        if ((data.error || "").toLowerCase().includes("verify your email")) {
          setShowResend(true);
          setInfo("Your email is not verified.");
        }
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative bg-bg-root flex items-center justify-center p-6 overflow-hidden select-none">
      {/* Background visual gradients */}
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
        {/* Logo and Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-4 relative">
            <RecallifyLogo size={48} />
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight leading-none" style={{ fontFamily: 'var(--font-display)' }}>Sign in to Recallify</h1>
          <p className="text-text-secondary text-[13px] mt-2 font-medium">Welcome back to your second brain</p>
        </div>

        {/* Access Form Card */}
        <div className="p-6 md:p-8 bg-bg-surface border border-border rounded-xl shadow-sm space-y-5">
          {info && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-primary-glow border border-primary/20 text-primary px-4 py-3 rounded-lg text-[12px] font-semibold tracking-wide"
            >
              <div className="flex flex-col gap-2">
                <span>{info}</span>
                {showResend && (
                  <button
                    onClick={handleResend}
                    disabled={resendTimer > 0 || resendLoading}
                    className="self-start px-3 py-1.5 bg-primary text-bg-root rounded text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    {resendLoading ? "Sending..." : resendTimer > 0 ? `Retry in ${resendTimer}s` : "Resend Email"}
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-error-muted border border-error/20 text-error px-4 py-3 rounded-lg text-[12px] font-semibold tracking-wide flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Email</label>
              <div className="relative flex items-center group">
                <Mail className="absolute left-3 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="input-premium w-full pl-9 h-11 text-[13px] font-medium"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Password</label>
                <Link href="/forgot-password" className="text-[10px] font-bold text-primary hover:text-primary-light transition-colors uppercase tracking-wider">
                   Forgot?
                </Link>
              </div>
              <div className="relative flex items-center group">
                <Lock className="absolute left-3 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="input-premium w-full pl-9 h-11 text-[13px] font-medium"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="btn-primary w-full h-11 flex items-center justify-center gap-1.5 mt-2 uppercase text-[12px] font-bold tracking-wider cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-bg-root/30 border-t-bg-root rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Nav links footer */}
          <div className="text-center pt-5 border-t border-border">
            <p className="text-[12px] text-text-muted font-medium">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-text-primary hover:text-primary transition-colors font-bold underline underline-offset-4 decoration-border hover:decoration-primary">
                Create one
              </Link>
            </p>
          </div>
        </div>

      </motion.div>
    </main>
  );
}
