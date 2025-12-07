import React from 'react';
import { motion } from 'framer-motion';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
}

interface ProductSectionProps {
  title: string;
  subtitle: string;
  id: string;
  products: Product[];
  align?: 'left' | 'right';
}

export const ProductSection: React.FC<ProductSectionProps> = ({ title, subtitle, id, products, align = 'left' }) => {
  return (
    <section id={id} className="py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`mb-20 ${align === 'right' ? 'text-right' : 'text-left'} relative z-10`}>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-serif font-light text-ink mb-6"
          >
            {title}
          </motion.h2>
          
          {/* Artistic Brush Underline */}
          <motion.div 
             initial={{ width: 0 }}
             whileInView={{ width: '120px' }}
             viewport={{ once: true }}
             className={`h-2 bg-teal-500/30 rounded-full mb-6 ${align === 'right' ? 'ml-auto' : 'mr-auto'}`}
             style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }}
          ></motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-ink/60 max-w-xl font-serif italic"
            style={{ marginLeft: align === 'right' ? 'auto' : '0' }}
          >
            {subtitle}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-20">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="group cursor-pointer"
            >
              {/* Artistic Frame Container */}
              <div className="relative aspect-[3/4] mb-8 p-4 bg-white shadow-sm hover:shadow-2xl transition-all duration-500 rotate-1 hover:rotate-0">
                {/* Tape effect */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-teal-100/50 rotate-2 z-20"></div>
                
                <div className="w-full h-full overflow-hidden relative">
                   <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 saturate-[0.85] group-hover:saturate-100"
                  />
                  {/* Brush stroke overlay on hover */}
                  <div className="absolute inset-0 bg-teal-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-multiply"></div>
                </div>
                
                <div className="absolute bottom-8 left-0 right-0 text-center z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                   <span className="bg-white text-ink px-6 py-3 text-sm uppercase tracking-widest font-medium shadow-lg border border-ink/10">
                     View Art
                   </span>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-xs font-sans uppercase tracking-widest text-teal-600 mb-2">{product.category}</p>
                <h3 className="text-2xl font-serif text-ink mb-2 group-hover:text-teal-700 transition-colors">{product.name}</h3>
                <p className="text-ink/50 font-serif italic">${product.price}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
