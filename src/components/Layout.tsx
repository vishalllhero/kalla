import Link from 'next/link'
import { SunIcon } from '@heroicons/react/24/outline'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background text-primary-text min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-ink">
            KALAA
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="hover:text-terracotta transition-colors">
              Explore
            </Link>
            <Link href="/artisans" className="hover:text-terracotta transition-colors">
              Artisans
            </Link>
            <Link href="/b2b" className="hover:text-terracotta transition-colors">
              B2B
            </Link>
            <Link href="/verified" className="hover:text-terracotta transition-colors">
              Verified
            </Link>
            <Link href="/how-it-works" className="hover:text-terracotta transition-colors">
              How It Works
            </Link>
          </nav>

          {/* Search, Notifications, Profile */}
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search artworks, artisans..."
              className="border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-terracotta"
            />
            <button className="relative">
              <SunIcon className="h-5 w-5 text-terracotta" />
            </button>
            <Link href="/profile" className="text-terracotta hover:text-terracotta/80 transition-colors">
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