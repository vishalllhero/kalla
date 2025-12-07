import React from 'react';
import { motion } from 'framer-motion';
import { Brush, Users, Palette, Image } from 'lucide-react';

const services = [
  {
    icon: <Brush size={32} />,
    title: "Custom Paintings",
    description: "Commission a bespoke piece for your home or office. Portraits, landscapes, or abstract visions brought to life.",
    color: "bg-clay-100 text-clay-900"
  },
  {
    icon: <Palette size={32} />,
    title: "Wearable Art",
    description: "Transform your wardrobe. We handpaint denim, silk, cotton, and leather with durable, washable acrylics.",
    color: "bg-teal-100 text-teal-900"
  },
  {
    icon: <Users size={32} />,
    title: "Art Workshops",
    description: "Join our weekend sessions. Learn the basics of color theory, brush techniques, and fabric painting.",
    color: "bg-ochre-100 text-ochre-900"
  },
  {
    icon: <Image size={32} />,
    title: "Digital Illustration",
    description: "Hand-drawn digital assets for your brand or personal projects, retaining that authentic organic feel.",
    color: "bg-stone-200 text-stone-800"
  }
];

export const Services = () => {
  return (
    <section className="py-32 bg-white relative">
      {/* Background Texture */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-serif text-ink mb-4">What We Offer</h2>
          <div className="w-24 h-1 bg-teal-500 mx-auto rounded-full mb-6"></div>
          <p className="text-ink/60 max-w-2xl mx-auto font-serif italic text-lg">
            Beyond the gallery. Experience art in multiple dimensions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-8 bg-canvas border border-ink/5 hover:border-ink/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 rounded-sm"
            >
              <div className={`w-16 h-16 rounded-full ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {service.icon}
              </div>
              <h3 className="text-2xl font-serif text-ink mb-3">{service.title}</h3>
              <p className="text-ink/60 leading-relaxed text-sm font-light">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
