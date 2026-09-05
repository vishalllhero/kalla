import { useState } from 'react'

type SortOption = 'featured' | 'newest' | 'priceLow' | 'priceHigh' | 'popular'

type SortBarProps = {
  options: SortOption[]
  selected: SortOption
  onChange: (newSort: SortOption) => void
}

export default function SortBar({ options, selected, onChange }: SortBarProps) {
  const [localSort, setLocalSort] = useState<SortOption>(selected)

  const handleSelect = (newSort: SortOption) => {
    setLocalSort(newSort)
    onChange(newSort)
  }

  return (
    <div className="flex flex-col sm:flex-row sm:space-x-4">
      {options.map((opt) => {
        return (
          <button
            key={opt}
            onClick={() => handleSelect(opt)}
            className={`px-4 py-2 rounded-lg border border-stone-200 text-sm font-medium ${
              localSort === opt
                ? 'bg-terracotta text-white'
                : 'bg-white text-stone-500 hover:bg-terracotta/50'
            }`}
            aria-label={`Sort by ${opt}`}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}