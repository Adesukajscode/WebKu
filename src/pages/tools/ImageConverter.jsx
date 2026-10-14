import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon, ImageIcon, UploadIcon, DownloadIcon, RefreshIcon, LoaderIcon,
} from "../../components/Icons";

const FORMATS = [
  { value: "image/jpeg", label: "JPEG", ext: "jpg" },
  { value: "image/png", label: "PNG", ext: "png" },
  { value: "image/webp", label: "WebP", ext: "webp" },
];

export default function ImageConverter() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [targetFormat, setTargetFormat] = useState("image/jpeg");
  const [quality, setQuality] = useState(0.9);
  const [output, setOutput] = useState(null);
  const [outputSize, setOutputSize] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleFile = useCallback((f) => {
    if (!f || !f.type.startsWith("image/")) return;
    setFile(f);
    setOutput(null);
    setOutputSize(null);

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const convert = async () => {
    if (!file || !preview) return;
    setLoading(true);

    try {
      const img = new Image();
      img.src = preview;

      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");

      // White background untuk JPEG (yang tidak support alpha)
      if (targetFormat === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setLoading(false);
            return;
          }
          const url = URL.createObjectURL(blob);
          setOutput({ url, blob });
          setOutputSize(blob.size);
          setLoading(false);
        },
        targetFormat,
        targetFormat === "image/png" ? undefined : quality
      );
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const download = () => {
    if (!output || !file) return;
    const fmt = FORMATS.find((f) => f.value === targetFormat);
    const baseName = file.name.replace(/\.[^.]+$/, "");
    const a = document.createElement("a");
    a.href = output.url;
    a.download = `${baseName}.${fmt.ext}`;
    a.click();
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setOutput(null);
    setOutputSize(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const formatBytes = (b) => {
    if (!b) return "—";
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / 1024 / 1024).toFixed(2)} MB`;
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
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
          <ImageIcon size={26} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            Image Converter
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Konversi dan kompres gambar langsung di browser. File tidak diunggah ke server.
          </p>
        </div>
      </motion.div>

      {/* Drop zone */}
      {!file && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
            dragActive
              ? "border-blue-400 bg-blue-50/60 dark:bg-blue-950/30 scale-[1.01]"
              : "border-blue-200 dark:border-blue-900/60 hover:border-blue-400 dark:hover:border-blue-700 bg-white/60 dark:bg-slate-900/40"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="hidden"
          />
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
            <UploadIcon size={26} />
          </div>
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Seret gambar ke sini atau klik untuk pilih
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            JPG, PNG, WebP, GIF, BMP — maks 10MB
          </div>
        </motion.div>
      )}

      {file && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Preview asli */}
          <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/50 glass p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                {file.name}
              </div>
              <button
                onClick={reset}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                <RefreshIcon size={12} />
                Ganti
              </button>
            </div>
            <img
              src={preview}
              alt="preview"
              className="max-h-64 w-full object-contain rounded-xl bg-slate-50 dark:bg-slate-900"
            />
            <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Ukuran asli: <span className="font-medium">{formatBytes(file.size)}</span>
            </div>
          </div>

          {/* Pengaturan */}
          <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/50 glass p-4 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                Format target
              </label>
              <div className="flex flex-wrap gap-2">
                {FORMATS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setTargetFormat(f.value)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      targetFormat === f.value
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm"
                        : "border border-emerald-100 dark:border-emerald-900/50 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {targetFormat !== "image/png" && (
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Kualitas: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{Math.round(quality * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>
            )}

            <button
              onClick={convert}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <LoaderIcon size={16} className="animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <RefreshIcon size={16} />
                  Konversi Sekarang
                </>
              )}
            </button>
          </div>

          {/* Hasil */}
          {output && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-emerald-100 dark:border-emerald-900/50 glass p-4 shadow-sm"
            >
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">
                Hasil Konversi
              </div>
              <img
                src={output.url}
                alt="output"
                className="max-h-64 w-full object-contain rounded-xl bg-slate-50 dark:bg-slate-900 mb-3"
              />
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
                <span>
                  Ukuran: <span className="font-medium text-emerald-600 dark:text-emerald-400">{formatBytes(outputSize)}</span>
                </span>
                {outputSize < file.size && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    ↓ {Math.round((1 - outputSize / file.size) * 100)}% lebih kecil
                  </span>
                )}
              </div>
              <button
                onClick={download}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all"
              >
                <DownloadIcon size={16} />
                Unduh Gambar
              </button>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
