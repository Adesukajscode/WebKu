import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon, TextIcon, CopyIcon, CheckIcon,
} from "../../components/Icons";

const TABS = [
  { id: "case", label: "Ubah Huruf" },
  { id: "base64", label: "Base64" },
  { id: "url", label: "URL Encode" },
  { id: "json", label: "JSON" },
];

export default function TextTools() {
  const [tab, setTab] = useState("case");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const run = (action) => {
    setError("");
    try {
      let result = "";
      switch (action) {
        case "upper": result = input.toUpperCase(); break;
        case "lower": result = input.toLowerCase(); break;
        case "title":
          result = input.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
          break;
        case "sentence":
          result = input.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
          break;
        case "reverse": result = input.split("").reverse().join(""); break;
        case "trim": result = input.split("\n").map((l) => l.trim()).filter(Boolean).join("\n"); break;
        case "b64-enc": result = btoa(unescape(encodeURIComponent(input))); break;
        case "b64-dec": result = decodeURIComponent(escape(atob(input))); break;
        case "url-enc": result = encodeURIComponent(input); break;
        case "url-dec": result = decodeURIComponent(input); break;
        case "json-format": result = JSON.stringify(JSON.parse(input), null, 2); break;
        case "json-min": result = JSON.stringify(JSON.parse(input)); break;
        default: result = input;
      }
      setOutput(result);
    } catch (e) {
      setError(e.message || "Gagal memproses");
      setOutput("");
    }
  };

  const actionsByTab = {
    case: [
      { label: "UPPERCASE", action: "upper" },
      { label: "lowercase", action: "lower" },
      { label: "Title Case", action: "title" },
      { label: "Sentence case", action: "sentence" },
      { label: "Balik Teks", action: "reverse" },
      { label: "Rapikan Baris", action: "trim" },
    ],
    base64: [
      { label: "Encode → Base64", action: "b64-enc" },
      { label: "Decode ← Base64", action: "b64-dec" },
    ],
    url: [
      { label: "Encode URL", action: "url-enc" },
      { label: "Decode URL", action: "url-dec" },
    ],
    json: [
      { label: "Format (Pretty)", action: "json-format" },
      { label: "Minify", action: "json-min" },
    ],
  };

  const stats = {
    chars: input.length,
    words: input.trim() ? input.trim().split(/\s+/).length : 0,
    lines: input ? input.split("\n").length : 0,
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to="/tools"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors"
      >
        <ArrowLeftIcon size={14} />
        Kembali ke Tools
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-4 mb-8"
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white shadow-lg">
          <TextIcon size={26} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            Text Tools
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Base64, URL encode, JSON formatter, dan manipulasi teks — semua di satu tempat.
          </p>
        </div>
      </motion.div>

      {/* Tab */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2 mb-5"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setOutput(""); setError(""); }}
            className={`relative rounded-xl px-4 py-2 text-xs font-medium transition-colors ${
              tab === t.id
                ? "text-white"
                : "text-slate-600 dark:text-slate-300 border border-fuchsia-100 dark:border-fuchsia-900/50 bg-white/70 dark:bg-slate-900/50 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-950/30"
            }`}
          >
            {tab === t.id && (
              <motion.span
                layoutId="text-tab"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-fuchsia-500 to-pink-600"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative">{t.label}</span>
          </button>
        ))}
      </motion.div>

      {/* Input */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-fuchsia-100 dark:border-fuchsia-900/50 glass p-5 shadow-sm space-y-4"
      >
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Input</label>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums">
              {stats.chars} char · {stats.words} kata · {stats.lines} baris
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={6}
            placeholder="Tempel atau ketik teks di sini..."
            className="w-full resize-none rounded-xl border border-fuchsia-100 dark:border-fuchsia-900/60 bg-white/80 dark:bg-slate-900/60 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-400 focus:border-fuchsia-400 dark:focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-100 dark:focus:ring-fuchsia-900/50 transition-all font-mono"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {actionsByTab[tab].map((a) => (
            <motion.button
              key={a.action}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => run(a.action)}
              disabled={!input}
              className="rounded-lg border border-fuchsia-100 dark:border-fuchsia-900/50 bg-white/70 dark:bg-slate-900/50 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-gradient-to-r hover:from-fuchsia-500 hover:to-pink-600 hover:text-white hover:border-transparent transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {a.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-700 dark:text-red-300"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Output */}
      <AnimatePresence>
        {output && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 rounded-2xl border border-fuchsia-100 dark:border-fuchsia-900/50 glass p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Hasil</label>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-fuchsia-600 dark:hover:text-fuchsia-400 transition-colors"
              >
                {copied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
                {copied ? "Tersalin" : "Salin"}
              </button>
            </div>
            <div className="rounded-xl bg-white/70 dark:bg-slate-900/60 border border-fuchsia-100 dark:border-fuchsia-900/50 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 font-mono whitespace-pre-wrap break-all max-h-64 overflow-y-auto scrollbar-thin">
              {output}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
