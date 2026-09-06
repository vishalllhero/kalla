import { useState, useEffect } from 'react'
import ArtworkCard from '../components/ArtworkCard'
import SearchBar from '../components/SearchBar' 
import FilterBar from '../components/FilterBar'
import SortBar from '../components/SortBar'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'

type FilterOptions = {
  craft: string
  region: string
  material: string
  minPrice: number
  maxPrice: number
  availability: string
  verified: boolean
  creationYear: number
}

type SortOption = 'featured' | 'newest' | 'priceLow' | 'priceHigh' | 'popular'

type Artwork = {
  craft: string
  region: string
  material: string
  price: number
  is_available: string
  verified: boolean
  creationYear: number
  viewCount: number
  [key: string]: unknown
}

export default function Explore() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterOptions>({
    craft: '',
    region: '',
    material: '',
    minPrice: 0,
    maxPrice: 100000,
    availability: 'all',
    verified: false,
    creationYear: 0,
  })
  const [sort, setSort] = useState<SortOption>('featured')

  // Fetch artworks
  useEffect(() => {
    const fetchArtworks = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/v1/artworks')
        if (!res.ok) {
          throw new Error('Failed to fetch artworks')
        }
        const data = await res.json()
        setArtworks(data)
      } catch (err) {
        setError('Unable to load artworks')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchArtworks()
  }, [])

  // Apply filters and sorting
  const filteredArtworks = artworks.filter((art) => {
    const a = art
    return (
      (!filters.craft || a.craft.toLowerCase().includes(filters.craft.toLowerCase())) &&
      (!filters.region || a.region.toLowerCase().includes(filters.region.toLowerCase())) &&
      (!filters.material || a.material.toLowerCase().includes(filters.material.toLowerCase())) &&
      (a.price >= filters.minPrice) &&
      (a.price <= filters.maxPrice) &&
      (filters.availability === 'all' || a.is_available === filters.availability) &&
      (!filters.verified || a.verified) &&
      (filters.creationYear === 0 || a.creationYear >= filters.creationYear)
    )
  })

  const sortedArtworks = [...filteredArtworks].sort((a, b) => {
    if (sort === 'featured') return 0
    if (sort === 'newest') return b.creationYear - a.creationYear
    if (sort === 'priceLow') return a.price - b.price
    if (sort === 'priceHigh') return b.price - a.price
    if (sort === 'popular') return b.viewCount - a.viewCount
    return 0
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <LoadingSkeleton paragraphs={3} images={5} />
      </div>
    )
  }

  if (error) {
    return (
      <EmptyState
        message="Error loading marketplace"
        illustration={<div className="text-center" />}
        ctaLabel="Try Again"
        onCta={() => {
          setError(null)
          setLoading(true)
          fetchArtworks()
        }}
      />
    )
  }

  return (
    <div className="bg-canvas min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
{/* Search & Filters */}
         <div className="flex flex-col sm:flex-row gap-6 mb-10">
           <SearchBar />
           <FilterBar options={filters} onChange={setFilters} />
           <SortBar options={sort} onChange={setSort} />
         </div>
 
         {/* Page Header */}
         <div className="text-center py-12">
           <h2 className="text-4xl md:text-5xl font-serif text-ink mb-4">Discover Premium Artisan Creations</h2>
           <p className="text-xl md:text-2xl text-ink/70 max-w-2xl mx-auto">Explore a curated collection of handcrafted Indian artworks, each with verified authenticity and elegant presentation.</p>
         </div>
 
         {/* Artwork Grid */}
         <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            <LoadingSkeleton paragraphs={4} images={8} />
          ) : sortedArtworks.length === 0 ? (
            <EmptyState
              message="No artworks found"
              illustration={<div className="flex justify-center" />}
              ctaLabel="Browse Categories"
            />
          ) : (
            sortedArtworks.map((artwork) => (
              <ArtworkCard key={artwork.artwork_id} artwork={artwork} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}