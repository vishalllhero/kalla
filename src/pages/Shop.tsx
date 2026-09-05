import React, { useState, useMemo } from 'react';
import { ChevronDown, Grid, List } from 'lucide-react';
import { products, categories } from '../data/products';
import { ProductCard } from '../components/ProductCard';

export const Shop = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [sortBy, setSortBy] = useState('featured');

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      return matchesCategory && matchesPrice;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });
  }, [selectedCategory, priceRange, sortBy]);

  return (
    <div className="pt-24 min-h-screen bg-canvas">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-serif text-ink mb-4">The Collection</h1>
          <p className="text-ink/60 max-w-2xl">Curated handpainted masterpieces, ethical fashion, and artisan decor.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Sidebar Filters - Amazon Style */}
          <div className="w-full lg:w-64 flex-shrink-0 space-y-8">
            {/* Categories */}
            <div>
              <h3 className="font-bold text-sm uppercase tracking-widest mb-4 text-ink">Categories</h3>
              <ul className="space-y-2">
                {categories.map(cat => (
                  <li key={cat}>
                    <button 
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-sm hover:text-brand-blue transition-colors ${selectedCategory === cat ? 'font-bold text-brand-blue' : 'text-ink/70'}`}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Slider */}
            <div>
              <h3 className="font-bold text-sm uppercase tracking-widest mb-4 text-ink">Price Range</h3>
              <input 
                type="range" 
                min="0" 
                max="300" 
                value={priceRange[1]} 
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-brand-blue"
              />
              <div className="flex justify-between text-xs text-ink/60 mt-2">
                <span>$0</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>

            {/* Colors (Mock) */}
            <div>
              <h3 className="font-bold text-sm uppercase tracking-widest mb-4 text-ink">Color Palette</h3>
              <div className="flex flex-wrap gap-3">
                {['#2E86C1', '#FF7F50', '#9B59B6', '#000000', '#FFFFFF', '#27AE60'].map(c => (
                  <button 
                    key={c}
                    className="w-6 h-6 rounded-full border border-stone-200 shadow-sm hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-wrap justify-between items-center mb-8 pb-4 border-b border-stone-200/50">
              <p className="text-sm text-ink/60">{filteredProducts.length} Masterpieces Found</p>
              
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <button className="flex items-center gap-2 text-sm font-medium hover:text-brand-blue">
                    Sort by: {sortBy === 'featured' ? 'Featured' : sortBy} <ChevronDown size={14} />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-40 bg-white shadow-xl rounded-lg py-2 hidden group-hover:block z-20 border border-stone-100">
                    <button onClick={() => setSortBy('featured')} className="block w-full text-left px-4 py-2 text-sm hover:bg-stone-50">Featured</button>
                    <button onClick={() => setSortBy('price-low')} className="block w-full text-left px-4 py-2 text-sm hover:bg-stone-50">Price: Low to High</button>
                    <button onClick={() => setSortBy('price-high')} className="block w-full text-left px-4 py-2 text-sm hover:bg-stone-50">Price: High to Low</button>
                    <button onClick={() => setSortBy('rating')} className="block w-full text-left px-4 py-2 text-sm hover:bg-stone-50">Top Rated</button>
                  </div>
                </div>

                <div className="flex items-center border border-stone-200 rounded-md p-1">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-stone-100 text-ink' : 'text-stone-400'}`}
                  >
                    <Grid size={16} />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-stone-100 text-ink' : 'text-stone-400'}`}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-xl font-serif text-ink/50">No artworks match your criteria.</p>
                <button onClick={() => {setSelectedCategory('All'); setPriceRange([0, 300]);}} className="mt-4 text-brand-blue hover:underline">Clear Filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
