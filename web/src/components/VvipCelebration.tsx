import { useState, useEffect } from 'react'
import { Gem, Sparkles, X, PartyPopper } from 'lucide-react'

interface VvipCelebrationProps {
  show: boolean
  onClose: () => void
  userName?: string
}

export default function VvipCelebration({ show, onClose, userName }: VvipCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      // Trigger animation after mount
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true)
        })
      })
    } else {
      setIsAnimating(false)
      const timeout = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timeout)
    }
  }, [show])

  if (!isVisible) return null

  return (
    <>
      <style>{`
        @keyframes celebration-bounce {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.1); }
          50% { transform: scale(0.95); }
          75% { transform: scale(1.05); }
        }

        @keyframes celebration-glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.4),
                        0 0 40px rgba(236, 72, 153, 0.2);
          }
          50% { 
            box-shadow: 0 0 30px rgba(168, 85, 247, 0.6),
                        0 0 60px rgba(236, 72, 153, 0.4),
                        0 0 80px rgba(139, 92, 246, 0.2);
          }
        }

        @keyframes float-up {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        @keyframes shimmer-text {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .celebration-card {
          animation: celebration-bounce 0.6s ease-out,
                     celebration-glow 2s ease-in-out infinite;
        }

        .celebration-title {
          background: linear-gradient(135deg, #8b5cf6, #ec4899, #8b5cf6, #ec4899);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer-text 3s linear infinite;
        }

        .celebration-icon {
          animation: float-up 0.5s ease-out 0.2s both,
                     spin-slow 8s linear infinite;
        }

        .celebration-gem {
          animation: float-up 0.5s ease-out 0.4s both;
        }

        .celebration-text {
          animation: float-up 0.5s ease-out 0.6s both;
        }

        .celebration-benefits {
          animation: float-up 0.5s ease-out 0.8s both;
        }

        .celebration-button {
          animation: float-up 0.5s ease-out 1s both;
        }
      `}</style>

      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
          style={{ opacity: isAnimating ? 1 : 0 }}
          onClick={onClose}
        />

        {/* Modal */}
        <div
          className="celebration-card relative w-full max-w-md overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-900 via-surface-900 to-pink-900 p-8 text-center shadow-2xl"
          style={{
            transform: isAnimating ? 'scale(1)' : 'scale(0.8)',
            opacity: isAnimating ? 1 : 0,
            transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
          }}
        >
          {/* Decorative elements */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-pink-500/20 blur-3xl" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-surface-400 transition-colors hover:bg-surface-800 hover:text-surface-200"
          >
            <X size={18} />
          </button>

          {/* Party icon */}
          <div className="celebration-icon mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-xl">
            <PartyPopper size={40} className="text-white" />
          </div>

          {/* Title */}
          <h2 className="celebration-title font-display text-3xl font-bold">
            Selamat!
          </h2>

          {/* VVIP Badge */}
          <div className="celebration-gem mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600/30 to-pink-600/30 px-6 py-3 shadow-lg">
            <Gem size={20} className="text-purple-300" />
            <span className="text-lg font-bold text-purple-200">VVIP Member</span>
            <Gem size={20} className="text-purple-300" />
          </div>

          {/* Message */}
          <div className="celebration-text mt-6">
            <p className="text-surface-200">
              {userName ? <span className="font-semibold text-white">{userName}</span> : 'Kamu'} sudah menjadi
            </p>
            <p className="mt-1 text-lg font-bold text-purple-300">VVIP Member COMIKA!</p>
          </div>

          {/* Benefits */}
          <div className="celebration-benefits mt-6 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-surface-400">Yang kamu dapatkan:</p>
            <div className="grid grid-cols-2 gap-2 text-left">
              {[
                { icon: '🎨', text: 'Bebas Iklan' },
                { icon: '📚', text: 'Semua Episode Gratis' },
                { icon: '💎', text: 'Badge VVIP Eksklusif' },
                { icon: '⭐', text: 'Akses Fitur Premium' },
              ].map((benefit, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-lg bg-purple-500/10 px-3 py-2"
                  style={{ animationDelay: `${1 + i * 0.1}s` }}
                >
                  <span className="text-lg">{benefit.icon}</span>
                  <span className="text-xs font-medium text-purple-200">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Close button */}
          <div className="celebration-button mt-8">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 font-semibold text-white shadow-lg shadow-purple-600/30 transition-all hover:brightness-110 hover:shadow-xl hover:shadow-purple-600/40"
            >
              <Sparkles size={18} />
              Mulai Menjelajah
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
