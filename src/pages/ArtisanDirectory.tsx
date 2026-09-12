import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiUrl } from '../lib/api'

type Artisan = {
  artisan_id: string
  artisan_name?: string
  bio?: string
  region?: string
  state?: string
  craft_experience_years: number
  is_verified: boolean
}

export default function ArtisanDirectory() {
  const [artisans, setArtisans] = useState<Artisan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(apiUrl('/api/v1/artisans/'))
      .then(response => response.ok ? response.json() : [])
      .then(setArtisans)
      .finally(() => setLoading(false))
  }, [])

  return <main className="min-h-screen bg-obsidian px-5 pb-24 pt-36 text-ivory sm:px-10">
    <div className="mx-auto max-w-6xl">
      <p className="eyebrow">The makers of KALAA</p>
      <h1 className="mt-6 max-w-3xl font-display text-6xl leading-[.9] sm:text-8xl">Meet the hands behind the work.</h1>
      {loading ? <p className="mt-12 text-muted">Loading artisans...</p> : <div className="mt-16 grid gap-px bg-ivory/10 sm:grid-cols-2 lg:grid-cols-3">
        {artisans.map(artisan => <Link key={artisan.artisan_id} to={`/artisan/${artisan.artisan_id}`} className="bg-obsidian p-7 transition-colors hover:bg-elevated">
          <div className="flex items-center justify-between"><p className="text-xs uppercase tracking-[.16em] text-gold">{artisan.state || artisan.region || 'India'}</p>{artisan.is_verified && <span className="text-xs text-gold">Verified</span>}</div>
          <h2 className="mt-12 font-display text-3xl">{artisan.artisan_name || 'KALAA artisan'}</h2>
          <p className="mt-3 text-sm text-muted">{artisan.bio || 'A local maker preserving a living craft tradition.'}</p>
          <p className="mt-8 text-xs uppercase tracking-[.14em] text-muted">{artisan.craft_experience_years} years of practice</p>
        </Link>)}
      </div>}
    </div>
  </main>
}
