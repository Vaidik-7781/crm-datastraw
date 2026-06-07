'use client'
import { useEffect } from 'react'
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <p className="text-4xl mb-4">⚠️</p>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Something went wrong</h2>
      <p className="text-sm text-slate-500 mb-6 max-w-sm">{error.message || 'An unexpected error occurred.'}</p>
      <button onClick={reset} className="btn-primary">Try Again</button>
    </div>
  )
}
