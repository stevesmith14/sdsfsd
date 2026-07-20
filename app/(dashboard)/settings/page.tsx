"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Bell, Clock, Globe, Shield, User, CheckCircle, AlertCircle } from "lucide-react";

type SettingsData = {
  email: string;
  preferences: {
    reminderTime: string;
    timezone: string;
    emailReminders: boolean;
  };
  reminderSettings: {
    enabled: boolean;
    frequency: "daily" | "every 2 days" | "weekly";
    lastReminderSentAt?: string | null;
  };
};

export default function SettingsPage() {
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string>("");
  const [msgType, setMsgType] = useState<"success" | "error">("success");

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/settings");
      const json = await res.json();
      if (json.success) setData(json.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const save = async (patch: any) => {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Update failed");
      if (json.data) setData(json.data);
      setMsgType("success");
      setMsg("Settings saved");
      setTimeout(() => setMsg(""), 2500);
    } catch (e: any) {
      setMsgType("error");
      setMsg(e.message || "Failed to save");
      setTimeout(() => setMsg(""), 3500);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 select-none">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.25em]">Loading...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="border border-dashed border-border p-12 rounded-xl flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto select-none mt-10">
         <AlertCircle className="w-10 h-10 text-error" />
         <h2 className="text-base font-bold text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>Failed to load settings</h2>
         <button onClick={fetchSettings} className="btn-primary h-9 px-5 uppercase text-[10px] tracking-wider cursor-pointer">Retry</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pt-24 sm:pt-28 pb-16 px-4 sm:px-6 md:px-8 page-transition">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary leading-tight mt-2" style={{ fontFamily: 'var(--font-display)' }}>
            Settings
          </h1>
          <p className="text-text-secondary text-[13px] font-medium leading-normal max-w-lg">
             Manage your notifications, review schedule, and account details.
          </p>
        </div>

        <AnimatePresence>
          {msg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`px-4 py-2 rounded-lg border text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm ${
                msgType === "success"
                  ? "bg-success-muted border-success/15 text-success"
                  : "bg-error-muted border-error/15 text-error"
              }`}
            >
              {msgType === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {msg}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Settings Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Main Toggles Panel */}
        <div className="md:col-span-8 space-y-6">
          <div className="card-premium p-6 md:p-8 border border-border space-y-6">
            
            {/* Email Reminders sliding switch */}
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-1">
                <h3 className="text-[13px] font-bold text-text-primary uppercase tracking-wider flex items-center gap-2 select-none">
                  Email Notifications <Bell className="w-3.5 h-3.5 text-primary" />
                </h3>
                <p className="text-text-secondary text-[12px] leading-relaxed font-medium">
                  Receive summarized insights and reminders directly in your inbox.
                </p>
              </div>
              <div 
                className={`sliding-switch-bg shrink-0 cursor-pointer ${data.preferences?.emailReminders ? "active" : ""}`}
                onClick={() => !saving && save({ preferences: { emailReminders: !data.preferences?.emailReminders } })}
              >
                <div className="sliding-switch-handle" />
              </div>
            </div>

            {/* Review Toggles sliding switch */}
            <div className="flex items-start justify-between gap-6 pt-6 border-t border-border">
              <div className="space-y-1">
                <h3 className="text-[13px] font-bold text-text-primary uppercase tracking-wider flex items-center gap-2 select-none">
                  Spaced Repetition <Settings className="w-3.5 h-3.5 text-primary-light" />
                </h3>
                <p className="text-text-secondary text-[12px] leading-relaxed font-medium">
                  Let us automatically email you flashcards when they are due for review.
                </p>
              </div>
              <div 
                className={`sliding-switch-bg shrink-0 cursor-pointer ${data.reminderSettings?.enabled ? "active" : ""}`}
                onClick={() => !saving && save({ reminderSettings: { enabled: !data.reminderSettings?.enabled } })}
              >
                <div className="sliding-switch-handle" />
              </div>
            </div>

            {/* Dropdowns / Timing forms */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-6 border-t border-border">
              
              <div className="space-y-1.5 select-none">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Frequency</label>
                <div className="relative">
                  <select
                    className="input-premium w-full h-11 bg-bg-input appearance-none text-[13px] pr-8 cursor-pointer font-medium"
                    value={data.reminderSettings?.frequency || "daily"}
                    disabled={saving}
                    onChange={(e) => save({ reminderSettings: { frequency: e.target.value } })}
                  >
                    <option value="daily">Daily</option>
                    <option value="every 2 days">Every 2 Days</option>
                    <option value="weekly">Weekly</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                     <Clock className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1 select-none">Delivery Time (HH:MM)</label>
                <div className="relative">
                  <input
                    type="text"
                    className="input-premium w-full h-11 text-[13px] font-medium"
                    value={data.preferences?.reminderTime || "09:00"}
                    disabled={saving}
                    onChange={(e) => setData({ ...data, preferences: { ...(data.preferences || {}), reminderTime: e.target.value } } as any)}
                    onBlur={() => save({ preferences: { reminderTime: data.preferences?.reminderTime || "09:00" } })}
                  />
                  <Clock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted select-none pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1 select-none">Timezone</label>
                <div className="relative">
                  <input
                    type="text"
                    className="input-premium w-full h-11 text-[13px] font-medium"
                    value={data.preferences?.timezone || "Asia/Kolkata"}
                    disabled={saving}
                    onChange={(e) => setData({ ...data, preferences: { ...(data.preferences || {}), timezone: e.target.value } } as any)}
                    onBlur={() => save({ preferences: { timezone: data.preferences?.timezone || "Asia/Kolkata" } })}
                    placeholder="e.g. UTC, America/New_York..."
                  />
                  <Globe className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted select-none pointer-events-none" />
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Sidebar details */}
        <div className="md:col-span-4 space-y-6 select-none">
          <div className="card-premium p-6 border border-border space-y-5">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-bg-root border border-border flex items-center justify-center">
                 <User className="w-4 h-4 text-text-muted" />
              </div>
              <div>
                 <h4 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Account ID</h4>
                 <p className="text-[13px] text-text-primary font-medium break-all mt-1">{data.email}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-border space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-text-primary uppercase tracking-wider">
                 <Shield className="w-3.5 h-3.5" /> Privacy
              </div>
              <p className="text-[11px] text-text-muted font-medium leading-relaxed">
                Your saved links, notes, and generated flashcards are completely private.
              </p>
            </div>
          </div>

          <div className="p-6 bg-primary-glow border border-primary/15 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary uppercase tracking-wider">
               Learning Habit
            </div>
            <p className="text-[11px] text-text-secondary font-medium leading-relaxed">
               Reviewing your saved content regularly dramatically improves retention. Turn on spaced repetition to build the habit.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
