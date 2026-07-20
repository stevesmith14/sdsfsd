"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Library,
  PlusCircle,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import RecallifyLogo from "@/components/RecallifyLogo";

/* ── Landing nav items ─────────────────────────────────────────────────── */

const LANDING_NAV = ["Home", "Features", "How It Works", "FAQ"] as const;

/* ── Component ─────────────────────────────────────────────────────────── */

export default function TopNav() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/user/settings")
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setUserEmail(json.data.email);
          }
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(() => setIsAuthenticated(false));
  }, [pathname]);

  // Handle click outside profile dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Navbar background on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToSection = useCallback(
    (id: string) => {
      setMobileOpen(false);
      // Small delay to let the drawer close before scrolling
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    },
    [],
  );

  const sectionIdFor = (item: string) =>
    item === "Home" ? "hero" : item.toLowerCase().replace(/\s+/g, "-");

  // Authenticated nav items
  const authNavItems = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Library", href: "/library", icon: Library },
    { name: "Capture", href: "/capture", icon: PlusCircle },
  ];

  return (
    <>
      <header
        className={`fixed top-0 z-40 w-full transition-all duration-500 ${
          scrolled
            ? "bg-bg-root/85 backdrop-blur-xl border-b border-border shadow-[0_1px_8px_rgba(0,0,0,0.04)]"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 h-16 sm:h-20 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <RecallifyLogo size={36} />
            <span
              className="text-xl font-bold text-text-primary tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Recallify
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {isAuthenticated === false ? (
              /* ── Landing Page Nav ── */
              <>
                {LANDING_NAV.map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(sectionIdFor(item))}
                    className="px-5 py-2 text-[13px] font-medium text-text-secondary rounded-full transition-all duration-200 hover:bg-[#F7EBE1] hover:text-[#E96C35]"
                  >
                    {item}
                  </button>
                ))}
                <a
                  href="https://github.com/shoaibkhan1s/Recallify"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 text-[13px] font-medium text-text-secondary rounded-full transition-all duration-200 hover:bg-[#F7EBE1] hover:text-[#E96C35]"
                >
                  GitHub
                </a>
              </>
            ) : isAuthenticated === true ? (
              /* ── App Nav ── */
              <>
                {authNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`px-4 py-2 rounded-full flex items-center gap-2 text-[13px] font-medium transition-all duration-300 ${
                        isActive
                          ? "text-primary bg-primary-glow"
                          : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </>
            ) : null}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated === false ? (
              <>
                <Link
                  href="/login"
                  className="px-5 py-2 text-[13px] font-medium text-text-secondary rounded-full transition-all duration-200 hover:bg-[#F7EBE1] hover:text-[#E96C35]"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="btn-primary px-6 py-2.5 text-[13px] font-semibold"
                >
                  Sign Up
                </Link>
              </>
            ) : isAuthenticated === true ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-primary text-white text-[13px] font-bold uppercase cursor-pointer hover:opacity-90 transition-opacity"
                  aria-label="User Profile"
                >
                  {userEmail ? userEmail.charAt(0) : "U"}
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 w-56 bg-bg-surface border border-border shadow-xl rounded-xl overflow-hidden py-1.5 z-50 flex flex-col"
                    >
                      <div className="px-4 py-2.5 border-b border-border/50 mb-1 text-left">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Signed in as</p>
                        <p className="text-[13px] font-medium text-text-primary truncate">{userEmail}</p>
                      </div>
                      
                      <Link
                        href="/settings"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors mx-1 rounded-md"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-error hover:bg-error-muted transition-colors mx-1 rounded-md text-left cursor-pointer w-[calc(100%-8px)]"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="w-9 h-9 skeleton-shimmer rounded-full" />
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2.5 rounded-xl text-text-primary hover:bg-bg-elevated transition-colors"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-30 md:hidden"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-text-primary/10 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer Panel */}
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
              className="absolute top-0 right-0 h-full w-[80vw] max-w-[320px] bg-bg-surface border-l border-border shadow-2xl flex flex-col pt-24 px-8 pb-8"
            >
              {isAuthenticated === false ? (
                /* ── Landing mobile nav ── */
                <>
                  <div className="space-y-1">
                    {LANDING_NAV.map((item) => (
                      <button
                        key={item}
                        onClick={() => scrollToSection(sectionIdFor(item))}
                        className="w-full text-left px-4 py-3.5 text-[15px] font-medium text-text-secondary hover:text-text-primary hover:bg-bg-elevated rounded-xl transition-colors"
                      >
                        {item}
                      </button>
                    ))}
                    <a
                      href="https://github.com/shoaibkhan1s/Recallify"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-left px-4 py-3.5 text-[15px] font-medium text-text-secondary hover:text-text-primary hover:bg-bg-elevated rounded-xl transition-colors"
                    >
                      GitHub
                    </a>
                  </div>

                  <div className="border-t border-border mt-6 pt-6 space-y-3">
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="block w-full text-center btn-outline px-6 py-3 text-[14px] font-semibold"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="block w-full text-center btn-primary px-6 py-3 text-[14px] font-semibold"
                    >
                      Sign Up
                    </Link>
                  </div>
                </>
              ) : isAuthenticated === true ? (
                /* ── App mobile nav ── */
                <>
                  <div className="space-y-1">
                    {authNavItems.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-medium transition-colors ${
                            isActive
                              ? "text-primary bg-primary-glow"
                              : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>

                  <div className="border-t border-border mt-6 pt-6 space-y-1">
                    <Link
                      href="/settings"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-medium text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
                    >
                      <Settings className="w-5 h-5" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-medium text-error hover:bg-error-muted transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      Log Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-3 mt-4">
                  <div className="w-full h-10 skeleton-shimmer rounded-xl" />
                  <div className="w-2/3 h-10 skeleton-shimmer rounded-xl" />
                </div>
              )}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
