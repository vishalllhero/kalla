import React from 'react';
import { motion } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Spotlight = () => {
  return (
    <section className="py-24 bg-stone-900 text-stone-100 overflow-hidden relative">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-orange-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-2 text-orange-500 mb-4 font-medium tracking-wider uppercase">
              <Star size={18} fill="currentColor" />
              <span>Masterpiece of the Month</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
              The Cosmic <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-600">
                Rockers
              </span> Edition
            </h2>
            
            <p className="text-stone-400 text-lg mb-8 leading-relaxed">
              Witness the peak of handpainted customization. This backpack features intricate acrylic detailing, 
              vibrant color blending, and a durability layer that ensures your art travels as far as you do.
            </p>

            <div className="flex flex-wrap gap-6 mb-10">
              <div>
                <h4 className="text-2xl font-bold text-white">45+</h4>
                <p className="text-stone-500 text-sm">Hours of Painting</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-white">100%</h4>
                <p className="text-stone-500 text-sm">Waterproof Acrylics</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-white">1 of 1</h4>
                <p className="text-stone-500 text-sm">Unique Design</p>
              </div>
            </div>

            <Link 
              to="/customize" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-stone-900 rounded-full font-medium hover:bg-orange-50 transition-colors"
            >
              Commission Your Own <ArrowRight size={18} />
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-purple-600 rounded-3xl rotate-3 opacity-20 blur-lg"></div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-stone-800 bg-stone-800">
              {/* 
                INSTRUCTION FOR USER: 
                Replace the src below with your uploaded image path, e.g., "/images/rick-morty-bag.jpg"
                For now, I'm using a placeholder that represents a bag.
              */}
              <img 
                src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=1000" 
                alt="Custom Handpainted Backpack" 
                className="w-full h-full object-cover"
              />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                <p className="text-white font-serif text-xl">"Cosmic Duo" Custom Commission</p>
                <p className="text-stone-400 text-sm">Designed by Kअlla Artist Team</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
