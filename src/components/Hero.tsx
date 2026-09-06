import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-canvas pt-20">
      {/* Watercolor Background Layers */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-center mix-blend-multiply"></div>
      </div>
      
{/* Animated Blobs */}
       <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
         <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-terracotta/20 rounded-full blur-[60px]">
           <motion.div 
             animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
             transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
             className="absolute top-10 right-10 w-[400px] h-[400px] bg-terracotta/20 rounded-full blur-[60px]"
           />
         </div>
<div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-muted-gold/15 rounded-full blur-[80px]">
  <motion.div 
    animate={{ y: [0, 30, 0], rotate: [0, -5, 0] }}
    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
    className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-muted-gold/15 rounded-full blur-[80px]"
  />
</div>
       </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-ink/5 bg-white/40 backdrop-blur-md mb-8 shadow-sm">
            <span className="text-xs font-sans uppercase tracking-[0.2em] text-ink/70">AI-Powered | Verified | Trusted</span>
          </div>

          <h1 className="text-8xl md:text-10xl font-serif font-medium text-ink tracking-tight shadow-sm mb-6 leading-[1.05]">
            India's Artisans.<br />
            <span className="relative inline-block text-terracotta">
              Digitally Empowered.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-ink/70 max-w-2xl mx-auto mb-12 leading-relaxed font-serif italic">
            Discover authentic handmade artworks with AI-powered cataloging and blockchain-backed digital identity.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
<Link 
                  to="/explore" 
                  className="relative px-8 py-3 bg-terracotta text-white rounded-lg font-medium hover:bg-terracotta/90 transition-colors shadow-sm"
                >
              Explore Art
            </Link>
<Link 
                  to="/sell" 
                  className="relative px-8 py-3 bg-muted-gold text-ink rounded-lg font-medium hover:bg-muted-gold/90 transition-colors shadow-sm"
                >
              Sell Your Craft
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}