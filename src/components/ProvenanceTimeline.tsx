import { Calendar } from 'lucide-react'

type ProvenanceEvent = {
  type: string
  title: string
  description: string
  date: string // ISO string
  isOnChain?: boolean
}

type ProvenanceTimelineProps = {
  events: ProvenanceEvent[]
}

export default function ProvenanceTimeline({ events }: ProvenanceTimelineProps) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-8 top-0 bottom-0 w-1 border-l border-stone-200" />
      {/* Events */}
      <div className="relative grid grid-cols-2 gap-4">
        {events.map((event, index) => (
          <div key={index} className="flex items-start">
            {/* Event Icon */}
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-100">
              <Calendar className="text-terracotta" size={18} />
            </div>
            <div className="ml-4">
              <p className="text-xs text-stone-500 font-medium">{new Date(event.date).toLocaleDateString()}</p>
              <p className="text-sm text-stone-500">{event.title}</p>
              <p className="text-xs text-stone-400">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}