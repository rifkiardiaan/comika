import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Palette, Send, CheckCircle, Clock, AlertCircle, ArrowLeft, PenTool, DollarSign, BarChart3, Loader2 } from 'lucide-react'
import { auth } from '../services/auth'
import { submitApplication, getMyApplication } from '../services/creatorApplication'
import type { CreatorApplication } from '../services/creatorApplication'

const benefits = [
  {
    icon: PenTool,
    title: 'Terbitkan Komik',
    description: 'Upload dan kelola komikmu sendiri di platform COMIKA',
  },
  {
    icon: DollarSign,
    title: 'Monetisasi',
    description: 'Hasilkan uang dari karya komikmu melalui episode premium',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Pantau statistik pembaca, rating, dan performa komikmu',
  },
]

export default function BecomeCreatorPage() {
  const user = auth.getStoredUser()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error' | 'already_creator' | 'already_applied' | 'approved' | 'rejected' | 'loading'>('loading')
  const [formData, setFormData] = useState({ portfolio_url: '', bio: '', reason: '', experience: '' })
  const [errorMsg, setErrorMsg] = useState('')
  const [myApp, setMyApp] = useState<CreatorApplication | null>(null)

  // Check user role + fetch existing application
  useEffect(() => {
    if (!user) { setStatus('idle'); return }
    if (user.role === 'creator') { setStatus('already_creator'); return }
    if (user.role === 'admin') { setStatus('idle'); return }

    getMyApplication()
      .then((res) => {
        if (res.data) {
          setMyApp(res.data)
          if (res.data.status === 'pending') setStatus('already_applied')
          else if (res.data.status === 'approved') setStatus('approved')
          else if (res.data.status === 'rejected') setStatus('rejected')
          else setStatus('idle')
        } else {
          setStatus('idle')
        }
      })
      .catch(() => setStatus('idle'))
  }, [user])

  // Already creator
  if (status === 'already_creator') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/15">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <h1 className="text-2xl font-extrabold">Kamu sudah Creator!</h1>
          <p className="mt-2 text-sm text-surface-400">Akun kamu sudah berstatus creator. Mulai terbitkan komikmu sekarang.</p>
          <Link to="/creator" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-500">
            <Palette size={18} /> Buka Dashboard Creator
          </Link>
        </div>
      </div>
    )
  }

  // Admin redirect
  if (user?.role === 'admin') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/15">
            <Palette size={32} className="text-brand-400" />
          </div>
          <h1 className="text-2xl font-extrabold">Area Admin</h1>
          <p className="mt-2 text-sm text-surface-400">Sebagai admin, kamu bisa mengelola pengajuan creator dari panel admin.</p>
          <Link to="/admin/creator-applications" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-500">
            <Palette size={18} /> Buka Panel Admin
          </Link>
        </div>
      </div>
    )
  }

  // Not logged in
  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/15">
            <Palette size={32} className="text-brand-400" />
          </div>
          <h1 className="text-2xl font-extrabold">Jadi Creator COMIKA</h1>
          <p className="mt-2 text-sm text-surface-400">Masuk atau daftar akun terlebih dahulu untuk mengajukan menjadi creator.</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link to="/login" className="rounded-xl border border-surface-700 px-5 py-2.5 text-sm font-semibold text-surface-200 transition-colors hover:bg-surface-800">Masuk</Link>
            <Link to="/register" className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-500">Daftar Gratis</Link>
          </div>
        </div>
      </div>
    )
  }

  // Loading
  if (status === 'loading') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 size={24} className="animate-spin text-brand-400" />
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')

    try {
      await submitApplication({
        bio: formData.bio,
        reason: formData.reason,
        experience: formData.experience || undefined,
        portfolio_url: formData.portfolio_url || undefined,
      })
      setStatus('success')
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string } } }
      setErrorMsg(anyErr.response?.data?.message ?? 'Gagal mengirim pengajuan. Coba lagi.')
      setStatus('error')
    }
  }

  // Application approved
  if (status === 'approved' && myApp) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/15">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-green-300">🎉 Selamat! Kamu Telah Disetujui Menjadi Creator!</h1>
          <p className="mt-2 max-w-md mx-auto text-sm text-surface-400">
            Pengajuanmu telah disetujui oleh admin. Sekarang kamu bisa mulai menerbitkan komikmu di COMIKA! Mulai berkarya dan jadilah creator yang hebat! 🚀
          </p>
          <div className="mt-4 rounded-xl border border-green-500/30 bg-green-500/5 p-4 text-left">
            <p className="text-xs font-semibold uppercase text-green-400">Status Pengajuan</p>
            <p className="mt-1 text-sm font-bold text-green-300">Disetujui ✅</p>
            <p className="mt-1 text-xs text-surface-500">Diajukan: {new Date(myApp.created_at).toLocaleString('id-ID')}</p>
            {myApp.reviewed_at && (
              <p className="mt-0.5 text-xs text-surface-500">Ditinjau: {new Date(myApp.reviewed_at).toLocaleString('id-ID')}</p>
            )}
            {myApp.reviewer && (
              <p className="mt-0.5 text-xs text-surface-500">Ditinjau oleh: {myApp.reviewer.name}</p>
            )}
          </div>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link to="/creator" className="rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-green-500">
              <Palette size={16} className="mr-1.5 inline" /> Buka Dashboard Creator
            </Link>
            <button onClick={() => navigate(-1)} className="rounded-xl border border-surface-700 px-5 py-2.5 text-sm font-semibold text-surface-200 transition-colors hover:bg-surface-800">
              <ArrowLeft size={16} className="mr-1.5 inline" /> Kembali
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Application rejected
  if (status === 'rejected' && myApp) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15">
            <AlertCircle size={32} className="text-amber-400" />
          </div>
          <h1 className="text-2xl font-extrabold">Tetap Semangat! Lain Kali Pasti Bisa! 💪</h1>
          <p className="mt-2 max-w-md mx-auto text-sm text-surface-400">
            Sayangnya pengajuanmu belum bisa diterima saat ini. Jangan berhenti berkarya ya! Kamu bisa mengajukan lagi setelah memperbaiki beberapa hal berikut.
          </p>
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-left">
            <p className="text-xs font-semibold uppercase text-amber-400">Status Pengajuan</p>
            <p className="mt-1 text-sm font-bold text-amber-300">Ditolak</p>
            <p className="mt-1 text-xs text-surface-500">Diajukan: {new Date(myApp.created_at).toLocaleString('id-ID')}</p>
            {myApp.reviewed_at && (
              <p className="mt-0.5 text-xs text-surface-500">Ditinjau: {new Date(myApp.reviewed_at).toLocaleString('id-ID')}</p>
            )}
            {myApp.reviewer && (
              <p className="mt-0.5 text-xs text-surface-500">Ditinjau oleh: {myApp.reviewer.name}</p>
            )}
            {myApp.review_note && (
              <div className="mt-3 rounded-lg bg-surface-800/50 p-3">
                <p className="text-xs font-semibold text-surface-400">Catatan dari reviewer:</p>
                <p className="mt-1 text-sm text-surface-300">{myApp.review_note}</p>
              </div>
            )}
          </div>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button onClick={() => { setMyApp(null); setStatus('idle'); }} className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-500">
              <Send size={16} className="mr-1.5 inline" /> Ajukan Ulang
            </button>
            <button onClick={() => navigate(-1)} className="rounded-xl border border-surface-700 px-5 py-2.5 text-sm font-semibold text-surface-200 transition-colors hover:bg-surface-800">
              <ArrowLeft size={16} className="mr-1.5 inline" /> Kembali
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Success / already applied
  if (status === 'success' || status === 'already_applied') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15">
            <Clock size={32} className="text-amber-400" />
          </div>
          <h1 className="text-2xl font-extrabold">
            {status === 'already_applied' ? 'Pengajuan Sudah Dikirim' : 'Pengajuan Terkirim!'}
          </h1>
          <p className="mt-2 max-w-md mx-auto text-sm text-surface-400">
            {status === 'already_applied'
              ? 'Kamu sudah mengajukan menjadi creator sebelumnya. Tim kami sedang meninjau pengajuanmu.'
              : 'Pengajuanmu berhasil dikirim! Tim kami akan meninjau dalam 1-3 hari kerja.'}
          </p>
          {myApp && (
            <div className="mt-4 rounded-xl border border-surface-800 bg-surface-900 p-4 text-left">
              <p className="text-xs font-semibold uppercase text-surface-500">Status Pengajuan</p>
              <p className="mt-1 text-sm font-bold text-amber-300 capitalize">{myApp.status === 'pending' ? 'Menunggu' : myApp.status}</p>
              <p className="mt-1 text-xs text-surface-500">Diajukan: {new Date(myApp.created_at).toLocaleString('id-ID')}</p>
              {myApp.review_note && (
                <p className="mt-2 text-xs text-surface-400">Catatan: {myApp.review_note}</p>
              )}
            </div>
          )}
          <div className="mt-6 flex items-center justify-center gap-3">
            <button onClick={() => navigate(-1)} className="rounded-xl border border-surface-700 px-5 py-2.5 text-sm font-semibold text-surface-200 transition-colors hover:bg-surface-800">
              <ArrowLeft size={16} className="mr-1.5 inline" /> Kembali
            </button>
            <Link to="/" className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-500">Ke Beranda</Link>
          </div>
        </div>
      </div>
    )
  }

  // Application form
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1.5 text-sm text-surface-400 transition-colors hover:text-surface-200">
          <ArrowLeft size={16} /> Kembali
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-pink-500">
            <Palette size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold">Jadi Creator COMIKA</h1>
            <p className="text-xs text-surface-400">Ajukan dirimu dan mulai terbitkan komik</p>
          </div>
        </div>
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {benefits.map((b) => (
          <div key={b.title} className="rounded-xl border border-surface-800 bg-surface-900 p-4 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/15">
              <b.icon size={20} className="text-brand-400" />
            </div>
            <h3 className="text-sm font-bold">{b.title}</h3>
            <p className="mt-1 text-xs text-surface-400">{b.description}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl border border-surface-800 bg-surface-900 p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-surface-400">Formulir Pengajuan</h2>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-surface-200">Bio Singkat *</label>
            <textarea required rows={3} maxLength={300} value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Ceritakan tentang dirimu dan minatmu di dunia komik..." className="w-full rounded-lg border border-surface-700 bg-surface-800 px-3 py-2.5 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
            <p className="mt-1 text-right text-[11px] text-surface-500">{formData.bio.length}/300</p>
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-surface-200">Mengapa ingin jadi Creator? *</label>
            <textarea required rows={3} maxLength={500} value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} placeholder="Jelaskan motivasi kamu untuk menjadi creator di COMIKA..." className="w-full rounded-lg border border-surface-700 bg-surface-800 px-3 py-2.5 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
            <p className="mt-1 text-right text-[11px] text-surface-500">{formData.reason.length}/500</p>
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-surface-200">Pengalaman Menggambar/Menulis</label>
            <textarea rows={2} maxLength={300} value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} placeholder="Opsional: ceritakan pengalamanmu dalam menggambar atau menulis cerita..." className="w-full rounded-lg border border-surface-700 bg-surface-800 px-3 py-2.5 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-surface-200">Link Portfolio (opsional)</label>
            <input type="url" value={formData.portfolio_url} onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })} placeholder="https://instagram.com/karyakamu atau link portfolio lainnya" className="w-full rounded-lg border border-surface-700 bg-surface-800 px-3 py-2.5 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
          </div>
        </div>

        {status === 'error' && errorMsg && (
          <div className="flex items-start gap-2 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {errorMsg}
          </div>
        )}

        <button type="submit" disabled={status === 'submitting'} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60">
          {status === 'submitting' ? (
            <><Loader2 size={16} className="animate-spin" /> Mengirim...</>
          ) : (
            <><Send size={16} /> Kirim Pengajuan</>
          )}
        </button>

        <p className="text-center text-xs text-surface-500">Pengajuan akan ditinjau oleh admin dalam 1-3 hari kerja.</p>
      </form>
    </div>
  )
}
