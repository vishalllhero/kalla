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
      className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lift transition-all duration-500 border border-stone-100"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
        <Link to={`/product/${product.id}`}>
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.tags?.includes('Best Seller') && (
            <span className="px-3 py-1 bg-brand-orange text-white text-[10px] font-bold uppercase tracking-widest rounded-sm shadow-sm">
              Best Seller
            </span>
          )}
          {product.tags?.includes('New') && (
            <span className="px-3 py-1 bg-brand-blue text-white text-[10px] font-bold uppercase tracking-widest rounded-sm shadow-sm">
              New
            </span>
          )}
        </div>

        {/* Quick Actions Overlay */}
        <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-4 group-hover:translate-x-0">
          <button 
            onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
            className={`p-2.5 rounded-full shadow-md transition-colors ${isWishlisted ? 'bg-brand-orange text-white' : 'bg-white text-ink hover:text-brand-orange'}`}
          >
            <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); addToCart(product); }}
            className="p-2.5 bg-white text-ink rounded-full shadow-md hover:bg-brand-blue hover:text-white transition-colors"
          >
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <p className="text-xs text-stone-500 uppercase tracking-wider">{product.category}</p>
          <div className="flex items-center gap-1">
            <Star size={12} className="fill-brand-orange text-brand-orange" />
            <span className="text-xs font-medium">{product.rating}</span>
          </div>
        </div>
        
        <Link to={`/product/${product.id}`}>
          <h3 className="font-serif text-xl text-ink mb-2 group-hover:text-brand-blue transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between mt-3">
          <span className="font-medium text-lg">${product.price}</span>
          <button 
            onClick={() => addToCart(product)}
            className="text-xs font-bold uppercase tracking-widest text-brand-blue hover:text-brand-purple transition-colors opacity-0 group-hover:opacity-100"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </motion.div>
  );
};
