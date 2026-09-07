import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, Menu, Search, ShoppingBag, X } from 'lucide-react'
import { Logo } from './Logo'
import { useShop } from '../context/ShopContext'
import { useWeb3 } from '../context/Web3Context'

const links = [
  ['DISCOVER', '/explore'],
  ['ARTWORKS', '/shop'],
  ['COLLECTIONS', '/collection'],
  ['ARTISANS', '/explore'],
  ['B2B', '/b2b/buyer'],
  ['AI STUDIO', '/customize'],
]

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const { cartCount, setIsCartOpen } = useShop()
  const { isConnected, klcBalance, connectWallet } = useWeb3()

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    if (searchQuery.trim()) navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
    setSearchOpen(false)
  }

  return (
    <>
      <nav className="fixed inset-x-0 top-4 z-50 px-4">
        <div className="mx-auto max-w-[1440px] rounded-2xl border border-ivory/10 bg-obsidian/75 px-4 backdrop-blur-2xl">
          <div className="flex h-[68px] items-center justify-between gap-6">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-ivory lg:hidden" aria-label="Toggle navigation menu" title="Menu">{isOpen ? <X size={20} /> : <Menu size={20} />}</button>
            <Link to="/" aria-label="KALAA home"><Logo /></Link>
            <div className="hidden flex-1 items-center justify-center gap-7 lg:flex">
              {links.map(([label, href]) => <Link key={label} to={href} className="text-[10px] font-medium tracking-[0.16em] text-muted transition-colors hover:text-gold">{label}</Link>)}
            </div>
            <div className="flex items-center gap-1 text-ivory">
              <button className="hidden rounded-full border border-gold/50 px-4 py-2 text-[10px] font-medium tracking-[0.14em] text-gold transition-colors hover:bg-gold hover:text-obsidian md:block" onClick={() => !isConnected ? connectWallet() : navigate('/wallet')} aria-label="Connect wallet">{isConnected ? `${klcBalance} KLC` : 'CONNECT WALLET'}</button>
              <button className="rounded-full p-2 transition-colors hover:text-gold" onClick={() => setSearchOpen(true)} aria-label="Search KALAA" title="Search"><Search size={18} strokeWidth={1.5} /></button>
              <Link to="/dashboard" className="hidden rounded-full p-2 transition-colors hover:text-gold sm:block" aria-label="Saved artworks" title="Saved artworks"><Heart size={18} strokeWidth={1.5} /></Link>
              <button onClick={() => setIsCartOpen(true)} className="relative rounded-full p-2 transition-colors hover:text-gold" aria-label="Open cart" title="Cart"><ShoppingBag size={18} strokeWidth={1.5} />{cartCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] text-obsidian">{cartCount}</span>}</button>
            </div>
          </div>
          <AnimatePresence>
            {isOpen && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="border-t border-ivory/10 lg:hidden"><div className="space-y-4 px-1 pb-6 pt-4"><form onSubmit={handleSearch} className="relative"><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Find artworks, artisans, collections..." className="w-full border border-ivory/10 bg-elevated px-4 py-3 text-sm text-ivory outline-none focus:border-gold" /><Search className="absolute right-3 top-3 text-muted" size={18} /></form>{links.map(([label, href]) => <Link key={label} to={href} onClick={() => setIsOpen(false)} className="block border-b border-ivory/10 py-2 font-display text-lg text-ivory">{label}</Link>)}<Link to="/wallet" onClick={() => setIsOpen(false)} className="block py-2 font-display text-lg text-gold">WALLET</Link></div></motion.div>}
          </AnimatePresence>
        </div>
      </nav>
      <AnimatePresence>
        {searchOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-obsidian/95 p-6 backdrop-blur-2xl"><button onClick={() => setSearchOpen(false)} className="absolute right-6 top-6 p-3 text-ivory" aria-label="Close search" title="Close search"><X /></button><form onSubmit={handleSearch} className="w-full max-w-3xl border-b border-gold/50 pb-4"><label htmlFor="global-search" className="mb-4 block text-[10px] tracking-[0.2em] text-gold">SEARCH KALAA</label><input id="global-search" autoFocus value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Find artworks, artisans, collections..." className="w-full bg-transparent font-display text-3xl text-ivory outline-none placeholder:text-muted sm:text-5xl" /></form></motion.div>}
      </AnimatePresence>
    </>
  )
}
