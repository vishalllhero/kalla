import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Palette, Brush } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-canvas pt-20">
      {/* Watercolor Background Layers */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-center mix-blend-multiply"></div>
      </div>
      
      {/* Animated Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
         <motion.div 
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 right-10 w-[400px] h-[400px] bg-teal-100/50 rounded-full blur-[80px]"
         />
         <motion.div 
            animate={{ y: [0, 30, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-clay-100/50 rounded-full blur-[100px]"
         />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-ink/5 bg-white/40 backdrop-blur-md mb-8 shadow-sm">
            <Palette size={16} className="text-teal-700" />
            <span className="text-xs font-sans uppercase tracking-[0.2em] text-ink/70">Hand-Painting | Creativity | Emotion</span>
          </div>

          <h1 className="text-7xl md:text-9xl font-serif font-medium text-ink mb-8 leading-[0.9] tracking-tight">
            The Art of <br />
            <span className="relative inline-block text-teal-800">
              <span className="relative z-10 font-handwriting text-8xl md:text-[9rem] ml-4">Expression</span>
              <svg className="absolute w-[110%] h-12 -bottom-2 -left-2 text-ochre-300/60 -z-10" viewBox="0 0 200 20" preserveAspectRatio="none">
                <path d="M0 15 Q 100 0 200 15" stroke="currentColor" strokeWidth="15" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-ink/70 max-w-2xl mx-auto mb-12 leading-relaxed font-serif italic">
            "We don't just paint on canvas; we paint on life itself."
            <span className="block mt-4 text-base font-sans not-italic text-ink/50 uppercase tracking-widest">
              Wearable Art • Custom Portraits • Workshops
            </span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a 
              href="#portfolio" 
              className="relative px-10 py-4 bg-ink text-canvas rounded-sm font-serif text-lg overflow-hidden group shadow-xl shadow-teal-900/10"
            >
              <span className="relative z-10 flex items-center gap-3">
                View Portfolio <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-teal-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out"></div>
            </a>
            <Link 
              to="/customize" 
              className="px-10 py-4 bg-white/50 border border-ink/10 text-ink rounded-sm font-serif text-lg hover:bg-white hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <Brush size={18} className="text-clay-500" />
              Commission Art
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
