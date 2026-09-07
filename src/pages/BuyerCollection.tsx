import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useShop } from '../context/ShopContext'
import { apiUrl } from '../lib/api'

type Artwork = {
  artwork_id: string
  title: string
  price: number
  image_url: string
  certificate_id: string
  provenance_events: Array<{
    type: string
    description: string
  }>
}

export default function BuyerCollection() {
  const { id: buyerId } = useParams()
  const { user } = useShop()
  const navigate = useNavigate()
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCollection = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(apiUrl(`/api/v1/orders?buyer_id=${buyerId}`))
        if (!res.ok) throw new Error('Failed to fetch orders')
        const orders = await res.json()

        const artworkIds = Array.from(new Set(orders.map((o: { artwork_id: string }) => o.artwork_id)))

        const artworkPromises = artworkIds.map((id: string) =>
          fetch(apiUrl(`/api/v1/artworks/${id}`))
            .then((res) => res.ok ? res.json() : null)
            .catch(() => null)
        )
        const artworksData = await Promise.all(artworkPromises)
        const filtered = artworksData.filter((a) => a !== null) as Artwork[]
        setArtworks(filtered)
      } catch (err) {
        setError('Failed to load collection')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchCollection()
  }, [buyerId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
          <p className="text-stone-500">Loading your collection...</p>
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
          onClick={() => {
            setError(null)
            setLoading(true)
          }}
          className="mt-4 bg-terracotta text-white px-6 py-3 rounded-lg hover:bg-terracotta/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="bg-canvas min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-6xl font-serif text-ink mb-8">
          My KALAA Collection
        </h1>

        {artworks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-stone-500">Your collection is empty</p>
            <button
              onClick={() => navigate('/explore')}
              className="mt-4 bg-terracotta text-white px-6 py-3 rounded-lg hover:bg-terracotta/90 transition-colors"
            >
              Start Collecting
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {artworks.map((art) => (
              <div key={art.artwork_id} className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-lg transition-shadow">
                <div className="relative h-48 w-full mb-4">
                  <img
                    src={art.image_url}
                    alt={art.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute top-0 right-0 bg-terracotta/30 text-xs text-white rounded-tr-lg p-1">
                    Cert {art.certificate_id.slice(0, 4)}...
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-ink">{art.title}</h3>
                <p className="text-sm text-stone-500 mt-2">{art.price.toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-stone-500">Owned by:</span>
                  <span className="ml-2 text-stone-500">{user?.display_name || ' — '}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-stone-500">Certificate:</span>
                  <span className="ml-2 text-stone-400">{art.certificate_id}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-stone-500">Provenance:</span>
                  <span className="ml-2 text-stone-400 line-clamp-2">{art.provenance_events[0]?.description || ' — '}</span>
                </div>
                <div className="flex justify-between mt-4">
                  <Link
                    to={`/product/${art.artwork_id}`}
                    className="text-brand-blue text-sm font-medium hover:underline"
                  >
                    View Artwork
                  </Link>
                  <Link
                    to={`/certificate/${art.certificate_id}`}
                    className="text-brand-purple text-sm font-medium hover:underline"
                  >
                    View Certificate
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
