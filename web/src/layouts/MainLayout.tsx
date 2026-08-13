import { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { Loader2, MailWarning, X } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { auth } from '../services/auth'
import type { User } from '../types'

function VerificationBanner() {
  const [user, setUser] = useState<User | null>(auth.getStoredUser())
  const [dismissed, setDismissed] = useState(false)
  const [resending, setResending] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const sync = () => {
      setUser(auth.getStoredUser())
      setMessage('')
    }
    window.addEventListener('storage', sync)
    window.addEventListener('comika:user', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('comika:user', sync)
    }
  }, [])

  // Hanya tampil bila status eksplisit false — user lama dengan cache tanpa
  // field is_email_verified (undefined) dianggap sudah verified agar tidak
  // salah menampilkan banner.
  if (!user || user.is_email_verified !== false || dismissed) return null

  const resend = async () => {
    setResending(true)
    setMessage('')
    try {
      const msg = await auth.sendVerificationEmail()
      setMessage(msg)
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string } } }
      setMessage(
        anyErr.response?.data?.message ??
          (err instanceof Error ? err.message : 'Gagal mengirim. Coba lagi.'),
      )
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="border-b border-amber-500/20 bg-amber-500/10">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6">
        <MailWarning size={16} className="shrink-0 text-amber-300" />
        <p className="min-w-0 flex-1 text-xs text-amber-200">
          {message || (
            <>
              Verifikasi email kamu untuk mengamankan akun. Cek inbox atau{' '}
              <Link to="/verify-email" className="font-semibold text-amber-100 underline underline-offset-2 hover:text-white">
                baca bantuan
              </Link>
              .
            </>
          )}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={resend}
            disabled={resending}
            className="flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-100 transition-colors hover:bg-amber-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resending && <Loader2 size={12} className="animate-spin" />}
            {resending ? 'Mengirim…' : 'Kirim Ulang'}
          </button>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Tutup"
            className="rounded-lg p-1 text-amber-300/70 transition-colors hover:bg-amber-500/20 hover:text-amber-200"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-950 text-surface-100">
      <Navbar />
      <VerificationBanner />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
