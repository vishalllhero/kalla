import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import ArtworkCard from '../components/ArtworkCard'
import VerifiedBadge from '../components/VerifiedBadge'
import { apiUrl } from '../lib/api'

type ArtisanProfileProps = {
  artisan: {
    id: string
    display_name: string
    full_name: string
    region: string
    craft: string
    verification_status: string
    bio: string
    years_experience: number
    workshop_location: string
    avatar_url: string
    is_verified: boolean
    total_listings: number
    total_sales: number
    avatar_url_full: string
  }
  artworks: Array<{
    artwork_id: string
    title: string
    price: number
    image_url: string
    verified: boolean
    craft?: string
    region?: string
  }>
}

export default function ArtisanProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [artisan, setArtisan] = useState<ArtisanProfileProps['artisan'] | null>(null)
  const [artworks, setArtworks] = useState<Array<ArtisanProfileProps['artworks'][0]>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArtisan = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(apiUrl(`/api/v1/artisans/${id}`))
        if (!res.ok) throw new Error('Artisan not found')
        const data = await res.json()
        setArtisan(data.artisan)
        setArtworks(data.artworks)
      } catch (err) {
        setError('Failed to load artisan profile')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchArtisan()
  }, [id])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
          <p className="text-stone-500">Loading artisan profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-semibold text-ink mb-4">Error</h2>
        <p className="text-stone-400">{error}</p>
        <button
          onClick={() => navigate('/explore')}
          className="mt-4 bg-terracotta text-white px-6 py-3 rounded-lg hover:bg-terracotta/90 transition-colors"
        >
          Back to Explore
        </button>
      </div>
    )
  }

  return (
    <div className="pt-24 min-h-screen bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <nav className="mb-8">
          <Link to="/" className="text-sm text-stone-500 hover:text-terracotta transition-colors mr-6">
            Home
          </Link>
          <Link to="/artisans" className="text-sm text-stone-500 hover:text-terracotta transition-colors mr-6">
            Artisans
          </Link>
        </nav>

        {/* Artisan Header */}
        <div className="flex flex-col items-center mb-10">
          {artisan && (
            <img
              src={artisan.avatar_url}
              alt={artisan.display_name}
              width={200}
              height={200}
              className="rounded-full shadow-lg border border-terracotta/30"
            />
          )}
          <h2 className="text-3xl md:text-6xl font-serif text-ink mb-2">
            {artisan?.display_name}
          </h2>
          <p className="text-lg text-stone-500">
            {artisan?.region} • {artisan?.craft}
          </p>
          <div className="flex items-center gap-2 mt-2">
            {artisan?.is_verified && (
              <VerifiedBadge isVerified={true} mode="real" />
            )}
            <span className="text-sm text-stone-500">· {artisan?.years_experience} years experience</span>
          </div>
        </div>

        {/* About Section */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold text-ink mb-2">About</h3>
          <p className="text-stone-500 leading-relaxed">{artisan?.bio}</p>
        </div>

        {/* Workshop Info */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-stone-500">Location:</p>
            <p className="text-lg font-medium text-ink">{artisan?.workshop_location}</p>
          </div>
          <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-stone-500">Experience:</p>
            <p className="text-lg font-medium text-ink">{artisan?.years_experience}</p>
          </div>
        </div>

        {/* Artworks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-stone-500">No artworks listed yet.</p>
            </div>
          ) : (
            artworks.map((art) => (
              <ArtworkCard
                key={art.artwork_id}
                artwork={{
                  ...art,
                  craft: art.craft || artisan?.craft || 'Handmade Art',
                  region: art.region || artisan?.region || 'India',
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
