import { useEffect, useRef } from 'react'
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react'

interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'success' | 'warning' | 'info'
  onConfirm: () => void
  onCancel: () => void
}

const variantConfig = {
  danger: {
    icon: XCircle,
    iconBg: 'bg-red-500/15',
    iconColor: 'text-red-400',
    confirmBg: 'bg-red-600 hover:bg-red-500',
  },
  success: {
    icon: CheckCircle,
    iconBg: 'bg-green-500/15',
    iconColor: 'text-green-400',
    confirmBg: 'bg-green-600 hover:bg-green-500',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-400',
    confirmBg: 'bg-amber-600 hover:bg-amber-500',
  },
  info: {
    icon: Info,
    iconBg: 'bg-brand-500/15',
    iconColor: 'text-brand-400',
    confirmBg: 'bg-brand-600 hover:bg-brand-500',
  },
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [open, onCancel])

  if (!open) return null

  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div
        ref={modalRef}
        className="relative w-full max-w-md animate-slide-up rounded-2xl border border-surface-800 bg-surface-900 p-6 shadow-2xl shadow-black/60"
      >
        {/* Icon */}
        <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${config.iconBg}`}>
          <Icon size={28} className={config.iconColor} />
        </div>

        {/* Text */}
        <h3 className="text-center font-display text-lg font-bold text-surface-50">{title}</h3>
        <p className="mt-2 text-center text-sm leading-relaxed text-surface-400">{message}</p>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-surface-700 px-4 py-2.5 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:brightness-110 ${config.confirmBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
