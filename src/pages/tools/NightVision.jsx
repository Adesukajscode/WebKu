import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ImageSegmenter, FilesetResolver } from "@mediapipe/tasks-vision";
import { ArrowLeftIcon, EyeIcon, CameraIcon, LoaderIcon, AlertIcon, StopIcon, RefreshIcon, RecordIcon, DownloadIcon, FlameIcon } from "../../components/Icons";

const WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const MODEL = "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite";

const MODES = [
  { id: "green",   label: "Green",   tint: "rgba(0,255,90,1)" },
  { id: "white",   label: "White",   tint: "rgba(220,235,255,1)" },
  { id: "amber",   label: "Amber",   tint: "rgba(255,170,40,1)" },
  { id: "cyan",    label: "Cyan",    tint: "rgba(0,230,255,1)" },
  { id: "thermal", label: "Thermal", tint: "rgba(255,80,0,1)", thermal: true },
];

const HEAT = [
  [0.0, 255, 190,  80],
  [0.4, 255, 140,  20],
  [0.7, 255,  80,   0],
  [1.0, 210,  15,  15],
];
const heatColor = (t) => {
  t = Math.max(0, Math.min(1, t));
  for (let i = 0; i < HEAT.length - 1; i++) {
    const a = HEAT[i], b = HEAT[i + 1];
    if (t >= a[0] && t <= b[0]) {
      const u = (t - a[0]) / (b[0] - a[0]);
      return [a[1] + (b[1] - a[1]) * u | 0, a[2] + (b[2] - a[2]) * u | 0, a[3] + (b[3] - a[3]) * u | 0];
    }
  }
  return [210, 15, 15];
};

// Histogram equalization sederhana
// Redistribusi brightness supaya detail dari area gelap muncul
function equalize(data, total) {
  const hist = new Uint32Array(256);
  for (let i = 0; i < data.length; i += 4) {
    const lum = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) | 0;
    hist[lum]++;
  }
  const cdf = new Uint32Array(256);
  let acc = 0;
  for (let i = 0; i < 256; i++) { acc += hist[i]; cdf[i] = acc; }
  // Cari cdfMin (nilai cdf terkecil yang > 0)
  let cdfMin = 0;
  for (let i = 0; i < 256; i++) if (cdf[i] > 0) { cdfMin = cdf[i]; break; }
  const lut = new Uint8Array(256);
  const denom = total - cdfMin;
  for (let i = 0; i < 256; i++) {
    lut[i] = denom > 0 ? Math.round(((cdf[i] - cdfMin) / denom) * 255) : i;
  }
  return lut;
}

export default function NightVision() {
  const video = useRef(), canvas = useRef(), raf = useRef(), stream = useRef(), seg = useRef(), rec = useRef(), chunks = useRef([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [mode, setMode] = useState("green");
  const [gain, setGain] = useState(1.8);
  const [heat, setHeat] = useState(1);
  const [autoBoost, setAutoBoost] = useState(true);
  const [eq, setEq] = useState(true);
  const [fps, setFps] = useState(0);
  const [recording, setRecording] = useState(false);
  const [coverage, setCoverage] = useState(0);
  const [brightness, setBrightness] = useState(0);

  const cur = MODES.find((m) => m.id === mode) || MODES[0];
  const thermal = !!cur.thermal;

  useEffect(() => {
    if (!thermal || seg.current) return;
    let cancel = false;
    (async () => {
      try {
        const v = await FilesetResolver.forVisionTasks(WASM);
        const s = await ImageSegmenter.createFromOptions(v, {
          baseOptions: { modelAssetPath: MODEL, delegate: "GPU" },
          runningMode: "VIDEO", outputCategoryMask: true, outputConfidenceMasks: false,
        });
        if (!cancel) seg.current = s;
      } catch (e) { console.error(e); }
    })();
    return () => { cancel = true; };
  }, [thermal]);

  const draw = useCallback(() => {
    const v = video.current, c = canvas.current;
    if (!v || !c || v.readyState < 2) return (raf.current = requestAnimationFrame(draw));
    const MAXW = thermal ? 640 : 960;
    let W = v.videoWidth || 640, H = v.videoHeight || 480;
    if (W > MAXW) { const s = MAXW / W; W = MAXW; H = H * s | 0; }
    if (c.width !== W) { c.width = W; c.height = H; }
    const ctx = c.getContext("2d", { willReadFrequently: true });

    ctx.drawImage(v, 0, 0, W, H);
    const frame = ctx.getImageData(0, 0, W, H);
    const d = frame.data;
    const total = W * H;

    // 1. Hitung rata-rata brightness untuk auto-boost
    let sum = 0;
    for (let i = 0; i < d.length; i += 16) { // sampling tiap 4 piksel untuk speed
      sum += d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
    }
    const avg = sum / (d.length / 16) / 255;
    setBrightness(avg);

    // 2. Auto-boost: hitung multiplier tambahan kalau gelap
    let autoGain = 1;
    if (autoBoost) {
      if (avg < 0.08) autoGain = 6;
      else if (avg < 0.15) autoGain = 4;
      else if (avg < 0.25) autoGain = 2.5;
      else if (avg < 0.4) autoGain = 1.5;
      else autoGain = 1;
    }
    const totalGain = gain * autoGain;

    // 3. Equalization LUT (kalau aktif & tidak thermal)
    let lut = null;
    if (eq && !thermal) {
      lut = equalize(d, total);
    }

    if (thermal && seg.current) {
      try {
        seg.current.segmentForVideo(v, performance.now(), (res) => {
          const cat = res.categoryMask; if (!cat) return;
          const m = cat.getAsUint8Array(), mw = cat.width, mh = cat.height;
          let n = 0;
          for (let y = 0; y < H; y++) {
            const my = Math.min(mh - 1, y * mh / H | 0) * mw, row = y * W;
            for (let x = 0; x < W; x++) {
              const i = (row + x) * 4, r = d[i], g = d[i + 1], b = d[i + 2];
              // Apply auto-gain ke lum untuk thermal juga
              let lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
              lum = Math.min(1, lum * autoGain);
              if (m[my + Math.min(mw - 1, x * mw / W | 0)] > 0) {
                n++;
                const t = Math.min(1, lum * gain * heat);
                const [pr, pg, pb] = heatColor(t);
                d[i] = pr; d[i + 1] = pg; d[i + 2] = pb;
              } else {
                const w = Math.min(255, 130 + lum * 125);
                d[i] = w; d[i + 1] = w; d[i + 2] = w;
              }
            }
          }
          ctx.putImageData(frame, 0, 0);
          setCoverage(n / total);
        });
      } catch {}
    } else {
      // Mode NV warna: grayscale + gamma + equalization + gain
      for (let i = 0; i < d.length; i += 4) {
        let lum = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) | 0;
        if (lut) lum = lut[lum];
        // Gamma 0.7 (angkat shadow)
        let val = Math.pow(lum / 255, 0.7) * 255 * totalGain;
        val = Math.min(255, Math.max(0, val)) | 0;
        d[i] = val; d[i + 1] = val; d[i + 2] = val;
      }
      ctx.putImageData(frame, 0, 0);
    }
    raf.current = requestAnimationFrame(draw);
  }, [gain, thermal, heat, autoBoost, eq]);

  useEffect(() => {
    if (status !== "ready") return;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf.current);
  }, [status, draw]);

  useEffect(() => {
    if (status !== "ready") return;
    let n = 0, t = performance.now(), r;
    const tick = () => { n++; r = requestAnimationFrame(tick); };
    r = requestAnimationFrame(tick);
    const id = setInterval(() => {
      const now = performance.now();
      setFps(Math.round(n / ((now - t) / 1000)));
      n = 0; t = now;
    }, 1000);
    return () => { cancelAnimationFrame(r); clearInterval(id); };
  }, [status]);

  const start = useCallback(async () => {
    setStatus("starting"); setError("");
    try {
      // Minta kamera naikkan exposure jika memungkinkan
      stream.current = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "environment",
          // Hint ke browser: prioritaskan low-light performance
          advanced: [{ exposureMode: "continuous" }],
        },
        audio: false,
      });

      // Coba paksa exposure tinggi + white balance auto
      const track = stream.current.getVideoTracks()[0];
      const caps = track.getCapabilities?.() || {};
      const constraints = {};
      if (caps.exposureMode?.includes?.("continuous")) {
        constraints.exposureMode = "continuous";
      }
      if (caps.exposureCompensation) {
        const { min = 0, max = 0 } = caps.exposureCompensation;
        constraints.exposureCompensation = max; // paksa paling terang
      }
      if (Object.keys(constraints).length) {
        try { await track.applyConstraints({ advanced: [constraints] }); } catch {}
      }

      video.current.srcObject = stream.current;
      await video.current.play();
      setStatus("ready");
    } catch (e) {
      setStatus(e.name === "NotAllowedError" ? "denied" : "error");
      setError(e.name === "NotAllowedError" ? "Izin kamera ditolak." : e.message);
    }
  }, []);

  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    if (rec.current?.state !== "inactive") rec.current?.stop();
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    if (video.current) video.current.srcObject = null;
    setStatus("idle"); setFps(0); setRecording(false); setCoverage(0);
  }, []);

  useEffect(() => () => stop(), [stop]);

  const shot = () => {
    const a = document.createElement("a");
    a.href = canvas.current.toDataURL("image/png");
    a.download = `nv-${Date.now()}.png`; a.click();
  };

  const record = () => {
    if (recording) return rec.current?.stop();
    const s = canvas.current.captureStream(30);
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
    const r = new MediaRecorder(s, { mimeType: mime, videoBitsPerSecond: 5e6 });
    chunks.current = [];
    r.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
    r.onstop = () => {
      const url = URL.createObjectURL(new Blob(chunks.current, { type: "video/webm" }));
      const a = document.createElement("a");
      a.href = url; a.download = `nv-${Date.now()}.webm`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setRecording(false);
    };
    r.start(); rec.current = r; setRecording(true);
  };

  const isBody = coverage > 0.01;
  const lightLabel = brightness < 0.1 ? "SANGAT GELAP" : brightness < 0.25 ? "GELAP" : brightness < 0.5 ? "REMBANG" : "TERANG";

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/tools" className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 mb-4">
        <ArrowLeftIcon size={14} /> Kembali
      </Link>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 text-white shadow-lg">
          <EyeIcon size={22} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Night Vision & Thermal</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Auto-boost low-light, histogram EQ, thermal putih→oranye→merah.</p>
        </div>
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-black">
        <video ref={video} playsInline muted className="hidden" />
        <canvas ref={canvas} className="absolute inset-0 h-full w-full object-cover" />

        {status === "ready" && !thermal && (
          <div className="absolute inset-0 pointer-events-none" style={{ background: cur.tint, mixBlendMode: "color" }} />
        )}

        {status === "ready" && (
          <>
            <div className="absolute top-3 left-3 flex items-center gap-2 font-mono text-[10px] text-white/90 bg-black/40 rounded-full px-2.5 py-1">
              {thermal ? "THERMAL" : cur.label.toUpperCase()} · {fps} FPS
            </div>
            <div className="absolute top-3 right-3 flex items-center gap-1.5 font-mono text-[10px] text-white bg-black/40 rounded-full px-2.5 py-1">
              LIGHT {lightLabel} {(brightness * 100).toFixed(0)}%
            </div>
            {recording && (
              <div className="absolute top-12 right-3 flex items-center gap-1.5 font-mono text-[10px] text-white bg-red-600/90 rounded-full px-2.5 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> REC
              </div>
            )}
            {thermal && isBody && (
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 font-mono text-[10px] text-white bg-red-600/85 rounded-full px-2.5 py-1">
                <FlameIcon size={11} /> BODY {(coverage * 100).toFixed(0)}%
              </div>
            )}
            {thermal && (
              <div className="absolute bottom-3 right-3 flex flex-col items-end gap-1">
                <div className="font-mono text-[9px] text-white/80 tracking-wider bg-black/40 rounded px-2 py-0.5">
                  DINGIN → PANAS
                </div>
                <div className="h-1.5 w-32 rounded-full border border-white/30"
                  style={{ background: "linear-gradient(to right, rgb(255,190,80), rgb(255,140,20), rgb(255,80,0), rgb(210,15,15))" }}
                />
              </div>
            )}
          </>
        )}

        {thermal && status === "ready" && !seg.current && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white">
            <LoaderIcon size={24} className="animate-spin text-orange-400 mb-2" />
            <div className="text-xs">Memuat model thermal...</div>
          </div>
        )}

        {status === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <EyeIcon size={36} className="text-emerald-400 mb-3" />
            <div className="text-sm font-semibold text-white mb-1">Night Vision & Thermal</div>
            <div className="text-[11px] text-slate-400 mb-4">Auto-boost low-light + histogram EQ aktif secara default.</div>
            <button onClick={start} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2 text-xs font-semibold text-white">
              <CameraIcon size={14} /> Aktifkan Kamera
            </button>
          </div>
        )}

        {status === "starting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <LoaderIcon size={24} className="animate-spin text-emerald-400 mb-2" />
            <div className="text-xs">Menyalakan kamera...</div>
          </div>
        )}

        {(status === "error" || status === "denied") && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
            <AlertIcon size={28} className="text-red-400 mb-2" />
            <div className="text-xs mb-3">{error}</div>
            <button onClick={start} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-[11px]">
              <RefreshIcon size={12} /> Coba lagi
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 items-center">
        {status === "ready" && (
          <>
            <button onClick={shot} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-white/70 dark:bg-slate-900/50 px-3 py-1.5 text-[11px] text-slate-700 dark:text-slate-200">
              <DownloadIcon size={12} /> Snapshot
            </button>
            <button onClick={record} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] ${recording ? "bg-red-600 text-white" : "border border-emerald-200 dark:border-emerald-900 bg-white/70 dark:bg-slate-900/50 text-slate-700 dark:text-slate-200"}`}>
              {recording ? <StopIcon size={11} /> : <RecordIcon size={11} />} {recording ? "Stop" : "Rekam"}
            </button>
            <button onClick={stop} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 px-3 py-1.5 text-[11px] text-red-600">
              <StopIcon size={11} /> Matikan
            </button>
          </>
        )}

        <select value={mode} onChange={(e) => setMode(e.target.value)}
          className="rounded-lg border border-emerald-200 dark:border-emerald-900 bg-white/70 dark:bg-slate-900/50 px-3 py-1.5 text-[11px] text-slate-700 dark:text-slate-200">
          {MODES.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>

        <label className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-white/70 dark:bg-slate-900/50 px-3 py-1.5 text-[11px] text-slate-700 dark:text-slate-200">
          Gain <input type="range" min="0.5" max="4" step="0.1" value={gain} onChange={(e) => setGain(+e.target.value)} className="w-20 accent-emerald-600" />
        </label>

        {!thermal && (
          <>
            <button onClick={() => setAutoBoost(!autoBoost)}
              className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${autoBoost ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white" : "border border-emerald-200 dark:border-emerald-900 bg-white/70 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300"}`}>
              Auto-Boost {autoBoost ? "ON" : "OFF"}
            </button>
            <button onClick={() => setEq(!eq)}
              className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${eq ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white" : "border border-emerald-200 dark:border-emerald-900 bg-white/70 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300"}`}>
              Histogram EQ {eq ? "ON" : "OFF"}
            </button>
          </>
        )}

        {thermal && (
          <label className="inline-flex items-center gap-2 rounded-lg border border-orange-200 dark:border-orange-900 bg-white/70 dark:bg-slate-900/50 px-3 py-1.5 text-[11px] text-slate-700 dark:text-slate-200">
            Panas <input type="range" min="0.4" max="2.5" step="0.1" value={heat} onChange={(e) => setHeat(+e.target.value)} className="w-20 accent-orange-600" />
          </label>
        )}
      </div>

      {status === "ready" && !thermal && (
        <div className="mt-3 rounded-xl border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 text-[10px] text-emerald-700 dark:text-emerald-300">
          💡 <strong>Auto-Boost</strong> naikkan kecerahan otomatis saat ruangan gelap. <strong>Histogram EQ</strong> sebarkan ulang
          brightness biar detail muncul. Untuk night vision asli (gelap total), butuh kamera dengan IR sensor — webcam HP biasa
          hanya bisa boost digital sampai batas tertentu.
        </div>
      )}
    </div>
  );
}
