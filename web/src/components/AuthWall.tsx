import { Link } from 'react-router-dom'
import { Lock, LogIn, UserPlus } from 'lucide-react'

interface AuthWallProps {
  title?: string
  description?: string
}

export default function AuthWall({
  title = 'Masuk untuk Melanjutkan',
  description = 'Kamu harus masuk atau membuat akun terlebih dahulu untuk mengakses konten ini.',
}: AuthWallProps) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-pink-600/10 blur-3xl" />

      <div className="relative animate-slide-up rounded-3xl border border-surface-800 bg-surface-900/80 p-8 shadow-2xl shadow-black/40 backdrop-blur sm:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-pink-500 shadow-lg shadow-brand-500/30">
          <Lock size={28} className="text-white" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold text-surface-50">{title}</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-surface-400">{description}</p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110"
          >
            <LogIn size={16} /> Masuk
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-surface-700 bg-surface-800 px-6 py-3 text-sm font-semibold text-surface-200 transition-colors hover:border-brand-500/50 hover:text-surface-50"
          >
            <UserPlus size={16} /> Daftar Gratis
          </Link>
        </div>

        <p className="mt-4 text-xs text-surface-500">
          Belum punya akun? Daftar gratis dalam 30 detik!
        </p>
      </div>
    </div>
  )
}
