import React from 'react'
import { Link } from 'react-router-dom'
import { Sun } from 'lucide-react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background text-primary-text min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-ink">
            KALAA
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex space-x-6">
            <Link to="/explore" className="hover:text-terracotta transition-colors">
              Explore
            </Link>
            <Link to="/shop" className="hover:text-terracotta transition-colors">
              Shop
            </Link>
            <Link to="/b2b/buyer" className="hover:text-terracotta transition-colors">
              B2B
            </Link>
            <Link to="/verified-art" className="hover:text-terracotta transition-colors">
              Verified
            </Link>
            <Link to="/customize" className="hover:text-terracotta transition-colors">
              AI Studio
            </Link>
          </nav>

          {/* Search, Notifications, Profile */}
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search artworks, artisans..."
              className="border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-terracotta"
            />
            <button className="relative" aria-label="Toggle theme">
              <Sun className="h-5 w-5 text-terracotta" />
            </button>
            <Link to="/dashboard" className="text-terracotta hover:text-terracotta/80 transition-colors">
              Profile
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white py-6 mt-12 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-stone-500">
          © 2026 KALAA. All rights reserved.
        </div>
      </footer>
    </div>
  )
}