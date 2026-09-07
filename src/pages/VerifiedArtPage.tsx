import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ArtworkCard from '../components/ArtworkCard'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'
import { apiUrl } from '../lib/api'

export default function VerifiedArtPage() {
  const navigate = useNavigate()
  const [artworks, setArtworks] = useState<Array<unknown>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArtworks = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(apiUrl('/api/v1/artworks'))
        if (!res.ok) throw new Error('Failed to fetch artworks')
        const data = await res.json()
        const verified = data.filter((a) => a.verified)
        setArtworks(verified)
      } catch {
        setError('Unable to load verified artworks')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchArtworks()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
          <p className="text-stone-500">Loading verified artworks...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <EmptyState
        message="Error loading verified artworks"
        illustration={<div className="text-center" />}
        ctaLabel="Try Again"
        onCta={() => {
          setError(null)
          setLoading(true)
        }}
      />
    )
  }

  return (
    <div className="bg-canvas min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="text-center py-20">
          <h2 className="text-4xl md:text-7xl font-serif text-ink mb-6">
            VERIFIED PHYSICAL ART
          </h2>
          <p className="text-xl md:text-2xl text-ink/70 max-w-2xl mx-auto">
            Every KALAA verified artwork has a unique digital identity and provenance record.
            Discover pieces that are authenticated, traceable, and backed by blockchain technology.
          </p>
        </section>

        {/* Artwork Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
          {loading ? (
            <LoadingSkeleton paragraphs={4} images={6} />
          ) : artworks.length === 0 ? (
            <EmptyState
              message="No verified artworks found"
              illustration={<div className="flex justify-center" />}
              ctaLabel="Browse All Art"
              onCta={() => navigate('/explore')}
            />
          ) : (
            artworks.map((artwork) => (
              <ArtworkCard key={artwork.artwork_id} artwork={artwork} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}