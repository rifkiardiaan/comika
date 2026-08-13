import { Inbox } from 'lucide-react'

interface Props {
  message?: string
}

export default function EmptyState({ message = 'Belum ada data untuk ditampilkan.' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-800 bg-surface-900/40 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-800/70 text-surface-500">
        <Inbox size={24} />
      </span>
      <p className="mt-4 text-sm text-surface-400">{message}</p>
    </div>
  )
}
