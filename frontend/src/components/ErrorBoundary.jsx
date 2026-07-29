import { Component } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

/**
 * Last line of defense against blank screens. React unmounts the whole
 * tree on an uncaught render error (see Sessions.jsx's missing-icon-import
 * bug for a real example) — without a boundary, that means a silent white
 * page with nothing but a console error the user never sees. This catches
 * it, shows a real message, and offers a way back instead of a dead end.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Keep this even in production — it's the only trace of what actually
    // broke, since the UI itself can no longer show a stack trace.
    console.error('[ErrorBoundary] caught render error:', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.assign('/')
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center dark:bg-ink-950">
          <AlertTriangle size={40} className="text-amber-500" />
          <h1 className="font-display text-xl font-bold text-ink-900 dark:text-white">
            Something went wrong
          </h1>
          <p className="max-w-md text-sm text-ink-900/60 dark:text-white/60">
            This page hit an unexpected error and couldn't continue. This has been logged —
            you can head back to the dashboard and try again.
          </p>
          {this.state.error?.message && (
            <p className="max-w-md rounded-lg bg-black/5 px-3 py-2 font-mono text-xs text-ink-900/50 dark:bg-white/10 dark:text-white/50">
              {this.state.error.message}
            </p>
          )}
          <button type="button" onClick={this.handleReset} className="btn-primary mt-2">
            <RefreshCcw size={15} /> Back to Dashboard
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
