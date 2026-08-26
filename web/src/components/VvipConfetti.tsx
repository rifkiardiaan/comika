import { useEffect, useState } from 'react'

interface VvipConfettiProps {
  show: boolean
  onComplete?: () => void
  duration?: number
}

interface Particle {
  id: number
  x: number
  y: number
  rotation: number
  scale: number
  color: string
  velocityX: number
  velocityY: number
  shape: 'square' | 'circle' | 'star'
}

const VVIP_COLORS = [
  '#8b5cf6', // purple-500
  '#a855f7', // purple-400
  '#c084fc', // purple-300
  '#ec4899', // pink-500
  '#f472b6', // pink-400
  '#f9a8d4', // pink-300
  '#d946ef', // fuchsia-500
  '#e879f9', // fuchsia-400
  '#fbbf24', // amber-400
  '#fcd34d', // amber-300
]

const SHAPES: Array<'square' | 'circle' | 'star'> = ['square', 'circle', 'star']

function createParticle(id: number): Particle {
  return {
    id,
    x: Math.random() * 100,
    y: -10,
    rotation: Math.random() * 360,
    scale: Math.random() * 0.5 + 0.5,
    color: VVIP_COLORS[Math.floor(Math.random() * VVIP_COLORS.length)],
    velocityX: (Math.random() - 0.5) * 3,
    velocityY: Math.random() * 3 + 2,
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
  }
}

function ParticleElement({ particle }: { particle: Particle }) {
  const style = {
    position: 'fixed' as const,
    left: `${particle.x}%`,
    top: `${particle.y}%`,
    transform: `rotate(${particle.rotation}deg) scale(${particle.scale})`,
    zIndex: 9999,
    pointerEvents: 'none' as const,
    animation: `confetti-fall 3s ease-out forwards`,
  }

  if (particle.shape === 'circle') {
    return (
      <div
        style={{
          ...style,
          width: 10,
          height: 10,
          borderRadius: '50%',
          backgroundColor: particle.color,
        }}
      />
    )
  }

  if (particle.shape === 'star') {
    return (
      <div style={{ ...style, fontSize: 14 }}>
        ✨
      </div>
    )
  }

  return (
    <div
      style={{
        ...style,
        width: 8,
        height: 12,
        backgroundColor: particle.color,
        borderRadius: 2,
      }}
    />
  )
}

export default function VvipConfetti({ show, onComplete, duration = 4000 }: VvipConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!show) {
      setVisible(false)
      return
    }

    setVisible(true)

    // Create particles in batches
    const totalParticles = 80
    const batchSize = 15
    let created = 0
    let batchIndex = 0

    const createBatch = () => {
      const newParticles: Particle[] = []
      const count = Math.min(batchSize, totalParticles - created)
      
      for (let i = 0; i < count; i++) {
        newParticles.push(createParticle(batchIndex * batchSize + i))
      }
      
      setParticles(prev => [...prev, ...newParticles])
      created += count
      batchIndex++
    }

    // First batch immediately
    createBatch()

    // Subsequent batches with delay
    const batchInterval = setInterval(() => {
      if (created >= totalParticles) {
        clearInterval(batchInterval)
        return
      }
      createBatch()
    }, 200)

    // Cleanup after duration
    const timeout = setTimeout(() => {
      setVisible(false)
      setParticles([])
      onComplete?.()
    }, duration)

    return () => {
      clearInterval(batchInterval)
      clearTimeout(timeout)
    }
  }, [show, duration, onComplete])

  if (!visible || particles.length === 0) return null

  return (
    <>
      <style>{`
        @keyframes confetti-fall {
          0% {
            opacity: 1;
            transform: translateY(0) rotate(0deg) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(100vh) rotate(720deg) scale(0.3);
          }
        }
      `}</style>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 9999 }}
      >
        {particles.map(particle => (
          <ParticleElement key={particle.id} particle={particle} />
        ))}
      </div>
    </>
  )
}
