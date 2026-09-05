import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FeaturedMasterpieces = () => {
  return (
    <section className="py-32 bg-ink text-canvas overflow-hidden relative">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-clay-600/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-ochre-600/10 rounded-full blur-[100px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="flex items-center justify-center gap-3 text-clay-400 mb-6 font-sans text-xs tracking-[0.3em] uppercase">
            <span className="w-8 h-[1px] bg-clay-400"></span>
            <span>Curated Gallery</span>
            <span className="w-8 h-[1px] bg-clay-400"></span>
          </div>
          <h2 className="text-5xl md:text-7xl font-serif font-medium mb-6">
            Signature <span className="italic text-ochre-400 font-light">Masterpieces</span>
          </h2>
          <p className="text-canvas/60 max-w-2xl mx-auto font-serif text-lg font-light leading-relaxed">
            "Art is not what you see, but what you make others see." <br/>
            Exclusive commissions from the Kअlla studio.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Item 1: The Backpack */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group relative"
          >
            <div className="aspect-[4/5] md:aspect-video lg:aspect-[4/3] overflow-hidden relative rounded-sm shadow-2xl shadow-black/50">
              <div className="absolute inset-0 border-[1px] border-white/10 z-20 pointer-events-none"></div>
              <img 
                src="/images/rick-morty-bag.jpg"
                alt="Cosmic Rockers Backpack" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                onError={(e) => {
                  // Fallback if image is not uploaded yet
                  e.currentTarget.src = "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=1000";
                }}
              />
              <div className="absolute top-6 right-6 z-20 bg-clay-600 text-white text-[10px] font-bold px-4 py-2 uppercase tracking-widest">
                Sold Out
              </div>
            </div>
            <div className="pt-8 px-2">
              <h3 className="text-3xl font-serif text-white mb-2">Cosmic Rockers Edition</h3>
              <p className="text-clay-400 font-handwriting text-2xl mb-4">Custom Backpack Commission</p>
              <p className="text-canvas/50 mb-6 leading-relaxed font-light">
                A vibrant tribute to interdimensional rockstars. Featuring intricate shading, neon acrylics, and a durable finish that withstands any adventure.
              </p>
              <Link to="/customize" className="text-white hover:text-clay-400 text-sm uppercase tracking-widest flex items-center gap-2 transition-colors group-hover:gap-4">
                Request Similar <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>

          {/* Item 2: The Dandelion Shirt (Updated) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group relative"
          >
            <div className="aspect-[4/5] md:aspect-video lg:aspect-[4/3] overflow-hidden relative rounded-sm shadow-2xl shadow-black/50">
              <div className="absolute inset-0 border-[1px] border-white/10 z-20 pointer-events-none"></div>
              <img 
                src="/images/dandelion-shirt.jpg"
                alt="Midnight Dandelion Shirt" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                onError={(e) => {
                  // Fallback if image is not uploaded yet
                  e.currentTarget.src = "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&q=80&w=1000";
                }}
              />
              <div className="absolute top-6 right-6 z-20 bg-purple-600 text-white text-[10px] font-bold px-4 py-2 uppercase tracking-widest">
                New Arrival
              </div>
            </div>
            <div className="pt-8 px-2">
              <h3 className="text-3xl font-serif text-white mb-2">Midnight Dandelion</h3>
              <p className="text-purple-400 font-handwriting text-2xl mb-4">Cosmic Night Series</p>
              <p className="text-canvas/50 mb-6 leading-relaxed font-light">
                A dreamlike masterpiece featuring delicate dandelions drifting across a cosmic purple and blue night sky. Handpainted on premium black fabric for a striking contrast.
              </p>
              <Link to="/customize" className="text-white hover:text-purple-400 text-sm uppercase tracking-widest flex items-center gap-2 transition-colors group-hover:gap-4">
                Customize Yours <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
