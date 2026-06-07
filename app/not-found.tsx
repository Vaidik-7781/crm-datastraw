import Link from 'next/link'
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <p className="text-7xl font-black text-slate-100 dark:text-slate-800 select-none">404</p>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-2 mb-1">Page Not Found</h2>
      <p className="text-sm text-slate-500 mb-6">This page does not exist or was moved.</p>
      <Link href="/" className="btn-primary">← Back to Dashboard</Link>
    </div>
  )
}
