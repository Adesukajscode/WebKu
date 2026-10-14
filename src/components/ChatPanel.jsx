import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGroqChat } from "../hooks/useGroqChat";
import ChatMessage from "./ChatMessage";
import {
  ChatIcon, CloseIcon, SendIcon, StopIcon, TrashIcon,
  SunIcon, MoonIcon, ChevronDownIcon, SparklesIcon,
  BulbIcon, PenIcon, CalculatorIcon, CompassIcon, BoltIcon,
} from "./Icons";

const SUGGESTIONS = [
  { Icon: BulbIcon, text: "Jelaskan konsep async/await di JavaScript" },
  { Icon: PenIcon, text: "Tulis caption Instagram tentang kopi" },
  { Icon: CalculatorIcon, text: "Bantu hitung cicilan KPR 500 juta 15 tahun" },
  { Icon: CompassIcon, text: "Rekomendasi 5 tempat wisata di Bali" },
];

export default function ChatPanel({ isOpen, onClose, isDark, toggleDark }) {
  const { messages, isLoading, sendMessage, stop, clear } = useGroqChat();
  const [input, setInput] = useState("");
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const bottomRef = useRef(null);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 128) + "px";
  }, [input]);

  useEffect(() => {
    if (isOpen) setTimeout(() => textareaRef.current?.focus(), 200);
  }, [isOpen]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(dist > 200);
  };

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.94 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="fixed bottom-24 right-6 z-40 flex h-[min(640px,82vh)] w-[min(420px,calc(100vw-3rem))] flex-col overflow-hidden rounded-3xl border border-blue-100/80 dark:border-blue-900/60 glass-strong shadow-2xl shadow-blue-900/10"
        >
          {/* Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 animate-gradient-x" />
            <div className="absolute inset-0 grid-pattern opacity-30" />
            <div className="relative flex items-center justify-between px-4 py-3 text-white">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
                    <ChatIcon size={18} />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold leading-tight">AI Assistant</div>
                  <div className="flex items-center gap-1 text-[11px] text-white/85 leading-tight">
                    <BoltIcon size={10} />
                    GPT-OSS 120B · Online
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-0.5">
                <button
                  onClick={toggleDark}
                  className="rounded-lg p-1.5 hover:bg-white/20 transition-colors"
                  aria-label="Toggle tema"
                  title="Ganti tema"
                >
                  {isDark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
                </button>
                <button
                  onClick={clear}
                  disabled={messages.length === 0}
                  className="rounded-lg p-1.5 hover:bg-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Hapus percakapan"
                  title="Hapus percakapan"
                >
                  <TrashIcon size={16} />
                </button>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 hover:bg-white/20 transition-colors"
                  aria-label="Tutup"
                >
                  <CloseIcon size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin relative"
          >
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex h-full flex-col items-center justify-center text-center px-2"
              >
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative mb-4"
                >
                  <div className="absolute inset-0 rounded-2xl bg-blue-500/30 blur-xl" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/40">
                    <SparklesIcon size={28} />
                  </div>
                </motion.div>

                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Halo! Ada yang bisa saya bantu?
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Pilih salah satu atau ketik pertanyaan Anda.
                </p>

                <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
                  {SUGGESTIONS.map((s, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.05 }}
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => sendMessage(s.text)}
                      className="group flex items-start gap-2.5 rounded-xl border border-blue-100 dark:border-blue-900/50 bg-white/70 dark:bg-slate-900/50 px-3 py-2.5 text-left text-xs text-slate-700 dark:text-slate-200 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 transition-all shadow-sm"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <s.Icon size={14} />
                      </span>
                      <span className="leading-snug pt-0.5">{s.text}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {messages.map((msg, i) => (
              <ChatMessage key={msg.id} message={msg} index={i} />
            ))}

            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start mb-3"
              >
                <div className="glass-strong rounded-2xl rounded-bl-md border border-blue-100/70 dark:border-blue-900/40 px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:0ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:300ms]" />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Scroll-to-bottom */}
          <AnimatePresence>
            {showScrollBtn && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onClick={scrollToBottom}
                className="absolute bottom-24 right-5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 shadow-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                aria-label="Scroll ke bawah"
              >
                <ChevronDownIcon size={16} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-blue-100/60 dark:border-blue-900/50 p-3 bg-white/50 dark:bg-slate-900/40"
          >
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Ketik pesan... (Shift+Enter baris baru)"
                  rows={1}
                  disabled={isLoading}
                  className="w-full max-h-32 min-h-[44px] resize-none rounded-2xl border border-blue-100 dark:border-blue-900/60 bg-white/80 dark:bg-slate-800/70 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-400 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 transition-all scrollbar-thin disabled:opacity-60"
                />
              </div>

              {isLoading ? (
                <motion.button
                  type="button"
                  onClick={stop}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-md shadow-blue-500/30 hover:shadow-lg transition-shadow"
                  aria-label="Stop"
                >
                  <StopIcon size={16} />
                </motion.button>
              ) : (
                <motion.button
                  type="submit"
                  disabled={!input.trim()}
                  whileHover={{ scale: input.trim() ? 1.05 : 1 }}
                  whileTap={{ scale: input.trim() ? 0.95 : 1 }}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white shadow-md shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/50 transition-shadow disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none animate-gradient-x"
                  aria-label="Kirim"
                >
                  <SendIcon size={18} />
                </motion.button>
              )}
            </div>

            <div className="mt-2 flex items-center justify-between px-1">
              <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                <BoltIcon size={10} />
                Powered by Groq · GPT-OSS 120B
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums">
                {input.length}/2048
              </span>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
