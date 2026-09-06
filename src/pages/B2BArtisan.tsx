import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Tag, IndianRupee, User, CheckCircle, XCircle, Clock, Sparkles, ExternalLink } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { b2bApi, B2BRequest, B2BMatch } from '../lib/api'

export const B2BArtisan = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [myMatches, setMyMatches] = useState<B2BRequest[]>([])
  const [openRequests, setOpenRequests] = useState<B2BRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'open' | 'my-matches'>('open')
  const [searchCraft, setSearchCraft] = useState('')
  const [searchRegion, setSearchRegion] = useState('')

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/dashboard')
      return
    }
    if (isAuthenticated && user?.role !== 'artisan' && user?.role !== 'admin') {
      navigate('/dashboard')
      return
    }
    loadData()
  }, [isAuthenticated, authLoading, user, navigate])

  const loadData = async () => {
    setLoading(true)
    try {
      const [matches, open] = await Promise.all([
        b2bApi.getMyMatches(),
        b2bApi.getOpenRequests(searchCraft || undefined, searchRegion || undefined),
      ])
      setMyMatches(matches)
      setOpenRequests(open)
    } catch (error) {
      console.error('Failed to load B2B data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setSearchCraft('')
    setSearchRegion('')
    loadData()
  }

  if (authLoading || loading) {
    return (
      <div className="pt-24 min-h-screen bg-stone-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
          <p className="text-stone-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-24 min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-serif text-ink mb-8">B2B Opportunities</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-stone-200">
          <button
            onClick={() => setActiveTab('open')}
            className={`px-4 py-2 rounded-lg border border-stone-300 text-sm font-medium transition-colors ${
              activeTab === 'open'
                ? 'text-brand-blue border-b-2 border-brand-blue'
                : 'text-stone-600 hover:text-ink'
            }`}
          >
            Open Opportunities
          </button>
          <button
            onClick={() => setActiveTab('my-matches')}
            className={`px-4 py-2 rounded-lg border border-stone-300 text-sm font-medium transition-colors ${
              activeTab === 'my-matches'
                ? 'text-brand-blue border-b-2 border-brand-blue'
                : 'text-stone-600 hover:text-ink'
            }`}
          >
            My Matches ({myMatches.length})
          </button>
        </div>

        {/* Search Filters */}
        {activeTab === 'open' && (
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <label htmlFor="craft-search" className="text-xs font-semibold text-stone-500">
                Craft
              </label>
              <input
                id="craft-search"
                type="text"
                value={searchCraft}
                onChange={(e) => setSearchCraft(e.target.value)}
                placeholder="Search by craft..."
                className="w-full pl-10 pr-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-brand-blue/10 outline-none"
              />
              <Tag size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            </div>
            <div className="flex-1 relative">
              <label htmlFor="region-search" className="text-xs font-semibold text-stone-500">
                Region
              </label>
              <input
                id="region-search"
                type="text"
                value={searchRegion}
                onChange={(e) => setSearchRegion(e.target.value)}
                placeholder="Search by region..."
                className="w-full pl-10 pr-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-brand-blue/10 outline-none"
              />
              <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            </div>
            <button onClick={handleSearch} className="bg-brand-blue text-white px-6 py-2 rounded-lg font-medium hover:bg-brand-blue/90 transition-colors flex items-center gap-2" aria-label="Search opportunities">
              <MapPin size={18} />
              Search
            </button>
          </div>
        )}

        {/* Open Opportunities */}
        {activeTab === 'open' && (
          <div>
            {openRequests.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <Clock size={48} className="mx-auto text-stone-300 mb-4" />
                <h3 className="text-xl font-medium text-ink mb-2">No open B2B opportunities found</h3>
                <p className="text-stone-500">New opportunities are added regularly. Check back soon!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {openRequests.map((req) => (
                  <B2BOpportunityCard key={req.id} request={req} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Matches */}
        {activeTab === 'my-matches' && (
          <div>
            {myMatches.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <Sparkles size={48} className="mx-auto text-stone-300 mb-4" />
                <h3 className="text-xl font-medium text-ink mb-2">No matches yet</h3>
                <p className="text-stone-500">Browse open opportunities and they may be matched here.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {myMatches.map((req) => (
                  <B2BRequestCard key={req.id} request={req} showMatches />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* B2BOpportunityCard */
const B2BOpportunityCard = ({ request }: { request: B2BRequest }) => {
  const formatBudget = () => {
    if (request.budget_min && request.budget_max) {
      return `₹${request.budget_min.toLocaleString()} - ₹${request.budget_max.toLocaleString()}`
    }
    if (request.budget_max) return `Up to ₹${request.budget_max.toLocaleString()}`
    if (request.budget_min) return `From ₹${request.budget_min.toLocaleString()}`
    return 'Budget not specified'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-serif text-ink mb-2">{request.title}</h3>
          <p className="text-stone-600 text-sm mb-3 line-clamp-2">{request.description}</p>
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2 text-stone-600">
          <Tag size={16} />
          <span>Craft: {request.craft || 'Any'}</span>
        </div>
        <div className="flex items-center gap-2 text-stone-600">
          <IndianRupee size={16} />
          <span>{formatBudget()}</span>
        </div>
        <div className="flex items-center gap-2 text-stone-600">
          <User size={16} />
          <span>Qty: {request.quantity_required}</span>
        </div>
        {request.region && (
          <div className="flex items-center gap-2 text-stone-600">
            <MapPin size={16} />
            <span>{request.region}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-stone-500 mb-4">
        <span>Buyer: {request.buyer_name || 'Unknown'}</span>
        <span>•</span>
        <span>Created: {new Date(request.created_at).toLocaleDateString()}</span>
        {request.deadline && (
          <>
            <span>•</span>
            <span>Deadline: {new Date(request.deadline).toLocaleDateString()}</span>
          </>
        )}
      </div>

      <button
        onClick={() => alert('Feature: Matchmaking will find suitable opportunities. Click "Find Matches" on the buyer side or contact the buyer directly.')}
        className="text-sm text-brand-blue font-medium hover:underline flex items-center gap-2"
      >
        View Details
        <ExternalLink size={14} />
      </button>
    </div>
  )
}

/* B2B Request Card */
const B2BRequestCard = ({
  request,
  showMatches = true,
  onAccept,
}: {
  request: B2BRequest
  showMatches?: boolean
  onAccept?: (requestId: string, artisanId: string) => void
}) => {
  const statusColors: Record<string, string> = {
    open: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-700',
    pending: 'bg-yellow-100 text-yellow-700',
  }
  const statusColor = statusColors[request.status] || 'bg-stone-100 text-stone-700'

  const formatBudget = () => {
    if (request.budget_min && request.budget_max) {
      return `₹${request.budget_min.toLocaleString()} - ₹${request.budget_max.toLocaleString()}`
    }
    if (request.budget_max) return `Up to ₹${request.budget_max.toLocaleString()}`
    if (request.budget_min) return `From ₹${request.budget_min.toLocaleString()}`
    return 'No budget specified'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-serif text-ink mb-2">{request.title}</h3>
          <p className="text-stone-600 text-sm mb-3 line-clamp-2">{request.description}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2 text-stone-600">
          <Tag size={16} />
          <span>Craft: {request.craft || 'Any'}</span>
        </div>
        <div className="flex items-center gap-2 text-stone-600">
          <IndianRupee size={16} />
          <span>{formatBudget()}</span>
        </div>
        <div className="flex items-center gap-2 text-stone-600">
          <User size={16} />
          <span>Qty: {request.quantity_required}</span>
        </div>
        {request.region && (
          <div className="flex items-center gap-2 text-stone-600">
            <MapPin size={16} />
            <span>{request.region}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-stone-500 mb-4">
        <span>Buyer: {request.buyer_name || 'Unknown'}</span>
        <span>•</span>
        <span>Created: {new Date(request.created_at).toLocaleDateString()}</span>
        {request.deadline && (
          <>
            <span>•</span>
            <span>Deadline: {new Date(request.deadline).toLocaleDateString()}</span>
          </>
        )}
      </div>

      {showMatches && request.matches && request.matches.length > 0 ? (
        <div className="border border-stone-100 rounded-lg p-4 mt-4">
          <h4 className="font-medium text-ink mb-3 flex items-center gap-2">
            <Sparkles size={16} />
            AI Matches ({request.matches.length})
          </h4>
          <div className="space-y-3">
            {request.matches.map((match) => (
              <B2BMatchCard
                key={match.id}
                match={match}
                onAccept={onAccept ? () => onAccept(request.id, match.artisan_id) : undefined}
                requestStatus={request.status}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-sm text-stone-500 flex items-center gap-2">
          <Sparkles size={14} className="text-brand-blue" />
          <span>Open for artisan matching</span>
        </div>
      )}
    </div>
  )
}

/* Match Card Component */
const B2BMatchCard = ({
  match,
  onAccept,
  requestStatus,
}: {
  match: B2BMatch
  onAccept?: () => void
  requestStatus: string
}) => {
  const canAccept = requestStatus === 'open' && !match.is_accepted && !match.is_rejected

  return (
    <div className="border border-stone-100 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex gap-4">
        {match.artwork_image_url && (
          <div className="w-16 h-16 rounded-md overflow-hidden bg-stone-100 flex-shrink-0">
            <img
              src={match.artwork_image_url}
              alt={match.artwork_title || 'Artwork'}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h5 className="text-sm font-medium text-ink">{match.artisan_name || 'Unknown Artisan'}</h5>
              <p className="text-sm text-stone-600 truncate">{match.artwork_title || 'Untitled Artwork'}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-brand-blue">{Math.round(match.match_score)}%</span>
              {match.is_accepted && <CheckCircle size={20} className="text-green-500" />}
              {match.is_rejected && <XCircle size={20} className="text-stone-300" />}
            </div>
          </div>
          {match.match_factors && (
            <div className="flex flex-wrap gap-2 mt-3">
              {Object.entries(match.match_factors).map(([key, value]) => (
                <span
                  key={key}
                  className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded"
                >
                  {key.replace(/_/g, ' ')}: {String(value)}
                </span>
              ))}
            </div>
          )}
          {canAccept && (
            <button
              onClick={() => onAccept()}
              className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
            >
              Accept Match
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
