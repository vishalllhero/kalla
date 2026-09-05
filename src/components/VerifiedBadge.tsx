type VerifiedBadgeProps = {
  isVerified: boolean
  mode?: 'demo' | 'real' // demo for mock blockchain, real for actual
}

export default function VerifiedBadge({ isVerified, mode = 'real' }: VerifiedBadgeProps) {
  if (!isVerified) return null

  const prefix = mode === 'demo' ? 'Demo Blockchain ' : ''
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white bg-terracotta">
      ✓ KALAA VERIFIED {prefix}
    </span>
  )
}