import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeftIcon, LinkIcon, DownloadIcon, LoaderIcon, AlertIcon } from "./Icons";
import { useDownloader } from "../hooks/useDownloader";
import { useState } from "react";

/**
 * Layout generik untuk semua tool downloader.
 * Props:
 *   - tool: object dari src/data/tools.js
 *   - placeholder: string placeholder input
 */
export default function ToolLayout({ tool, placeholder }) {
  const [url, setUrl] = useState("");
  const { download, loading, result, error, reset } = useDownloader();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim() || loading) return;
    download(url.trim(), tool.slug);
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
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.gradient} text-white shadow-lg`}
        >
          <tool.Icon size={26} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            {tool.name}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {tool.desc}
          </p>
        </div>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className={`rounded-2xl border ${tool.border} glass p-5 shadow-sm`}
      >
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
          Tempel link di bawah
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <LinkIcon size={16} />
            </span>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-xl border border-blue-100 dark:border-blue-900/60 bg-white/80 dark:bg-slate-900/60 pl-10 pr-3 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-400 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!url.trim() || loading}
            className={`inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${tool.gradient} px-5 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <>
                <LoaderIcon size={16} className="animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <DownloadIcon size={16} />
                Ambil
              </>
            )}
          </button>
        </div>

        <div className="mt-3 flex items-start gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
          <AlertIcon size={12} className="mt-0.5 shrink-0" />
          <span>
            Hanya untuk penggunaan pribadi. Hormati hak cipta konten.
          </span>
        </div>
      </motion.form>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-700 dark:text-red-300"
        >
          <AlertIcon size={16} className="mt-0.5 shrink-0" />
          <div>
            <div className="font-medium">Gagal memproses</div>
            <div className="text-xs mt-0.5 opacity-80">{error}</div>
            <button
              onClick={reset}
              className="mt-2 text-xs underline hover:no-underline"
            >
              Coba lagi
            </button>
          </div>
        </motion.div>
      )}

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-6 rounded-2xl border ${tool.border} glass p-5 shadow-sm`}
        >
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">
            Hasil
          </h2>

          <div className="flex flex-col sm:flex-row gap-4">
            {result.thumbnail && (
              <img
                src={result.thumbnail}
                alt={result.title}
                className="w-full sm:w-40 h-24 object-cover rounded-xl border border-blue-100 dark:border-blue-900/50"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-800 dark:text-slate-100 line-clamp-2">
                {result.title || "Tanpa judul"}
              </div>
              {(result.author || result.duration) && (
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex gap-3">
                  {result.author && <span>{result.author}</span>}
                  {result.duration && <span>{result.duration}</span>}
                </div>
              )}
            </div>
          </div>

          {Array.isArray(result.formats) && result.formats.length > 0 && (
            <div className="mt-4 space-y-2">
              {result.formats.map((f, i) => (
                <a
                  key={i}
                  href={f.url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="flex items-center justify-between gap-2 rounded-xl border border-blue-100 dark:border-blue-900/50 bg-white/70 dark:bg-slate-900/50 px-3 py-2.5 text-xs hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/60 dark:hover:bg-blue-950/30 transition-colors"
                >
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <DownloadIcon size={14} className={tool.accent} />
                    <span className="font-medium">{f.quality || "Default"}</span>
                    <span className="text-slate-400 uppercase">{f.ext || ""}</span>
                  </div>
                  {f.size && (
                    <span className="text-slate-400 tabular-nums">
                      {(f.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                  )}
                </a>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
