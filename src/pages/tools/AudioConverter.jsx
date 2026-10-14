import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAudioConverter, FORMATS } from "../../hooks/useAudioConverter";
import {
  ArrowLeftIcon, AudioIcon, UploadIcon, DownloadIcon, LoaderIcon,
  AlertIcon, ScissorsIcon, VolumeIcon, WaveIcon, RefreshIcon, LinkIcon,
} from "../../components/Icons";

const BITRATES = [64, 96, 128, 160, 192, 256, 320];
const SAMPLERATES = [22050, 32000, 44100, 48000];

export default function AudioConverter() {
  const { loaded, loading, progress, status, error, load, convert } = useAudioConverter();

  const [file, setFile] = useState(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [format, setFormat] = useState("mp3");
  const [bitrate, setBitrate] = useState(192);
  const [sampleRate, setSampleRate] = useState(44100);
  const [channels, setChannels] = useState(2);
  const [volume, setVolume] = useState(1);
  const [start, setStart] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioDur, setAudioDur] = useState(0);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [convErr, setConvErr] = useState("");
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();
  const previewRef = useRef();

  // Load ffmpeg saat pertama kali
  useEffect(() => { load(); }, [load]);

  const pickFile = useCallback((f) => {
    if (!f) return;
    if (!f.type.startsWith("audio/") && !f.type.startsWith("video/")) {
      setConvErr("Format tidak didukung. Pilih file audio atau video.");
      return;
    }
    setFile(f); setResult(null); setConvErr("");
    setStart(0); setDuration(0);
    const url = URL.createObjectURL(f);
    const a = new Audio(url);
    a.onloadedmetadata = () => setAudioDur(a.duration);
  }, []);

  const onDrop = (e) => {
    e.preventDefault(); setDrag(false);
    pickFile(e.dataTransfer.files?.[0]);
  };

  const loadFromUrl = async () => {
    if (!sourceUrl.trim()) return;
    try {
      setConvErr("");
      const res = await fetch(sourceUrl.trim());
      if (!res.ok) throw new Error("Gagal mengambil URL");
      const blob = await res.blob();
      const name = sourceUrl.split("/").pop().split("?")[0] || "audio";
      pickFile(new File([blob], name, { type: blob.type || "audio/mpeg" }));
    } catch (e) {
      setConvErr(e.message);
    }
  };

  const run = async () => {
    if (!file || !loaded) return;
    setBusy(true); setConvErr(""); setResult(null);
    try {
      const res = await convert(file, format, {
        bitrate, sampleRate, channels, volume, start,
        duration: duration > 0 ? duration : null,
      });
      setResult(res);
    } catch (e) {
      setConvErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!result || !file) return;
    const base = file.name.replace(/\.[^.]+$/, "");
    const a = document.createElement("a");
    a.href = result.url;
    a.download = `${base}.${result.ext}`;
    a.click();
  };

  const reset = () => {
    setFile(null); setResult(null); setConvErr(""); setSourceUrl("");
    setStart(0); setDuration(0); setAudioDur(0);
    if (inputRef.current) inputRef.current.value = "";
  };

  const fmtBytes = (b) => {
    if (!b) return "—";
    if (b < 1024) return `${b} B`;
    if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / 1048576).toFixed(2)} MB`;
  };

  const fmtTime = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const estimate = () => {
    if (!audioDur) return null;
    const dur = duration > 0 ? Math.min(duration, audioDur - start) : audioDur - start;
    const fmt = FORMATS.find((f) => f.id === format);
    if (fmt.id === "wav" || fmt.id === "flac") {
      const bps = fmt.id === "wav" ? sampleRate * channels * 2 : 0;
      return bps ? (bps * dur) / 8 : null;
    }
    return (bitrate * 1000 * dur) / 8;
  };

  const est = estimate();

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/tools" className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 mb-4">
        <ArrowLeftIcon size={14} /> Kembali
      </Link>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-700 text-white shadow-lg">
          <AudioIcon size={22} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Audio Converter</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            MP3 · AAC · Opus · WAV · FLAC · OGG · M4A — kualitas tinggi, 100% di browser.
          </p>
        </div>
      </div>

      {/* FFmpeg status */}
      {!loaded && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/30 p-3 text-[11px] text-blue-700 dark:text-blue-300">
          <LoaderIcon size={14} className="animate-spin mt-0.5 shrink-0" />
          <span>{status || "Memuat FFmpeg..."} {progress > 0 && progress < 100 ? `(${progress}%)` : ""}</span>
        </div>
      )}

      {/* Input sources */}
      {!file && (
        <>
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
              drag ? "border-purple-400 bg-purple-50/60 dark:bg-purple-950/30 scale-[1.01]"
                   : "border-purple-200 dark:border-purple-900/60 hover:border-purple-400 bg-white/60 dark:bg-slate-900/40"
            }`}
          >
            <input ref={inputRef} type="file" accept="audio/*,video/*"
              onChange={(e) => pickFile(e.target.files?.[0])} className="hidden" />
            <UploadIcon size={28} className="mx-auto text-purple-500 mb-2" />
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Seret file audio atau video ke sini
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Atau klik untuk memilih — MP3, WAV, FLAC, OGG, M4A, MP4, WebM
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="relative flex-1">
              <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="Atau tempel URL audio langsung (mp3, wav, ogg...)"
                className="w-full rounded-xl border border-purple-100 dark:border-purple-900/60 bg-white/80 dark:bg-slate-900/60 pl-9 pr-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-purple-400" />
            </div>
            <button onClick={loadFromUrl} disabled={!sourceUrl.trim()}
              className="rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50">
              Ambil
            </button>
          </div>
        </>
      )}

      {/* File loaded */}
      {file && (
        <div className="space-y-3">
          {/* File info */}
          <div className="rounded-2xl border border-purple-100 dark:border-purple-900/50 glass p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 shrink-0">
                <WaveIcon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-slate-800 dark:text-slate-100 truncate">{file.name}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {fmtBytes(file.size)} · {fmtTime(audioDur)}
                </div>
              </div>
              <button onClick={reset} className="text-[11px] text-slate-400 hover:text-purple-600 flex items-center gap-1">
                <RefreshIcon size={11} /> Ganti
              </button>
            </div>
            <audio ref={previewRef} controls src={URL.createObjectURL(file)}
              className="mt-2 w-full h-9" />
          </div>

          {/* Format */}
          <div className="rounded-2xl border border-purple-100 dark:border-purple-900/50 glass p-4 space-y-4">
            <div>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Format Output</div>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {FORMATS.map((f) => (
                  <button key={f.id} onClick={() => setFormat(f.id)}
                    className={`rounded-lg py-2 text-[11px] font-semibold transition-all ${
                      format === f.id
                        ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-sm"
                        : "border border-purple-100 dark:border-purple-900/50 text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                    }`}>{f.label}</button>
                ))}
              </div>
            </div>

            {/* Bitrate (tidak untuk WAV/FLAC) */}
            {format !== "wav" && format !== "flac" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Bitrate</span>
                  <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 tabular-nums">{bitrate} kbps</span>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {BITRATES.map((b) => (
                    <button key={b} onClick={() => setBitrate(b)}
                      className={`rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-colors ${
                        bitrate === b ? "bg-purple-600 text-white" : "border border-purple-100 dark:border-purple-900/50 text-slate-600 dark:text-slate-300"
                      }`}>{b}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Sample rate */}
            <div>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Sample Rate</div>
              <div className="flex gap-1.5 flex-wrap">
                {SAMPLERATES.map((s) => (
                  <button key={s} onClick={() => setSampleRate(s)}
                    className={`rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors ${
                      sampleRate === s ? "bg-purple-600 text-white" : "border border-purple-100 dark:border-purple-900/50 text-slate-600 dark:text-slate-300"
                    }`}>{(s / 1000).toFixed(1)} kHz</button>
                ))}
              </div>
            </div>

            {/* Channels */}
            <div>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Channel</div>
              <div className="flex gap-1.5">
                {[[1, "Mono"], [2, "Stereo"]].map(([n, label]) => (
                  <button key={n} onClick={() => setChannels(n)}
                    className={`rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors ${
                      channels === n ? "bg-purple-600 text-white" : "border border-purple-100 dark:border-purple-900/50 text-slate-600 dark:text-slate-300"
                    }`}>{label}</button>
                ))}
              </div>
            </div>

            {/* Volume */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <VolumeIcon size={11} /> Volume
                </span>
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 tabular-nums">
                  {Math.round(volume * 100)}%
                </span>
              </div>
              <input type="range" min="0.1" max="2" step="0.05" value={volume}
                onChange={(e) => setVolume(+e.target.value)} className="w-full accent-purple-600" />
            </div>

            {/* Trim */}
            <div>
              <div className="flex items-center gap-1 mb-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                <ScissorsIcon size={11} /> Trim (opsional)
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                    Mulai: <span className="font-mono font-semibold text-purple-600 dark:text-purple-400">{fmtTime(start)}</span>
                  </div>
                  <input type="range" min="0" max={Math.max(0, audioDur - 1)} step="0.5"
                    value={start} onChange={(e) => setStart(+e.target.value)}
                    className="w-full accent-purple-600" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                    Durasi: <span className="font-mono font-semibold text-purple-600 dark:text-purple-400">
                      {duration > 0 ? fmtTime(duration) : "Full"}
                    </span>
                  </div>
                  <input type="range" min="0" max={Math.max(0, audioDur - start)} step="0.5"
                    value={duration} onChange={(e) => setDuration(+e.target.value)}
                    className="w-full accent-purple-600" />
                </div>
              </div>
            </div>

            {/* Estimate */}
            {est && (
              <div className="rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 px-3 py-2 text-[10px] text-purple-700 dark:text-purple-300">
                Estimasi ukuran: <span className="font-semibold">{fmtBytes(est)}</span>
              </div>
            )}

            {/* Progress */}
            {busy && (
              <div>
                <div className="flex items-center justify-between mb-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <LoaderIcon size={10} className="animate-spin" /> Mengkonversi...
                  </span>
                  <span className="tabular-nums font-semibold">{progress}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-purple-100 dark:bg-purple-950/60 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-violet-600 transition-all"
                    style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {/* Button */}
            <button onClick={run} disabled={!loaded || busy}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              {busy ? <><LoaderIcon size={15} className="animate-spin" /> Memproses...</>
                    : <><AudioIcon size={15} /> Konversi ke {FORMATS.find(f => f.id === format)?.label}</>}
            </button>
          </div>

          {/* Error */}
          {(convErr || error) && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 p-3 text-[11px] text-red-700 dark:text-red-300">
              <AlertIcon size={13} className="mt-0.5 shrink-0" />
              <span>{convErr || error}</span>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 glass p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Konversi selesai</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-3">
                <span>{FORMATS.find(f => f.id === format)?.label} · {result.ext.toUpperCase()}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{fmtBytes(result.size)}</span>
              </div>
              {file.size > 0 && result.size > 0 && (
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-3">
                  {result.size < file.size
                    ? `↓ ${Math.round((1 - result.size / file.size) * 100)}% lebih kecil dari aslinya`
                    : `↑ ${Math.round((result.size / file.size - 1) * 100)}% lebih besar dari aslinya`}
                </div>
              )}
              <audio controls src={result.url} className="w-full h-9 mb-3" />
              <button onClick={download}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:shadow-lg transition-all">
                <DownloadIcon size={14} /> Unduh {result.ext.toUpperCase()}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div className="mt-4 flex items-start gap-2 rounded-xl border border-purple-100 dark:border-purple-900/50 glass p-3 text-[10px] text-slate-500 dark:text-slate-400">
        <AlertIcon size={12} className="mt-0.5 shrink-0 text-purple-500" />
        <span>
          Konversi diproses sepenuhnya di browser menggunakan <b>FFmpeg.wasm</b>. Tidak ada file yang
          dikirim ke server. Pertama kali memuat butuh ~25 MB (di-cache browser). Mendukung ekstraksi
          audio dari video juga.
        </span>
      </div>
    </div>
  );
}
