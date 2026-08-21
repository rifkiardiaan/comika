import { ExternalLink, MessageCircle, Camera, AtSign, Play, BookOpen, Heart, Users } from 'lucide-react'

const socialLinks = [
  {
    name: 'Discord',
    description: 'Bergabung dengan komunitas aktif di Discord',
    url: 'https://discord.gg/comika',
    icon: MessageCircle,
    color: 'from-indigo-500 to-purple-500',
  },
  {
    name: 'Instagram',
    description: 'Follow untuk update terbaru dan behind the scenes',
    url: 'https://www.instagram.com/4rdiaan___/',
    icon: Camera,
    color: 'from-pink-500 to-orange-500',
  },
  {
    name: 'Twitter / X',
    description: 'Ikuti berita dan pengumuman terbaru',
    url: 'https://x.com/comika_app',
    icon: AtSign,
    color: 'from-sky-500 to-blue-500',
  },
  {
    name: 'YouTube',
    description: 'Nonton video behind the scenes dan tips',
    url: 'https://youtube.com/@comika',
    icon: Play,
    color: 'from-red-500 to-red-600',
  },
]

const communityGuidelines = [
  {
    icon: Heart,
    title: 'Hormati Sesama',
    description: 'Jaga etika dan saling menghargai di komunitas.',
  },
  {
    icon: BookOpen,
    title: 'Dukung Kreator',
    description: 'Apresiasi karya kreator dengan membaca dan memberi rating.',
  },
  {
    icon: Users,
    title: 'Berkonstruksi',
    description: 'Berikan feedback yang membangun untuk komik dan fitur.',
  },
]

export default function KomunitasPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-pink-500">
          <Users size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-extrabold">Komunitas COMIKA</h1>
        <p className="mt-2 text-sm text-surface-400">Bergabung dengan ribuan pembaca dan kreator komik Indonesia</p>
      </div>

      {/* Community Guidelines */}
      <div className="mb-8 rounded-xl border border-surface-800 bg-surface-900 p-6">
        <h2 className="mb-4 text-lg font-bold">Panduan Komunitas</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {communityGuidelines.map((guideline) => (
            <div key={guideline.title} className="text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/15">
                <guideline.icon size={20} className="text-brand-400" />
              </div>
              <h3 className="text-sm font-bold">{guideline.title}</h3>
              <p className="mt-1 text-xs text-surface-400">{guideline.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Social Links */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold">Ikuti Kami</h2>
        {socialLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-xl border border-surface-800 bg-surface-900 p-4 transition-colors hover:border-surface-700 hover:bg-surface-800"
          >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${link.color}`}>
              <link.icon size={24} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold">{link.name}</h3>
              <p className="truncate text-xs text-surface-400">{link.description}</p>
            </div>
            <ExternalLink size={16} className="shrink-0 text-surface-500" />
          </a>
        ))}
      </div>

    
    </div>
  )
}
