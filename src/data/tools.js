import {
  YouTubeIcon, InstagramIcon, TikTokIcon, TwitterIcon, FacebookIcon,
  ImageIcon, QrIcon, KeyIcon, TextIcon, FileZipIcon, HandIcon, EyeIcon,
  UsersIcon, AudioIcon,
} from "../components/Icons";

export const CATEGORIES = [
  { id: "all", label: "Semua" },
  { id: "downloader", label: "Downloader" },
  { id: "converter", label: "Konverter" },
  { id: "utility", label: "Utilitas" },
  { id: "social", label: "Sosial" },
];

export const TOOLS = [
  { slug: "youtube", category: "downloader", name: "YouTube Downloader", short: "YouTube", desc: "Unduh video dan audio YouTube dalam berbagai kualitas hingga 4K.", Icon: YouTubeIcon, gradient: "from-red-500 to-red-700", accent: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-100 dark:border-red-900/50" },
  { slug: "instagram", category: "downloader", name: "Instagram Downloader", short: "Instagram", desc: "Simpan Reels, foto, video, dan carousel dari Instagram.", Icon: InstagramIcon, gradient: "from-pink-500 to-purple-600", accent: "text-pink-600 dark:text-pink-400", bg: "bg-pink-50 dark:bg-pink-950/30", border: "border-pink-100 dark:border-pink-900/50" },
  { slug: "tiktok", category: "downloader", name: "TikTok Downloader", short: "TikTok", desc: "Unduh video TikTok tanpa watermark, langsung ke galeri Anda.", Icon: TikTokIcon, gradient: "from-slate-800 to-slate-950", accent: "text-slate-800 dark:text-slate-200", bg: "bg-slate-100 dark:bg-slate-900/40", border: "border-slate-200 dark:border-slate-700/60" },
  { slug: "twitter", category: "downloader", name: "Twitter / X Downloader", short: "Twitter", desc: "Ambil video dan gambar dari postingan Twitter / X.", Icon: TwitterIcon, gradient: "from-slate-700 to-slate-900", accent: "text-slate-700 dark:text-slate-300", bg: "bg-slate-100 dark:bg-slate-900/40", border: "border-slate-200 dark:border-slate-700/60" },
  { slug: "facebook", category: "downloader", name: "Facebook Downloader", short: "Facebook", desc: "Unduh video Facebook dari publik dan reels.", Icon: FacebookIcon, gradient: "from-blue-600 to-blue-800", accent: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-100 dark:border-blue-900/50" },
  { slug: "image-converter", category: "converter", name: "Image Converter", short: "Gambar", desc: "Konversi JPG, PNG, WebP, dan kompres ukuran gambar langsung di browser.", Icon: ImageIcon, gradient: "from-emerald-500 to-teal-600", accent: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-100 dark:border-emerald-900/50" },
  { slug: "file-zip", category: "converter", name: "File Compressor", short: "ZIP", desc: "Kompres banyak file jadi satu ZIP langsung di browser Anda.", Icon: FileZipIcon, gradient: "from-amber-500 to-orange-600", accent: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-100 dark:border-amber-900/50" },
  { slug: "audio-converter", category: "converter", name: "Audio Converter", short: "Audio", desc: "Konversi audio ke MP3, AAC, Opus, WAV, FLAC, OGG, M4A dengan kontrol bitrate dan sample rate.", Icon: AudioIcon, gradient: "from-purple-500 to-violet-700", accent: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-100 dark:border-purple-900/50" },
  { slug: "qr-generator", category: "utility", name: "QR Code Generator", short: "QR Code", desc: "Buat QR code dari link, teks, atau kontak — unduh sebagai PNG.", Icon: QrIcon, gradient: "from-violet-500 to-purple-700", accent: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-100 dark:border-violet-900/50" },
  { slug: "password-generator", category: "utility", name: "Password Generator", short: "Password", desc: "Buat password acak yang kuat dengan opsi panjang dan karakter.", Icon: KeyIcon, gradient: "from-cyan-500 to-blue-600", accent: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-50 dark:bg-cyan-950/30", border: "border-cyan-100 dark:border-cyan-900/50" },
  { slug: "text-tools", category: "utility", name: "Text Tools", short: "Teks", desc: "Base64, URL encode, JSON formatter, ubah huruf besar/kecil.", Icon: TextIcon, gradient: "from-fuchsia-500 to-pink-600", accent: "text-fuchsia-600 dark:text-fuchsia-400", bg: "bg-fuchsia-50 dark:bg-fuchsia-950/30", border: "border-fuchsia-100 dark:border-fuchsia-900/50" },
  { slug: "hand-tracker", category: "utility", name: "Hand Tracker", short: "Hand Tracker", desc: "Deteksi 21 titik sendi tangan real-time lewat webcam dengan pengenalan gestur.", Icon: HandIcon, gradient: "from-indigo-500 to-violet-700", accent: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/30", border: "border-indigo-100 dark:border-indigo-900/50" },
  { slug: "night-vision", category: "utility", name: "Night Vision & Thermal", short: "Night Vision", desc: "Webcam jadi night vision + thermal imaging. Deteksi tubuh berwarna oranye-merah.", Icon: EyeIcon, gradient: "from-emerald-500 to-green-700", accent: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-100 dark:border-emerald-900/50" },
  { slug: "contact-caller", category: "social", name: "Hubungi Teman", short: "Hubungi Teman", desc: "Impor kontak HP dan panggil teman langsung dari web via WhatsApp atau telepon biasa.", Icon: UsersIcon, gradient: "from-green-500 to-emerald-700", accent: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-100 dark:border-green-900/50" },
];

export const getToolBySlug = (slug) => TOOLS.find((t) => t.slug === slug);
