import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { router } from './routes'
import { push } from './services/push'

// Web push: daftarkan service worker & sinkronkan subscription yang sudah ada
// (izin sudah diberikan & user sudah login) agar notifikasi tetap berjalan.
if (localStorage.getItem('comika_token')) {
  void push.syncExisting()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
