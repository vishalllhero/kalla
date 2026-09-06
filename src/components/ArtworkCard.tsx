import React, { useState } from 'react'
import { Link } from 'react-router-dom'

type ArtworkCardProps = {
  artwork: {
    artwork_id: string
    title: string
    price: number
    craft: string
    region: string
    verified: boolean
    image_url: string
    _id?: string
  }
}

export default function ArtworkCard({ artwork }: ArtworkCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <Link to={`/product/${artwork.artwork_id}`} className="group block">
      <div className="relative group-hover/translate-y-0.5 transition-transform duration-200">
        <div className="relative group-hover/translate-y-0.5">
<img
            src={artwork.image_url ?? artwork.image}
            alt={artwork.title}
            className="rounded-lg shadow-sm overflow-hidden object-cover w-full h-64"
        />
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-xl font-semibold text-ink">{artwork.title}</h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm font-bold text-stone-500">Craft:</span>
          <span className="ml-2 text-stone-500">{artwork.craft}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-stone-500">Region:</span>
          <span className="ml-2 text-stone-500">{artwork.region}</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm text-stone-500">Price:</span>
          <span className="text-3xl font-bold text-ink">{artwork.price.toLocaleString()}</span>
        </div>

        {/* Verified Badge */}
        {artwork.verified && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white bg-terracotta">
            ✓ KALAA VERIFIED
          </span>
        )}

        {/* Artwork ID */}
        <p className="text-xs text-stone-500 mt-3">{artwork.artwork_id}</p>

        {/* Favorite button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsFavorite(!isFavorite)
          }}
          className="mt-3 flex items-center gap-2 text-stone-500 hover:text-terracotta focus:ring-terracotta focus:outline-none transition-colors"
          aria-label={`Add ${artwork.title} to wishlist`}
        >
          {isFavorite ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 19C12.7604 19 19 15.7604 19 13.5 19 10.5 15.5 19 10 19H10z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-stone-500 hover:text-terracotta focus:ring-terracotta focus:outline-none"
              viewBox="0 0 20 20"
            >
              <path d="M10 9a3 3 0 0 1 3 3v3a3 3 0 1 1-6 0V12a3 3 0 1 1-3-3z" />
            </svg>
          )}
        </button>
      </div>
    </Link>
  )
}