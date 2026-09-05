type LoadingSkeletonProps = {
  paragraphs?: number
  images?: number
}

export default function LoadingSkeleton({ paragraphs = 2, images = 1 }: LoadingSkeletonProps) {
  return (
    <div className="space-y-4">
      {/* Skeleton for images */}
      {[...Array(images)].map((_, i) => (
        <div
          key={i}
          className="h-48 bg-stone-200 rounded-lg animate-pulse"
        />
      ))}
      {/* Skeleton for text */}
      {[...Array(paragraphs)].map((_, i) => (
        <div
          key={i}
          className="h-6 bg-stone-200 rounded-lg animate-pulse"
        />
      ))}
    </div>
  )
}