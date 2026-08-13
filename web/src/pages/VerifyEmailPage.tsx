import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { BadgeCheck, Loader2, LogIn, MailWarning, ShieldAlert } from 'lucide-react'
import { auth } from '../services/auth'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const verified = searchParams.get('verified') === '1'
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  // Halaman tanpa param (diakses langsung) → arahkan ke login
  const directAccess = !searchParams.has('verified')

  const resend = async () => {
    setResending(true)
    setResendMessage('')
    try {
      const message = await auth.sendVerificationEmail()
      setResendMessage(message)
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string } } }
      setResendMessage(
        anyErr.response?.data?.message ??
          (err instanceof Error ? err.message : 'Gagal mengirim ulang. Coba lagi.'),
      )
    } finally {
      setResending(false)
    }
  }

  if (directAccess) {
    return (
      <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4 py-16">
        <div className="relative w-full max-w-md animate-slide-up rounded-3xl border border-surface-800 bg-surface-900/80 p-8 text-center shadow-2xl shadow-black/40 backdrop-blur">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300">
            <MailWarning size={26} />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold text-surface-50">Verifikasi Email</h1>
          <p className="mt-2 text-sm text-surface-400">
            Halaman ini bisa dibuka dari link di email verifikasi COMIKA. Buka link yang kami
            kirimkan saat kamu mendaftar.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110"
          >
            <LogIn size={16} /> Ke Halaman Masuk
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-brand-600/20 blur-3xl" />

      <div className="relative w-full max-w-md animate-slide-up rounded-3xl border border-surface-800 bg-surface-900/80 p-8 text-center shadow-2xl shadow-black/40 backdrop-blur">
        {verified ? (
          <>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30">
              <BadgeCheck size={30} className="text-white" />
            </span>
            <h1 className="mt-4 font-display text-2xl font-bold text-surface-50">Email Terverifikasi! 🎉</h1>
            <p className="mt-2 text-sm leading-relaxed text-surface-400">
              Akun COMIKA kamu sudah aktif. Sekarang kamu bisa login dan menikmati semua fitur.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110"
            >
              <LogIn size={16} /> Masuk Sekarang
            </button>
          </>
        ) : (
          <>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/15 text-red-300">
              <ShieldAlert size={30} />
            </span>
            <h1 className="mt-4 font-display text-2xl font-bold text-surface-50">Verifikasi Gagal</h1>
            <p className="mt-2 text-sm leading-relaxed text-surface-400">
              Link verifikasi ini tidak valid atau sudah kedaluwarsa. Kamu bisa meminta link baru.
            </p>
            <button
              onClick={resend}
              disabled={resending}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resending ? <Loader2 size={16} className="animate-spin" /> : <MailWarning size={16} />}
              {resending ? 'Mengirim…' : 'Kirim Ulang Link'}
            </button>
            {resendMessage && <p className="mt-3 text-xs text-surface-400">{resendMessage}</p>}
            <p className="mt-3 text-xs text-surface-500">
              Butuh login untuk mengirim ulang link verifikasi.{' '}
              <Link to="/login" className="font-semibold text-brand-300 hover:text-brand-200">
                Masuk
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
