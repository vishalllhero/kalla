import { Link } from 'react-router-dom'
import { Instagram, Mail } from 'lucide-react'
import { Logo } from './Logo'

const groups = [
  { title: 'Discover', links: [['Artworks', '/shop'], ['Collections', '/collection'], ['Artisans', '/explore']] },
  { title: 'Business', links: [['B2B Marketplace', '/b2b'], ['Source Art', '/b2b/buyer'], ['Sell with KALAA', '/b2b/artisan']] },
  { title: 'Technology', links: [['Digital Identity', '/verified-art'], ['Provenance', '/provenance/demo'], ['AI Studio', '/ai-studio']] },
  { title: 'Company', links: [['About', '/'], ['Contact', '/'], ['Privacy', '/']] },
]

export const Footer = () => <footer className="border-t border-ivory/10 bg-surface"><div className="mx-auto max-w-[1500px] px-5 py-20 sm:px-10"><div className="grid gap-14 lg:grid-cols-[1.4fr_2fr]"><div><Logo /><p className="mt-8 max-w-sm font-display text-3xl leading-[.95] text-ivory">Where Indian craftsmanship meets digital identity.</p><a href="mailto:hello@kalaa.art" className="mt-8 inline-flex items-center gap-2 text-sm text-muted hover:text-gold"><Mail size={15} /> hello@kalaa.art</a></div><div className="grid grid-cols-2 gap-10 sm:grid-cols-4">{groups.map((group) => <div key={group.title}><h2 className="text-[10px] uppercase tracking-[.18em] text-gold">{group.title}</h2><ul className="mt-5 space-y-3 text-sm text-muted">{group.links.map(([label, href]) => <li key={label}><Link to={href} className="transition-colors hover:text-ivory">{label}</Link></li>)}</ul></div>)}</div></div><div className="mt-20 flex flex-col justify-between gap-5 border-t border-ivory/10 pt-6 text-[10px] uppercase tracking-[.16em] text-muted sm:flex-row"><span>© KALAA / Physical art · Digital identity</span><a href="#" aria-label="KALAA on Instagram" title="Instagram" className="hover:text-gold"><Instagram size={15} /></a></div></div></footer>
