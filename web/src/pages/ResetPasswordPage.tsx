import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, KeyRound, Loader2, Lock, ShieldCheck } from 'lucide-react'
import { auth } from '../services/auth'

interface FieldError {
  [key: string]: string[]
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const email = searchParams.get('email') ?? ''
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldError>({})
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setLoading(true)

    try {
      await auth.resetPassword({
        email: email.toLowerCase(),
        token,
        password,
        password_confirmation: passwordConfirmation,
      })
      navigate('/login', { state: { passwordReset: true } })
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

  // Halaman ini selalu dipanggil lewat link dari email (token + email wajib ada)
  const invalidLink = !email || !token

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-pink-600/20 blur-3xl" />

      <div className="relative w-full max-w-md animate-slide-up rounded-3xl border border-surface-800 bg-surface-900/80 p-8 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-pink-500 shadow-lg shadow-brand-500/30">
            <KeyRound size={26} className="text-white" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold text-surface-50">Buat Password Baru</h1>
          <p className="mt-1 text-sm text-surface-400">
            {invalidLink ? 'Link reset tidak valid.' : `Untuk akun ${email}`}
          </p>
        </div>

        {invalidLink ? (
          <>
            <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
              Link ini tidak lengkap atau sudah tidak berlaku. Minta link baru lewat halaman lupa password.
            </p>
            <Link
              to="/forgot-password"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110"
            >
              Minta Link Baru
            </Link>
          </>
        ) : (
          <form onSubmit={submit} className="space-y-4" noValidate>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-surface-200">Password Baru</label>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className={`w-full rounded-xl border bg-surface-950 py-3 pl-10 pr-11 text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 ${
                    fieldErrors.password
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                      : 'border-surface-700 focus:border-brand-500 focus:ring-brand-500/30'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 transition-colors hover:text-surface-300"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && <p className="mt-1 text-xs text-red-400">{fieldErrors.password[0]}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-surface-200">Konfirmasi Password</label>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="w-full rounded-xl border border-surface-700 bg-surface-950 py-3 pl-10 pr-11 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 transition-colors hover:text-surface-300"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && !fieldErrors.password && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
              {loading ? 'Menyimpan…' : 'Simpan Password Baru'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
