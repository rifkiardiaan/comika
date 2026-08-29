import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ErrorBoundary from '../components/ErrorBoundary'

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-950 text-surface-100">
      <Navbar />
      <main className="flex-1">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  )
}
