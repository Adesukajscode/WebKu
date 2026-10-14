import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { HomeIcon, GridIcon, SunIcon, MoonIcon, SparklesIcon } from "../components/Icons";
import { useDarkMode } from "../hooks/useDarkMode";
import FloatingButton from "../components/FloatingButton";
import ChatPanel from "../components/ChatPanel";
import { useState, useEffect } from "react";

export default function MainLayout() {
  const { isDark, toggle } = useDarkMode();
  const [chatOpen, setChatOpen] = useState(false);
  const { pathname } = useLocation();

  const navItems = [
    { to: "/", label: "Beranda", Icon: HomeIcon },
    { to: "/tools", label: "Tools", Icon: GridIcon },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-white dark:bg-slate-950 transition-colors">
      <div className="pointer-events-none absolute inset-0 grid-pattern opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-50/70 via-transparent to-blue-50/50 dark:from-blue-950/30 dark:via-transparent dark:to-blue-950/20" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full bg-blue-300/40 dark:bg-blue-600/15 filter blur-3xl animate-blob" />
        <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-blue-400/30 dark:bg-blue-500/15 filter blur-3xl animate-blob animation-delay-2000" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-30 border-b border-blue-100/60 dark:border-blue-900/50 glass-strong">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="group flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.05 }}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-md shadow-blue-500/30 animate-gradient-x"
            >
              <SparklesIcon size={18} />
            </motion.div>
            <div className="leading-tight">
              <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                AI Tools
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                Groq · GPT-OSS 120B
              </div>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-xl bg-blue-50 dark:bg-blue-950/50"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Icon size={14} />
                    <span className="relative hidden sm:inline">{label}</span>
                  </>
                )}
              </NavLink>
            ))}

            <button
              onClick={toggle}
              className="ml-1 flex h-8 w-8 items-center justify-center rounded-xl border border-blue-100 dark:border-blue-900/60 bg-white/70 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
              aria-label="Toggle tema"
            >
              {isDark ? <SunIcon size={14} /> : <MoonIcon size={14} />}
            </button>
          </nav>
        </div>
      </header>

      {/* Route content */}
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative mx-auto max-w-5xl px-4 sm:px-6 py-10"
      >
        <Outlet />
      </motion.main>

      {/* Floating chat global */}
      <FloatingButton isOpen={chatOpen} onClick={() => setChatOpen(!chatOpen)} />
      <ChatPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        isDark={isDark}
        toggleDark={toggle}
      />
    </div>
  );
}
