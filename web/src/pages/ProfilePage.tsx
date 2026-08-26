import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  BadgeCheck,
  Bell,
  BellOff,
  BellRing,
  BookOpen,
  Calendar,
  CheckCircle2,
  Coins,
  Crown,
  Gem,
  Loader2,
  Lock,
  LogIn,
  Mail,
  Palette,
  Shield,
  Trash2,
  User as UserIcon,
} from 'lucide-react'
import Avatar from '../components/Avatar'
import ConfirmModal from '../components/ConfirmModal'
import VvipConfetti from '../components/VvipConfetti'
import VvipCelebration from '../components/VvipCelebration'
import PageHeader from '../components/admin/PageHeader'
import { auth } from '../services/auth'
import { creator } from '../services/creator'
import { push } from '../services/push'
import { getApiErrorMessage } from '../utils/errors'
import { formatDate } from '../utils/format'
import type { CreatorProfile, User } from '../types'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(() => auth.getStoredUser())
  const [profile, setProfile] = useState<CreatorProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  // Form profil creator
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  // Form ganti password
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwFieldErrors, setPwFieldErrors] = useState<Record<string, string[]>>({})

  // Form profil akun (nama & avatar)
  const [profileName, setProfileName] = useState(() => user?.name ?? '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [deletingAvatar, setDeletingAvatar] = useState(false)
  const [showDeleteAvatarConfirm, setShowDeleteAvatarConfirm] = useState(false)

  // Web push notification (browser)
  const [pushState, setPushState] = useState<'checking' | 'unsupported' | 'on' | 'off'>('checking')
  const [pushBusy, setPushBusy] = useState(false)

  // VVIP celebration
  const [showConfetti, setShowConfetti] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [hasSeenVvip, setHasSeenVvip] = useState(() => {
    // Check if user has already seen VVIP celebration
    try {
      return localStorage.getItem(`vvip_seen_${user?.id}`) === 'true'
    } catch {
      return false
    }
  })

  const fetchProfile = useCallback(async () => {
    if (user?.role !== 'creator') return
    setLoadingProfile(true)
    try {
      const p = await creator.profile()
      setProfile(p)
      setDisplayName(p.display_name ?? '')
      setBio(p.bio ?? '')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memuat profil creator.'))
    } finally {
      setLoadingProfile(false)
    }
  }, [user])

  useEffect(() => {
    if (user?.role === 'creator') fetchProfile()
  }, [user, fetchProfile])

  // VVIP celebration effect
  useEffect(() => {
    if (user?.is_vvip && !hasSeenVvip) {
      // Show celebration after a short delay
      const timer = setTimeout(() => {
        setShowConfetti(true)
        setShowCelebration(true)
        // Mark as seen
        try {
          localStorage.setItem(`vvip_seen_${user.id}`, 'true')
        } catch {
          // ignore
        }
        setHasSeenVvip(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [user, hasSeenVvip])

  const handleCelebrationClose = () => {
    setShowCelebration(false)
    // Keep confetti running for a bit more
    setTimeout(() => setShowConfetti(false), 1000)
  }

  useEffect(() => {
    let cancelled = false
    const checkPushStatus = async () => {
      if (!push.isSupported()) {
        if (!cancelled) setPushState('unsupported')
        return
      }
      if (Notification.permission !== 'granted') {
        if (!cancelled) setPushState('off')
        return
      }
      const subscription = await push.getSubscription()
      if (!cancelled) setPushState(subscription ? 'on' : 'off')
    }
    checkPushStatus()
    return () => {
      cancelled = true
    }
  }, [])

  const handleEnablePush = async () => {
    setPushBusy(true)
    const ok = await push.enable()
    setPushBusy(false)
    if (ok) setPushState('on')
  }

  const handleDisablePush = async () => {
    setPushBusy(true)
    await push.disable()
    setPushBusy(false)
    setPushState('off')
  }

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-300">
          <UserIcon size={30} />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold text-surface-50">Masuk untuk Melihat Profil</h1>
        <p className="mt-2 text-sm text-surface-400">
          Kelola profil, peran, dan preferensi akun COMIKA kamu.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110"
        >
          <LogIn size={16} /> Masuk Sekarang
        </Link>
      </div>
    )
  }


  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setNotice('')
    if (!displayName.trim()) return setFormError('Nama tampilan wajib diisi.')
    setSaving(true)
    try {
      const updated = await creator.updateProfile({
        display_name: displayName.trim(),
        bio: bio.trim(),
      })
      setProfile(updated)
      setNotice('Profil creator berhasil diperbarui.')
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Gagal menyimpan profil.'))
    } finally {
      setSaving(false)
    }
  }

  const saveBasicProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError('')
    setNotice('')
    if (!profileName.trim()) return setProfileError('Nama wajib diisi.')
    setProfileSaving(true)
    try {
      const updated = await auth.updateProfile({ name: profileName.trim(), avatar: avatarFile })
      setNotice('Profil akun berhasil diperbarui.')
      setAvatarFile(null)
      setAvatarPreview(null)
      // Perbarui state lokal agar kartu identitas ikut berubah
      setProfileName(updated.name)
      setUser(updated)
    } catch (err) {
      setProfileError(getApiErrorMessage(err, 'Gagal menyimpan profil akun.'))
    } finally {
      setProfileSaving(false)
    }
  }

  const handleAvatarChange = (file: File | undefined) => {
    setAvatarFile(file ?? null)
    setAvatarPreview(file ? URL.createObjectURL(file) : null)
  }

  const handleDeleteAvatar = async () => {
    const hasAvatar = user.avatar_url && user.avatar_url.length > 0
    if (!hasAvatar) return
    setShowDeleteAvatarConfirm(true)
  }

  const confirmDeleteAvatar = async () => {
    setShowDeleteAvatarConfirm(false)
    setDeletingAvatar(true)
    try {
      const updated = await auth.deleteAvatar()
      setUser(updated)
      setProfileName(updated.name)
      setNotice('Avatar berhasil dihapus.')
    } catch (err) {
      setProfileError(getApiErrorMessage(err, 'Gagal menghapus avatar.'))
    } finally {
      setDeletingAvatar(false)
    }
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError('')
    setPwFieldErrors({})
    setNotice('')
    setPwSaving(true)
    try {
      const message = await auth.changePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: newPasswordConfirm,
      })
      setCurrentPassword('')
      setNewPassword('')
      setNewPasswordConfirm('')
      setNotice(message)
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
      if (anyErr.response?.data?.errors) {
        setPwFieldErrors(anyErr.response.data.errors)
      }
      setPwError(
        anyErr.response?.data?.message ??
          (err instanceof Error ? err.message : 'Gagal mengganti password.'),
      )
    } finally {
      setPwSaving(false)
    }
  }

  return (
    <>
      {/* VVIP Celebration Effects */}
      <VvipConfetti show={showConfetti} duration={5000} />
      <VvipCelebration
        show={showCelebration}
        onClose={handleCelebrationClose}
        userName={user.name}
      />

    <div className="mx-auto max-w-5xl animate-fade-in px-4 py-10 sm:px-6">
      <PageHeader title="Profil Saya" subtitle="Informasi akun dan profil creator kamu" />

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {notice && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 size={16} /> {notice}
        </div>
      )}

      {/* ====== Kartu identitas VVIP ====== */}
      {user.is_vvip ? (
        <section className="relative overflow-hidden rounded-3xl border border-purple-500/30 vvip-card-glow bg-gradient-to-br from-purple-900/40 via-surface-900 to-pink-900/30 p-8">
          {/* Decorative elements */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-pink-500/15 blur-3xl" />
          <div className="pointer-events-none absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
          
          {/* VVIP Badge Header */}
          <div className="mb-6 flex items-center justify-center">
            <div className="badge-vvip-gradient flex items-center gap-2 rounded-full px-5 py-2 shadow-xl">
              <Gem size={16} className="text-white animate-pulse" />
              <span className="text-sm font-bold text-white tracking-wider uppercase">VVIP Member</span>
              <Gem size={16} className="text-white animate-pulse" />
            </div>
          </div>

          <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            {/* Avatar with glow */}
            <div className="relative">
              <div className="avatar-vvip-glow">
                <Avatar name={user.name} avatarUrl={user.avatar_url} size={100} className="shadow-2xl shadow-purple-500/30" />
              </div>
              {user.avatar_url && (
                <button
                  type="button"
                  onClick={handleDeleteAvatar}
                  disabled={deletingAvatar}
                  title="Hapus foto profil"
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface-900 bg-red-500 text-white shadow-lg transition-colors hover:bg-red-600 disabled:opacity-60"
                >
                  {deletingAvatar ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                </button>
              )}
            </div>

            {/* User info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h2 className="font-display text-3xl font-bold text-surface-50">{user.name}</h2>
                <RoleChip role={user.role} />
                {profile?.is_verified && (
                  <span className="flex items-center gap-1 rounded-full border border-sky-500/40 bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-sky-300">
                    <BadgeCheck size={12} /> Terverifikasi
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-purple-300/80">@{user.username}</p>
              
              <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-surface-400 sm:justify-start">
                <span className="flex items-center gap-1.5">
                  <Mail size={13} /> {user.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} /> Bergabung {formatDate(user.created_at)}
                </span>
                <span className="flex items-center gap-1.5 text-amber-300">
                  <Coins size={13} /> {(user.coin_balance ?? 0).toLocaleString('id-ID')} koin
                </span>
              </div>

              {/* VVIP Expiry */}
              {user.vvip_until && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2">
                  <Gem size={14} className="text-purple-400" />
                  <span className="text-sm text-purple-200">
                    VVIP aktif sampai <strong>{new Date(user.vvip_until).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* VVIP Benefits */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: '🎨', label: 'Bebas Iklan', desc: 'Baca tanpa gangguan' },
              { icon: '📚', label: 'Semua Episode', desc: 'Akses gratis semua eps' },
              { icon: '💎', label: 'Badge Eksklusif', desc: 'Tanda VVIP kamu' },
              { icon: '⭐', label: 'Fitur Eksklusif', desc: 'Akses fitur terbaru' },
            ].map((benefit, i) => (
              <div key={i} className="rounded-xl border border-purple-500/20 bg-purple-900/20 p-3 text-center transition-all hover:border-purple-500/40 hover:bg-purple-900/30">
                <span className="text-2xl">{benefit.icon}</span>
                <p className="mt-1 text-xs font-bold text-purple-200">{benefit.label}</p>
                <p className="text-[10px] text-purple-300/60">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </section>
      ) : (
      /* ====== Kartu identitas Regular ====== */
      <section className="relative overflow-hidden rounded-3xl border border-surface-800 bg-gradient-to-br from-brand-900/40 via-surface-900 to-surface-900 p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-brand-500/15 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="relative">
            <Avatar name={user.name} avatarUrl={user.avatar_url} size={80} className="shadow-xl shadow-brand-500/30" />
            {user.avatar_url && (
              <button
                type="button"
                onClick={handleDeleteAvatar}
                disabled={deletingAvatar}
                title="Hapus foto profil"
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface-900 bg-red-500 text-white shadow-lg transition-colors hover:bg-red-600 disabled:opacity-60"
              >
                {deletingAvatar ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
              </button>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-2xl font-bold text-surface-50">{user.name}</h2>
              <RoleChip role={user.role} />
              {user.is_premium && (
                <span className="badge-premium inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-gradient-to-r from-amber-500/15 to-orange-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                  <Crown size={12} /> Premium
                </span>
              )}
              {profile?.is_verified && (
                <span className="flex items-center gap-1 rounded-full border border-sky-500/40 bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-sky-300">
                  <BadgeCheck size={12} /> Terverifikasi
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-surface-400">@{user.username}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-surface-400">
              <span className="flex items-center gap-1.5">
                <Mail size={13} /> {user.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={13} /> Bergabung {formatDate(user.created_at)}
              </span>
              <span className="flex items-center gap-1.5 text-amber-300">
                <Coins size={13} /> {(user.coin_balance ?? 0).toLocaleString('id-ID')} koin
              </span>
              {user.is_premium && user.premium_until && (
                <span className="flex items-center gap-1.5 text-amber-300">
                  <Crown size={13} /> Premium aktif sampai {new Date(user.premium_until).toLocaleDateString('id-ID')}
                </span>
              )}
            </div>
            {/* Upgrade CTA */}
            <Link
              to="/premium"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition-all hover:brightness-110"
            >
              <Gem size={14} /> Upgrade ke VVIP
            </Link>
          </div>
        </div>
      </section>
      )}

      {/* ====== Aksi akun ====== */}
      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <AccountLink to="/wallet" icon={<Coins size={18} className="text-amber-300" />} title="Dompet Koin" desc="Top-up & riwayat transaksi" />
        <AccountLink to="/history" icon={<BookOpen size={18} className="text-brand-300" />} title="Riwayat Baca" desc="Lanjutkan baca komik" />
        {user.role === 'creator' ? (
          <AccountLink to="/creator" icon={<Palette size={18} className="text-pink-300" />} title="Dashboard Creator" desc="Kelola komik & episode" />
        ) : (
          <AccountLink to="/creator" icon={<Lock size={18} className="text-surface-500" />} title="Jadi Creator" desc="Peran creator diatur admin" />
        )}
      </section>

      {/* ====== Profil creator ====== */}
      {user.role === 'creator' && (
        <section className="mt-10 rounded-2xl border border-surface-800 bg-surface-900 p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-surface-50">
            <Palette size={18} className="text-pink-300" /> Profil Creator
          </h2>
          <p className="mt-1 text-sm text-surface-400">
            Nama tampilan dan bio akan ditampilkan di halaman publik karya kamu.
          </p>

          {loadingProfile ? (
            <div className="flex items-center justify-center py-10 text-surface-500">
              <Loader2 size={18} className="mr-2 animate-spin" /> Memuat profil…
            </div>
          ) : (
            <form onSubmit={saveProfile} className="mt-5 max-w-lg space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-surface-200">Nama Tampilan</label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={80}
                  placeholder="Nama studio atau alias kamu"
                  className="w-full rounded-xl border border-surface-800 bg-surface-950 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-surface-200">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  placeholder="Ceritakan tentang karya dan dirimu…"
                  className="w-full resize-none rounded-xl border border-surface-800 bg-surface-950 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>

              {formError && (
                <p className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-2.5 text-sm text-red-300">
                  <AlertCircle size={15} /> {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                {saving ? 'Menyimpan…' : 'Simpan Profil Creator'}
              </button>
            </form>
          )}
        </section>
      )}

      {/* ====== Profil akun (nama & avatar) ====== */}
      <section className="mt-10 rounded-2xl border border-surface-800 bg-surface-900 p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-surface-50">
          <UserIcon size={18} className="text-brand-300" /> Profil Akun
        </h2>
        <p className="mt-1 text-sm text-surface-400">
          Nama tampilan dan avatar akan terlihat di komentar serta seluruh aplikasi.
        </p>

        <form onSubmit={saveBasicProfile} className="mt-5 max-w-lg space-y-4" noValidate>
          {/* Preview avatar + upload */}
          <div className="flex items-center gap-4">
            <Avatar
              name={profileName}
              avatarUrl={avatarPreview ?? user.avatar_url}
              size={72}
              className="shadow-lg shadow-black/30"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-surface-700 bg-surface-950 px-4 py-2.5 text-sm font-medium text-surface-200 transition-colors hover:border-brand-500/60 hover:text-surface-50">
                  {avatarFile ? <CheckCircle2 size={15} className="text-emerald-400" /> : <UserIcon size={15} />}
                  {avatarFile ? 'Ganti Foto (baru dipilih)' : 'Pilih Foto Avatar'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleAvatarChange(e.target.files?.[0])}
                  />
                </label>
                {user.avatar_url && (
                  <button
                    type="button"
                    onClick={handleDeleteAvatar}
                    disabled={deletingAvatar}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/5 px-3 py-2.5 text-sm font-medium text-red-400 transition-colors hover:border-red-500/60 hover:bg-red-500/10 disabled:opacity-60"
                  >
                    {deletingAvatar ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    Hapus
                  </button>
                )}
              </div>
              <p className="mt-1.5 text-[11px] text-surface-500">
                JPEG, PNG, atau WebP — maksimal 2MB
              </p>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-surface-200">Nama Tampilan</label>
            <input
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              maxLength={100}
              placeholder="Nama yang ditampilkan publik"
              className="w-full rounded-xl border border-surface-800 bg-surface-950 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>

          {profileError && (
            <p className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-2.5 text-sm text-red-300">
              <AlertCircle size={15} /> {profileError}
            </p>
          )}

          <button
            type="submit"
            disabled={profileSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {profileSaving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
            {profileSaving ? 'Menyimpan…' : 'Simpan Profil Akun'}
          </button>
        </form>
      </section>

      {/* ====== Notifikasi browser (web push) ====== */}
      <section className="mt-10 rounded-2xl border border-surface-800 bg-surface-900 p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-surface-50">
          <BellRing size={18} className="text-brand-300" /> Notifikasi Browser
        </h2>
        <p className="mt-1 text-sm text-surface-400">
          Terima notifikasi langsung di browser walau tab COMIKA sedang ditutup — episode baru,
          balasan komentar, dan info transaksi.
        </p>

        {pushState === 'checking' ? (
          <div className="mt-5 flex items-center gap-2 text-sm text-surface-500">
            <Loader2 size={15} className="animate-spin" /> Memeriksa status…
          </div>
        ) : pushState === 'unsupported' ? (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-surface-800 bg-surface-950 px-4 py-3 text-sm text-surface-400">
            <AlertCircle size={15} className="mt-0.5 shrink-0 text-amber-300" />
            Browser kamu tidak mendukung web push. Gunakan Chrome, Edge, atau Firefox versi terbaru.
          </div>
        ) : (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-surface-800 bg-surface-950 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  pushState === 'on' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-surface-800 text-surface-400'
                }`}
              >
                {pushState === 'on' ? <Bell size={16} /> : <BellOff size={16} />}
              </span>
              <div>
                <p className="text-sm font-semibold text-surface-100">
                  {pushState === 'on' ? 'Notifikasi aktif' : 'Notifikasi nonaktif'}
                </p>
                <p className="text-xs text-surface-400">
                  {pushState === 'on'
                    ? 'Push akan dikirim ke browser ini.'
                    : 'Aktifkan untuk menerima notifikasi browser.'}
                </p>
              </div>
            </div>

            {pushState === 'on' ? (
              <button
                type="button"
                onClick={handleDisablePush}
                disabled={pushBusy}
                className="inline-flex items-center gap-2 rounded-xl border border-surface-700 bg-surface-900 px-5 py-2.5 text-sm font-semibold text-surface-200 transition-colors hover:border-red-500/50 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pushBusy ? <Loader2 size={15} className="animate-spin" /> : <BellOff size={15} />}
                {pushBusy ? 'Memproses…' : 'Nonaktifkan'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleEnablePush}
                disabled={pushBusy}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pushBusy ? <Loader2 size={15} className="animate-spin" /> : <Bell size={15} />}
                {pushBusy ? 'Memproses…' : 'Aktifkan Notifikasi'}
              </button>
            )}
          </div>
        )}
      </section>

      {/* ====== Ganti password ====== */}
      <section className="mt-10 rounded-2xl border border-surface-800 bg-surface-900 p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-surface-50">
          <Lock size={18} className="text-brand-300" /> Ganti Password
        </h2>
        <p className="mt-1 text-sm text-surface-400">
          Perbarui password akun kamu. Sesi di perangkat lain akan otomatis keluar.
        </p>

        <form
          onSubmit={changePassword}
          className="mt-5 max-w-lg space-y-4"
          noValidate
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-surface-200">Password Saat Ini</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full rounded-xl border bg-surface-950 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 ${
                pwFieldErrors.current_password
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                  : 'border-surface-800 focus:border-brand-500 focus:ring-brand-500/30'
              }`}
            />
            {pwFieldErrors.current_password && (
              <p className="mt-1 text-xs text-red-400">{pwFieldErrors.current_password[0]}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-surface-200">Password Baru</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="w-full rounded-xl border border-surface-800 bg-surface-950 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-surface-200">Konfirmasi Password Baru</label>
              <input
                type="password"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                placeholder="Ulangi password baru"
                className="w-full rounded-xl border border-surface-800 bg-surface-950 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </div>
          </div>
          {pwFieldErrors.password && (
            <p className="text-xs text-red-400">{pwFieldErrors.password[0]}</p>
          )}

          {pwError && (
            <p className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-2.5 text-sm text-red-300">
              <AlertCircle size={15} /> {pwError}
            </p>
          )}

          <button
            type="submit"
            disabled={pwSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pwSaving ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
            {pwSaving ? 'Menyimpan…' : 'Ganti Password'}
          </button>
        </form>
      </section>

      {/* ====== Info keamanan ====== */}
      <section className="mt-8 flex items-start gap-3 rounded-2xl border border-surface-800 bg-surface-900/50 p-5 text-sm text-surface-400">
        <Shield size={18} className="mt-0.5 shrink-0 text-brand-300" />
        <p>
          Akun kamu dilindungi autentikasi token (Sanctum). Perubahan peran akun dikelola oleh admin platform —
          hubungi tim COMIKA jika kamu ingin menjadi creator.
        </p>
      </section>

      {/* Confirm delete avatar modal */}
      <ConfirmModal
        open={showDeleteAvatarConfirm}
        title="Hapus Foto Profil?"
        message="Foto profil akan dihapus dan diganti dengan inisial nama. Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus"
        variant="danger"
        onConfirm={confirmDeleteAvatar}
        onCancel={() => setShowDeleteAvatarConfirm(false)}
      />
    </div>
    </>
  )
}

function RoleChip({ role }: { role: User['role'] }) {
  const styles: Record<User['role'], string> = {
    reader: 'border-surface-700 bg-surface-800 text-surface-300',
    creator: 'border-pink-500/40 bg-pink-500/10 text-pink-300',
    admin: 'border-brand-500/40 bg-brand-500/10 text-brand-300',
  }
  const labels: Record<User['role'], string> = { reader: 'Pembaca', creator: 'Creator', admin: 'Admin' }
  return (
    <span className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${styles[role]}`}>
      {role === 'admin' ? <Shield size={11} /> : role === 'creator' ? <Palette size={11} /> : <UserIcon size={11} />}
      {labels[role]}
    </span>
  )
}

function AccountLink({ to, icon, title, desc }: { to: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-2xl border border-surface-800 bg-surface-900 p-5 transition-all hover:border-brand-500/50 hover:bg-surface-800/60"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-800 transition-colors group-hover:bg-surface-800/80">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-surface-100">{title}</p>
        <p className="truncate text-xs text-surface-400">{desc}</p>
      </div>
    </Link>
  )
}
