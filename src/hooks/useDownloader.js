import { useState, useCallback } from "react";

/**
 * Hook untuk memanggil backend downloader.
 *
 * Backend yang diharapkan: POST /api/download
 *   body: { url: string, platform: string }
 *   response: {
 *     title?: string,
 *     thumbnail?: string,
 *     duration?: string,
 *     author?: string,
 *     formats: [{ quality, ext, size, url }]
 *   }
 *
 * Contoh implementasi backend (Express + ytdl-core / cobalt):
 * lihat komentar di bawah file ini.
 */
export function useDownloader() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const download = useCallback(async (url, platform) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, platform }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || `Gagal mengambil data (${res.status})`);
      }

      const data = await res.json();
      setResult(data);
      return data;
    } catch (e) {
      setError(e.message || "Terjadi kesalahan");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { download, loading, result, error, reset };
}

/*
=== CONTOH BACKEND EXPRESS (server.js) ===

import express from "express";
import ytdl from "@distube/ytdl-core";

const app = express();
app.use(express.json());

app.post("/api/download", async (req, res) => {
  const { url, platform } = req.body;

  try {
    if (platform === "youtube") {
      const info = await ytdl.getInfo(url);
      const formats = info.formats
        .filter(f => f.hasVideo && f.hasAudio)
        .map(f => ({
          quality: f.qualityLabel,
          ext: f.container,
          size: f.contentLength,
          url: f.url,
        }));

      return res.json({
        title: info.videoDetails.title,
        thumbnail: info.videoDetails.thumbnails.at(-1)?.url,
        duration: info.videoDetails.lengthSeconds + "s",
        author: info.videoDetails.author.name,
        formats,
      });
    }

    // Platform lain pakai library/service masing-masing
    return res.status(400).json({ message: "Platform belum didukung" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.listen(3001, () => console.log("API ready on :3001"));
*/
