"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Brain, Lock, Mail, User, ArrowRight, ShieldCheck } from "lucide-react";
import RecallifyLogo from "@/components/RecallifyLogo";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [resendTimer, setResendTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

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
        setSuccess("Verification email resent!");
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
    setSuccess("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(data.message || "Account created. Please verify your email.");
        startResendTimer();
      } else {
        setError(data.error || "Failed to create account");
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
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/[0.08] rounded-full blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-amber-800/[0.05] rounded-full blur-[140px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[380px] relative z-10 space-y-6"
      >
        {/* Header Branding */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-4 relative">
            <RecallifyLogo size={48} />
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight leading-none" style={{ fontFamily: 'var(--font-display)' }}>Create an Account</h1>
          <p className="text-text-secondary text-[13px] mt-2 font-medium">Build your intelligent second brain</p>
        </div>

        {/* Signup Card */}
        <div className="p-6 md:p-8 bg-bg-surface border border-border rounded-xl shadow-sm space-y-5">
          {success && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-success-muted border border-success/15 text-success px-4 py-3 rounded-lg text-[12px] font-semibold tracking-wide"
            >
              <div>{success}</div>
              <div className="mt-3 flex items-center gap-3 select-none">
                <button
                  onClick={handleResend}
                  disabled={resendTimer > 0 || resendLoading}
                  className="px-3 py-1.5 rounded bg-success/10 border border-success/20 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {resendLoading ? "Sending..." : resendTimer > 0 ? `Retry in ${resendTimer}s` : "Resend"}
                </button>
                <Link href="/login" className="text-[10px] font-bold text-success uppercase tracking-wider hover:text-success/80 transition-colors cursor-pointer">
                  Sign In
                </Link>
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
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative flex items-center group">
                <User className="absolute left-3 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  className="input-premium w-full pl-9 h-11 text-[13px] font-medium"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Email Address</label>
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
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Password</label>
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
                  Create Account <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer controls */}
          <div className="text-center pt-5 border-t border-border">
            <p className="text-[12px] text-text-muted font-medium">
              Already have an account?{" "}
              <Link href="/login" className="text-text-primary hover:text-primary transition-colors font-bold underline underline-offset-4 decoration-border hover:decoration-primary">
                Sign In
              </Link>
            </p>
          </div>
        </div>

      </motion.div>
    </main>
  );
}
