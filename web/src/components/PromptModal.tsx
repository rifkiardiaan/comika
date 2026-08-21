import { useEffect, useRef, useState } from 'react'
import { MessageSquare, X } from 'lucide-react'

interface PromptModalProps {
  open: boolean
  title: string
  message?: string
  placeholder?: string
  defaultValue?: string
  confirmText?: string
  cancelText?: string
  onConfirm: (value: string) => void
  onCancel: () => void
}

export default function PromptModal({
  open,
  title,
  message,
  placeholder = '',
  defaultValue = '',
  confirmText = 'Kirim',
  cancelText = 'Batal',
  onConfirm,
  onCancel,
}: PromptModalProps) {
  const [value, setValue] = useState(defaultValue)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open) {
      setValue(defaultValue)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, defaultValue])

  useEffect(() => {
    if (!open) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md animate-slide-up rounded-2xl border border-surface-800 bg-surface-900 p-6 shadow-2xl shadow-black/60">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-surface-800 hover:text-surface-50"
        >
          <X size={16} />
        </button>

        {/* Icon */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15">
          <MessageSquare size={28} className="text-amber-400" />
        </div>

        {/* Text */}
        <h3 className="text-center font-display text-lg font-bold text-surface-50">{title}</h3>
        {message && <p className="mt-2 text-center text-sm text-surface-400">{message}</p>}

        {/* Input */}
        <div className="mt-4">
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder={placeholder}
            className="w-full resize-none rounded-xl border border-surface-700 bg-surface-800 px-4 py-3 text-sm text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
          <p className="mt-1 text-right text-[11px] text-surface-500">{value.length}/500</p>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={onCancel}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-surface-700 px-4 py-2.5 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800"
          >
            {cancelText}
          </button>
          <button
            onClick={() => onConfirm(value)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
