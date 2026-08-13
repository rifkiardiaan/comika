import type { ReactNode } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { auth } from '../../services/auth'

function Forbidden() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md animate-slide-up text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/15 text-red-400">
          <ShieldAlert size={30} />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold text-surface-50">Akses Ditolak</h1>
        <p className="mt-2 text-sm leading-relaxed text-surface-400">
          Halaman ini khusus untuk administrator COMIKA. Jika Anda merasa ini sebuah kesalahan, hubungi
          tim admin.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}

/** Guard route: hanya user dengan role admin yang boleh mengakses. */
export default function AdminGuard({ children }: { children: ReactNode }) {
  const user = auth.getStoredUser()

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Forbidden />

  return <>{children}</>
}
