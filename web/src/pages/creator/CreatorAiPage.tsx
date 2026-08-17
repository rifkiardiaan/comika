import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  BookOpen,
  Check,
  Copy,
  FileText,
  Lightbulb,
  Loader2,
  Lock,
  Sparkles,
  Tag,
  UserRound,
  Wand2,
} from 'lucide-react'
import PageHeader from '../../components/admin/PageHeader'
import { auth } from '../../services/auth'
import { ai } from '../../services/ai'
import { getApiErrorMessage } from '../../utils/errors'
import type { AiCharacterResult, AiGenresTagsResult, AiOutlineResult, AiSynopsisResult, AiTitleResult } from '../../types'

type ToolKey = 'titles' | 'synopsis' | 'genresTags' | 'character' | 'outline'

const tools: Array<{ key: ToolKey; label: string; icon: React.ReactNode; desc: string }> = [
  { key: 'titles', label: 'Judul', icon: <Lightbulb size={16} />, desc: 'Ide judul komik' },
  { key: 'synopsis', label: 'Sinopsis', icon: <FileText size={16} />, desc: 'Ringkasan cerita' },
  { key: 'genresTags', label: 'Genre & Tag', icon: <Tag size={16} />, desc: 'Kategori & kata kunci' },
  { key: 'character', label: 'Karakter', icon: <UserRound size={16} />, desc: 'Konsep tokoh' },
  { key: 'outline', label: 'Outline', icon: <BookOpen size={16} />, desc: 'Alur episode' },
]

/** Input umum untuk semua tool. */
interface AiForm {
  title: string
  topic: string
  synopsis: string
  keywords: string
  role: string
  genres: string
  count: string
}

const emptyForm: AiForm = { title: '', topic: '', synopsis: '', keywords: '', role: 'protagonis', genres: '', count: '5' }

export default function CreatorAiPage() {
  const [user] = useState(() => auth.getStoredUser())
  const [configured, setConfigured] = useState<boolean | null>(null)
  const [active, setActive] = useState<ToolKey>('titles')
  const [form, setForm] = useState<AiForm>(emptyForm)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')

  const [titles, setTitles] = useState<string[]>([])
  const [synopsis, setSynopsis] = useState('')
  const [genresTags, setGenresTags] = useState<AiGenresTagsResult | null>(null)
  const [character, setCharacter] = useState<AiCharacterResult['character'] | null>(null)
  const [outline, setOutline] = useState<AiOutlineResult['outline']>([])

  useEffect(() => {
    ai
      .status()
      .then((res) => setConfigured(res.configured))
      .catch(() => setConfigured(false))
  }, [])

  const set = <K extends keyof AiForm>(key: K, value: AiForm[K]) => setForm((f) => ({ ...f, [key]: value }))

  const genresList = useMemo(
    () =>
      form.genres
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean)
        .slice(0, 10),
    [form.genres],
  )

  const run = async () => {
    setLoading(true)
    setError('')
    setCopied('')

    try {
      if (active === 'titles') {
        const res: AiTitleResult = await ai.titles({
          topic: form.topic || undefined,
          synopsis: form.synopsis || undefined,
          genres: genresList.length ? genresList : undefined,
          keywords: form.keywords || undefined,
          count: Number(form.count) || undefined,
        })
        setTitles(res.titles)
      } else if (active === 'synopsis') {
        const res: AiSynopsisResult = await ai.synopsis({
          title: form.title || undefined,
          topic: form.topic || undefined,
          genres: genresList.length ? genresList : undefined,
          keywords: form.keywords || undefined,
        })
        setSynopsis(res.synopsis)
      } else if (active === 'genresTags') {
        const res: AiGenresTagsResult = await ai.genresTags({
          title: form.title || undefined,
          synopsis: form.synopsis || undefined,
          topic: form.topic || undefined,
        })
        setGenresTags(res)
      } else if (active === 'character') {
        const res: AiCharacterResult = await ai.character({
          role: form.role || undefined,
          genres: genresList.length ? genresList : undefined,
          topic: form.topic || undefined,
        })
        setCharacter(res.character)
      } else if (active === 'outline') {
        const res: AiOutlineResult = await ai.outline({
          title: form.title || undefined,
          synopsis: form.synopsis || undefined,
          genres: genresList.length ? genresList : undefined,
          count: Number(form.count) || undefined,
        })
        setOutline(res.outline)
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gagal membuat konten AI. Coba lagi.'))
    } finally {
      setLoading(false)
    }
  }

  const copyText = (key: string, text: string) => {
    if (!text) return
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(key)
        setTimeout(() => setCopied(''), 1500)
      },
      () => {},
    )
  }

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-300">
          <Sparkles size={30} />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold text-surface-50">Masuk untuk Menggunakan Asisten AI</h1>
        <p className="mt-2 text-sm text-surface-400">
          Asisten AI membantu creator menyusun judul, sinopsis, dan outline komik lebih cepat.
        </p>
        <Link
          to="/login"
          className="mt-6 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110"
        >
          Masuk Sekarang
        </Link>
      </div>
    )
  }

  if (user.role !== 'creator') {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300">
          <Lock size={30} />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold text-surface-50">Khusus Creator</h1>
        <p className="mt-2 text-sm text-surface-400">Asisten AI hanya tersedia untuk akun dengan peran creator.</p>
        <Link
          to="/"
          className="mt-6 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110"
        >
          Kembali ke Beranda
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl animate-fade-in px-4 py-10 sm:px-6">
      <PageHeader
        title="Asisten AI"
        subtitle="Buat judul, sinopsis, genre, karakter, dan outline komik dengan bantuan AI"
        actions={
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold ${
              configured
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : 'border-surface-700 bg-surface-900 text-surface-400'
            }`}
            title={configured ? 'AI online — memakai LLM yang dikonfigurasi' : 'Mode bawaan — generator template tanpa API'}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${configured ? 'bg-emerald-400' : 'bg-surface-500'}`} />
            {configured === null ? 'Memeriksa…' : configured ? 'AI Aktif' : 'Mode Bawaan'}
          </span>
        }
      />

      {!configured && (
        <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-surface-800 bg-surface-900/60 px-4 py-3 text-sm text-surface-400">
          <Sparkles size={15} className="mt-0.5 shrink-0 text-brand-300" />
          <p>
            AI API belum dikonfigurasi — hasil dibuat oleh generator template bawaan (tanpa API). Untuk hasil yang lebih
            kreatif, isi <code className="rounded bg-surface-800 px-1.5 py-0.5 text-xs text-brand-200">AI_API_KEY</code>{' '}
            di <code className="rounded bg-surface-800 px-1.5 py-0.5 text-xs text-brand-200">backend/.env</code> dengan
            kunci OpenAI-compatible.
          </p>
        </div>
      )}

      {/* ====== Tool tabs ====== */}
      <div className="flex flex-wrap gap-2">
        {tools.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setActive(t.key)
              setError('')
              setCopied('')
            }}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
              active === t.key
                ? 'border-brand-500/60 bg-gradient-to-r from-brand-600/20 to-pink-600/20 text-brand-200 shadow-lg shadow-brand-600/10'
                : 'border-surface-800 bg-surface-900 text-surface-300 hover:border-surface-700 hover:text-surface-50'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ====== Form per tool ====== */}
      <div className="mt-6 rounded-2xl border border-surface-800 bg-surface-900 p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-surface-50">
          {tools.find((t) => t.key === active)?.icon}
          {tools.find((t) => t.key === active)?.label}
        </h2>
        <p className="mt-1 text-sm text-surface-400">{tools.find((t) => t.key === active)?.desc}</p>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            run()
          }}
          className="mt-5 space-y-4"
        >
          {(active === 'synopsis' || active === 'genresTags' || active === 'outline') && (
            <Field label="Judul">
              <input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Judul komik (boleh kosong)"
                maxLength={120}
                className={inputCls}
              />
            </Field>
          )}

          {(active === 'titles' || active === 'synopsis' || active === 'genresTags' || active === 'character') && (
            <Field label="Tema / Topik">
              <input
                value={form.topic}
                onChange={(e) => set('topic', e.target.value)}
                placeholder="Contoh: prajurit di dunia sihir, cinta di kampus, detektif masa depan…"
                maxLength={255}
                className={inputCls}
              />
            </Field>
          )}

          {(active === 'titles' || active === 'synopsis' || active === 'genresTags' || active === 'outline') && (
            <Field label="Sinopsis / Deskripsi">
              <textarea
                value={form.synopsis}
                onChange={(e) => set('synopsis', e.target.value)}
                rows={3}
                maxLength={5000}
                placeholder="Ceritakan inti kisah Anda (opsional)"
                className={`${inputCls} resize-none`}
              />
            </Field>
          )}

          {active === 'titles' && (
            <Field label="Kata kunci">
              <input
                value={form.keywords}
                onChange={(e) => set('keywords', e.target.value)}
                placeholder="Kata kunci yang ingin muncul di judul (opsional)"
                maxLength={500}
                className={inputCls}
              />
            </Field>
          )}

          {(active === 'titles' || active === 'synopsis' || active === 'character' || active === 'outline') && (
            <Field label="Genre (pisahkan dengan koma, maks 5)">
              <input
                value={form.genres}
                onChange={(e) => set('genres', e.target.value)}
                placeholder="Contoh: Action, Fantasy, Romance"
                maxLength={255}
                className={inputCls}
              />
            </Field>
          )}

          {active === 'character' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Peran">
                <select value={form.role} onChange={(e) => set('role', e.target.value)} className={inputCls}>
                  <option value="protagonis">Protagonis</option>
                  <option value="antagonis">Antagonis</option>
                  <option value="pendukung">Karakter Pendukung</option>
                </select>
              </Field>
              <Field label="Jumlah hasil (maks 10)">
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={form.count}
                  onChange={(e) => set('count', e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>
          )}

          {active === 'titles' && (
            <Field label="Jumlah judul (maks 10)">
              <input
                type="number"
                min={1}
                max={10}
                value={form.count}
                onChange={(e) => set('count', e.target.value)}
                className={inputCls}
              />
            </Field>
          )}

          {active === 'outline' && (
            <Field label="Jumlah episode (maks 10)">
              <input
                type="number"
                min={1}
                max={10}
                value={form.count}
                onChange={(e) => set('count', e.target.value)}
                className={inputCls}
              />
            </Field>
          )}

          {error && (
            <p className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-2.5 text-sm text-red-300">
              <AlertCircle size={15} /> {error}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />}
              {loading ? 'Membuat…' : 'Buat dengan AI'}
            </button>
          </div>
        </form>
      </div>

      {/* ====== Results ====== */}
      {(active === 'titles' && titles.length > 0) ||
      (active === 'synopsis' && synopsis) ||
      (active === 'genresTags' && genresTags) ||
      (active === 'character' && character) ||
      (active === 'outline' && outline.length > 0) ? (
        <section className="mt-8">
          <h3 className="mb-3 flex items-center gap-2 font-display text-base font-bold text-surface-50">
            <Sparkles size={16} className="text-brand-300" /> Hasil
          </h3>

          {active === 'titles' && (
            <div className="space-y-2">
              {titles.map((t, i) => (
                <ResultRow key={i} label={`#${i + 1}`} text={t} onCopy={() => copyText(`t${i}`, t)} copied={copied === `t${i}`} />
              ))}
            </div>
          )}

          {active === 'synopsis' && synopsis && (
            <ResultBlock text={synopsis} onCopy={() => copyText('synopsis', synopsis)} copied={copied === 'synopsis'} />
          )}

          {active === 'genresTags' && genresTags && (
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-surface-500">Genre</p>
                <div className="flex flex-wrap gap-2">
                  {genresTags.genres.map((g) => (
                    <span key={g} className="rounded-full border border-brand-500/40 bg-brand-500/10 px-3 py-1.5 text-xs font-semibold text-brand-200">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-surface-500">Tag</p>
                <div className="flex flex-wrap gap-2">
                  {genresTags.tags.map((t) => (
                    <span key={t} className="rounded-full border border-surface-700 bg-surface-950 px-3 py-1.5 text-xs text-surface-300">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() =>
                  copyText('genresTags', `Genre: ${genresTags.genres.join(', ')}\nTag: ${genresTags.tags.map((t) => `#${t}`).join(' ')}`)
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-surface-700 px-3 py-1.5 text-xs font-medium text-surface-300 transition-colors hover:bg-surface-800"
              >
                {copied === 'genresTags' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                {copied === 'genresTags' ? 'Tersalin!' : 'Salin'}
              </button>
            </div>
          )}

          {active === 'character' && character && (
            <div className="rounded-2xl border border-surface-800 bg-surface-950 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-bold text-surface-50">{character.name}</p>
                  <span className="mt-0.5 inline-block rounded-full border border-brand-500/40 bg-brand-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-brand-200">
                    {character.role}
                  </span>
                </div>
                <button
                  onClick={() =>
                    copyText(
                      'character',
                      `${character.name} (${character.role})\nSifat: ${character.personality}\nCiri: ${character.traits.join(', ')}\nLatar: ${character.backstory}`,
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-surface-700 px-3 py-1.5 text-xs font-medium text-surface-300 transition-colors hover:bg-surface-800"
                >
                  {copied === 'character' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  {copied === 'character' ? 'Tersalin!' : 'Salin'}
                </button>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-surface-300">{character.personality}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {character.traits.map((t) => (
                  <span key={t} className="rounded-full border border-surface-700 bg-surface-900 px-2.5 py-1 text-[11px] text-surface-300">
                    {t}
                  </span>
                ))}
              </div>
              <p className="mt-4 border-t border-surface-800 pt-3 text-sm leading-relaxed text-surface-400">
                <span className="font-semibold text-surface-300">Latar:</span> {character.backstory}
              </p>
            </div>
          )}

          {active === 'outline' && outline.length > 0 && (
            <ol className="space-y-3">
              {outline.map((beat) => (
                <li key={beat.number} className="rounded-2xl border border-surface-800 bg-surface-950 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-surface-100">
                      <span className="mr-2 text-xs font-bold text-brand-300">#{beat.number}</span>
                      {beat.title}
                    </p>
                    <button
                      onClick={() => copyText(`o${beat.number}`, `${beat.title}: ${beat.summary}`)}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-surface-700 px-2.5 py-1.5 text-[11px] font-medium text-surface-300 transition-colors hover:bg-surface-800"
                    >
                      {copied === `o${beat.number}` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      {copied === `o${beat.number}` ? 'OK' : 'Salin'}
                    </button>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-surface-400">{beat.summary}</p>
                </li>
              ))}
            </ol>
          )}
        </section>
      ) : null}
    </div>
  )
}

const inputCls =
  'w-full rounded-xl border border-surface-800 bg-surface-950 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-surface-200">{label}</label>
      {children}
    </div>
  )
}

function ResultRow({ label, text, onCopy, copied }: { label: string; text: string; onCopy: () => void; copied: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-surface-800 bg-surface-950 px-4 py-3">
      <p className="min-w-0 flex-1 text-sm font-medium text-surface-100">
        <span className="mr-2 text-xs font-bold text-brand-300">{label}</span>
        {text}
      </p>
      <button
        onClick={onCopy}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-surface-700 px-2.5 py-1.5 text-[11px] font-medium text-surface-300 transition-colors hover:bg-surface-800"
      >
        {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
        {copied ? 'Tersalin!' : 'Salin'}
      </button>
    </div>
  )
}

function ResultBlock({ text, onCopy, copied }: { text: string; onCopy: () => void; copied: boolean }) {
  return (
    <div className="rounded-2xl border border-surface-800 bg-surface-950 p-5">
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-surface-200">{text}</p>
      <button
        onClick={onCopy}
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-surface-700 px-3 py-1.5 text-xs font-medium text-surface-300 transition-colors hover:bg-surface-800"
      >
        {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
        {copied ? 'Tersalin!' : 'Salin'}
      </button>
    </div>
  )
}
