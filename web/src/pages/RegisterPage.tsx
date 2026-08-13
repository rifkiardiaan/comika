import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User as UserIcon, UserPlus, Loader2 } from 'lucide-react'
import { auth } from '../services/auth'

interface FieldError {
  [key: string]: string[]
}

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldError>({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setLoading(true)

    try {
      await auth.register({
        name,
        username,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })
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

  const inputClass = (field: string) =>
    `w-full rounded-xl border bg-surface-950 py-3 pl-10 pr-4 text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 ${
      fieldErrors[field]
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
        : 'border-surface-700 focus:border-brand-500 focus:ring-brand-500/30'
    }`

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-pink-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-brand-600/20 blur-3xl" />

      <div className="relative w-full max-w-md animate-slide-up rounded-3xl border border-surface-800 bg-surface-900/80 p-8 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-brand-500 font-display text-2xl font-bold text-white shadow-lg shadow-pink-500/30">
            C
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold text-surface-50">Buat Akun Baru</h1>
          <p className="mt-1 text-sm text-surface-400">Mulai membaca dan menerbitkan komik</p>
        </div>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-surface-200">Nama Lengkap</label>
            <div className="relative">
              <UserIcon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama kamu"
                className={inputClass('name')}
              />
            </div>
            {fieldErrors.name && <p className="mt-1 text-xs text-red-400">{fieldErrors.name[0]}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-surface-200">Username</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-surface-500">@</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="username"
                className={inputClass('username')}
              />
            </div>
            {fieldErrors.username && (
              <p className="mt-1 text-xs text-red-400">{fieldErrors.username[0]}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-surface-200">Email</label>
            <div className="relative">
              <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                placeholder="nama@email.com"
                className={inputClass('email')}
              />
            </div>
            {fieldErrors.email && <p className="mt-1 text-xs text-red-400">{fieldErrors.email[0]}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-surface-200">Password</label>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className={inputClass('password')}
              />
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-400">{fieldErrors.password[0]}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-surface-200">Konfirmasi Password</label>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
              <input
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="Ulangi password"
                className={inputClass('password')}
              />
            </div>
          </div>

          {error && Object.keys(fieldErrors).length === 0 && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-brand-600 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-600/25 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
            {loading ? 'Mendaftar…' : 'Daftar Sekarang'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-surface-400">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-semibold text-brand-300 hover:text-brand-200">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  )
}
