import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useWeb3 } from '../context/Web3Context'
import VerifiedBadge from '../components/VerifiedBadge'
import DigitalIdentityPanel from '../components/DigitalIdentityPanel'
import ProvenanceTimeline from '../components/ProvenanceTimeline'
import { Heart, Share2, Wallet, Truck, RotateCcw, Shield, ArrowLeft } from 'lucide-react'
import { API_BASE_URL } from '../lib/api'

type ArtworkDetails = {
  artwork_id: string
  title: string
  description: string
  price: number
  currency: string
  region: string
  craft: string
  verified: boolean
  image_url: string
  certificate_id: string
  blockchain_status: string
  blockchain_tx_hash: string | null
  created_at: string
  listed_at: string
  sold_at: string | null
}

export function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isConnected, connectWallet, exchangeRate } = useWeb3()
  const [artwork, setArtwork] = useState<ArtworkDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'description' | 'artistNote' | 'reviews'>('description')

  useEffect(() => {
    const fetchArtwork = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/artworks/${id}`)
        if (!res.ok) {
          throw new Error('Artwork not found')
        }
        const data = await res.json()
        setArtwork(data)
      } catch (err) {
        setError('Failed to load artwork')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchArtwork()
  }, [id])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
          <p className="text-stone-500">Loading artwork details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center min-h-screen pt-32">
        <h2 className="text-2xl font-semibold text-ink mb-4">Error</h2>
        <p className="text-stone-400">{error}</p>
        <button
          onClick={() => {
            setError(null)
            navigate('/explore')
          }}
          className="mt-4 bg-terracotta text-white px-6 py-3 rounded-lg hover:bg-terracotta/90 transition-colors"
        >
          Go Back to Explore
        </button>
      </div>
    )
  }

  if (!artwork) return null

  const klcPrice = artwork.price * exchangeRate

  return (
    <div className="pt-24 min-h-screen bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Left: Large Image Gallery */}
        <div className="w-full lg:w-2/5">
          <div className="relative rounded-xl shadow-xl border border-stone-100 overflow-hidden">
            <img
              src={artwork.image_url}
              alt={artwork.title}
              className="w-full h-96 object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute bottom-0 right-0 bg-white/80 p-2 text-xs font-medium text-stone-500">
              Hover to view details
            </div>
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="w-full lg:w-3/5 lg:pl-8 pt-8">
          <div className="flex justify-between items-start mb-6">
            <Link to="/" className="text-sm text-stone-500 hover:text-terracotta transition-colors">
              Home / Shop / {artwork.craft} / {artwork.region}
            </Link>
            <button
              onClick={() => navigate('/explore')}
              className="text-sm text-stone-500 hover:text-terracotta transition-colors flex items-center gap-1"
            >
              <ArrowLeft size={14} />
              Back to Shop
            </button>
          </div>

          {/* Title & Badges */}
          <h1 className="text-4xl md:text-5xl font-serif text-ink mb-4">{artwork.title}</h1>
          <VerifiedBadge isVerified={artwork.verified} mode="demo" />
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm text-stone-500">Craft:</span>
            <span className="ml-2 text-stone-500">{artwork.craft}</span>
            <span className="ml-4 text-sm text-stone-500">Region: {artwork.region}</span>
          </div>

          {/* Price */}
          <div className="mt-6">
            <span className="text-sm text-stone-500">Price:</span>
            <span className="text-3xl md:text-4xl font-bold text-ink">{artwork.price.toLocaleString()}</span>
            <span className="ml-4 text-sm text-stone-400">({artwork.currency})</span>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col gap-4">
            <Link
              to={`/checkout/${artwork.artwork_id}`}
              className="flex items-center gap-2 px-6 py-3 bg-terracotta rounded-lg text-white font-medium hover:bg-terracotta/90 transition-colors shadow-sm"
              aria-label={`Buy ${artwork.title}`}
            >
              BUY NOW
            </Link>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  alert('Saved to wishlist!')
                }}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
                aria-label={`Add ${artwork.title} to wishlist`}
              >
                <Heart size={18} />
                <span>Wishlist</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href)
                  alert('Artwork link copied to clipboard!')
                }}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
                aria-label={`Share ${artwork.title}`}
              >
                <Share2 size={18} />
                <span>Share</span>
              </button>
            </div>
            <button
              onClick={() => {
                if (isConnected) {
                  alert('Processing KLC Payment...')
                } else {
                  connectWallet()
                }
              }}
              className="w-full py-3 bg-brand-purple/10 border border-brand-purple/30 text-brand-purple rounded-lg font-bold hover:bg-brand-purple hover:text-white transition-all flex items-center justify-center gap-2"
              aria-label={`Connect wallet to pay with KLC (${klcPrice} KLC)`}
            >
              <Wallet size={18} />
              {isConnected ? `Buy with KLC (${klcPrice} KLC)` : 'Connect Wallet to Pay with KLC'}
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-stone-100 my-8">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="text-brand-blue">
              <Truck size={24} />
            </div>
            <span className="text-xs font-medium">Free Shipping</span>
          </div>
          <div className="flex flex-col items-center text-center gap-2">
            <motion.div
              className="text-brand-purple"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <RotateCcw size={24} />
            </motion.div>
            <span className="text-xs font-medium">7 Day Returns</span>
          </div>
          <div className="flex flex-col items-center text-center gap-2">
            <div className="text-brand-blue">
              <Shield size={24} />
            </div>
            <span className="text-xs font-medium">100% Authentic Handcrafted</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-stone-200 mb-6">
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-2 text-sm font-bold uppercase tracking-widest transition-colors relative ${
              activeTab === 'description'
                ? 'text-brand-blue border-b-2 border-brand-blue'
                : 'text-stone-400 hover:text-ink'
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab('artistNote')}
            className={`pb-2 text-sm font-bold uppercase tracking-widest transition-colors relative ${
              activeTab === 'artistNote'
                ? 'text-brand-blue border-b-2 border-brand-blue'
                : 'text-stone-400 hover:text-ink'
            }`}
          >
            Artist Note
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-2 text-sm font-bold uppercase tracking-widest transition-colors relative ${
              activeTab === 'reviews'
                ? 'text-brand-blue border-b-2 border-brand-blue'
                : 'text-stone-400 hover:text-ink'
            }`}
          >
            Provenance & Verification
          </button>
        </div>

        {/* Content Tabs */}
        <div className="prose prose-stone max-w-none">
          {activeTab === 'description' && (
            <p className="text-ink/70 leading-relaxed text-base">
              {artwork.description || "Experience the luxury of handpainted art. Each piece is unique, crafted with passion and precision by our master artisans."}
            </p>
          )}
          {activeTab === 'artistNote' && (
            <p className="text-ink/70 leading-relaxed text-base">
              Handcrafted in {artwork.region} using traditional {artwork.craft} techniques passed down through generations. Certified authentic under the KALAA Artisan Assurance Program.
            </p>
          )}
          {activeTab === 'reviews' && (
            <div className="space-y-6 not-prose">
              <DigitalIdentityPanel
                artworkId={artwork.artwork_id}
                certificateId={artwork.certificate_id || 'CERT-DEMO-001'}
                network={artwork.blockchain_status || 'KALAA Demo Blockchain'}
                status="Verified on Testnet"
                transactionHash={artwork.blockchain_tx_hash || '0x4f8a...9c2d'}
              />
              <ProvenanceTimeline
                events={[
                  {
                    type: 'creation',
                    title: 'Crafted by Artisan',
                    description: `Handcrafted in ${artwork.region} with certified heritage materials`,
                    date: artwork.created_at || new Date().toISOString(),
                  },
                  {
                    type: 'verification',
                    title: 'KALAA Verification & Digital Identity',
                    description: 'Physical artwork inspected and certificate registered on demo ledger',
                    date: artwork.listed_at || new Date().toISOString(),
                    isOnChain: true,
                  },
                ]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


export default ProductDetails;