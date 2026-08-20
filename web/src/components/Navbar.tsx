import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Banknote,
  BookOpen,
  ChevronDown,
  Coins,
  Compass,
  Library,
  LogOut,
  Menu,
  Palette,
  Search,
  Shield,
  Sparkles,
  Trophy,
  User,
  Wallet,
  X,
} from 'lucide-react'
import { auth } from '../services/auth'
import Avatar from './Avatar'
import NotificationBell from './NotificationBell'
import type { User as UserType } from '../types'

const links = [
  { to: '/', label: 'Beranda', icon: BookOpen, end: true },
  { to: '/discover', label: 'Jelajahi', icon: Compass },
  { to: '/library', label: 'Perpustakaan', icon: Library },
]

export default function Navbar() {
  const [query, setQuery] = useState('')
  const [user, setUser] = useState<UserType | null>(auth.getStoredUser())
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const sync = () => setUser(auth.getStoredUser())
    window.addEventListener('storage', sync)
    window.addEventListener('comika:user', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('comika:user', sync)
    }
  }, [])

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  const handleLogout = async () => {
    await auth.logout()
    setUser(null)
    setMenuOpen(false)
    setMobileOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-surface-800/70 bg-surface-950/85 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-pink-500 font-display text-lg font-bold text-white shadow-lg shadow-brand-500/30">
            C
          </span>
          <span className="hidden font-display text-xl font-bold tracking-tight text-surface-50 sm:block">
            COMIKA
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-500/15 text-brand-300'
                    : 'text-surface-300 hover:bg-surface-800/60 hover:text-surface-50'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Search */}
        <form onSubmit={submitSearch} className="relative ml-auto hidden max-w-xs flex-1 sm:block">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
          <input
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari komik, genre, creator…"
            className="w-full rounded-full border border-surface-800 bg-surface-900 py-2 pl-9 pr-4 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </form>

        {/* Auth / user */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {user ? (
            <div className="relative" ref={menuRef}>
              <Link
                to="/wallet"
                className="hidden items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-300 transition-colors hover:border-amber-500/60 sm:flex"
                title="Dompet koin"
              >
                <Coins size={13} />
                {(user?.coin_balance ?? 0).toLocaleString('id-ID')}
              </Link>
              <NotificationBell />
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-full border border-surface-800 bg-surface-900 py-1 pl-1 pr-2 sm:pr-3 transition-colors hover:border-brand-500/50"
              >
                <Avatar name={user.name} avatarUrl={user.avatar_url} size={32} className="rounded-full" />
                <span className="hidden max-w-24 truncate text-sm font-medium text-surface-100 md:block">
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown size={14} className="hidden text-surface-400 sm:block" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-surface-800 bg-surface-900 shadow-2xl shadow-black/50">
                  <div className="border-b border-surface-800 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-surface-100">{user.name}</p>
                    <p className="truncate text-xs text-surface-400">@{user.username}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-surface-300 transition-colors hover:bg-surface-800 hover:text-surface-50"
                  >
                    <User size={15} /> Profil
                  </Link>
                  <Link
                    to="/wallet"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-amber-300 transition-colors hover:bg-surface-800 hover:text-amber-200"
                  >
                    <Wallet size={15} /> Dompet ({((user.coin_balance || 0) ?? 0).toLocaleString('id-ID')} koin)
                  </Link>
                  <Link
                    to="/gamification"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-orange-300 transition-colors hover:bg-surface-800 hover:text-orange-200"
                  >
                    <Trophy size={15} /> Prestasi & Level
                  </Link>
                  {user.role === 'creator' && (
                    <>
                      <Link
                        to="/creator"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-pink-300 transition-colors hover:bg-surface-800 hover:text-pink-200"
                      >
                        <Palette size={15} /> Dashboard Creator
                      </Link>
                      <Link
                        to="/creator/comics"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-300 transition-colors hover:bg-surface-800 hover:text-brand-200"
                      >
                        <BookOpen size={15} /> Kelola Komik
                      </Link>
                      <Link
                        to="/creator/earnings"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-emerald-300 transition-colors hover:bg-surface-800 hover:text-emerald-200"
                      >
                        <Banknote size={15} /> Penghasilan & Penarikan
                      </Link>
                      <Link
                        to="/creator/ai"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-violet-300 transition-colors hover:bg-surface-800 hover:text-violet-200"
                      >
                        <Sparkles size={15} /> Asisten AI
                      </Link>
                    </>
                  )}
                  {user.role === 'admin' && (
                    <>
                      <div className="border-t border-surface-800 px-4 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-surface-500">
                        Admin
                      </div>
                      <Link
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-surface-300 transition-colors hover:bg-surface-800 hover:text-surface-50"
                      >
                        <Shield size={15} /> Dashboard
                      </Link>
                      <Link
                        to="/admin/users"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-surface-300 transition-colors hover:bg-surface-800 hover:text-surface-50"
                      >
                        <User size={15} /> Pengguna
                      </Link>
                      <Link
                        to="/admin/comics"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-surface-300 transition-colors hover:bg-surface-800 hover:text-surface-50"
                      >
                        <BookOpen size={15} /> Komik
                      </Link>
                      <Link
                        to="/admin/reports"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-surface-300 transition-colors hover:bg-surface-800 hover:text-surface-50"
                      >
                        <Shield size={15} /> Laporan
                      </Link>
                    </>
                  )}
                  <div className="border-t border-surface-800 p-1.5">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                    >
                      <LogOut size={15} /> Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-surface-300 transition-colors hover:text-surface-50"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-gradient-to-r from-brand-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110"
              >
                Daftar
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-800 text-surface-300 transition-colors hover:text-surface-50 md:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-surface-800 bg-surface-950 px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-500/15 text-brand-300'
                      : 'text-surface-300 hover:bg-surface-800/60 hover:text-surface-50'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
            {user && (
              <>
                <NavLink
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-surface-300 transition-colors hover:bg-surface-800/60 hover:text-surface-50"
                >
                  <User size={16} /> Profil
                </NavLink>
                <NavLink
                  to="/wallet"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-amber-300 transition-colors hover:bg-surface-800/60 hover:text-amber-200"
                >
                  <Wallet size={16} /> Dompet ({((user.coin_balance || 0) ?? 0).toLocaleString('id-ID')} koin)
                </NavLink>
                <NavLink
                  to="/gamification"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-orange-300 transition-colors hover:bg-surface-800/60 hover:text-orange-200"
                >
                  <Trophy size={16} /> Prestasi & Level
                </NavLink>
                {user.role === 'creator' && (
                  <>
                    <NavLink
                      to="/creator"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-pink-300 transition-colors hover:bg-surface-800/60 hover:text-pink-200"
                    >
                      <Palette size={16} /> Dashboard Creator
                    </NavLink>
                    <NavLink
                      to="/creator/ai"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-violet-300 transition-colors hover:bg-surface-800/60 hover:text-violet-200"
                    >
                      <Sparkles size={16} /> Asisten AI
                    </NavLink>
                  </>
                )}
                {user.role === 'admin' && (
                  <NavLink
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-brand-300 transition-colors hover:bg-surface-800/60 hover:text-brand-200"
                  >
                    <Shield size={16} /> Admin
                  </NavLink>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10"
                >
                  <LogOut size={16} /> Keluar
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
