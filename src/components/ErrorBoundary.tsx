import React, { Component } from 'react'

type ErrorBoundaryProps = {
  children: React.ReactNode
  fallback?: React.ReactNode
}

type State = {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<ErrorBoundaryProps> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
          <h2 className="text-2xl font-semibold text-ink mb-4">
            Something went wrong.
          </h2>
          <p className="text-stone-500">
            Please try again later or contact support.
          </p>
        </div>
      )
    }

    return this.props.children
  }
}