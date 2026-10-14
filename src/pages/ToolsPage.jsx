import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { TOOLS, CATEGORIES } from "../data/tools";
import { ArrowRightIcon, GridIcon } from "../components/Icons";

export default function ToolsPage() {
  const [activeCat, setActiveCat] = useState("all");

  const filtered = useMemo(
    () => (activeCat === "all" ? TOOLS : TOOLS.filter((t) => t.category === activeCat)),
    [activeCat]
  );

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-400 mb-3"
      >
        <GridIcon size={14} />
        Koleksi Tools
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="text-3xl sm:text-4xl font-bold tracking-tight text-shimmer"
      >
        Semua Tools
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-3 text-slate-600 dark:text-slate-400 max-w-xl"
      >
        {TOOLS.length} tool praktis siap pakai — downloader, konverter, dan utilitas.
      </motion.p>

      {/* Category filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-6 flex flex-wrap gap-2"
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.id)}
            className={`relative rounded-xl px-4 py-2 text-xs font-medium transition-colors ${
              activeCat === cat.id
                ? "text-white"
                : "text-slate-600 dark:text-slate-300 border border-blue-100 dark:border-blue-900/50 bg-white/70 dark:bg-slate-900/50 hover:bg-blue-50 dark:hover:bg-blue-950/40"
            }`}
          >
            {activeCat === cat.id && (
              <motion.span
                layoutId="cat-pill"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative">{cat.label}</span>
          </button>
        ))}
      </motion.div>

      {/* Tools grid */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((tool, i) => (
            <motion.div
              key={tool.slug}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.2) }}
              whileHover={{ y: -6 }}
            >
              <Link
                to={`/tools/${tool.slug}`}
                className={`group flex h-full flex-col rounded-2xl border ${tool.border} glass p-5 shadow-sm tool-card-glow transition-all`}
              >
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${tool.gradient} text-white shadow-md group-hover:scale-110 transition-transform`}
                >
                  <tool.Icon size={22} />
                </div>

                <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                  {tool.name}
                </h2>
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex-1">
                  {tool.desc}
                </p>

                <div className={`mt-4 inline-flex items-center gap-1 text-xs font-medium ${tool.accent} group-hover:gap-2 transition-all`}>
                  Buka tool
                  <ArrowRightIcon size={12} />
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="mt-12 text-center text-sm text-slate-400 dark:text-slate-500">
          Belum ada tool di kategori ini.
        </div>
      )}
    </div>
  );
}
