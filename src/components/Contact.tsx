import React from 'react';
import { Send, Instagram, Twitter, Mail } from 'lucide-react';

export const Contact = () => {
  return (
    <section className="py-32 bg-ink text-canvas relative overflow-hidden">
      {/* Doodle Accents Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg className="absolute top-10 left-10 w-32 h-32" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="10 5" />
        </svg>
        <svg className="absolute bottom-10 right-10 w-48 h-48" viewBox="0 0 100 100">
          <path d="M10 50 Q 25 25 50 50 T 90 50" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-serif mb-6">Let's Create Together</h2>
          <p className="text-canvas/60 text-lg font-serif italic">
            Have a vision? A question? Or just want to say hello? <br/>
            We're always ready to talk art.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm p-8 md:p-12 rounded-sm border border-white/10">
          <form className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-canvas/50">Your Name</label>
                <input 
                  type="text" 
                  className="w-full bg-transparent border-b border-white/20 py-2 text-xl font-serif focus:border-teal-400 focus:outline-none transition-colors"
                  placeholder="Picasso Jr."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-canvas/50">Email Address</label>
                <input 
                  type="email" 
                  className="w-full bg-transparent border-b border-white/20 py-2 text-xl font-serif focus:border-teal-400 focus:outline-none transition-colors"
                  placeholder="art@gallery.com"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-canvas/50">Your Message</label>
              <textarea 
                rows={4}
                className="w-full bg-transparent border-b border-white/20 py-2 text-xl font-serif focus:border-teal-400 focus:outline-none transition-colors resize-none"
                placeholder="Tell us about your dream project..."
              ></textarea>
            </div>

            <div className="flex justify-between items-center pt-4">
              <div className="flex gap-6 text-canvas/40">
                 <Instagram className="hover:text-teal-400 cursor-pointer transition-colors" size={20} />
                 <Twitter className="hover:text-teal-400 cursor-pointer transition-colors" size={20} />
                 <Mail className="hover:text-teal-400 cursor-pointer transition-colors" size={20} />
              </div>
              <button className="px-8 py-3 bg-teal-700 text-white rounded-sm font-serif text-lg hover:bg-teal-600 transition-colors flex items-center gap-2">
                Send Inquiry <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
