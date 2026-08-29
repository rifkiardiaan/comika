import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { CheckCircle2, Eye, EyeOff, LogIn, Mail, Lock, Loader2 } from 'lucide-react'
import { auth } from '../services/auth'

interface FieldError {
  [key: string]: string[]
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldError>({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loggedIn, setLoggedIn] = useState(() => !!auth.getStoredUser())
  const navigate = useNavigate()
  const location = useLocation()
  const passwordReset = (location.state as { passwordReset?: boolean } | null)?.passwordReset === true

  useEffect(() => {
    const sync = () => setLoggedIn(!!auth.getStoredUser())
    window.addEventListener('comika:user', sync)
    return () => window.removeEventListener('comika:user', sync)
  }, [])

  if (loggedIn) return <Navigate to="/" replace />

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setLoading(true)

    try {
      await auth.login({ email, password })
      navigate('/')
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

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-pink-600/20 blur-3xl" />

      <div className="relative w-full max-w-md animate-slide-up rounded-3xl border border-surface-800 bg-surface-900/80 p-8 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-pink-500 font-display text-2xl font-bold text-white shadow-lg shadow-brand-500/30">
            C
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold text-surface-50">Selamat Datang Kembali</h1>
          <p className="mt-1 text-sm text-surface-400">Masuk untuk lanjut membaca komik favoritmu</p>
          {passwordReset && (
            <p className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
              <CheckCircle2 size={14} /> Password berhasil diatur ulang. Silakan masuk dengan password baru.
            </p>
          )}
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
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-400">{fieldErrors.email[0]}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-surface-200">Password</label>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-surface-700 bg-surface-950 py-3 pl-10 pr-11 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 transition-colors hover:text-surface-300"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="mt-1.5 text-right">
              <Link to="/forgot-password" className="text-xs font-medium text-brand-300 hover:text-brand-200">
                Lupa password?
              </Link>
            </div>
          </div>

          {error && !fieldErrors.email && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
            {loading ? 'Memproses…' : 'Masuk'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-surface-400">
          Belum punya akun?{' '}
          <Link to="/register" className="font-semibold text-brand-300 hover:text-brand-200">
            Daftar gratis
          </Link>
        </p>
      </div>
    </div>
  )
}
