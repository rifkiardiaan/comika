import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Eye,
  Flag,
  Gem,
  History,
  Landmark,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Palette,
  PieChart,
  Shield,
  Tags,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { auth } from '../../services/auth'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Pengguna', icon: Users },
  { to: '/admin/vvip', label: 'VVIP & Premium', icon: Gem },
  { to: '/admin/creator-applications', label: 'Pengajuan Creator', icon: UserPlus },
  { to: '/admin/creators', label: 'Creator', icon: Palette },
  { to: '/admin/comics', label: 'Laporan Komik', icon: Flag },
  { to: '/admin/comments', label: 'Komentar', icon: MessageSquare },
  { to: '/admin/reading', label: 'Laporan Pembaca', icon: Eye },
  { to: '/admin/activities', label: 'Riwayat Aktivitas', icon: History },
  { to: '/admin/genres', label: 'Genre', icon: Tags },
  { to: '/admin/transactions', label: 'Transaksi', icon: Landmark },
  { to: '/admin/revenue', label: 'Pendapatan', icon: PieChart },
]

function SidebarContent({ onNavigate, pendingCount }: { onNavigate?: () => void; pendingCount?: number }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await auth.logout()
    navigate('/login')
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-pink-500 font-display text-lg font-bold text-white shadow-lg shadow-brand-500/30">
          C
        </span>
        <div className="leading-tight">
          <p className="font-display text-sm font-bold text-surface-50">COMIKA Admin</p>
          <p className="text-[11px] text-surface-500">Panel Moderasi</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {navItems.map(({ to, label, icon: Icon, end }) => {
          const isCreatorApp = to === '/admin/creator-applications'
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 to-pink-600 text-white shadow-lg shadow-brand-600/25'
                    : 'text-surface-300 hover:bg-surface-800/60 hover:text-surface-50'
                }`
              }
            >
              <Icon size={17} />
              {label}
              {isCreatorApp && (pendingCount ?? 0) > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                  {pendingCount}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="space-y-1 border-t border-surface-800/70 px-3 py-4">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800/60 hover:text-surface-50"
        >
          <ArrowLeft size={17} /> Kembali ke Situs
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
        >
          <LogOut size={17} /> Keluar
        </button>
      </div>
    </div>
  )
}

import { listApplications } from '../../services/creatorApplication'

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const refresh = () => {
      listApplications({ status: 'pending', per_page: 1 })
        .then((res) => setPendingCount(res.meta.total))
        .catch(() => {})
    }
    refresh()
    // Poll setiap 10 detik untuk cek perubahan dari tab lain
    const id = setInterval(refresh, 10_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex min-h-screen bg-surface-950 text-surface-100">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-surface-800/70 bg-surface-900/60 backdrop-blur lg:block">
        <SidebarContent pendingCount={pendingCount} />
      </aside>

      {/* Sidebar mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 animate-slide-up border-r border-surface-800 bg-surface-900 shadow-2xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-surface-800 hover:text-surface-50"
              aria-label="Tutup menu"
            >
              <X size={18} />
            </button>
            <SidebarContent onNavigate={() => setOpen(false)} pendingCount={pendingCount} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-60">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-surface-800/70 bg-surface-950/85 px-4 backdrop-blur-lg sm:px-6">
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-surface-300 transition-colors hover:bg-surface-800 hover:text-surface-50 lg:hidden"
            aria-label="Buka menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-brand-400" />
            <span className="text-sm font-semibold text-surface-200">Area Administrator</span>
          </div>
          <span className="ml-auto hidden items-center gap-2 rounded-full border border-brand-500/40 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-300 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Server Terhubung
          </span>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
