import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import {
  ArrowLeftIcon, HandIcon, CameraIcon, LoaderIcon, AlertIcon,
  StopIcon, RefreshIcon, SparklesIcon,
} from "../../components/Icons";

// ============ KONSTANTA ============
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

const CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

const HAND_COLORS = [
  { main: "#06b6d4", light: "#67e8f9", rgb: "6,182,212" },   // cyan
  { main: "#ec4899", light: "#f9a8d4", rgb: "236,72,153" },  // pink
];

// ============ UTIL ============
function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0));
}

function detectGesture(lm) {
  const wrist = lm[0];
  const ext = {
    thumb: dist(lm[4], wrist) > dist(lm[2], wrist) * 1.15,
    index: dist(lm[8], wrist) > dist(lm[6], wrist) * 1.15,
    middle: dist(lm[12], wrist) > dist(lm[10], wrist) * 1.15,
    ring: dist(lm[16], wrist) > dist(lm[14], wrist) * 1.15,
    pinky: dist(lm[20], wrist) > dist(lm[18], wrist) * 1.15,
  };
  const count = Object.values(ext).filter(Boolean).length;

  if (count === 0) return { name: "fist", label: "Kepalan" };
  if (count === 5) return { name: "open", label: "Telapak Terbuka" };
  if (ext.index && ext.middle && !ext.ring && !ext.pinky && !ext.thumb)
    return { name: "peace", label: "Peace" };
  if (ext.index && !ext.middle && !ext.ring && !ext.pinky && !ext.thumb)
    return { name: "point", label: "Menunjuk" };
  if (ext.thumb && !ext.index && !ext.middle && !ext.ring && !ext.pinky)
    return lm[4].y < wrist.y
      ? { name: "thumbs-up", label: "Jempol Naik" }
      : { name: "thumbs-down", label: "Jempol Turun" };
  if (ext.thumb && ext.pinky && !ext.index && !ext.middle && !ext.ring)
    return { name: "hangloose", label: "Hang Loose" };
  if (ext.index && ext.middle && ext.ring && !ext.pinky)
    return { name: "three", label: "Tiga Jari" };
  if (ext.index && !ext.middle && !ext.ring && ext.pinky)
    return { name: "rock", label: "Rock" };
  return { name: `count-${count}`, label: `${count} jari` };
}

// ============ CANVAS RENDERING ============
function drawHand(ctx, landmarks, color, W, H, t) {
  // Glow layer (garis tebal transparan)
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const [a, b] of CONNECTIONS) {
    const p1 = landmarks[a];
    const p2 = landmarks[b];
    const x1 = (1 - p1.x) * W;
    const y1 = p1.y * H;
    const x2 = (1 - p2.x) * W;
    const y2 = p2.y * H;

    // Outer glow
    ctx.strokeStyle = `rgba(${color.rgb}, 0.25)`;
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Inner line
    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, color.main);
    grad.addColorStop(1, color.light);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Landmark dots
  landmarks.forEach((p, i) => {
    const x = (1 - p.x) * W;
    const y = p.y * H;
    const isTip = [4, 8, 12, 16, 20].includes(i);
    const isWrist = i === 0;
    const radius = isWrist ? 7 : isTip ? 5 : 3;

    // Glow
    ctx.shadowColor = color.main;
    ctx.shadowBlur = isTip ? 16 : 8;
    ctx.fillStyle = isTip ? color.light : color.main;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Pulsing ring untuk fingertip
    if (isTip) {
      const pulse = (Math.sin(t / 400 + i) + 1) / 2;
      ctx.strokeStyle = `rgba(${color.rgb}, ${0.5 - pulse * 0.4})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, radius + 4 + pulse * 8, 0, Math.PI * 2);
      ctx.stroke();
    }
  });

  // Pulse ring dari wrist
  const wrist = landmarks[0];
  const wx = (1 - wrist.x) * W;
  const wy = wrist.y * H;
  const pulse2 = (t % 1500) / 1500;
  ctx.strokeStyle = `rgba(${color.rgb}, ${0.4 * (1 - pulse2)})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(wx, wy, 20 + pulse2 * 60, 0, Math.PI * 2);
  ctx.stroke();
}

// ============ KOMPONEN ============
export default function HandTracker() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const landmarkerRef = useRef(null);
  const streamRef = useRef(null);
  const lastTimeRef = useRef(-1);
  const fpsRef = useRef({ frames: 0, last: performance.now() });
  const gestureRef = useRef(null);
  const startTimeRef = useRef(performance.now());

  const [modelStatus, setModelStatus] = useState("loading"); // loading | ready | error
  const [status, setStatus] = useState("idle"); // idle | starting | ready | error | denied
  const [error, setError] = useState("");
  const [gesture, setGesture] = useState(null);
  const [handCount, setHandCount] = useState(0);
  const [fps, setFps] = useState(0);
  const [flash, setFlash] = useState(0);

  // Load model sekali
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(WASM_URL);
        const lm = await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
          runningMode: "VIDEO",
          numHands: 2,
        });
        if (cancelled) {
          lm.close();
          return;
        }
        landmarkerRef.current = lm;
        setModelStatus("ready");
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setModelStatus("error");
          setError("Gagal memuat model. Cek koneksi internet.");
        }
      }
    })();
    return () => {
      cancelled = true;
      try {
        landmarkerRef.current?.close?.();
      } catch {}
    };
  }, []);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus("idle");
    setHandCount(0);
    setGesture(null);
    setFps(0);
    gestureRef.current = null;
  }, []);

  const start = useCallback(async () => {
    if (!landmarkerRef.current) return;
    setStatus("starting");
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      const v = videoRef.current;
      v.srcObject = stream;
      await v.play();
      lastTimeRef.current = -1;
      startTimeRef.current = performance.now();
      setStatus("ready");
    } catch (e) {
      console.error(e);
      if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
        setStatus("denied");
        setError("Izin kamera ditolak. Buka setelan browser dan izinkan akses kamera.");
      } else {
        setStatus("error");
        setError(e.message || "Gagal mengakses kamera.");
      }
    }
  }, []);

  // Loop deteksi
  useEffect(() => {
    if (status !== "ready") return;
    let running = true;

    const loop = () => {
      if (!running) return;
      const v = videoRef.current;
      const c = canvasRef.current;
      const lm = landmarkerRef.current;
      if (!v || !c || !lm) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      if (v.readyState >= 2) {
        if (c.width !== v.videoWidth || c.height !== v.videoHeight) {
          c.width = v.videoWidth || 640;
          c.height = v.videoHeight || 480;
        }

        if (v.currentTime !== lastTimeRef.current) {
          lastTimeRef.current = v.currentTime;
          try {
            const res = lm.detectForVideo(v, performance.now());
            render(res, c);
            updateGesture(res);
          } catch (e) {
            // abaikan frame error
          }

          const f = fpsRef.current;
          f.frames++;
          const now = performance.now();
          if (now - f.last >= 1000) {
            setFps(f.frames);
            f.frames = 0;
            f.last = now;
          }
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    loop();
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const render = (res, canvas) => {
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const t = performance.now() - startTimeRef.current;

    if (res.landmarks) {
      res.landmarks.forEach((lm, i) => {
        drawHand(ctx, lm, HAND_COLORS[i % HAND_COLORS.length], W, H, t);
      });
    }
  };

  const updateGesture = (res) => {
    if (!res.landmarks || res.landmarks.length === 0) {
      setHandCount(0);
      if (gestureRef.current !== null) {
        gestureRef.current = null;
        setGesture(null);
      }
      return;
    }
    setHandCount(res.landmarks.length);
    const g = detectGesture(res.landmarks[0]);
    if (gestureRef.current?.name !== g.name) {
      gestureRef.current = g;
      setGesture(g);
      setFlash((x) => x + 1);
    }
  };

  // Cleanup saat unmount
  useEffect(() => () => stop(), [stop]);

  return (
    <div className="max-w-4xl mx-auto">
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
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-700 text-white shadow-lg shadow-indigo-500/30">
          <HandIcon size={26} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            Hand Tracker
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Deteksi 21 titik sendi tangan real-time lewat webcam. Coba bentuk gestur seperti peace, thumbs up, atau kepalan.
          </p>
        </div>
      </motion.div>

      {/* Video area */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative aspect-video w-full overflow-hidden rounded-3xl border border-indigo-100 dark:border-indigo-900/60 bg-slate-950 shadow-2xl shadow-indigo-900/20"
      >
        {/* Video (mirrored) */}
        <video
          ref={videoRef}
          playsInline
          muted
          className="absolute inset-0 h-full w-full object-cover -scale-x-100"
        />

        {/* Canvas overlay */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full pointer-events-none"
        />

        {/* HUD: top-left */}
        <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-white">
          <span
            className={`h-2 w-2 rounded-full ${
              status === "ready"
                ? "bg-emerald-400 animate-pulse"
                : status === "starting"
                ? "bg-amber-400 animate-pulse"
                : "bg-slate-400"
            }`}
          />
          {status === "ready"
            ? "Tracking aktif"
            : status === "starting"
            ? "Memuat..."
            : "Kamera mati"}
        </div>

        {/* HUD: top-right */}
        {status === "ready" && (
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <div className="rounded-full bg-black/40 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-white tabular-nums">
              {handCount} tangan
            </div>
            <div className="rounded-full bg-black/40 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-white tabular-nums">
              {fps} FPS
            </div>
          </div>
        )}

        {/* Gesture display */}
        <AnimatePresence>
          {gesture && status === "ready" && (
            <motion.div
              key={flash}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2"
            >
              <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500/90 to-violet-600/90 backdrop-blur-md px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40">
                <SparklesIcon size={14} />
                {gesture.label}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Start overlay */}
        {status === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950 text-center px-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-700 text-white shadow-lg shadow-indigo-500/40"
            >
              <HandIcon size={30} />
            </motion.div>
            <div className="text-base font-semibold text-white">
              {modelStatus === "loading"
                ? "Memuat model AI..."
                : modelStatus === "error"
                ? "Gagal memuat model"
                : "Siap mendeteksi tangan Anda"}
            </div>
            <div className="mt-1.5 text-xs text-slate-400 max-w-xs">
              {modelStatus === "loading"
                ? "Butuh koneksi internet untuk pertama kali."
                : "Klik tombol di bawah untuk mengaktifkan kamera."}
            </div>
            <button
              onClick={start}
              disabled={modelStatus !== "ready"}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {modelStatus === "loading" ? (
                <>
                  <LoaderIcon size={16} className="animate-spin" />
                  Memuat...
                </>
              ) : (
                <>
                  <CameraIcon size={16} />
                  Aktifkan Kamera
                </>
              )}
            </button>
          </div>
        )}

        {/* Starting overlay */}
        {status === "starting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur text-white text-center px-6">
            <LoaderIcon size={32} className="animate-spin text-indigo-400 mb-3" />
            <div className="text-sm font-medium">Menyalakan kamera...</div>
            <div className="text-xs text-slate-400 mt-1">
              Izinkan akses kamera jika browser menanyakan.
            </div>
          </div>
        )}

        {/* Error overlay */}
        {(status === "error" || status === "denied") && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur text-white text-center px-6">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/20 text-red-400">
              <AlertIcon size={24} />
            </div>
            <div className="text-sm font-semibold">Gagal mengakses kamera</div>
            <div className="mt-1.5 text-xs text-slate-300 max-w-xs">{error}</div>
            <button
              onClick={start}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 text-xs font-medium text-white hover:bg-white/20 transition-colors"
            >
              <RefreshIcon size={14} />
              Coba lagi
            </button>
          </div>
        )}
      </motion.div>

      {/* Kontrol bawah */}
      {status === "ready" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
              Tangan kiri
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.6)]" />
              Tangan kanan
            </div>
          </div>

          <button
            onClick={stop}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
          >
            <StopIcon size={12} />
            Hentikan kamera
          </button>
        </motion.div>
      )}

      {/* Panduan gestur */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 glass p-5 shadow-sm"
      >
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-3">
          Gestur yang dikenali
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {[
            "Kepalan",
            "Telapak Terbuka",
            "Peace",
            "Menunjuk",
            "Jempol Naik",
            "Jempol Turun",
            "Hang Loose",
            "Rock",
          ].map((g) => (
            <div
              key={g}
              className="rounded-lg border border-indigo-100 dark:border-indigo-900/50 bg-white/60 dark:bg-slate-900/40 px-3 py-2 text-slate-600 dark:text-slate-300 text-center"
            >
              {g}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-start gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
          <AlertIcon size={12} className="mt-0.5 shrink-0" />
          <span>
            Semua proses berjalan di browser Anda. Video tidak diunggah ke server mana pun.
          </span>
        </div>
      </motion.div>
    </div>
  );
}
