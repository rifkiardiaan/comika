import { Component, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallbackTitle?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center">
          <AlertTriangle size={40} className="text-amber-400" />
          <h1 className="mt-4 font-display text-xl font-bold text-surface-50">
            {this.props.fallbackTitle ?? 'Terjadi Kesalahan'}
          </h1>
          <p className="mt-2 max-w-md text-sm text-surface-400">
            Sepertinya ada masalah saat memuat halaman ini. Coba muat ulang atau kembali ke beranda.
          </p>
          {this.state.error && (
            <p className="mt-3 max-w-lg break-all rounded-lg bg-red-500/10 px-4 py-3 text-xs text-red-400">
              {this.state.error.message}
            </p>
          )}
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-surface-700 bg-surface-900 px-5 py-2.5 text-sm font-semibold text-surface-200 transition-colors hover:border-brand-500/50"
            >
              <RefreshCw size={15} /> Muat Ulang
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:brightness-110"
            >
              Beranda
            </Link>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
