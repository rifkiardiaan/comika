import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-surface-800/70 bg-surface-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-pink-500 font-display font-bold text-white">
                C
              </span>
              <span className="font-display text-lg font-bold text-surface-50">COMIKA</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-surface-400">
              Platform komik dan webtoon digital untuk pembaca dan creator. Baca, terbitkan, dan
              monetisasi karyamu.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-surface-200">Jelajahi</h4>
            <ul className="mt-3 space-y-2 text-sm text-surface-400">
              <li><Link to="/discover" className="transition-colors hover:text-brand-300">Jelajahi Komik</Link></li>
              <li><Link to="/library" className="transition-colors hover:text-brand-300">Perpustakaan</Link></li>
              <li><Link to="/creator" className="transition-colors hover:text-brand-300">Jadi Creator</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-surface-200">Komunitas</h4>
            <ul className="mt-3 space-y-2 text-sm text-surface-400">
              <li><Link to="/login" className="transition-colors hover:text-brand-300">Masuk</Link></li>
              <li><Link to="/register" className="transition-colors hover:text-brand-300">Buat Akun</Link></li>
              <li><a href="#" className="transition-colors hover:text-brand-300">Bantuan</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-surface-800/60 pt-6 text-center text-xs text-surface-500">
          © 2026 COMIKA. Dibuat dengan ❤️ untuk komunitas komik Indonesia.
        </div>
      </div>
    </footer>
  )
}
