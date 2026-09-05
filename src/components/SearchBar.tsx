import { useState } from 'react'

export default function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto mb-6">
      <label htmlFor="marketplace-search" className="sr-only">
        Search artworks, artisans and crafts
      </label>
      <input
        id="marketplace-search"
        type="text"
        placeholder="Search artworks, artisans..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search artworks, artisans and crafts"
        className="w-full p-3 rounded-lg border border-stone-200 focus:ring-terracotta focus:border-terracotta"
      />
    </form>
  )
}