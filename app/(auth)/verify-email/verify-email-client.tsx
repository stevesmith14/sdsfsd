"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailClient({ token }: { token: string | null }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!token) return;
    setStatus("verifying");
    setError("");

    fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.success) {
          setStatus("success");
          setTimeout(() => router.push("/login"), 1200);
        } else {
          setStatus("error");
          setError(data?.error || "Verification failed");
        }
      })
      .catch((err) => {
        console.error("Verification fetch error:", err);
        setStatus("error");
        setError("Verification failed");
      });
  }, [token, router]);

  return (
    <div className="max-w-md mx-auto py-16 space-y-6">
      <div className="glass p-10 rounded-[2.5rem] border border-slate-800 space-y-4">
        <h1 className="text-3xl font-black text-white tracking-tight">Verify Email</h1>

        {!token && (
          <p className="text-slate-400 font-medium">
            Missing verification token. Please use the link from your email.
          </p>
        )}

        {status === "verifying" && (
          <div className="flex items-center gap-3 text-slate-300 font-bold">
            <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            Verifying…
          </div>
        )}

        {status === "success" && (
          <p className="text-emerald-400 font-bold">Email verified. Redirecting to login…</p>
        )}

        {status === "error" && (
          <div className="space-y-3">
            <p className="text-red-400 font-bold">{error || "Verification failed"}</p>
            <Link className="btn-ghost inline-flex" href="/signup">
              Back to Signup
            </Link>
          </div>
        )}

        {status === "idle" && token && <p className="text-slate-400 font-medium">Starting verification…</p>}
      </div>
    </div>
  );
}

