type EmptyStateProps = {
  message: string
  illustration: React.ReactNode
  ctaLabel?: string
  onCta?: () => void
}

export default function EmptyState({
  message,
  illustration,
  ctaLabel = 'Try Again',
  onCta,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
      <div className="max-w-md">{illustration}</div>
      <h2 className="mt-4 text-2xl font-semibold text-ink">{message}</h2>
      <button
        onClick={onCta}
        className="mt-6 bg-terracotta text-white px-6 py-3 rounded-lg font-medium hover:bg-terracotta/90 transition-colors"
      >
        {ctaLabel}
      </button>
    </div>
  )
}