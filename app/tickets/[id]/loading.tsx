export default function Loading() {
  return (
    <div className="space-y-6 max-w-7xl animate-pulse">
      <div className="h-6 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
      <div className="h-8 w-96 bg-slate-100 dark:bg-slate-800 rounded" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6 h-40 bg-slate-50 dark:bg-slate-900" />
          <div className="card p-6 h-32 bg-slate-50 dark:bg-slate-900" />
          <div className="card p-6 h-56 bg-slate-50 dark:bg-slate-900" />
        </div>
        <div className="space-y-4">
          <div className="card p-5 h-28 bg-slate-50 dark:bg-slate-900" />
          <div className="card p-5 h-48 bg-slate-50 dark:bg-slate-900" />
          <div className="card p-5 h-36 bg-slate-50 dark:bg-slate-900" />
        </div>
      </div>
    </div>
  )
}
