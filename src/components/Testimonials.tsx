import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Elena R.",
    role: "Art Collector",
    text: "The portrait I commissioned brought tears to my eyes. The attention to detail is unlike anything I've seen. Truly a masterpiece.",
    bg: "bg-clay-50"
  },
  {
    name: "Marcus T.",
    role: "Fashion Designer",
    text: "I ordered a custom painted jacket for a show. Kअlla didn't just deliver clothing; they delivered a statement piece that stole the spotlight.",
    bg: "bg-teal-50"
  },
  {
    name: "Sarah J.",
    role: "Workshop Attendee",
    text: "The weekend workshop was therapeutic. I never thought I could paint, but their guidance made me feel like a true artist.",
    bg: "bg-ochre-50"
  }
];

export const Testimonials = () => {
  return (
    <section className="py-32 bg-canvas overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="font-handwriting text-3xl text-clay-500">Love Notes</span>
          <h2 className="text-5xl font-serif text-ink mt-2">Words from the Heart</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {testimonials.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className={`p-10 ${item.bg} rounded-sm relative`}
            >
              {/* Decorative Quote Mark */}
              <div className="absolute top-4 right-6 text-6xl font-serif text-ink/5 leading-none">"</div>
              
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-ochre-400 text-ochre-400" />
                ))}
              </div>
              
              <p className="text-ink/70 font-serif text-lg italic mb-8 leading-relaxed">
                {item.text}
              </p>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-ink/10"></div>
                <div>
                  <h4 className="font-serif font-bold text-ink">{item.name}</h4>
                  <p className="text-xs uppercase tracking-widest text-ink/40">{item.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
