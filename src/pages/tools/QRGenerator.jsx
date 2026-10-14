import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import {
  ArrowLeftIcon, QrIcon, DownloadIcon, LoaderIcon,
} from "../../components/Icons";

export default function QRGenerator() {
  const [text, setText] = useState("https://example.com");
  const [size, setSize] = useState(300);
  const [fgColor, setFgColor] = useState("#0f172a");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [dataUrl, setDataUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!text.trim()) {
      setDataUrl("");
      return;
    }

    let cancelled = false;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const url = await QRCode.toDataURL(text, {
          width: size,
          margin: 2,
          color: { dark: fgColor, light: bgColor },
          errorCorrectionLevel: "M",
        });
        if (!cancelled) setDataUrl(url);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [text, size, fgColor, bgColor]);

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qrcode-${Date.now()}.png`;
    a.click();
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
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 text-white shadow-lg">
          <QrIcon size={26} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            QR Code Generator
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Buat QR code dari link, teks, atau apa pun. Sepenuhnya offline di browser.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-violet-100 dark:border-violet-900/50 glass p-5 shadow-sm space-y-4"
        >
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
              Isi QR Code
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              placeholder="https://... atau teks apapun"
              className="w-full resize-none rounded-xl border border-violet-100 dark:border-violet-900/60 bg-white/80 dark:bg-slate-900/60 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-400 focus:border-violet-400 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
              Ukuran: <span className="text-violet-600 dark:text-violet-400 font-semibold">{size}px</span>
            </label>
            <input
              type="range"
              min="150"
              max="600"
              step="50"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full accent-violet-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                Warna QR
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded-lg border border-violet-100 dark:border-violet-900/60 bg-transparent"
                />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {fgColor}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                Warna BG
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded-lg border border-violet-100 dark:border-violet-900/60 bg-transparent"
                />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {bgColor}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-violet-100 dark:border-violet-900/50 glass p-5 shadow-sm flex flex-col"
        >
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-3">
            Preview
          </div>

          <div className="flex-1 flex items-center justify-center min-h-[240px] rounded-xl bg-slate-50 dark:bg-slate-900/50 p-4">
            {loading ? (
              <LoaderIcon size={32} className="animate-spin text-violet-500" />
            ) : dataUrl ? (
              <motion.img
                key={dataUrl}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                src={dataUrl}
                alt="QR Code"
                className="max-w-full max-h-[280px] rounded-lg"
              />
            ) : (
              <div className="text-xs text-slate-400 dark:text-slate-500">
                Isi teks untuk melihat QR code
              </div>
            )}
          </div>

          <button
            onClick={download}
            disabled={!dataUrl}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-700 px-5 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <DownloadIcon size={16} />
            Unduh PNG
          </button>
        </motion.div>
      </div>
    </div>
  );
}
