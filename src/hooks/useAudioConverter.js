import { useRef, useState, useCallback } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";

const CORE = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm";

// Format → ekstensi + mime + opsi encoder
export const FORMATS = [
  { id: "mp3",  label: "MP3",  ext: "mp3",  mime: "audio/mpeg",  args: (b) => ["-b:a", `${b}k`] },
  { id: "aac",  label: "AAC",  ext: "m4a",  mime: "audio/mp4",   args: (b) => ["-c:a", "aac", "-b:a", `${b}k`] },
  { id: "m4a",  label: "M4A",  ext: "m4a",  mime: "audio/mp4",   args: (b) => ["-c:a", "aac", "-b:a", `${b}k`, "-movflags", "+faststart"] },
  { id: "opus", label: "Opus", ext: "opus", mime: "audio/ogg",   args: (b) => ["-c:a", "libopus", "-b:a", `${b}k`] },
  { id: "ogg",  label: "OGG",  ext: "ogg",  mime: "audio/ogg",   args: (b) => ["-c:a", "libvorbis", "-b:a", `${b}k`] },
  { id: "wav",  label: "WAV",  ext: "wav",  mime: "audio/wav",   args: () => ["-c:a", "pcm_s16le"] },
  { id: "flac", label: "FLAC", ext: "flac", mime: "audio/flac",  args: () => ["-c:a", "flac", "-compression_level", "5"] },
];

export function useAudioConverter() {
  const ffmpegRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (loaded || loading) return;
    setLoading(true); setError("");
    setStatus("Memuat FFmpeg (~25 MB, sekali saja)...");
    try {
      const ff = new FFmpeg();
      ff.on("progress", ({ progress: p }) => setProgress(Math.round(p * 100)));
      ff.on("log", ({ message }) => { if (message.includes("Error")) console.warn(message); });
      await ff.load({
        coreURL: await toBlobURL(`${CORE}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${CORE}/ffmpeg-core.wasm`, "application/wasm"),
      });
      ffmpegRef.current = ff;
      setLoaded(true);
      setStatus("FFmpeg siap");
    } catch (e) {
      setError(e.message || "Gagal memuat FFmpeg. Pastikan header COOP/COEP aktif.");
      setStatus("");
    } finally {
      setLoading(false);
    }
  }, [loaded, loading]);

  /**
   * Convert audio file.
   * @param {File|Blob} file - input audio
   * @param {string} formatId - target format id (mp3, aac, opus, ...)
   * @param {object} opts - { bitrate, sampleRate, channels, start, duration, volume }
   * @returns {Promise<{ url, blob, size, ext }>}
   */
  const convert = useCallback(async (file, formatId, opts = {}) => {
    if (!ffmpegRef.current) throw new Error("FFmpeg belum siap");
    const ff = ffmpegRef.current;
    const fmt = FORMATS.find((f) => f.id === formatId);
    if (!fmt) throw new Error("Format tidak didukung");

    const {
      bitrate = 192, sampleRate = 44100, channels = 2,
      start = 0, duration = null, volume = 1,
    } = opts;

    setProgress(0); setError("");

    const inputName = "input";
    const outputName = `output.${fmt.ext}`;

    try {
      await ff.writeFile(inputName, await fetchFile(file));

      const args = ["-i", inputName];

      // Trim
      if (start > 0) args.push("-ss", String(start));
      if (duration && duration > 0) args.push("-t", String(duration));

      // Audio filters
      const filters = [];
      if (volume !== 1) filters.push(`volume=${volume}`);
      if (filters.length) args.push("-af", filters.join(","));

      // Sample rate & channels
      args.push("-ar", String(sampleRate), "-ac", String(channels));

      // Codec & bitrate
      args.push(...fmt.args(bitrate));

      args.push(outputName);

      await ff.exec(args);

      const data = await ff.readFile(outputName);
      const blob = new Blob([data.buffer || data], { type: fmt.mime });
      const url = URL.createObjectURL(blob);

      // Cleanup
      await ff.deleteFile(inputName).catch(() => {});
      await ff.deleteFile(outputName).catch(() => {});

      setProgress(100);
      return { url, blob, size: blob.size, ext: fmt.ext };
    } catch (e) {
      setError(e.message || "Konversi gagal");
      throw e;
    }
  }, []);

  return { loaded, loading, progress, status, error, load, convert };
}
