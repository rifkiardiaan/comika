import { Construction } from 'lucide-react'

export default function ComingSoonPage({ title }: { title?: string }) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-400">
        <Construction size={30} />
      </span>
      <h1 className="font-display text-2xl font-bold text-surface-50">
        {title ?? 'Halaman Sedang Dibangun'}
      </h1>
      <p className="max-w-md text-sm text-surface-400">
        Halaman ini akan tersedia di fase berikutnya sesuai roadmap pengembangan COMIKA.
      </p>
    </div>
  )
}
