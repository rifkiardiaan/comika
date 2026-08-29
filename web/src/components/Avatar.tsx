import { useState } from 'react'
import { assetUrl } from '../utils/format'

interface Props {
  name: string
  avatarUrl?: string | null
  /** Ukuran dalam px; default 32. */
  size?: number
  className?: string
}

/** Avatar user — gambar bila tersedia, fallback ke inisial ber-gradient. */
export default function Avatar({ name, avatarUrl, size = 32, className = '' }: Props) {
  const [broken, setBroken] = useState(false)
  const src = assetUrl(avatarUrl)
  const showImage = src && !broken

  const borderRadius = Math.max(6, Math.round(size * 0.35))

  if (showImage) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        onError={() => setBroken(true)}
        className={`shrink-0 object-cover ${className}`}
        style={{ width: size, height: size, borderRadius }}
      />
    )
  }

  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center bg-gradient-to-br from-brand-500 to-pink-500 font-bold text-white ${className}`}
      style={{ width: size, height: size, borderRadius, fontSize: Math.round(size * 0.4) }}
    >
      {(name ?? '')[0]?.toUpperCase() ?? 'C'}
    </span>
  )
}
