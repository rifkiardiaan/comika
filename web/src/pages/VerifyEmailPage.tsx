import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { BadgeCheck, KeyRound, Loader2, LogIn, MailWarning, ShieldAlert } from 'lucide-react'
import { auth } from '../services/auth'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const verified = searchParams.get('verified') === '1'
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  // Verifikasi manual dengan kode 6 digit
  const [code, setCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [codeError, setCodeError] = useState('')
  const [codeDone, setCodeDone] = useState(false)

  // Halaman tanpa param (diakses langsung) → tampilkan form kode manual
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

  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setCodeError('')
    if (!/^[0-9]{6}$/.test(code)) {
      setCodeError('Masukkan kode 6 digit dari email.')
      return
    }
    setVerifying(true)
    try {
      const res = await auth.verifyEmailCode(code)
      if (res.verified) {
        setCodeDone(true)
      } else {
        setCodeError(res.message)
      }
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
      const firstError = anyErr.response?.data?.errors ? Object.values(anyErr.response.data.errors).flat()[0] : undefined
      setCodeError(
        firstError ??
          anyErr.response?.data?.message ??
          (err instanceof Error ? err.message : 'Kode salah atau sudah kedaluwarsa.'),
      )
    } finally {
      setVerifying(false)
    }
  }

  if (directAccess) {
    return (
      <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4 py-16">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-600/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-brand-600/20 blur-3xl" />

        <div className="relative w-full max-w-md animate-slide-up rounded-3xl border border-surface-800 bg-surface-900/80 p-8 text-center shadow-2xl shadow-black/40 backdrop-blur">
          {codeDone ? (
            <>
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30">
                <BadgeCheck size={30} className="text-white" />
              </span>
              <h1 className="mt-4 font-display text-2xl font-bold text-surface-50">Email Terverifikasi! 🎉</h1>
              <p className="mt-2 text-sm leading-relaxed text-surface-400">
                Akun COMIKA kamu sudah aktif. Sekarang kamu bisa menikmati semua fitur.
              </p>
              <button
                onClick={() => navigate('/')}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110"
              >
                <LogIn size={16} /> Ke Beranda
              </button>
            </>
          ) : (
            <>
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-300">
                <KeyRound size={26} />
              </span>
              <h1 className="mt-4 font-display text-2xl font-bold text-surface-50">Verifikasi Email</h1>
              <p className="mt-2 text-sm leading-relaxed text-surface-400">
                Kami telah mengirim <span className="font-semibold text-surface-200">kode 6 digit</span> ke email kamu
                saat mendaftar. Masukkan kode tersebut untuk mengaktifkan akun.
              </p>

              <form onSubmit={submitCode} className="mt-6 space-y-3 text-left">
                <div>
                  <label htmlFor="code" className="mb-1.5 block text-sm font-medium text-surface-200">
                    Kode Verifikasi
                  </label>
                  <input
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    className="w-full rounded-xl border border-surface-800 bg-surface-950 px-4 py-3 text-center font-mono text-lg tracking-[0.5em] text-surface-100 placeholder:text-surface-600 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  />
                </div>
                {codeError && <p className="text-sm text-red-300">{codeError}</p>}
                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {verifying ? <Loader2 size={16} className="animate-spin" /> : <BadgeCheck size={16} />}
                  {verifying ? 'Memverifikasi…' : 'Verifikasi Kode'}
                </button>
              </form>

              <div className="mt-5 border-t border-surface-800 pt-4">
                <p className="text-xs text-surface-500">Tidak menerima kode?</p>
                <div className="mt-2 flex flex-col gap-2">
                  <button
                    onClick={resend}
                    disabled={resending}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-surface-700 px-4 py-2 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800 disabled:opacity-50"
                  >
                    {resending ? <Loader2 size={14} className="animate-spin" /> : <MailWarning size={14} />}
                    {resending ? 'Mengirim…' : 'Kirim Ulang Kode'}
                  </button>
                  <Link to="/login" className="text-xs font-medium text-brand-300 hover:text-brand-200">
                    Butuh login untuk kirim ulang kode? Masuk dulu
                  </Link>
                </div>
                {resendMessage && <p className="mt-2 text-xs text-surface-400">{resendMessage}</p>}
              </div>
            </>
          )}
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
              Link verifikasi ini tidak valid atau sudah kedaluwarsa. Kamu bisa meminta link atau kode baru.
            </p>
            <button
              onClick={resend}
              disabled={resending}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resending ? <Loader2 size={16} className="animate-spin" /> : <MailWarning size={16} />}
              {resending ? 'Mengirim…' : 'Kirim Ulang Email'}
            </button>
            {resendMessage && <p className="mt-3 text-xs text-surface-400">{resendMessage}</p>}
            <p className="mt-3 text-xs text-surface-500">
              Butuh login untuk mengirim ulang email verifikasi.{' '}
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
