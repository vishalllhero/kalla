import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowUpRight, Check, ShieldCheck } from 'lucide-react'
import { apiUrl } from '../lib/api'

type Verification = { artwork_id: string; title: string; image_url?: string; certificate_id?: string; creator?: string; network?: string; transaction_signature?: string; metadata_hash?: string; verification_status?: string; events?: Array<{ title: string; description: string; date: string; transaction_signature?: string }> }

export default function Provenance() {
  const { id } = useParams()
  const [record, setRecord] = useState<Verification | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(apiUrl(`/api/v1/verify/${id}`))
      .then((response) => response.ok ? response.json() : null)
      .then((data: Verification | null) => setRecord(data))
      .finally(() => setLoading(false))
  }, [id])

  const events = record?.events || []

  return <main className="min-h-screen bg-obsidian px-5 pb-24 pt-36 sm:px-10"><div className="mx-auto max-w-5xl"><p className="eyebrow">Digital identity / provenance</p><h1 className="mt-7 max-w-3xl font-display text-6xl leading-[.88] text-ivory sm:text-8xl">KALAA<br />authenticity check.</h1>{loading ? <p className="mt-10 text-muted">Loading verification record...</p> : <div className="mt-16 grid gap-12 lg:grid-cols-[.8fr_1.2fr]"><div>{record?.image_url && <img src={record.image_url} alt={record.title} className="aspect-[4/5] w-full object-cover" />}<div className="mt-6 border border-gold/25 bg-surface p-6"><div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.16em] text-gold"><ShieldCheck size={14} /> {record?.verification_status || 'Verification record'}</div><p className="mt-6 font-display text-3xl text-ivory">{record?.title || 'KALAA artwork'}</p><div className="mt-6 space-y-3 font-mono text-[10px] uppercase tracking-[.12em] text-muted"><p>Artwork ID <span className="float-right text-ivory">{record?.artwork_id || id}</span></p><p>Creator <span className="float-right text-ivory">{record?.creator || 'Not provided'}</span></p><p>Certificate <span className="float-right text-gold">{record?.certificate_id || 'Pending'}</span></p></div></div></div><div><div className="relative border-l border-gold/30 pl-8 sm:pl-12">{events.length > 0 ? events.map((event, index) => <div key={`${event.title}-${index}`} className="relative pb-12 last:pb-0"><span className="absolute -left-[41px] top-0 flex h-5 w-5 items-center justify-center border border-gold bg-obsidian text-gold sm:-left-[57px]"><Check size={11} /></span><p className="font-mono text-[10px] uppercase tracking-[.18em] text-gold">0{index + 1} / {event.title}</p><h2 className="mt-3 font-display text-4xl text-ivory">{event.title}</h2><p className="mt-2 max-w-sm text-muted">{event.description}</p>{event.date && <p className="mt-3 font-mono text-[10px] uppercase tracking-[.14em] text-muted">{new Date(event.date).toLocaleDateString()}</p>}{event.transaction_signature && <p className="mt-3 break-all font-mono text-[10px] text-muted">TX / {event.transaction_signature}</p>}</div>) : <div className="border border-ivory/10 bg-surface p-6"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-gold">Provenance pending</p><p className="mt-4 text-muted">The certificate exists, but its event history has not been published yet.</p></div>}</div><div className="mt-10 grid gap-4 border-t border-ivory/10 pt-6 font-mono text-[10px] uppercase tracking-[.12em] text-muted sm:grid-cols-2"><p>Network <span className="block pt-2 text-ivory">{record?.network || 'Not provided'}</span></p><p>Transaction <span className="block break-all pt-2 text-ivory">{record?.transaction_signature || 'Not provided'}</span></p><p>Metadata hash <span className="block break-all pt-2 text-ivory">{record?.metadata_hash || 'Not provided'}</span></p><p>Status <span className="block pt-2 text-gold">{record?.verification_status || 'Pending'}</span></p></div><Link to={`/product/${record?.artwork_id || id}`} className="quiet-button mt-10">View artwork <ArrowUpRight size={14} /></Link></div></div>}</div></main>
}
