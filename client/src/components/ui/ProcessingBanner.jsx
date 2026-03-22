import { useEffect, useState } from 'react'
import { experiencesApi } from '../../api/experiences'

// Polls /experiences/:id/status every 3 seconds until done or failed
export default function ProcessingBanner({ experienceId }) {
  const [status, setStatus] = useState('pending')
  const [dots, setDots] = useState('.')

  // Animated dots
  useEffect(() => {
    const t = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '.' : d + '.'))
    }, 500)
    return () => clearInterval(t)
  }, [])

  // Poll status
  useEffect(() => {
    if (status === 'done' || status === 'failed') return
    const poll = setInterval(async () => {
      try {
        const { data } = await experiencesApi.getStatus(experienceId)
        setStatus(data.data.status)
      } catch {
        /* ignore */
      }
    }, 3000)
    return () => clearInterval(poll)
  }, [experienceId, status])

  if (status === 'done')
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-2 text-sm text-green-700">
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        AI processing complete — this experience is now fully searchable.
      </div>
    )

  if (status === 'failed')
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-700">
        AI processing failed — this experience is saved but may not appear in semantic search yet. It will be retried automatically.
      </div>
    )

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-2 text-sm text-blue-700">
      <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
      AI is analysing and indexing this experience{dots} It will appear in search results shortly.
    </div>
  )
}
