import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag, Search, Heart, User, Wallet, Hexagon, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';
import { useShop } from '../context/ShopContext';
import { useWeb3 } from '../context/Web3Context';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { cartCount, setIsCartOpen, wishlist } = useShop();
  const { isConnected, klcBalance, connectWallet } = useWeb3();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${searchQuery}`);
    }
  };

  return (
    <nav className="fixed w-full z-50 bg-canvas bg-opacity-95 shadow-sm border-b border-stone-200/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-ink p-2">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 group relative z-10">
            <Logo className="w-32 h-14" />
          </Link>

          {/* Desktop Search - Amazon Style */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <form onSubmit={handleSearch} className="relative w-full group">
<input
                  type="text"
                  placeholder="Search art, NFTs, or products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-12 py-2.5 rounded-full bg-canvas border border-stone-200/30 focus:border-brand-blue/50 focus:bg-white focus:ring-2 focus:ring-brand-blue/10 focus-visible:outline-none transition-all font-sans text-sm"
                />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-brand-blue text-white rounded-full hover:bg-brand-blue/90 transition-colors">
                <Search size={16} />
              </button>
            </form>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-6">
            
            {/* Wallet Connection */}
            <div className="hidden md:flex flex-col items-center group cursor-pointer" onClick={() => !isConnected ? connectWallet() : navigate('/wallet')}>
              <div className={`relative p-1 rounded-full border ${isConnected ? 'border-brand-purple bg-brand-purple/10' : 'border-transparent'}`}>
                <Wallet size={22} className={isConnected ? "text-brand-purple" : "text-ink group-hover:text-brand-purple"} />
                {isConnected && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                )}
              </div>
              <span className="text-[10px] uppercase tracking-wider mt-1 text-ink/60">
                {isConnected ? `${klcBalance} KLC` : 'Connect'}
              </span>
            </div>

            <Link to="/dashboard" className="hidden md:flex flex-col items-center group">
              <div className="relative">
                <User size={22} className="text-ink group-hover:text-brand-blue transition-colors" />
              </div>
              <span className="text-[10px] uppercase tracking-wider mt-1 text-ink/60">Account</span>
            </Link>

            <Link to="/dashboard" className="hidden md:flex flex-col items-center group">
              <div className="relative">
                <Heart size={22} className="text-ink group-hover:text-brand-orange transition-colors" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-orange text-white text-[10px] flex items-center justify-center rounded-full">
                    {wishlist.length}
                  </span>
                )}
              </div>
              <span className="text-[10px] uppercase tracking-wider mt-1 text-ink/60">Wishlist</span>
            </Link>

            <button 
              onClick={() => setIsCartOpen(true)}
              className="flex flex-col items-center group relative"
            >
              <div className="relative">
                <ShoppingBag size={22} className="text-ink group-hover:text-brand-purple transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-purple text-white text-[10px] flex items-center justify-center rounded-full animate-bounce">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] uppercase tracking-wider mt-1 text-ink/60">Cart</span>
            </button>
          </div>
        </div>
        
{/* Secondary Nav - simplified premium categories */}
        <div className="hidden md:flex justify-center space-x-6 pb-4 border-t border-stone-100/30 pt-2">
          {['Shop All', 'New Arrivals', 'Artisan', 'B2B'].map((item) => (
            <Link 
              key={item}
              to="/shop" 
              className="text-xs font-medium uppercase tracking-widest text-ink/60 hover:text-brand-blue transition-colors relative group"
            >
              {item}
            </Link>
          ))}
          <Link to="/nft-marketplace" className="text-xs font-bold uppercase tracking-widest text-brand-purple hover:text-brand-purple/80 flex items-center gap-1">
            <Hexagon size={14} /> NFT Gallery
          </Link>
          <Link to="/b2b/buyer" className="text-xs font-bold uppercase tracking-widest text-brand-blue hover:text-brand-blue/80 flex items-center gap-1">
            <Store size={14} /> B2B Marketplace
          </Link>
        </div>
      </div>

{/* Mobile Menu */}
       <AnimatePresence>
         {isOpen && (
           <motion.div
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: 'auto' }}
             exit={{ opacity: 0, height: 0 }}
             className="md:hidden bg-canvas border-b border-stone-100/30 overflow-hidden"
           >
             <div className="px-4 pt-4 pb-8 space-y-4 border-t border-stone-100/30">
               <form onSubmit={handleSearch} className="relative w-full mb-6">
                 <input
                   type="text"
                   placeholder="Search art, collections..."
                   className="w-full pl-4 pr-10 py-3 rounded-lg bg-stone-100 outline-none focus:ring-brand-blue/30"
                 />
                 <Search className="absolute right-3 top-3 text-ink/50" size={20} />
               </form>
               
               <Link to="/shop" onClick={() => setIsOpen(false)} className="block py-2 text-lg font-serif text-ink border-b border-stone-100/30 pb-2">
                 Shop Collection
               </Link>
               <Link to="/nft-marketplace" onClick={() => setIsOpen(false)} className="block py-2 text-lg font-serif text-brand-purple border-b border-stone-100/30 pb-2">
                 NFT Gallery
               </Link>
               <Link to="/b2b/buyer" onClick={() => setIsOpen(false)} className="block py-2 text-lg font-serif text-brand-blue border-b border-stone-100/30 pb-2">
                 B2B Marketplace
               </Link>
               <Link to="/wallet" onClick={() => setIsOpen(false)} className="block py-2 text-lg font-serif text-ink border-b border-stone-100/30 pb-2">
                 Wallet & KLC
               </Link>
               <Link to="/customize" onClick={() => setIsOpen(false)} className="block py-2 text-lg font-serif text-brand-orange border-b border-stone-100/30 pb-2">
                 Customize
               </Link>
             </div>
           </motion.div>
         )}
       </AnimatePresence>
    </nav>
  );
};
