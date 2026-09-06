import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { router } from './routes'
import { push } from './services/push'
import ErrorBoundary from './components/ErrorBoundary'

// Service worker untuk offline (PWA): daftarkan selalu agar app shell & halaman
// Komik Offline tersimpan sehingga bisa dibuka saat tidak ada koneksi.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

// Web push: sinkronkan subscription yang sudah ada (izin sudah diberikan &
// user sudah login) agar notifikasi tetap berjalan. Registrasi service worker
// di atas idempotent — aman dijalankan dua kali. Saat offline, jangan panggil
// API agar booting aplikasi (mis. buka komik offline) tetap mulus tanpa error.
if (navigator.onLine && localStorage.getItem('comika_token')) {
  void push.syncExisting()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallbackTitle="COMIKA mengalami kesalahan">
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
)
