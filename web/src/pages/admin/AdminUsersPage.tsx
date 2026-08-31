import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, Ban, Coins, Loader2, Search, ShieldAlert, Trash2, Unlock } from 'lucide-react'
import Avatar from '../../components/Avatar'
import PageHeader from '../../components/admin/PageHeader'
import { RoleBadge } from '../../components/admin/Badge'
import Pagination from '../../components/admin/Pagination'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import EmptyState from '../../components/admin/EmptyState'
import { admin, getApiErrorMessage } from '../../services/admin'
import type { AdminUser, Role } from '../../types'
import { formatDate } from '../../utils/format'

const roleOptions: Array<{ value: Role | ''; label: string }> = [
  { value: '', label: 'Semua Role' },
  { value: 'reader', label: 'Pembaca' },
  { value: 'creator', label: 'Creator' },
  { value: 'admin', label: 'Admin' },
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [q, setQ] = useState('')
  const [role, setRole] = useState<Role | ''>('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [banBusyId, setBanBusyId] = useState<number | null>(null)
  const [banTarget, setBanTarget] = useState<AdminUser | null>(null)
  const [banReason, setBanReason] = useState('')
  const [permanentBanTarget, setPermanentBanTarget] = useState<AdminUser | null>(null)
  const [permanentBanReason, setPermanentBanReason] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await admin.users({ q: q || undefined, role: role || undefined, page })
      setUsers(res.data)
      setMeta(res.meta)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memuat daftar pengguna.'))
    } finally {
      setLoading(false)
    }
  }, [q, role, page])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const changeRole = async (user: AdminUser, newRole: Role) => {
    if (newRole === user.role) return
    setBusyId(user.id)
    setNotice('')
    try {
      const updated = await admin.updateUserRole(user.id, newRole)
      setUsers((list) => list.map((u) => (u.id === updated.id ? updated : u)))
      setNotice(`Role ${user.name} diubah menjadi ${newRole}.`)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal mengubah role.'))
    } finally {
      setBusyId(null)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await admin.deleteUser(deleteTarget.id)
      setNotice(`User ${deleteTarget.name} telah dihapus.`)
      setDeleteTarget(null)
      await fetchUsers()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal menghapus user.'))
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const banUser = async () => {
    if (!banTarget) return
    setBanBusyId(banTarget.id)
    setNotice('')
    try {
      await admin.banUser(banTarget.id, banReason || undefined)
      setNotice(`User ${banTarget.name} berhasil diblokir.`)
      setBanTarget(null)
      setBanReason('')
      await fetchUsers()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memblokir user.'))
    } finally {
      setBanBusyId(null)
    }
  }

  const unbanUser = async (user: AdminUser) => {
    setBanBusyId(user.id)
    setNotice('')
    try {
      await admin.unbanUser(user.id)
      setNotice(`Blokir user ${user.name} berhasil dibuka.`)
      await fetchUsers()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal membuka blokir user.'))
    } finally {
      setBanBusyId(null)
    }
  }

  const permanentBanUser = async () => {
    if (!permanentBanTarget || !permanentBanReason) return
    setBanBusyId(permanentBanTarget.id)
    setNotice('')
    try {
      await admin.permanentBanUser(permanentBanTarget.id, permanentBanReason)
      setNotice(`User ${permanentBanTarget.name} berhasil diblokir permanen.`)
      setPermanentBanTarget(null)
      setPermanentBanReason('')
      await fetchUsers()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memblokir permanen user.'))
    } finally {
      setBanBusyId(null)
    }
  }

  const resetFilters = () => {
    setQ('')
    setRole('')
    setPage(1)
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Manajemen Pengguna"
        subtitle="Kelola akun, ubah role, dan moderasi pengguna platform"
      />

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setPage(1)
          }}
          className="relative"
        >
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama, username, atau email…"
            className="w-full rounded-xl border border-surface-800 bg-surface-900 py-2 pl-9 pr-4 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 sm:w-72"
          />
        </form>
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value as Role | '')
            setPage(1)
          }}
          className="rounded-xl border border-surface-800 bg-surface-900 px-3 py-2 text-sm text-surface-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        >
          {roleOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {(q || role) && (
          <button
            onClick={resetFilters}
            className="text-xs font-medium text-surface-400 underline-offset-2 transition-colors hover:text-surface-200 hover:underline"
          >
            Reset filter
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {notice && (
        <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
          {notice}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-surface-800 bg-surface-900">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-surface-500">
            <Loader2 size={20} className="mr-2 animate-spin" /> Memuat data…
          </div>
        ) : users.length === 0 ? (
          <div className="p-6">
            <EmptyState message="Tidak ada pengguna yang cocok dengan filter." />
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead>
                  <tr className="border-b border-surface-800 text-xs uppercase tracking-wide text-surface-500">
                    <th className="px-5 py-3 font-medium">Pengguna</th>
                    <th className="px-5 py-3 font-medium">Role</th>
                    <th className="px-5 py-3 font-medium">Koin</th>
                    <th className="px-5 py-3 font-medium">Komik</th>
                    <th className="px-5 py-3 font-medium">Bergabung</th>
                    <th className="px-5 py-3 text-right font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-800/60">
                  {users.map((u) => (
                    <tr key={u.id} className="transition-colors hover:bg-surface-800/30">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} avatarUrl={u.avatar_url} size={36} className="rounded-full" />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-surface-100">{u.name}</p>
                            <p className="truncate text-xs text-surface-500">
                              @{u.username} · {u.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <RoleBadge role={u.role} />
                          <select
                            value={u.role}
                            disabled={busyId === u.id}
                            onChange={(e) => changeRole(u, e.target.value as Role)}
                            className="rounded-lg border border-surface-800 bg-surface-950 px-2 py-1 text-xs text-surface-300 focus:border-brand-500 focus:outline-none disabled:opacity-50"
                            title="Ubah role"
                          >
                            <option value="reader">Pembaca</option>
                            <option value="creator">Creator</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="flex items-center gap-1.5 text-surface-300">
                          <Coins size={14} className="text-amber-400" />
                          {u.coin_balance.toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-surface-300">{u.comics_count}</td>
                      <td className="px-5 py-3.5 text-surface-400">{formatDate(u.created_at)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          {u.is_permanently_banned && (
                            <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-300">
                              Diblokir Permanen
                            </span>
                          )}
                          {u.is_banned && !u.is_permanently_banned && (
                            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                              Diblokir
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {u.is_banned ? (
                            <button
                              onClick={() => unbanUser(u)}
                              disabled={banBusyId === u.id}
                              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/10 disabled:opacity-50"
                              title="Buka blokir"
                            >
                              {banBusyId === u.id ? <Loader2 size={14} className="animate-spin" /> : <Unlock size={14} />} Buka Blokir
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => setBanTarget(u)}
                                disabled={banBusyId === u.id}
                                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-500/10 disabled:opacity-50"
                                title="Blokir sementara"
                              >
                                <Ban size={14} /> Blokir
                              </button>
                              <button
                                onClick={() => setPermanentBanTarget(u)}
                                disabled={banBusyId === u.id}
                                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                                title="Blokir permanen"
                              >
                                <ShieldAlert size={14} /> Permanen
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setDeleteTarget(u)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
                            title="Hapus user"
                          >
                            <Trash2 size={14} /> Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile Card Layout */}
            <div className="divide-y divide-surface-800/60 md:hidden">
              {users.map((u) => (
                <div key={u.id} className="p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <Avatar name={u.name} avatarUrl={u.avatar_url} size={40} className="rounded-full" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-surface-100">{u.name}</p>
                      <p className="truncate text-xs text-surface-500">@{u.username}</p>
                    </div>
                    <RoleBadge role={u.role} />
                  </div>
                  <div className="mb-3">
                    <label className="mb-1 block text-xs text-surface-500">Role</label>
                    <select
                      value={u.role}
                      disabled={busyId === u.id}
                      onChange={(e) => changeRole(u, e.target.value as Role)}
                      className="w-full rounded-lg border border-surface-800 bg-surface-950 px-3 py-2 text-sm text-surface-300 focus:border-brand-500 focus:outline-none disabled:opacity-50"
                    >
                      <option value="reader">Pembaca</option>
                      <option value="creator">Creator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between text-xs text-surface-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Coins size={12} className="text-amber-400" /> {u.coin_balance.toLocaleString('id-ID')}</span>
                      <span>{u.comics_count} komik</span>
                      <span>{formatDate(u.created_at)}</span>
                    </div>
                    <button
                      onClick={() => setDeleteTarget(u)}
                      className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/10"
                      title="Hapus user"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {!loading && users.length > 0 && <Pagination meta={meta} onPageChange={setPage} />}

      {/* Ban Dialog */}
      <ConfirmDialog
        open={banTarget !== null}
        title="Blokir Pengguna"
        description={
          banTarget
            ? `User "${banTarget.name}" (@${banTarget.username}) akan diblokir sementara. User tidak bisa login selama blokir aktif.`
            : ''
        }
        confirmLabel="Blokir"
        loading={banBusyId !== null}
        onConfirm={banUser}
        onCancel={() => { setBanTarget(null); setBanReason('') }}
      >
        <input
          value={banReason}
          onChange={(e) => setBanReason(e.target.value)}
          placeholder="Alasan blokir (opsional)"
          className="mt-3 w-full rounded-lg border border-surface-800 bg-surface-950 px-3 py-2 text-sm text-surface-200 focus:border-brand-500 focus:outline-none"
        />
      </ConfirmDialog>

      {/* Permanent Ban Dialog */}
      <ConfirmDialog
        open={permanentBanTarget !== null}
        title="Blokir Permanen Pengguna"
        description={
          permanentBanTarget
            ? `User "${permanentBanTarget.name}" (@${permanentBanTarget.username}) akan diblokir PERMANEN. User tidak akan bisa login lagi dan semua komiknya akan dihapus. Tindakan ini tidak dapat dibatalkan.`
            : ''
        }
        confirmLabel="Blokir Permanen"
        loading={banBusyId !== null}
        onConfirm={permanentBanUser}
        onCancel={() => { setPermanentBanTarget(null); setPermanentBanReason('') }}
      >
        <input
          value={permanentBanReason}
          onChange={(e) => setPermanentBanReason(e.target.value)}
          placeholder="Alasan blokir permanen (wajib)"
          className="mt-3 w-full rounded-lg border border-surface-800 bg-surface-950 px-3 py-2 text-sm text-surface-200 focus:border-brand-500 focus:outline-none"
          required
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Hapus Pengguna"
        description={
          deleteTarget
            ? `User "${deleteTarget.name}" (@${deleteTarget.username}) beserta data terkaitnya akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`
            : ''
        }
        confirmLabel="Hapus User"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

    </div>
  )
}
