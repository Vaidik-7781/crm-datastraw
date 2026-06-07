'use client'
import { useTheme } from 'next-themes'
import { Sun, Moon, Plus } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TITLES: Record<string, string> = {
  '/':            'Dashboard',
  '/tickets':     'All Tickets',
  '/tickets/new': 'New Ticket',
  '/analytics':   'Analytics',
  '/agents':      'Agents',
  '/settings':    'Settings',
}

export function Header() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  const title = Object.entries(TITLES)
    .reverse()
    .find(([p]) => pathname === p || (p !== '/' && pathname.startsWith(p)))?.[1] ?? 'SupportDesk'

  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 flex-shrink-0 z-10">
      <h1 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h1>
      <div className="flex items-center gap-2">
        <Link href="/tickets/new" className="btn-primary flex items-center gap-1.5 text-xs">
          <Plus size={13} /> New Ticket
        </Link>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          title="Toggle dark mode"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  )
}
