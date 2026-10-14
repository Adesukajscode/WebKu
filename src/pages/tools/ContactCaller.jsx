import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useContacts } from "../../hooks/useContacts";
import {
  ArrowLeftIcon, UsersIcon, PhoneCallIcon, VideoIcon, ChatIcon,
  UserPlusIcon, TrashIcon, AlertIcon, PhoneIcon, RefreshIcon,
} from "../../components/Icons";

// Buka WA deep link — di Android akan langsung buka app
const openUrl = (url) => window.open(url, "_blank", "noopener");

export default function ContactCaller() {
  const { contacts, supported, error, pick, remove, clear, addManual } = useContacts();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNum, setNewNum] = useState("");
  const [cc, setCc] = useState("62");
  const [addErr, setAddErr] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return contacts;
    return contacts.filter(
      (c) => c.name.toLowerCase().includes(q) || c.num.includes(q)
    );
  }, [contacts, search]);

  const handleAdd = (e) => {
    e.preventDefault();
    setAddErr("");
    const ok = addManual(newName, newNum, cc);
    if (!ok) return setAddErr("Nama kosong atau nomor sudah ada.");
    setNewName(""); setNewNum(""); setShowAdd(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/tools" className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 mb-4">
        <ArrowLeftIcon size={14} /> Kembali
      </Link>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 text-white shadow-lg">
          <UsersIcon size={22} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Hubungi Teman</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Panggil teman langsung dari web — tanpa cari manual di WhatsApp.
          </p>
        </div>
      </div>

      {/* Warning */}
      {!supported && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 p-3 text-[11px] text-amber-700 dark:text-amber-300">
          <AlertIcon size={14} className="mt-0.5 shrink-0" />
          <span>
            Contact Picker hanya jalan di <b>Chrome Android</b> dengan HTTPS.
            Anda tetap bisa tambah kontak manual di bawah.
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={pick}
          disabled={!supported}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UserPlusIcon size={14} /> Pilih dari Kontak HP
        </button>
        <button
          onClick={() => setShowAdd((s) => !s)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-white/70 dark:bg-slate-900/50 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200"
        >
          <PhoneIcon size={14} /> Tambah Manual
        </button>
        {contacts.length > 0 && (
          <button
            onClick={clear}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400"
          >
            <TrashIcon size={12} /> Hapus Semua
          </button>
        )}
      </div>

      {/* Error */}
      {(error || addErr) && (
        <div className="mb-3 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-2.5 text-[11px] text-red-700 dark:text-red-300">
          {error || addErr}
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="mb-3 rounded-xl border border-blue-100 dark:border-blue-900/50 glass p-3 space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nama"
              className="flex-1 rounded-lg border border-blue-100 dark:border-blue-900/60 bg-white/80 dark:bg-slate-900/60 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-400"
            />
            <div className="flex gap-2">
              <input
                value={cc}
                onChange={(e) => setCc(e.target.value.replace(/\D/g, ""))}
                placeholder="62"
                className="w-14 rounded-lg border border-blue-100 dark:border-blue-900/60 bg-white/80 dark:bg-slate-900/60 px-2 py-2 text-xs text-center font-mono text-slate-800 dark:text-slate-100 outline-none focus:border-blue-400"
              />
              <input
                value={newNum}
                onChange={(e) => setNewNum(e.target.value)}
                placeholder="8123456789"
                className="flex-1 rounded-lg border border-blue-100 dark:border-blue-900/60 bg-white/80 dark:bg-slate-900/60 px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-100 outline-none focus:border-blue-400"
              />
            </div>
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white">
              Simpan
            </button>
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500">
            Kode negara default 62 (Indonesia). Nomor dengan awalan 0 akan dikonversi otomatis.
          </div>
        </form>
      )}

      {/* Search */}
      {contacts.length > 0 && (
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama atau nomor..."
          className="w-full mb-3 rounded-xl border border-blue-100 dark:border-blue-900/60 bg-white/70 dark:bg-slate-900/50 px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-400"
        />
      )}

      {/* Contact list */}
      {contacts.length === 0 ? (
        <div className="rounded-2xl border border-blue-100 dark:border-blue-900/50 glass p-10 text-center">
          <UsersIcon size={32} className="mx-auto text-blue-400 mb-3" />
          <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Belum ada kontak</div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {supported
              ? "Klik \"Pilih dari Kontak HP\" atau tambah manual."
              : "Tambah manual karena browser tidak mendukung."}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-blue-100 dark:border-blue-900/50 glass p-8 text-center text-xs text-slate-500 dark:text-slate-400">
          Tidak ada kontak yang cocok dengan "{search}".
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <div key={c.id}
              className="flex items-center gap-3 rounded-xl border border-blue-100 dark:border-blue-900/50 glass p-3 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
              {/* Avatar */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white font-semibold text-sm">
                {c.name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                  {c.name}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  +{c.num}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => openUrl(`https://wa.me/call/${c.num}`)}
                  title="Telepon WA"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/60 transition-colors"
                >
                  <PhoneCallIcon size={14} />
                </button>
                <button
                  onClick={() => openUrl(`https://wa.me/${c.num}?text=${encodeURIComponent("Halo " + c.name + "!")}`)}
                  title="Chat WA"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors"
                >
                  <ChatIcon size={14} />
                </button>
                <button
                  onClick={() => openUrl(`tel:+${c.num}`)}
                  title="Telepon biasa"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
                >
                  <PhoneIcon size={14} />
                </button>
                <button
                  onClick={() => remove(c.id)}
                  title="Hapus"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <TrashIcon size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="mt-4 flex items-start gap-2 rounded-xl border border-blue-100 dark:border-blue-900/50 glass p-3 text-[10px] text-slate-500 dark:text-slate-400">
        <AlertIcon size={12} className="mt-0.5 shrink-0 text-blue-500" />
        <span>
          Tombol <b>Telepon WA</b> membuka WhatsApp dengan deep link <code>wa.me/call/</code> — panggilan
          tetap dimulai dari dalam WhatsApp karena browser tidak punya akses langsung ke jaringan telepon.
          Untuk panggilan tanpa WA, gunakan tombol telepon biasa (<code>tel:</code>).
          Kontak disimpan lokal di browser Anda (localStorage), tidak dikirim ke server.
        </span>
      </div>
    </div>
  );
}
