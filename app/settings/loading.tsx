export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-40 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({length:4}).map((_,i)=>(
          <div key={i} className="card p-5">
            <div className="h-8 w-12 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mb-2"/>
            <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"/>
          </div>
        ))}
      </div>
      <div className="card p-6 h-64 animate-pulse bg-slate-50 dark:bg-slate-900" />
    </div>
  )
}
