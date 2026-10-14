import { useState, useCallback } from "react";

const KEY = "saved_contacts";

// Normalisasi nomor → format internasional tanpa + (untuk wa.me)
function normalize(raw, cc = "62") {
  let n = String(raw).replace(/[^\d+]/g, "");
  if (n.startsWith("+")) n = n.slice(1);
  if (n.startsWith("0")) return cc + n.slice(1);
  if (n.startsWith(cc)) return n;
  return cc + n;
}

export function useContacts() {
  const [contacts, setContacts] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  });
  const [error, setError] = useState("");

  const supported =
    typeof navigator !== "undefined" &&
    "contacts" in navigator &&
    "ContactsManager" in window;

  const persist = (list) => {
    setContacts(list);
    localStorage.setItem(KEY, JSON.stringify(list));
  };

  const pick = useCallback(async () => {
    setError("");
    if (!supported) {
      setError("Browser tidak mendukung Contact Picker. Pakai Chrome Android + HTTPS.");
      return;
    }
    try {
      const props = ["name", "tel"];
      const opts = { multiple: true };
      const picked = await navigator.contacts.select(props, opts);

      const merged = [...contacts];
      for (const c of picked) {
        const name = c.name?.[0] || "Tanpa Nama";
        for (const raw of c.tel || []) {
          const num = normalize(raw);
          if (!merged.some((x) => x.num === num)) {
            merged.push({ id: Date.now() + Math.random(), name, num, raw });
          }
        }
      }
      persist(merged);
    } catch (e) {
      if (e.name !== "AbortError") setError(e.message || "Gagal membuka kontak.");
    }
  }, [contacts, supported]);

  const remove = useCallback((id) => {
    persist(contacts.filter((c) => c.id !== id));
  }, [contacts]);

  const clear = useCallback(() => persist([]), []);

  const addManual = useCallback((name, raw, cc = "62") => {
    const num = normalize(raw, cc);
    if (!num || !name.trim()) return false;
    if (contacts.some((c) => c.num === num)) return false;
    persist([...contacts, { id: Date.now(), name: name.trim(), num, raw }]);
    return true;
  }, [contacts]);

  return { contacts, supported, error, pick, remove, clear, addManual, normalize };
}
