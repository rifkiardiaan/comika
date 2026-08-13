import { BookOpen, Coins, MessageSquare, RefreshCw, Sparkles } from 'lucide-react'
import type { AppNotificationType } from '../types'

const styles: Record<
  AppNotificationType,
  { icon: typeof BookOpen; className: string }
> = {
  new_episode: { icon: BookOpen, className: 'bg-brand-500/15 text-brand-300' },
  comic_update: { icon: RefreshCw, className: 'bg-sky-500/15 text-sky-300' },
  comment_reply: { icon: MessageSquare, className: 'bg-pink-500/15 text-pink-300' },
  transaction: { icon: Coins, className: 'bg-amber-500/15 text-amber-300' },
  system: { icon: Sparkles, className: 'bg-surface-700 text-surface-300' },
}

/** Ikon berwarna sesuai jenis notifikasi — dipakai di lonceng & halaman. */
export default function NotificationIcon({ type, size = 16 }: { type: AppNotificationType; size?: number }) {
  const { icon: Icon, className } = styles[type] ?? styles.system
  return (
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${className}`}>
      <Icon size={size} />
    </span>
  )
}
