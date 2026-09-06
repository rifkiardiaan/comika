import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ErrorBoundary from '../components/ErrorBoundary'
import OfflineBanner from '../components/OfflineBanner'
import OfflineGate from '../components/OfflineGate'

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-950 text-surface-100">
      <Navbar />
      <main className="flex-1">
        <OfflineGate>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </OfflineGate>
      </main>
      <Footer />
      <OfflineBanner />
    </div>
  )
}
