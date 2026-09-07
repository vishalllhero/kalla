import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Check, Heart, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { products } from '../data/products'
import { apiUrl } from '../lib/api'

const heroWork = products[7]
const works = products.slice(3, 9)
const imageFor = (image: string) => image.startsWith('http') ? image : products[7].image
type FeaturedArtwork = { title: string; artwork_id: string; image_url?: string; craft?: string; region?: string; price?: number }

type ArtCardProps = { product: typeof products[number]; tall?: boolean }

const ArtCard = ({ product, tall = false }: ArtCardProps) => (
  <Link to={`/product/${product.id}`} className={`group block ${tall ? 'md:translate-y-12' : ''}`}>
    <div className={`relative overflow-hidden rounded-2xl bg-elevated ${tall ? 'aspect-[4/5]' : 'aspect-[4/3]'}`}>
      <img src={imageFor(product.image)} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]" />
      <button type="button" onClick={(event) => event.preventDefault()} className="absolute right-4 top-4 rounded-full border border-ivory/30 bg-obsidian/50 p-2 text-ivory backdrop-blur-md" aria-label={`Save ${product.name}`} title="Save artwork"><Heart size={16} strokeWidth={1.5} /></button>
    </div>
    <div className="flex items-start justify-between gap-4 border-b border-ivory/10 py-5">
      <div><h3 className="font-display text-2xl text-ivory">{product.name}</h3><p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted">{product.category} / India</p></div>
      <div className="text-right"><p className="font-display text-lg text-ivory">₹{(product.price * 84).toLocaleString('en-IN')}</p><p className="mt-1 flex items-center gap-1 text-[9px] uppercase tracking-[0.14em] text-gold"><Check size={11} /> Verified</p></div>
    </div>
  </Link>
)

export const PremiumHome = () => {
  const [catalogArtwork, setCatalogArtwork] = useState<FeaturedArtwork | null>(null)

  useEffect(() => {
    fetch(apiUrl('/api/v1/artworks?limit=1&verified=true'))
      .then((response) => response.ok ? response.json() : null)
      .then((artworks: FeaturedArtwork[] | null) => setCatalogArtwork(artworks?.[0] ?? null))
      .catch(() => setCatalogArtwork(null))
  }, [])

  const heroImage = catalogArtwork?.image_url || imageFor(heroWork.image)
  const heroTitle = catalogArtwork?.title || heroWork.name

  return <div className="overflow-hidden bg-obsidian">
    <section className="mx-auto grid min-h-screen max-w-[1500px] items-center gap-12 px-5 pb-20 pt-36 sm:px-10 lg:grid-cols-[.82fr_1.18fr] lg:gap-[72px] lg:pt-32">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }}>
        <p className="eyebrow">KALAA / VERIFIED ART MARKETPLACE</p>
        <h1 className="mt-8 max-w-xl font-display text-6xl font-medium leading-[.88] tracking-[-.045em] text-ivory sm:text-8xl">PHYSICAL ART.<br />DIGITAL IDENTITY.</h1>
        <p className="mt-8 max-w-md font-display text-xl leading-relaxed text-muted">Authentic Indian craftsmanship, given a permanent digital identity.<br /><span className="text-ivory/70">AI-powered cataloguing. Blockchain-backed provenance.</span></p>
        <div className="mt-10 flex flex-wrap gap-3"><Link to="/explore" className="inline-flex items-center gap-3 rounded-full bg-gold px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-obsidian transition-colors hover:bg-gold-light">Explore collection <ArrowUpRight size={15} /></Link><button type="button" className="quiet-button">Connect wallet</button></div>
        <div className="mt-16 grid max-w-md grid-cols-3 border-t border-ivory/10 pt-5 text-[10px] uppercase tracking-[0.15em] text-muted"><span>01<br /><b className="font-normal text-ivory">One-of-one</b></span><span>02<br /><b className="font-normal text-ivory">Verified</b></span><span>03<br /><b className="font-normal text-ivory">India</b></span></div>
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .9 }} className="relative">
        <div className="rounded-[26px] border border-ivory/10 bg-elevated p-2 shadow-[0_40px_120px_rgba(0,0,0,.55)]"><img src={heroImage} alt={heroTitle} className="h-[55vh] min-h-[420px] w-full rounded-[20px] object-cover transition-transform duration-300 hover:scale-[1.02] lg:h-[min(70vh,720px)]" /></div>
        <div className="absolute -bottom-7 right-3 w-64 border border-gold/30 bg-surface/90 p-5 shadow-2xl backdrop-blur-2xl sm:-right-6"><div className="flex items-center gap-2 text-[9px] uppercase tracking-[.16em] text-gold"><ShieldCheck size={13} /> Verified artwork</div><p className="mt-7 font-display text-3xl text-ivory">Digital Twin</p><p className="mt-1 text-[10px] uppercase tracking-[.14em] text-muted">{catalogArtwork?.artwork_id || `KLA-${String(heroWork.id).padStart(4, '0')}`} / One-of-one</p><div className="mt-5 border-t border-ivory/10 pt-4 text-[9px] uppercase tracking-[.14em] text-muted">{catalogArtwork?.region || 'India'} <span className="float-right text-gold">Provenance verified</span></div></div>
      </motion.div>
    </section>
    <div className="border-y border-ivory/10"><div className="mx-auto flex max-w-[1500px] flex-wrap justify-between gap-5 px-5 py-5 text-[9px] uppercase tracking-[.18em] text-muted sm:px-10"><span>Physical art</span><span>•</span><span>Digital twin</span><span>•</span><span>Verified provenance</span><span>•</span><span>AI cataloguing</span><span>•</span><span>Secure checkout</span></div></div>
    <section className="section-shell"><div className="mb-14 flex items-end justify-between gap-6"><div><p className="eyebrow">01 / Featured works</p><h2 className="mt-5 font-display text-5xl text-ivory sm:text-7xl">The collection</h2><p className="mt-4 max-w-md font-display text-xl text-muted">Crafted across generations. Verified for a digital world.</p></div><Link to="/explore" className="hidden text-[10px] uppercase tracking-[.16em] text-gold sm:flex sm:items-center sm:gap-2">View all <ArrowUpRight size={14} /></Link></div><div className="grid gap-x-6 gap-y-16 md:grid-cols-2 lg:grid-cols-3">{works.map((product, index) => <ArtCard key={product.id} product={product} tall={index === 0 || index === 4} />)}</div></section>
    <section className="border-y border-ivory/10 bg-surface"><div className="section-shell grid items-center gap-14 lg:grid-cols-[1.1fr_.9fr]"><div className="aspect-[4/3] overflow-hidden rounded-2xl"><img src={imageFor(products[6].image)} alt={products[6].name} loading="lazy" className="h-full w-full object-cover" /></div><div><p className="eyebrow">The masterpiece</p><h2 className="mt-6 font-display text-5xl leading-[.95] text-ivory sm:text-7xl">{products[6].name}</h2><p className="mt-6 max-w-sm font-display text-xl text-muted">A considered object for spaces that value the hand, the material, and the story.</p><div className="my-8 grid grid-cols-2 gap-y-4 border-y border-ivory/10 py-5 text-[10px] uppercase tracking-[.15em] text-muted"><span>Artisan <b className="block pt-1 font-normal text-ivory">KALAA Studio</b></span><span>Location <b className="block pt-1 font-normal text-ivory">Jaipur, India</b></span><span>Edition <b className="block pt-1 font-normal text-ivory">One-of-one</b></span><span>Price <b className="block pt-1 font-normal text-ivory">₹{(products[6].price * 84).toLocaleString('en-IN')}</b></span></div><Link to={`/product/${products[6].id}`} className="quiet-button">View artwork <ArrowUpRight size={14} /></Link></div></div></section>
    <section className="section-shell"><div className="text-center"><p className="eyebrow justify-center">Physical + digital</p><h2 className="mt-6 font-display text-5xl leading-[.92] text-ivory sm:text-7xl">One artwork.<br /><span className="text-gold">Two identities.</span></h2></div><div className="mx-auto mt-16 grid max-w-5xl items-center gap-6 md:grid-cols-[1fr_auto_1fr]"><div className="border border-ivory/10 bg-surface p-6"><p className="text-[10px] uppercase tracking-[.16em] text-gold">01 / Physical artwork</p><div className="mt-8 aspect-[4/3] overflow-hidden"><img src={imageFor(heroWork.image)} alt="Physical artwork detail" loading="lazy" className="h-full w-full object-cover" /></div></div><div className="flex justify-center text-3xl text-gold">⟷</div><div className="border border-gold/25 bg-elevated p-6"><p className="text-[10px] uppercase tracking-[.16em] text-gold">02 / Digital twin</p><div className="mt-8 space-y-5 font-display text-2xl text-ivory"><p>ARTWORK ID <span className="float-right text-muted">KLA-0004</span></p><p>CERTIFICATE <span className="float-right text-gold">ISSUED</span></p><p>PROVENANCE <span className="float-right text-gold">VERIFIED</span></p><p>OWNER <span className="float-right text-muted">COLLECTOR</span></p></div></div></div></section>
    <section className="border-y border-ivory/10 bg-[#12100e]"><div className="section-shell grid items-center gap-12 lg:grid-cols-[.9fr_1.1fr]"><div><p className="eyebrow">Made by hand</p><h2 className="mt-6 font-display text-5xl leading-[.9] text-ivory sm:text-7xl">Carried forward<br />digitally.</h2><p className="mt-6 max-w-md font-display text-xl text-muted">Meet the people, places, and techniques behind every work.</p><Link to="/explore" className="mt-8 inline-flex items-center gap-2 text-[10px] uppercase tracking-[.16em] text-gold">Meet the artisan <ArrowUpRight size={14} /></Link></div><div className="aspect-[4/3] overflow-hidden rounded-2xl"><img src={imageFor(products[4].image)} alt="Artisan work" loading="lazy" className="h-full w-full object-cover" /></div></div></section>
    <section className="section-shell"><div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]"><div><p className="eyebrow">AI studio</p><h2 className="mt-6 font-display text-5xl leading-[.9] text-ivory sm:text-7xl">From photograph<br />to marketplace.</h2><p className="mt-6 max-w-sm text-muted">A quieter way to catalogue the work that matters.</p></div><div className="divide-y divide-ivory/10 border-y border-ivory/10">{['Raw photo', 'AI enhancement', 'Smart catalogue', 'Smart price', 'Ready to sell'].map((step, index) => <div key={step} className="flex items-center justify-between py-5"><span className="text-[10px] uppercase tracking-[.16em] text-gold">0{index + 1}</span><span className="font-display text-3xl text-ivory">{step}</span><ArrowUpRight size={16} className="text-muted" /></div>)}</div></div></section>
    <section className="border-t border-ivory/10"><div className="section-shell text-center"><p className="eyebrow justify-center">KALAA for business</p><h2 className="mx-auto mt-6 max-w-4xl font-display text-5xl leading-[.9] text-ivory sm:text-8xl">Source art.<br /><span className="text-gold">At scale.</span></h2><p className="mx-auto mt-6 max-w-md font-display text-xl text-muted">Verified collections for hotels, designers, retailers, galleries, and exporters.</p><Link to="/b2b/buyer" className="quiet-button mt-9">Explore B2B <ArrowUpRight size={14} /></Link></div></section>
    <section className="border-t border-ivory/10"><div className="section-shell text-center"><h2 className="font-display text-5xl text-ivory sm:text-7xl">Collect something<br /><span className="text-gold">that has a story.</span></h2><p className="mx-auto mt-6 max-w-md font-display text-xl text-muted">Discover authentic Indian craftsmanship, verified for a digital world.</p><div className="mt-9 flex justify-center gap-3"><Link to="/explore" className="inline-flex items-center gap-3 rounded-full bg-ivory px-6 py-3 text-[10px] font-semibold uppercase tracking-[.16em] text-obsidian">Explore art <ArrowUpRight size={14} /></Link><Link to="/collection" className="quiet-button">Become a collector</Link></div></div></section>
  </div>
}
