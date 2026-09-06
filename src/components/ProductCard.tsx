import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../data/products';
import { useShop } from '../context/ShopContext';

export const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart, toggleWishlist, wishlist } = useShop();
  const isWishlisted = wishlist.includes(product.id);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-white rounded-lg shadow-sm border border-stone-100/40 overflow-hidden transition-all duration-500"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-sm">
        <Link to={`/product/${product.id}`}>
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-103 group-hover:shadow-lg"
          />
        </Link>
      </div>
      
      {/* Badges */}
      <div className="absolute top-3 left-3 flex flex-col gap-1">
        {product.tags?.includes('Best Seller') && (
          <span className="px-3 py-1 bg-terracotta text-white text-[10px] font-bold uppercase rounded-sm shadow-sm">
            Best Seller
          </span>
        )}
        {product.tags?.includes('New') && (
          <span className="px-3 py-1 bg-muted-gold text-white text-[10px] font-bold uppercase tracking-widest rounded-sm shadow-sm">
            New
          </span>
        )}
      </div>
      
      {/* Quick Actions Overlay */}
      <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-4 group-hover:translate-x-0">
        <button 
          onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
          className="p-2.5 rounded-full shadow-md transition-colors group-hover:bg-terracotta/20 group-hover:text-terracotta focus:ring-terracotta focus:outline-none"
        >
          <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
        <button 
          onClick={(e) => { e.preventDefault(); addToCart(product); }}
          className="p-2.5 rounded-full shadow-md transition-colors group-hover:bg-muted-gold/20 group-hover:text-muted-gold focus:ring-muted-gold focus:outline-none"
        >
          <ShoppingBag size={18} />
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <p className="text-xs text-stone-500 uppercase tracking-wider font-medium">
            {product.category}
          </p>
          <div className="flex items-center gap-1">
            <Star size={12} className="fill-clay-400 text-clay-400" />
            <span className="text-xs font-medium text-stone-500">{product.rating}</span>
          </div>
          
          <Link to={`/product/${product.id}`}>
            <h3 className="font-serif text-xl md:text-2xl text-ink group-hover:text-clay-400 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          
          <div className="flex items-center justify-between mt-3">
            <span className="font-medium text-lg text-ink">{product.price}</span>
            <button 
              onClick={() => addToCart(product)}
              className="text-xs font-bold uppercase tracking-widest text-clay-400 bg-clay-50/30 rounded bg-clay-600/30 hover:bg-clay-700 text-clay-400 transition-colors opacity-0 group-hover:opacity-100"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};