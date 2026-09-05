import { useState } from 'react'

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

type FilterBarProps = {
  options: FilterOptions
  onChange: (newFilters: FilterOptions) => void
}

export default function FilterBar({ options, onChange }: FilterBarProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(options)

  const handleChange = (field: keyof FilterOptions, value: string | number | boolean) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const applyChanges = () => {
    onChange(localFilters)
  }

  return (
    <div className="space-y-4 sm:space-y-0 sm:flex sm:space-x-4">
      {/* Craft */}
      <div className="flex flex-col sm:flex-row sm:space-x-4">
        <label htmlFor="craft-filter" className="text-xs font-semibold text-stone-500">
          Craft
        </label>
        <input
          id="craft-filter"
          type="text"
          placeholder="e.g. Pottery"
          value={localFilters.craft}
          onChange={(e) => handleChange('craft', e.target.value)}
          className="mt-1 px-3 py-1 border border-stone-200 rounded-lg focus:ring-terracotta focus:border-terracotta"
        />
      </div>

      {/* Region */}
      <div className="flex flex-col sm:flex-row sm:space-x-4">
        <label htmlFor="region-filter" className="text-xs font-semibold text-stone-500">Region</label>
        <input
          id="region-filter"
          type="text"
          placeholder="e.g. Jaipur"
          value={localFilters.region}
          onChange={(e) => handleChange('region', e.target.value)}
          className="mt-1 px-3 py-1 border border-stone-200 rounded-lg focus:ring-terracotta focus:border-terracotta"
        />
      </div>

      {/* Material */}
      <div className="flex flex-col sm:flex-row sm:space-x-4">
        <label htmlFor="material-filter" className="text-xs font-semibold text-stone-500">Material</label>
        <input
          id="material-filter"
          type="text"
          placeholder="e.g. Cotton"
          value={localFilters.material}
          onChange={(e) => handleChange('material', e.target.value)}
          className="mt-1 px-3 py-1 border border-stone-200 rounded-lg focus:ring-terracotta focus:border-terracotta"
        />
      </div>

      {/* Price Range */}
      <div className="flex flex-col sm:flex-row sm:space-x-4">
        <label htmlFor="min-price" className="text-xs font-semibold text-stone-500">Price</label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="0"
            id="min-price"
            value={localFilters.minPrice}
            onChange={(e) => handleChange('minPrice', parseInt(e.target.value, 10))}
            className="px-2 py-1 border border-stone-200 rounded-l"
          />
          <span className="text-sm text-stone-500 mx-1">–</span>
          <input
            type="number"
            min="0"
            id="max-price"
            value={localFilters.maxPrice}
            onChange={(e) => handleChange('maxPrice', parseInt(e.target.value, 10))}
            className="px-3 py-1 border border-stone-200 rounded-r focus:ring-terracotta focus:border-terracotta"
          />
        </div>
      </div>

      {/* Availability */}
      <div className="flex flex-col sm:flex-row sm:space-x-4">
        <label className="text-xs font-semibold text-stone-500">Availability</label>
        <div className="flex items-center space-x-2">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={localFilters.availability === 'all'}
              onChange={(e) => {
                setLocalFilters((prev) => ({
                  ...prev,
                  availability: e.target.checked ? 'all' : 'available'
                }))
              }}
              className="form-radio h-4 w-4 text-teal-500 focus:ring-terracotta"
            />
            <span className="ml-1 text-sm text-stone-500">Available</span>
          </label>
        </div>
      </div>

      {/* Verified */}
      <div className="flex items-center space-x-2">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={localFilters.verified}
            onChange={(e) => {
              setLocalFilters((prev) => ({
                ...prev,
                verified: e.target.checked
              }))
            }}
            className="form-radio h-4 w-4 text-teal-500 focus:ring-terracotta"
            id="verified-filter"
          />
          <span className="ml-1 text-sm text-stone-500">Verified</span>
        </label>
      </div>

      {/* Creation Year */}
      <div className="flex items-center space-x-2">
        <label className="text-xs font-semibold text-stone-500">Year</label>
        <input
          type="number"
          min="2000"
          max="2100"
          value={localFilters.creationYear}
          onChange={(e) => handleChange('creationYear', parseInt(e.target.value, 10))}
          className="px-2 py-1 border border-stone-200 rounded-lg focus:ring-terracotta focus:border-terracotta"
          id="creation-year-filter"
        />
      </div>

      <button
        onClick={applyChanges}
        className="mt-4 sm:mt-0 sm:ml-4 px-5 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors"
      >
        Apply Filters
      </button>
    </div>
  )
}