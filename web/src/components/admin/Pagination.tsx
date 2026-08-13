import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  meta: { current_page: number; last_page: number; total: number }
  onPageChange: (page: number) => void
}

export default function Pagination({ meta, onPageChange }: Props) {
  if (meta.last_page <= 1) return null

  const { current_page: current, last_page: last, total } = meta
  const pages: number[] = []
  for (let p = 1; p <= last; p++) {
    if (p === 1 || p === last || Math.abs(p - current) <= 1) pages.push(p)
    else if (pages[pages.length - 1] !== -1) pages.push(-1)
  }

  const btn =
    'flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-surface-800/70 pt-4">
      <p className="text-xs text-surface-500">
        Menampilkan halaman {current} dari {last} · total {total.toLocaleString('id-ID')} data
      </p>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(current - 1)}
          disabled={current <= 1}
          className={`${btn} text-surface-300 hover:bg-surface-800`}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft size={16} />
        </button>
        {pages.map((p, i) =>
          p === -1 ? (
            <span key={`gap-${i}`} className="px-1 text-xs text-surface-600">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`${btn} ${
                p === current
                  ? 'bg-gradient-to-r from-brand-600 to-pink-600 text-white shadow-lg shadow-brand-600/25'
                  : 'text-surface-300 hover:bg-surface-800'
              }`}
            >
              {p}
            </button>
          ),
        )}
        <button
          onClick={() => onPageChange(current + 1)}
          disabled={current >= last}
          className={`${btn} text-surface-300 hover:bg-surface-800`}
          aria-label="Halaman berikutnya"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
