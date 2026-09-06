import React from 'react';
import { Instagram, Facebook, Twitter, Mail } from 'lucide-react';
import { Logo } from './Logo';

export const Footer = () => {
  return (
    <footer className="bg-ink text-canvas/60 border-t border-stone-100/30 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-8">
              <Logo className="w-48 h-20" variant="light" />
            </div>
            <p className="max-w-md leading-relaxed mb-8 font-serif text-lg font-light">
              "We don't just sell art; we curate authentic cultural expression." <br/>
              Celebrating the imperfect perfection of the human hand.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-clay-400 transition-colors"><Instagram size={22} strokeWidth={1.5} /></a>
              <a href="#" className="hover:text-clay-400 transition-colors"><Facebook size={22} strokeWidth={1.5} /></a>
              <a href="#" className="hover:text-clay-400 transition-colors"><Twitter size={22} strokeWidth={1.5} /></a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-sans text-xs uppercase tracking-[0.2em] mb-6">Collection</h3>
            <ul className="space-y-4 font-serif text-lg">
              <li><a href="#men" className="hover:text-clay-400 transition-colors">Men's Gallery</a></li>
              <li><a href="#women" className="hover:text-clay-400 transition-colors">Women's Gallery</a></li>
              <li><a href="#bags" className="hover:text-clay-400 transition-colors">Artisan Bags</a></li>
              <li><a href="#art" className="hover:text-clay-400 transition-colors">Canvas Studio</a></li>
              <li><a href="/customize" className="hover:text-clay-400 transition-colors">Commissions</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-sans text-xs uppercase tracking-[0.2em] mb-6">Studio</h3>
            <ul className="space-y-4 font-serif text-lg">
              <li className="flex items-center gap-3"><Mail size={18} className="text-clay-500" /> hello@kalla.art</li>
              <li>123 Art District, Creative Lane</li>
              <li>New York, NY 10012</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-stone-100/30 pt-10 flex flex-col md:flex-row justify-between items-center text-sm font-sans tracking-wide opacity-60">
          <p className="text-canvas/70">&copy; 2025 Kalla Art Marketplace.</p>
          <div className="flex space-x-8 mt-6 md:mt-0">
            <a href="#" className="hover:text-clay-400">Privacy</a>
            <a href="#" className="hover:text-clay-400">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
