import express from "express";
import cors from "cors";
import ytdl from "@distube/ytdl-core";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Downloader API ready" });
});

/**
 * ========================
 *  YOUTUBE
 * ========================
 */
async function handleYouTube(url) {
  if (!ytdl.validateURL(url)) {
    throw new Error("URL YouTube tidak valid");
  }

  const info = await ytdl.getInfo(url);

  const formats = info.formats
    .filter((f) => f.hasVideo && f.hasAudio)
    .map((f) => ({
      quality: f.qualityLabel || f.quality || "unknown",
      ext: f.container || "mp4",
      size: f.contentLength ? Number(f.contentLength) : null,
      url: f.url,
    }));

  return {
    title: info.videoDetails.title,
    thumbnail: info.videoDetails.thumbnails?.at(-1)?.url || null,
    duration: `${info.videoDetails.lengthSeconds}s`,
    author: info.videoDetails.author?.name || null,
    formats,
  };
}

/**
 * ========================
 *  TIKTOK (via TikWM API)
 * ========================
 *  Docs: https://tikwm.com
 *  Endpoint: GET https://www.tikwm.com/api/?url=<tiktok_url>&hd=1
 *
 *  Response data:
 *    .play       → video tanpa watermark (SD)
 *    .hdplay     → video tanpa watermark (HD)
 *    .wmplay     → video dengan watermark
 *    .music      → audio mp3
 *    .cover      → thumbnail
 *    .title      → judul / caption
 *    .author     → { unique_id, nickname, avatar }
 *    .duration   → durasi detik
 */
async function handleTikTok(url) {
  const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`;

  const res = await fetch(apiUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36",
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`TikWM API error: ${res.status}`);
  }

  const json = await res.json();

  if (json.code !== 0 || !json.data) {
    throw new Error(json.msg || "Gagal mengambil data TikTok");
  }

  const d = json.data;
  const formats = [];

  if (d.hdplay) {
    formats.push({
      quality: "HD · No Watermark",
      ext: "mp4",
      size: d.hd_size ? Number(d.hd_size) : null,
      url: d.hdplay,
    });
  }

  if (d.play) {
    formats.push({
      quality: "SD · No Watermark",
      ext: "mp4",
      size: d.size ? Number(d.size) : null,
      url: d.play,
    });
  }

  if (d.wmplay) {
    formats.push({
      quality: "SD · Watermark",
      ext: "mp4",
      size: null,
      url: d.wmplay,
    });
  }

  if (d.music) {
    formats.push({
      quality: "Audio MP3",
      ext: "mp3",
      size: null,
      url: d.music,
    });
  }

  return {
    title: d.title || "TikTok Video",
    thumbnail: d.cover || d.origin_cover || null,
    duration: d.duration ? `${d.duration}s` : null,
    author: d.author?.nickname || d.author?.unique_id || null,
    formats,
  };
}

/**
 * ========================
 *  ROUTER UTAMA
 * ========================
 */
const HANDLERS = {
  youtube: handleYouTube,
  tiktok: handleTikTok,
};

app.post("/api/download", async (req, res) => {
  const { url, platform } = req.body || {};

  if (!url || !platform) {
    return res.status(400).json({ message: "url dan platform wajib diisi" });
  }

  const handler = HANDLERS[platform];

  if (!handler) {
    const supported = Object.keys(HANDLERS).join(", ");
    return res.status(400).json({
      message: `Platform "${platform}" belum didukung. Yang tersedia: ${supported}`,
    });
  }

  try {
    const result = await handler(url);
    res.json(result);
  } catch (e) {
    console.error(`[${platform} error]`, e.message);
    res.status(500).json({ message: e.message || "Terjadi kesalahan di server" });
  }
});

app.listen(PORT, () => {
  console.log(`API ready on http://localhost:${PORT}`);
  console.log(`Supported platforms: ${Object.keys(HANDLERS).join(", ")}`);
});
