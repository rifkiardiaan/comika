import { HelpCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

interface FAQ {
  question: string
  answer: string
}

const faqSections = [
  {
    title: 'Umum',
    items: [
      {
        question: 'Apa itu COMIKA?',
        answer: 'COMIKA adalah platform baca komik digital yang memungkinkan kamu membaca ribuan komik dari berbagai genre. Kamu bisa membaca komik gratis atau membeli episode premium menggunakan koin.',
      },
      {
        question: 'Bagaimana cara membuat akun COMIKA?',
        answer: 'Klik tombol "Daftar" di pojok kanan atas, lalu isi nama lengkap, username, email, dan password. Setelah mendaftar, verifikasi email kamu untuk mengaktifkan akun.',
      },
      {
        question: 'Apakah COMIKA gratis?',
        answer: 'Ya! COMIKA gratis untuk digunakan. Banyak komik yang bisa dibaca secara gratis. Untuk episode premium, kamu perlu membeli koin.',
      },
    ] as FAQ[],
  },
  {
    title: 'Akun & Profil',
    items: [
      {
        question: 'Bagaimana cara mengubah foto profil?',
        answer: 'Buka halaman Profil, klik pada foto profil kamu, lalu pilih "Ubah Foto Profil". Kamu bisa memilih foto dari galeri perangkat.',
      },
      {
        question: 'Bagaimana cara mengganti password?',
        answer: 'Buka halaman Profil > Ganti Password. Masukkan password lama dan password baru (minimal 8 karakter), lalu klik "Simpan".',
      },
      {
        question: 'Bagaimana cara verifikasi email?',
        answer: 'Setelah mendaftar, cek inbox email kamu untuk link verifikasi. Jika tidak menerima email, klik "Kirim Ulang" di banner verifikasi yang muncul di halaman.',
      },
    ] as FAQ[],
  },
  {
    title: 'Membaca Komik',
    items: [
      {
        question: 'Bagaimana cara membaca komik?',
        answer: 'Pilih komik yang kamu suka dari halaman Beranda atau Jelajahi, lalu klik "Baca Sekarang". Geser ke bawah untuk membaca setiap halaman.',
      },
      {
        question: 'Apa itu episode premium?',
        answer: 'Episode premium adalah episode komik yang memerlukan koin untuk dibuka. Koin bisa dibeli dari halaman Dompet.',
      },
      {
        question: 'Bagaimana cara membeli koin?',
        answer: 'Buka halaman Dompet, pilih paket koin yang diinginkan, lalu klik "Beli". Pembayaran saat ini masih disimulasikan untuk versi MVP.',
      },
      {
        question: 'Bagaimana cara bookmark komik?',
        answer: 'Buka halaman detail komik, lalu klik tombol "Simpan". Komik yang sudah di-bookmark akan muncul di tab "Bookmark" di halaman Perpustakaan.',
      },
    ] as FAQ[],
  },
  {
    title: 'Teknis',
    items: [
      {
        question: 'Browser apa yang didukung?',
        answer: 'COMIKA mendukung browser modern seperti Chrome, Firefox, Safari, dan Edge. Pastikan browser kamu sudah versi terbaru.',
      },
      {
        question: 'Aplikasi mobile tersedia?',
        answer: 'Saat ini COMIKA tersedia sebagai Progressive Web App (PWA) yang bisa di-install dari browser. Aplikasi native untuk Android dan iOS sedang dalam pengembangan.',
      },
    ] as FAQ[],
  },
]

function FAQItem({ item }: { item: FAQ }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-surface-800 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-surface-100 transition-colors hover:bg-surface-800/40"
      >
        <span>{item.question}</span>
        {open ? <ChevronUp size={16} className="shrink-0 text-surface-400" /> : <ChevronDown size={16} className="shrink-0 text-surface-400" />}
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-sm leading-relaxed text-surface-300">{item.answer}</p>
        </div>
      )}
    </div>
  )
}

export default function BantuanPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/15">
          <HelpCircle size={32} className="text-brand-400" />
        </div>
        <h1 className="text-2xl font-extrabold">Pusat Bantuan</h1>
        <p className="mt-2 text-sm text-surface-400">Temukan jawaban untuk pertanyaan kamu seputar COMIKA</p>
      </div>

      {/* FAQ Sections */}
      <div className="space-y-6">
        {faqSections.map((section) => (
          <div key={section.title} className="overflow-hidden rounded-xl border border-surface-800 bg-surface-900">
            <h2 className="border-b border-surface-800 px-4 py-3 text-sm font-bold uppercase tracking-wider text-surface-400">
              {section.title}
            </h2>
            {section.items.map((item) => (
              <FAQItem key={item.question} item={item} />
            ))}
          </div>
        ))}
      </div>

      {/* Contact */}
      <div className="mt-8 rounded-xl border border-surface-800 bg-surface-900 p-6 text-center">
        <h3 className="text-lg font-bold">Masih punya pertanyaan?</h3>
        <p className="mt-2 text-sm text-surface-400">Hubungi kami melalui email atau kunjungi komunitas kami</p>
        <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
          
          <Link
            to="/komunitas"
            className="flex items-center gap-2 rounded-lg border border-surface-700 px-4 py-2.5 text-sm font-semibold text-surface-200 transition-colors hover:bg-surface-800"
          >
            <ExternalLink size={16} /> Komunitas COMIKA
          </Link>
        </div>
      </div>
    </div>
  )
}
