import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import JSZip from "jszip";
import {
  ArrowLeftIcon, FileZipIcon, UploadIcon, DownloadIcon, RefreshIcon,
  LoaderIcon, CloseIcon,
} from "../../components/Icons";

export default function FileZip() {
  const [files, setFiles] = useState([]);
  const [zipName, setZipName] = useState("archive");
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  const addFiles = useCallback((fileList) => {
    const arr = Array.from(fileList);
    setFiles((prev) => [...prev, ...arr]);
    setResult(null);
  }, []);

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setResult(null);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const compress = async () => {
    if (!files.length) return;
    setLoading(true);

    try {
      const zip = new JSZip();
      for (const f of files) {
        zip.file(f.name, f);
      }
      const blob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      });
      const url = URL.createObjectURL(blob);
      setResult({ url, blob, size: blob.size });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = `${zipName || "archive"}.zip`;
    a.click();
  };

  const reset = () => {
    setFiles([]);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const formatBytes = (b) => {
    if (!b) return "—";
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / 1024 / 1024).toFixed(2)} MB`;
  };

  const totalSize = files.reduce((s, f) => s + f.size, 0);

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
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg">
          <FileZipIcon size={26} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            File Compressor
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Kompres banyak file jadi satu ZIP. Semua terjadi di browser, tidak ada upload ke server.
          </p>
        </div>
      </motion.div>

      {/* Drop zone */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          dragActive
            ? "border-amber-400 bg-amber-50/60 dark:bg-amber-950/30 scale-[1.01]"
            : "border-amber-200 dark:border-amber-900/60 hover:border-amber-400 dark:hover:border-amber-700 bg-white/60 dark:bg-slate-900/40"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={(e) => e.target.files && addFiles(e.target.files)}
          className="hidden"
        />
        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg">
          <UploadIcon size={22} />
        </div>
        <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Seret file ke sini atau klik untuk pilih
        </div>
        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Bisa pilih banyak file sekaligus
        </div>
      </motion.div>

      {/* File list */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-2xl border border-amber-100 dark:border-amber-900/50 glass p-4 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
              {files.length} file · {formatBytes(totalSize)}
            </div>
            <button
              onClick={reset}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              <RefreshIcon size={12} />
              Reset
            </button>
          </div>

          <div className="max-h-56 overflow-y-auto scrollbar-thin space-y-1.5">
            <AnimatePresence>
              {files.map((f, i) => (
                <motion.div
                  key={`${f.name}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-2 rounded-lg bg-white/70 dark:bg-slate-900/50 border border-amber-100/70 dark:border-amber-900/40 px-3 py-2"
                >
                  <FileZipIcon size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="flex-1 text-xs text-slate-700 dark:text-slate-200 truncate">
                    {f.name}
                  </span>
                  <span className="text-[10px] text-slate-400 tabular-nums shrink-0">
                    {formatBytes(f.size)}
                  </span>
                  <button
                    onClick={() => removeFile(i)}
                    className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
                  >
                    <CloseIcon size={12} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                Nama ZIP
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={zipName}
                  onChange={(e) => setZipName(e.target.value)}
                  className="flex-1 rounded-xl border border-amber-100 dark:border-amber-900/60 bg-white/80 dark:bg-slate-900/60 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-100 dark:focus:ring-amber-900/50 transition-all"
                />
                <span className="text-xs text-slate-500 dark:text-slate-400">.zip</span>
              </div>
            </div>

            {!result ? (
              <button
                onClick={compress}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <LoaderIcon size={16} className="animate-spin" />
                    Mengompres...
                  </>
                ) : (
                  <>
                    <FileZipIcon size={16} />
                    Buat ZIP
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 p-3 text-xs text-emerald-700 dark:text-emerald-300">
                  Berhasil! Ukuran ZIP: <span className="font-semibold">{formatBytes(result.size)}</span>
                  {result.size < totalSize && (
                    <span className="ml-2">
                      (↓ {Math.round((1 - result.size / totalSize) * 100)}%)
                    </span>
                  )}
                </div>
                <button
                  onClick={download}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all"
                >
                  <DownloadIcon size={16} />
                  Unduh ZIP
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
