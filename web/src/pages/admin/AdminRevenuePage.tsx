import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Coins,
  Landmark,
  Loader2,
  PieChart,
  Save,
  Split,
  TrendingUp,
} from 'lucide-react'
import PageHeader from '../../components/admin/PageHeader'
import { Badge } from '../../components/admin/Badge'
import EmptyState from '../../components/admin/EmptyState'
import { admin, getApiErrorMessage } from '../../services/admin'
import { formatNumber, formatRupiah } from '../../utils/format'
import type { RevenueShareSettings } from '../../types'

const MIN_CREATOR_SHARE = 5
const MAX_CREATOR_SHARE = 95

export default function AdminRevenuePage() {
  const [settings, setSettings] = useState<RevenueShareSettings | null>(null)
  const [revenue, setRevenue] = useState<{
    total_revenue: number
    monthly_revenue: number
    total_coin_revenue: number
    revenue_by_comic: Array<{
      comic_id: number
      comic_title: string
      total_creator_earnings: number
      gross_revenue: number
      admin_revenue: number
      total_revenue: number
    }>
  } | null>(null)
  const [creatorShare, setCreatorShare] = useState('')
  const [coinValue, setCoinValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const initialized = useRef(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [settingsRes, revenueRes] = await Promise.all([admin.revenueSettings(), admin.revenue()])
      setSettings(settingsRes.settings)
      setRevenue(revenueRes)
      if (!initialized.current) {
        initialized.current = true
        setCreatorShare(String(Math.round(settingsRes.settings.creator_share * 100)))
        setCoinValue(String(settingsRes.settings.coin_value))
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal memuat data pendapatan.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const percent = Number(creatorShare) || 0

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setNotice('')
    if (Number.isNaN(percent) || percent < MIN_CREATOR_SHARE || percent > MAX_CREATOR_SHARE) {
      setFormError(`Persentase creator harus antara ${MIN_CREATOR_SHARE}% – ${MAX_CREATOR_SHARE}%.`)
      return
    }
    const coin = Number(coinValue) || 0
    if (coin <= 0) {
      setFormError('Nilai koin harus lebih dari 0.')
      return
    }
    setSaving(true)
    try {
      const updated = await admin.updateRevenueSettings({ creator_share: percent / 100, coin_value: coin })
      setSettings(updated)
      setNotice('Pembagian pendapatan berhasil diperbarui. Perhitungan earning berikutnya memakai persentase baru.')
      await fetchAll()
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Gagal menyimpan pengaturan pembagian pendapatan.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Pendapatan & Pembagian"
        subtitle="Kelola pendapatan dari penjualan komik berbayar dan pembagiannya antara creator dan platform"
      />

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

      {/* ====== Summary cards ====== */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-surface-800 bg-surface-900 p-5">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-surface-500">
            <TrendingUp size={13} className="text-emerald-300" /> Pendapatan Platform Total
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-surface-50">
            {loading ? '…' : formatRupiah(revenue?.total_revenue ?? 0)}
          </p>
          <p className="mt-1 text-xs text-surface-400">
            {loading ? '…' : `${(revenue?.total_coin_revenue ?? 0).toLocaleString('id-ID')} koin ter-unlock`}
          </p>
        </div>
        <div className="rounded-2xl border border-surface-800 bg-surface-900 p-5">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-surface-500">
            <TrendingUp size={13} className="text-sky-300" /> Pendapatan Bulan Ini
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-surface-50">
            {loading ? '…' : formatRupiah(revenue?.monthly_revenue ?? 0)}
          </p>
          <p className="mt-1 text-xs text-surface-400">
            share platform {loading ? '…' : `${Math.round((settings?.admin_share ?? 0) * 100)}%`}
          </p>
        </div>
        <div className="rounded-2xl border border-surface-800 bg-surface-900 p-5">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-surface-500">
            <Split size={13} className="text-violet-300" /> Pembagian Saat Ini
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-surface-50">
            {loading ? '…' : `${Math.round((settings?.creator_share ?? 0) * 100)}% : ${Math.round((settings?.admin_share ?? 0) * 100)}%`}
          </p>
          <p className="mt-1 text-xs text-surface-400">{loading ? '…' : `creator : platform · 1 koin = Rp ${settings?.coin_value ?? 0}`}</p>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* ====== Revenue share settings form ====== */}
        <section className="rounded-2xl border border-surface-800 bg-surface-900 p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-surface-50">
            <PieChart size={18} className="text-brand-300" /> Pengaturan Pembagian Pendapatan
          </h2>
          <p className="mt-1 text-sm text-surface-400">
            Atur persentase pendapatan dari setiap unlock episode premium yang dibagi antara creator dan platform
            (admin). Perubahan berlaku untuk perhitungan earning selanjutnya.
          </p>

          <form onSubmit={save} className="mt-5 space-y-4">
            <div>
              <label htmlFor="rev-share" className="mb-1.5 block text-sm font-medium text-surface-200">
                Share Creator (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="rev-share"
                  type="text"
                  inputMode="numeric"
                  value={creatorShare}
                  onChange={(e) => {
                    setCreatorShare(e.target.value.replace(/[^\d]/g, ''))
                    setFormError('')
                  }}
                  placeholder="60"
                  className="w-full rounded-xl border border-surface-800 bg-surface-950 px-4 py-3 text-sm font-semibold text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
                <span className="shrink-0 text-sm text-surface-400">%</span>
              </div>
              <p className="mt-1 text-xs text-surface-500">
                Share platform otomatis = <span className="font-semibold text-surface-300">{percent > 0 ? 100 - percent : 100}%</span>
              </p>
            </div>

            <div>
              <label htmlFor="rev-coin" className="mb-1.5 block text-sm font-medium text-surface-200">
                Nilai 1 Koin (Rp)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="rev-coin"
                  type="text"
                  inputMode="numeric"
                  value={coinValue}
                  onChange={(e) => {
                    setCoinValue(e.target.value.replace(/[^\d]/g, ''))
                    setFormError('')
                  }}
                  placeholder="100"
                  className="w-full rounded-xl border border-surface-800 bg-surface-950 px-4 py-3 text-sm font-semibold text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
                <span className="shrink-0 text-sm text-surface-400">Rp</span>
              </div>
              <p className="mt-1 text-xs text-surface-500">Dipakai untuk mengonversi koin ke nilai rupiah saat menghitung earning.</p>
            </div>

            {/* Preview per unlock */}
            {settings && percent > 0 && (
              <div className="rounded-xl border border-surface-800 bg-surface-950 p-4 text-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-surface-500">Contoh perhitungan (1 unlock, episode 50 koin)</p>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-[11px] text-surface-500">Nilai Unlock</p>
                    <p className="mt-0.5 font-display text-lg font-bold text-surface-100">
                      {formatRupiah(50 * (Number(coinValue) || 0))}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-surface-500">Creator ({percent}%)</p>
                    <p className="mt-0.5 font-display text-lg font-bold text-emerald-300">
                      {formatRupiah(50 * (Number(coinValue) || 0) * (percent / 100))}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-surface-500">Platform ({100 - percent}%)</p>
                    <p className="mt-0.5 font-display text-lg font-bold text-sky-300">
                      {formatRupiah(50 * (Number(coinValue) || 0) * ((100 - percent) / 100))}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {formError && (
              <p className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-2.5 text-sm text-red-300">
                <AlertCircle size={15} /> {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Menyimpan…' : 'Simpan Pembagian'}
            </button>
          </form>

          {settings?.updated_at && (
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-surface-800 bg-surface-950 px-3 py-1 text-[11px] text-surface-500">
              <Coins size={11} /> Terakhir diperbarui {new Date(settings.updated_at).toLocaleString('id-ID')}
            </p>
          )}
        </section>

        {/* ====== Revenue by comic ====== */}
        <section className="overflow-hidden rounded-2xl border border-surface-800 bg-surface-900">
          <div className="border-b border-surface-800 px-6 py-4">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-surface-50">
              <BookOpen size={18} className="text-sky-300" /> Pendapatan per Komik
            </h2>
            <p className="mt-0.5 text-xs text-surface-500">10 komik berpendapatan tertinggi dari penjualan episode premium</p>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16 text-surface-500">
              <Loader2 size={20} className="mr-2 animate-spin" /> Memuat pendapatan…
            </div>
          ) : (revenue?.revenue_by_comic?.length ?? 0) === 0 ? (
            <div className="p-6">
              <EmptyState message="Belum ada penjualan komik berbayar. Pendapatan muncul saat reader meng-unlock episode premium." />
            </div>
          ) : (
            <ul className="divide-y divide-surface-800/60">
              {revenue!.revenue_by_comic.map((c, i) => (
                <li key={c.comic_id} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-surface-800/30">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-800 font-display text-sm font-bold text-surface-300">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-surface-100">{c.comic_title}</p>
                    <p className="text-xs text-surface-500">
                      Gross <span className="text-sky-300">{formatRupiah(c.total_revenue ?? 0)}</span> · creator{' '}
                      <span className="text-emerald-300">{formatRupiah(c.total_creator_earnings ?? 0)}</span> · platform{' '}
                      <span className="text-violet-300">{formatRupiah(c.admin_revenue ?? 0)}</span>
                    </p>
                  </div>
                  <Badge tone="green">{formatNumber(c.total_creator_earnings ?? 0)}</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* ====== Info ====== */}
      <section className="mt-8 flex items-start gap-3 rounded-2xl border border-surface-800 bg-surface-900/50 p-5 text-sm text-surface-400">
        <Landmark size={18} className="mt-0.5 shrink-0 text-brand-300" />
        <p>
          Pendapatan platform dihitung dari total koin episode premium yang ter-<span className="text-surface-200">unlock</span> dikali{' '}
          nilai koin dan dikali share platform. Creator melihat bagiannya di <strong className="text-surface-200">Dashboard Creator → Penghasilan</strong>.
          Ubah persentase di atas untuk menyesuaikan pembagian pendapatan antara creator dan platform.
        </p>
      </section>
    </div>
  )
}