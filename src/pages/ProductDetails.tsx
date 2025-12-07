import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { products } from '../data/products';
import { Star, Truck, Shield, RotateCcw, Heart, Share2, Wallet } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useWeb3 } from '../context/Web3Context';
import { motion } from 'framer-motion';
import { CoinBadge } from '../components/CoinBadge';

export const ProductDetails = () => {
  const { id } = useParams();
  const product = products.find(p => p.id === Number(id));
  const { addToCart, toggleWishlist, wishlist } = useShop();
  const { exchangeRate, isConnected, connectWallet } = useWeb3();
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0]);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]);
  const [activeTab, setActiveTab] = useState('description');

  if (!product) return <div className="pt-32 text-center">Product not found</div>;

  // Calculate KLC Price
  const klcPrice = product.price * exchangeRate;

  return (
    <div className="pt-24 min-h-screen bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Breadcrumb */}
        <div className="text-sm text-stone-500 mb-8">
          Home / Shop / {product.category} / <span className="text-ink">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/5] bg-white rounded-xl overflow-hidden shadow-lg border border-stone-100 relative group">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125 cursor-zoom-in" 
              />
              <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                Hover to Zoom
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden border border-stone-200 cursor-pointer hover:border-brand-blue">
                  <img src={product.image} className="w-full h-full object-cover opacity-80 hover:opacity-100" alt="thumbnail" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-4xl md:text-5xl font-serif text-ink leading-tight">{product.name}</h1>
              <button 
                onClick={() => toggleWishlist(product.id)}
                className={`p-3 rounded-full border ${wishlist.includes(product.id) ? 'border-brand-orange text-brand-orange bg-brand-orange/10' : 'border-stone-200 text-stone-400 hover:border-brand-orange hover:text-brand-orange'}`}
              >
                <Heart size={20} fill={wishlist.includes(product.id) ? "currentColor" : "none"} />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex text-brand-orange">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} className={i >= Math.floor(product.rating) ? "text-stone-300" : ""} />
                ))}
              </div>
              <span className="text-sm text-stone-500 underline">{product.reviews} Reviews</span>
            </div>

            <div className="flex items-end gap-4 mb-8">
              <div className="text-3xl font-medium text-ink">${product.price}</div>
              <div className="flex items-center gap-1 text-brand-purple font-bold text-lg pb-1">
                <span className="text-sm text-stone-400 font-normal">or</span>
                <CoinBadge size="sm" /> {klcPrice} KLC
              </div>
            </div>

            {/* Selectors */}
            <div className="space-y-6 mb-8">
              {product.colors && (
                <div>
                  <span className="text-sm font-bold uppercase tracking-widest text-stone-500 block mb-3">Color</span>
                  <div className="flex gap-3">
                    {product.colors.map(color => (
                      <button 
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 border rounded-md text-sm transition-all ${selectedColor === color ? 'border-brand-blue bg-brand-blue/5 text-brand-blue font-bold' : 'border-stone-200 hover:border-stone-400'}`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.sizes && (
                <div>
                  <span className="text-sm font-bold uppercase tracking-widest text-stone-500 block mb-3">Size</span>
                  <div className="flex gap-3">
                    {product.sizes.map(size => (
                      <button 
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 flex items-center justify-center border rounded-md text-sm transition-all ${selectedSize === size ? 'border-brand-blue bg-brand-blue text-white' : 'border-stone-200 hover:border-stone-400'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 mb-10">
              <div className="flex gap-4">
                <button 
                  onClick={() => addToCart(product, selectedSize, selectedColor)}
                  className="flex-1 bg-ink text-white py-4 rounded-sm font-medium hover:bg-brand-blue transition-colors shadow-lg hover:shadow-glow-blue"
                >
                  Add to Cart
                </button>
                <button className="px-6 py-4 border border-stone-200 rounded-sm hover:bg-stone-50">
                  <Share2 size={20} />
                </button>
              </div>
              
              {/* KLC Quick Buy */}
              <button 
                onClick={() => isConnected ? alert('Processing KLC Payment...') : connectWallet()}
                className="w-full py-3 bg-brand-purple/10 border border-brand-purple/30 text-brand-purple rounded-sm font-bold hover:bg-brand-purple hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Wallet size={18} />
                {isConnected ? `Buy with KLC (${klcPrice} KLC)` : 'Connect Wallet to Pay with KLC'}
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-stone-100 mb-8">
              <div className="flex flex-col items-center text-center gap-2">
                <Truck className="text-brand-blue" size={24} />
                <span className="text-xs font-medium">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <Shield className="text-brand-purple" size={24} />
                <span className="text-xs font-medium">Authentic Art</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <RotateCcw className="text-brand-orange" size={24} />
                <span className="text-xs font-medium">7 Day Returns</span>
              </div>
            </div>

            {/* Tabs */}
            <div>
              <div className="flex gap-8 border-b border-stone-200 mb-4">
                {['Description', 'Artist Note', 'Reviews'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                    className={`pb-2 text-sm font-bold uppercase tracking-widest transition-colors relative ${activeTab === tab.toLowerCase() ? 'text-brand-blue' : 'text-stone-400 hover:text-ink'}`}
                  >
                    {tab}
                    {activeTab === tab.toLowerCase() && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-blue" />}
                  </button>
                ))}
              </div>
              <div className="prose prose-stone">
                <p className="text-ink/70 leading-relaxed">{product.description || "Experience the luxury of handpainted art. Each piece is unique, crafted with passion and precision by our master artisans."}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
