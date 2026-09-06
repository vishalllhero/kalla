import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Check, FileText, ShoppingCart } from 'lucide-react'
import ProvenanceTimeline from '../components/ProvenanceTimeline'
import { API_BASE_URL } from '../lib/api'

type PurchaseData = {
  order_id: string
  artwork: {
    artwork_id: string
    title: string
    image_url: string
  }
  total_amount: number
  currency: string
  payment_method: string
  status: string
  buyer_info: {
    name: string
  }
  artisan_info: {
    name: string
  }
  transaction_hash: string
  timestamp: string
  message: string
}

export function PurchaseSuccess() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [purchase, setPurchase] = useState<PurchaseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPurchase = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/orders/${id}`)
        if (!res.ok) throw new Error('Purchase not found')
        const data = await res.json()
        setPurchase(data)
      } catch (err) {
        setError('Could not load purchase details')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (id) {
      fetchPurchase()
    }
  }, [id])

  if (!isAuthenticated) {
    return (
      <div className="pt-24 min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-ink">Login to Continue</h2>
          <p className="text-stone-500 mt-4">Please login to view your purchase confirmation</p>
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
          <p className="text-stone-500">Loading purchase details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-3xl font-semibold text-ink mb-4">Error</h2>
        <p className="text-stone-400">{error}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 bg-terracotta text-white px-6 py-3 rounded-lg hover:bg-terracotta/90 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  if (!purchase) return null

  return (
    <div className="pt-24 min-h-screen bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Link to="/" className="text-sm text-stone-500 hover:text-terracotta transition-colors">
            Home
          </Link>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-stone-500 hover:text-terracotta transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="text-6xl font-bold text-terracotta"
            >
              ✓
            </motion.div>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif text-ink mb-2">Purchase Successful</h1>
          <p className="text-xl md:text-2xl text-ink/70 max-w-2xl mx-auto">
            Your purchase of '{purchase.artwork.title}' was successful.
          </p>
        </div>

        {/* Order Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {/* Artwork */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <img
              src={purchase.artwork.image_url}
              alt={purchase.artwork.title}
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="absolute bottom-0 right-0 bg-white/80 p-2 text-xs font-bold text-stone-500">
              High Quality
            </div>
          </div>

          {/* Order Details */}
          <div className="flex flex-col md:flex-row">
            {/* Order Info */}
            <div className="space-y-4">
              <p className="text-sm text-stone-500">Order ID:</p>
              <p className="text-lg font-medium text-ink">{purchase.order_id}</p>

              <p className="text-sm text-stone-500">Artwork ID:</p>
              <p className="text-lg font-medium text-ink">{purchase.artwork.artwork_id}</p>

              <p className="text-sm text-stone-500">Certificate ID:</p>
              <p className="text-lg font-medium text-ink">{purchase.transaction_hash.slice(0, 8)}...</p>

              <p className="text-sm text-stone-500">Status:</p>
              <p className="text-lg font-medium text-green-500">{purchase.status}</p>

              <p className="text-sm text-stone-500">Blockchain Status:</p>
              <p className="text-lg font-medium text-ink">
                {'✓ Confirmed'}
              </p>

              <p className="text-sm text-stone-500">Order Date:</p>
              <p className="text-sm text-stone-500">
                {new Date(purchase.timestamp).toLocaleString()}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-4">
              <Link
                to={`/product/${purchase.artwork.artwork_id}`}
                className="flex items-center gap-2 px-6 py-3 bg-terracotta rounded-lg text-white font-medium hover:bg-terracotta/90 transition-colors shadow-sm"
              >
                <Check size={20} className="text-green-500" />
                <span>View Artwork</span>
              </Link>
              <Link
                to={`/certificate/${purchase.transaction_hash}`}
                className="flex items-center gap-2 px-6 py-3 bg-muted-gold text-ink rounded-lg hover:bg-muted-gold/80 transition-colors"
              >
                <FileText size={16} />
                <span>View Certificate</span>
              </Link>
              <Link
                to={`/orders/${purchase.order_id}`}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-stone-200 rounded-lg text-stone-500 hover:bg-stone-50 transition-colors"
              >
                <ShoppingCart size={16} />
                <span>View Order</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Provenance Timeline */}
        <div className="mt-8">
          <ProvenanceTimeline events={[
            { type: 'created', title: 'Created', description: 'Artwork created by artisan', date: purchase.timestamp, isOnChain: false },
            { type: 'registered', title: 'Registered', description: 'Registered on KALAA blockchain', date: purchase.timestamp, isOnChain: true },
            { type: 'certificate', title: 'Certificate Issued', description: 'Digital certificate issued', date: purchase.timestamp, isOnChain: true },
            { type: 'sold', title: 'Sold', description: 'Ownership transferred', date: purchase.timestamp, isOnChain: true },
          ]}
          />
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-brand-blue text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-blue/90 transition-colors shadow-sm"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default PurchaseSuccess;
