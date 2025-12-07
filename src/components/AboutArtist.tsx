import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

export const AboutArtist = () => {
  return (
    <section className="py-32 bg-canvas relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          {/* Image with Hand-painted Frame Effect */}
          <motion.div 
            initial={{ opacity: 0, rotate: -2 }}
            whileInView={{ opacity: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 border-2 border-ink/10 transform rotate-3 rounded-sm scale-105"></div>
            <div className="absolute inset-0 bg-clay-100 transform -rotate-2 rounded-sm scale-105 -z-10"></div>
            <div className="relative rounded-sm overflow-hidden shadow-2xl grayscale hover:grayscale-0 transition-all duration-700">
              <img 
                src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=1000" 
                alt="Artist at work" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative Tape */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-32 h-8 bg-ochre-200/80 rotate-1 shadow-sm backdrop-blur-sm"></div>
          </motion.div>

          {/* Story Content */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6 text-teal-700 font-handwriting text-3xl">The Soul Behind the Brush</div>
            <h2 className="text-5xl font-serif text-ink mb-8 leading-tight">
              Crafting Stories in <br/>
              <span className="text-clay-500 italic">Every Stroke</span>
            </h2>
            
            <div className="relative pl-8 border-l-2 border-ochre-300 mb-8">
              <Quote className="absolute -top-4 -left-3 bg-canvas text-ochre-400 p-1" size={24} />
              <p className="text-lg text-ink/70 font-serif italic leading-relaxed">
                "Art isn't just about making things look good. It's about capturing a feeling, a moment, a whisper of the soul, and making it tangible. Whether it's on a canvas or a cotton shirt, every piece I create is a dialogue between my heart and your world."
              </p>
            </div>

            <p className="text-ink/60 mb-8 font-light leading-relaxed">
              Founded in a small sunlit studio, Kअlla began as a rebellion against mass production. We believe in the imperfect perfection of the human hand. Our team of artisans pours hours of love, patience, and skill into every creation, ensuring that what you own is truly one of a kind.
            </p>

            <div className="flex gap-8">
              <div>
                <h4 className="text-4xl font-serif text-ink">12+</h4>
                <p className="text-xs uppercase tracking-widest text-ink/50 mt-1">Years Creating</p>
              </div>
              <div>
                <h4 className="text-4xl font-serif text-ink">5k+</h4>
                <p className="text-xs uppercase tracking-widest text-ink/50 mt-1">Artworks Sold</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
