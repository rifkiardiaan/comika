import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Loader2, Mail, MailCheck, ShieldCheck } from 'lucide-react'
import { auth } from '../services/auth'

interface FieldError {
  [key: string]: string[]
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldError>({})
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setLoading(true)

    try {
      await auth.forgotPassword(email)
      setSent(true)
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string; errors?: FieldError } } }
      if (anyErr.response?.data?.errors) {
        setFieldErrors(anyErr.response.data.errors)
      }
      setError(
        anyErr.response?.data?.message ??
          (err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.'),
      )
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4 py-16">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-pink-600/20 blur-3xl" />

        <div className="relative w-full max-w-md animate-slide-up rounded-3xl border border-surface-800 bg-surface-900/80 p-8 text-center shadow-2xl shadow-black/40 backdrop-blur">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30">
            <MailCheck size={26} className="text-white" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold text-surface-50">Cek Email Kamu</h1>
          <p className="mt-2 text-sm leading-relaxed text-surface-400">
            Jika <span className="font-semibold text-surface-200">{email}</span> terdaftar di COMIKA,
            kami telah mengirim link untuk mengatur ulang password. Link berlaku selama 60 menit.
          </p>
          <p className="mt-3 text-xs text-surface-500">
            Tidak menerima email? Periksa folder spam, atau coba lagi dalam beberapa menit.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110"
          >
            <ArrowLeft size={16} /> Kembali ke Masuk
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-pink-600/20 blur-3xl" />

      <div className="relative w-full max-w-md animate-slide-up rounded-3xl border border-surface-800 bg-surface-900/80 p-8 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-pink-500 shadow-lg shadow-brand-500/30">
            <ShieldCheck size={26} className="text-white" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold text-surface-50">Lupa Password?</h1>
          <p className="mt-1 text-sm text-surface-400">
            Masukkan email akunmu dan kami akan mengirim link reset.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-surface-200">Email</label>
            <div className="relative">
              <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                placeholder="nama@email.com"
                className={`w-full rounded-xl border bg-surface-950 py-3 pl-10 pr-4 text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 ${
                  fieldErrors.email
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                    : 'border-surface-700 focus:border-brand-500 focus:ring-brand-500/30'
                }`}
              />
            </div>
            {fieldErrors.email && <p className="mt-1 text-xs text-red-400">{fieldErrors.email[0]}</p>}
          </div>

          {error && !fieldErrors.email && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
            {loading ? 'Mengirim…' : 'Kirim Link Reset'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-surface-400">
          Ingat passwordnya?{' '}
          <Link to="/login" className="font-semibold text-brand-300 hover:text-brand-200">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  )
}
