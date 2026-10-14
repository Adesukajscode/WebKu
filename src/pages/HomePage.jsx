import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChatIcon, BoltIcon, ShieldIcon, LayersIcon,
  ArrowRightIcon, SparklesIcon, GridIcon,
} from "../components/Icons";

const FEATURES = [
  { Icon: BoltIcon, title: "Super Cepat", desc: "Respons streaming real-time via Groq LPU" },
  { Icon: ShieldIcon, title: "Cerdas & Aman", desc: "Model OpenAI GPT-OSS 120B parameter" },
  { Icon: LayersIcon, title: "Markdown Penuh", desc: "Kode, list, tabel, dan format lengkap" },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200/70 dark:border-blue-800/60 bg-white/80 dark:bg-slate-900/60 backdrop-blur px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 shadow-sm"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        AI Online · GPT-OSS 120B
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-4xl sm:text-6xl font-bold tracking-tight text-shimmer"
      >
        Tools AI Saya
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-5 text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed"
      >
        Asisten AI bertenaga Groq plus koleksi tools praktis untuk pekerjaan sehari-hari.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-8 flex flex-wrap gap-3"
      >
        <button
          onClick={() => navigate("/tools")}
          className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 transition-all animate-gradient-x"
        >
          <GridIcon size={16} />
          Jelajahi Tools
          <ArrowRightIcon size={14} className="transition-transform group-hover:translate-x-1" />
        </button>

        <button
          onClick={() => {
            // Buka chat global lewat event custom
            window.dispatchEvent(new CustomEvent("open-chat"));
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-blue-200 dark:border-blue-800/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur px-5 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
        >
          <ChatIcon size={16} />
          Mulai Chat
        </button>
      </motion.div>

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {FEATURES.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
            whileHover={{ y: -4 }}
            className="group rounded-2xl border border-blue-100/80 dark:border-blue-900/60 glass p-5 shadow-sm hover:shadow-lg hover:shadow-blue-500/10 transition-all"
          >
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-md shadow-blue-500/30 group-hover:scale-110 transition-transform">
              <f.Icon size={20} />
            </div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {f.title}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {f.desc}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-16 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500"
      >
        <SparklesIcon size={14} className="text-blue-500" />
        Klik tombol di kanan bawah untuk mulai percakapan
      </motion.div>
    </div>
  );
}
