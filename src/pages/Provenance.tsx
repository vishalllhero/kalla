import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowUpRight, Check, ShieldCheck } from 'lucide-react'
import { API_BASE_URL } from '../lib/api'

type Verification = { artwork_id: string; title: string; image_url?: string; certificate_id?: string; events?: Array<{ title: string; description: string; date: string }> }

export default function Provenance() {
  const { id } = useParams()
  const [record, setRecord] = useState<Verification | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/verify/${id}`)
      .then((response) => response.ok ? response.json() : null)
      .then((data: Verification | null) => setRecord(data))
      .finally(() => setLoading(false))
  }, [id])

  const events = record?.events?.length ? record.events : [
    { title: 'Created', description: 'Artwork registered by the artisan', date: '' },
    { title: 'Certified', description: 'Digital certificate issued', date: '' },
    { title: 'Listed', description: 'Work made available to collectors', date: '' },
    { title: 'Purchased', description: 'Ownership transfer recorded', date: '' },
    { title: 'Owned', description: 'Verified in the collector record', date: '' },
  ]

  return <main className="min-h-screen bg-obsidian px-5 pb-24 pt-36 sm:px-10"><div className="mx-auto max-w-5xl"><p className="eyebrow">Digital identity / provenance</p><h1 className="mt-7 max-w-3xl font-display text-6xl leading-[.88] text-ivory sm:text-8xl">The history<br />of this work.</h1>{loading ? <p className="mt-10 text-muted">Loading verification record...</p> : <div className="mt-16 grid gap-12 lg:grid-cols-[.8fr_1.2fr]"><div>{record?.image_url && <img src={record.image_url} alt={record.title} className="aspect-[4/5] w-full object-cover" />}<div className="mt-6 border border-gold/25 bg-surface p-6"><div className="flex items-center gap-2 text-[10px] uppercase tracking-[.16em] text-gold"><ShieldCheck size={14} /> Verified record</div><p className="mt-6 font-display text-3xl text-ivory">{record?.title || 'KALAA artwork'}</p><p className="mt-3 text-xs uppercase tracking-[.14em] text-muted">Artwork ID / {record?.artwork_id || id}</p><p className="mt-2 text-xs uppercase tracking-[.14em] text-muted">Certificate / {record?.certificate_id || 'Pending record'}</p></div></div><div className="relative border-l border-gold/30 pl-8 sm:pl-12">{events.map((event, index) => <div key={`${event.title}-${index}`} className="relative pb-12 last:pb-0"><span className="absolute -left-[41px] top-0 flex h-5 w-5 items-center justify-center rounded-full border border-gold bg-obsidian text-gold sm:-left-[57px]"><Check size={11} /></span><p className="text-[10px] uppercase tracking-[.18em] text-gold">0{index + 1} / {event.title}</p><h2 className="mt-3 font-display text-4xl text-ivory">{event.title}</h2><p className="mt-2 max-w-sm text-muted">{event.description}</p>{event.date && <p className="mt-3 text-[10px] uppercase tracking-[.14em] text-muted">{new Date(event.date).toLocaleDateString()}</p>}</div>)}<Link to={`/product/${record?.artwork_id || id}`} className="quiet-button mt-12">View artwork <ArrowUpRight size={14} /></Link></div></div>}</div></main>
}
