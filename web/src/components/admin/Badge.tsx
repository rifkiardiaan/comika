type Tone = 'brand' | 'green' | 'amber' | 'red' | 'slate' | 'blue' | 'pink'

const tones: Record<Tone, string> = {
  brand: 'border-brand-500/40 bg-brand-500/10 text-brand-300',
  green: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  amber: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  red: 'border-red-500/40 bg-red-500/10 text-red-300',
  slate: 'border-surface-700 bg-surface-800/70 text-surface-300',
  blue: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
  pink: 'border-pink-500/40 bg-pink-500/10 text-pink-300',
}

export function Badge({ tone = 'slate', children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  )
}

/** Badge role pengguna (reader / creator / admin). */
export function RoleBadge({ role }: { role: string }) {
  const map: Record<string, Tone> = { reader: 'slate', creator: 'blue', admin: 'brand' }
  const label: Record<string, string> = { reader: 'Pembaca', creator: 'Creator', admin: 'Admin' }
  return <Badge tone={map[role] ?? 'slate'}>{label[role] ?? role}</Badge>
}

/** Badge status konten (ongoing / completed / hiatus / draft / published). */
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, Tone> = {
    ongoing: 'green',
    completed: 'blue',
    hiatus: 'amber',
    published: 'green',
    draft: 'slate',
    active: 'green',
    hidden: 'red',
    pending: 'amber',
    resolved: 'green',
    dismissed: 'slate',
  }
  const label: Record<string, string> = {
    ongoing: 'Ongoing',
    completed: 'Selesai',
    hiatus: 'Hiatus',
    published: 'Terbit',
    draft: 'Draft',
    active: 'Aktif',
    hidden: 'Disembunyikan',
    pending: 'Menunggu',
    resolved: 'Selesai',
    dismissed: 'Ditolak',
  }
  return <Badge tone={map[status] ?? 'slate'}>{label[status] ?? status}</Badge>
}
