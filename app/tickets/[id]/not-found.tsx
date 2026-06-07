import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <p className="text-6xl font-black text-slate-200 dark:text-slate-800 mb-4">404</p>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Ticket Not Found</h2>
      <p className="text-sm text-slate-500 mb-6">The ticket you're looking for doesn't exist or was deleted.</p>
      <Link href="/tickets" className="btn-primary">← Back to Tickets</Link>
    </div>
  )
}
