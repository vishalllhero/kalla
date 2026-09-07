import React from 'react';
import { Hero } from '../components/Hero';
import { ProductSection } from '../components/ProductSection';
import { FeaturedMasterpieces } from '../components/FeaturedMasterpieces';
import { AboutArtist } from '../components/AboutArtist';
import { Services } from '../components/Services';
import { Testimonials } from '../components/Testimonials';
import { Contact } from '../components/Contact';
import { products } from '../data/products';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const Home = () => {
  const newArrivals = products.slice(0, 3);
  const bestSellers = products.filter(p => p.rating >= 4.8).slice(0, 3);

  return (
    <div className="bg-surface min-h-screen">
      <Hero />
      
      {/* Trending Categories - Apple Style Grid */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-serif mb-8 text-center">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Men', 'Women', 'Bags', 'Decor'].map((cat, i) => (
            <Link key={cat} to="/shop" className="group relative aspect-square overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500">
              <img 
                src={`https://images.unsplash.com/photo-${i === 0 ? '1489987707025-afc232f7ea0f' : i === 1 ? '1610030469983-98e550d6193c' : i === 2 ? '1590874103328-eac38a683ce7' : '1581337204873-ef36aa186caa'}?auto=format&fit=crop&q=80&w=600`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                alt={cat}
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <span className="text-white font-serif text-2xl tracking-widest uppercase border border-white/30 px-6 py-2 backdrop-blur-sm">{cat}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <FeaturedMasterpieces />

      <ProductSection 
        id="new-arrivals"
        title="New Arrivals"
        subtitle="Fresh from the studio. Be the first to own these."
        products={newArrivals}
      />

      {/* Promotional Banner - Parallax */}
      <div className="relative py-32 bg-fixed bg-center bg-cover" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=1920')" }}>
        <div className="absolute inset-0 bg-brand-blue/80 mix-blend-multiply"></div>
        <div className="relative z-10 text-center text-white max-w-2xl mx-auto px-4">
          <h2 className="text-5xl font-serif mb-6">The Canvas Collection</h2>
          <p className="text-xl mb-8 opacity-90">Transform your living space with our exclusive range of handpainted home decor.</p>
          <Link to="/shop" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-blue rounded-full font-bold hover:bg-stone-100 transition-colors">
            Explore Decor <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <ProductSection 
        id="best-sellers"
        title="Best Sellers"
        subtitle="Loved by art enthusiasts worldwide."
        products={bestSellers}
        align="right"
      />

      <AboutArtist />
      <Services />
      <Testimonials />
      <Contact />
    </div>
  );
};
