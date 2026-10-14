import { Link } from "react-router-dom";
import { ArrowLeftIcon, AlertIcon } from "../components/Icons";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg mb-4">
        <AlertIcon size={28} />
      </div>
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">404</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Halaman yang Anda cari tidak ditemukan.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 px-5 py-2.5 text-sm font-medium text-white shadow-md hover:shadow-lg transition-shadow"
      >
        <ArrowLeftIcon size={14} />
        Kembali ke Beranda
      </Link>
    </div>
  );
}
