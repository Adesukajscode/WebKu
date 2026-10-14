import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon, KeyIcon, RefreshIcon, CopyIcon, CheckIcon,
} from "../../components/Icons";

const CHARSETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [useLower, setUseLower] = useState(true);
  const [useUpper, setUseUpper] = useState(true);
  const [useDigits, setUseDigits] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    let pool = "";
    if (useLower) pool += CHARSETS.lower;
    if (useUpper) pool += CHARSETS.upper;
    if (useDigits) pool += CHARSETS.digits;
    if (useSymbols) pool += CHARSETS.symbols;

    if (!pool) {
      setPassword("");
      return;
    }

    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    const result = Array.from(arr)
      .map((n) => pool[n % pool.length])
      .join("");
    setPassword(result);
    setCopied(false);
  }, [length, useLower, useUpper, useDigits, useSymbols]);

  useEffect(() => {
    generate();
  }, [generate]);

  const copy = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Hitung kekuatan kasar
  const calculateStrength = () => {
    if (!password) return { level: 0, label: "—", color: "bg-slate-300" };
    let pool = 0;
    if (useLower) pool += 26;
    if (useUpper) pool += 26;
    if (useDigits) pool += 10;
    if (useSymbols) pool += 30;
    const entropy = Math.log2(pool) * length;
    if (entropy < 40) return { level: 1, label: "Lemah", color: "bg-red-500" };
    if (entropy < 60) return { level: 2, label: "Sedang", color: "bg-amber-500" };
    if (entropy < 80) return { level: 3, label: "Kuat", color: "bg-emerald-500" };
    return { level: 4, label: "Sangat Kuat", color: "bg-emerald-600" };
  };

  const strength = calculateStrength();

  const toggle = (label, value, setter) => (
    <label className="flex items-center justify-between cursor-pointer rounded-xl border border-cyan-100 dark:border-cyan-900/50 bg-white/60 dark:bg-slate-900/40 px-3 py-2.5 hover:bg-cyan-50/60 dark:hover:bg-cyan-950/30 transition-colors">
      <span className="text-xs text-slate-700 dark:text-slate-300">{label}</span>
      <button
        type="button"
        onClick={() => setter(!value)}
        className={`relative h-5 w-9 rounded-full transition-colors ${
          value ? "bg-gradient-to-r from-cyan-500 to-blue-600" : "bg-slate-300 dark:bg-slate-700"
        }`}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm ${
            value ? "right-0.5" : "left-0.5"
          }`}
        />
      </button>
    </label>
  );

  return (
    <div className="max-w-2xl mx-auto">
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
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg">
          <KeyIcon size={26} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            Password Generator
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Buat password acak yang kuat. Semua proses di browser, tidak ada yang dikirim ke server.
          </p>
        </div>
      </motion.div>

      {/* Output */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-cyan-100 dark:border-cyan-900/50 glass p-4 shadow-sm mb-4"
      >
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-cyan-100 dark:border-cyan-900/50 px-4 py-3 font-mono text-sm text-slate-800 dark:text-slate-100 break-all">
            {password || "—"}
          </div>
          <button
            onClick={copy}
            disabled={!password}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md hover:shadow-lg transition-shadow disabled:opacity-50"
            aria-label="Salin"
          >
            {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
          </button>
          <button
            onClick={generate}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-100 dark:border-cyan-900/60 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 transition-colors"
            aria-label="Generate ulang"
          >
            <RefreshIcon size={16} />
          </button>
        </div>

        {/* Strength bar */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(strength.level / 4) * 100}%` }}
              transition={{ duration: 0.3 }}
              className={`h-full ${strength.color}`}
            />
          </div>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400 min-w-[80px] text-right">
            {strength.label}
          </span>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-cyan-100 dark:border-cyan-900/50 glass p-5 shadow-sm space-y-3"
      >
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
            Panjang: <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{length}</span>
          </label>
          <input
            type="range"
            min="4"
            max="64"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-cyan-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {toggle("Huruf kecil (a-z)", useLower, setUseLower)}
          {toggle("Huruf besar (A-Z)", useUpper, setUseUpper)}
          {toggle("Angka (0-9)", useDigits, setUseDigits)}
          {toggle("Simbol (!@#$)", useSymbols, setUseSymbols)}
        </div>
      </motion.div>
    </div>
  );
}
