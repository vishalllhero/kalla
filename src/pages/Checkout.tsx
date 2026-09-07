import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useShop } from '../context/ShopContext'
import { useWeb3 } from '../context/Web3Context'
import type { Product } from '../data/products'
import { apiUrl } from '../lib/api'

export const Checkout = () => {
  const { id } = useParams()
  const { addToCart, isAuthenticated } = useShop()
  const { exchangeRate, connectWallet } = useWeb3()
  const navigate = useNavigate()
  const [artwork, setArtwork] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const response = await fetch(apiUrl(`/api/v1/artworks/${id}`))
        if (response.ok) {
          const data = await response.json()
          setArtwork(data)
        }
      } catch (error) {
        console.error('Error loading product:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id])

  if (!isAuthenticated) {
    return (
      <div className="pt-24 min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-ink">Login to Continue</h2>
          <p className="text-stone-500 mt-4">Please login to access the checkout flow</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-6 bg-brand-blue text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-blue/90 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="pt-24 min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
          <p className="text-stone-500">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (!artwork) {
    return null
  }

  const klcPrice = artwork.price * exchangeRate

  return (
    <div className="pt-24 min-h-screen bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-serif text-ink">Checkout</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-brand-blue"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Product Information */}
        <div className="flex flex-col md:flex-row gap-6 mb-10">
          <div className="w-full md:w-2/5">
            <div className="relative bg-white rounded-xl shadow-md overflow-hidden">
              <img
                src={artwork.image}
                alt={artwork.name}
                className="w-full h-64 object-cover"
              />
              <div className="absolute bottom-0 right-0 bg-white/80 p-3">
                <span className="text-xs font-bold">High Quality</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-3/5">
            <h2 className="text-3xl font-serif text-ink mb-4">{artwork.name}</h2>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold">Craft:</span>
                <span className="ml-2 text-stone-500">{artwork.category}</span>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center gap-4">
                <span className="text-sm text-stone-500">Price:</span>
                <span className="text-3xl font-bold text-ink">{artwork.price.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-stone-500">Currency:</span>
                <span className="ml-2 text-stone-500">INR</span>
              </div>
            </div>

            <div className="mt-10">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => addToCart(artwork)}
                  className="flex items-center gap-2 bg-brand-blue/10 text-brand-blue/80 hover:bg-brand-blue/70 rounded-lg py-3 px-5 transition-colors"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => connectWallet()}
                  className="px-6 py-3 border border-brand-purple/30 text-brand-purple hover:bg-brand-purple/30 rounded-lg transition-colors"
                >
                  Buy with KLC ({klcPrice} KLC)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Summary */}
        <div className="mt-12 bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-ink mb-4">Order Summary</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-stone-500">Artwork:</span>
              <span className="text-sm text-ink">{artwork.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-stone-500">₹{artwork.price.toLocaleString()}</span>
              <span className="ml-4 text-sm text-stone-400">(₹500 platform fee included)</span>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-6">
            <span className="text-sm text-stone-500">Total:</span>
            <span className="text-2xl font-bold text-ink">₹{artwork.price.toLocaleString()}</span>
          </div>

          <div className="mt-6">
            <button
              onClick={() => navigate(`/checkout/${id}`)}
              className="w-full bg-brand-blue text-white rounded-lg py-3 font-medium hover:bg-brand-blue/90 transition-colors shadow-md"
            >
              Continue to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
