'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Ticket, PlusCircle, BarChart3,
  Users, Settings, Headphones, Menu, X, ChevronRight,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/',           label: 'Dashboard',   icon: LayoutDashboard, section: 'main' },
  { href: '/tickets',    label: 'All Tickets', icon: Ticket,          section: 'main' },
  { href: '/tickets/new',label: 'New Ticket',  icon: PlusCircle,      section: 'main' },
  { href: '/analytics',  label: 'Analytics',   icon: BarChart3,       section: 'main' },
  { href: '/agents',     label: 'Agents',      icon: Users,           section: 'team' },
  { href: '/settings',   label: 'Settings',    icon: Settings,        section: 'team' },
]

export function Sidebar() {
  const pathname     = usePathname()
  const [open, setOpen] = useState(false)
  const mainNav = nav.filter(n => n.section === 'main')
  const teamNav = nav.filter(n => n.section === 'team')

  const NavLink = ({ href, label, icon: Icon }: typeof nav[number]) => {
    const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
    return (
      <Link href={href} onClick={() => setOpen(false)}
        className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group',
          active ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                 : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200')}>
        <Icon size={15} className={cn(active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300')} />
        <span className="font-medium">{label}</span>
        {active && <ChevronRight size={13} className="ml-auto opacity-70" />}
      </Link>
    )
  }

  const Content = () => (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#0F172A' }}>
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700/50">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-900/50">
          <Headphones size={15} className="text-white" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-none">SupportDesk</p>
          <p className="text-slate-500 text-xs mt-0.5">Datastraw CRM</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        <div className="space-y-0.5">
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-2">Main</p>
          {mainNav.map(item => <NavLink key={item.href} {...item} />)}
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-2">Team</p>
          {teamNav.map(item => <NavLink key={item.href} {...item} />)}
        </div>
      </nav>
      <div className="px-5 py-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">VG</div>
          <div className="min-w-0">
            <p className="text-slate-300 text-xs font-medium truncate">Support Admin</p>
            <p className="text-slate-600 text-xs">Datastraw Inc.</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden md:flex w-60 flex-shrink-0"><Content /></aside>
      <button onClick={() => setOpen(true)} className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-900 text-white shadow-lg">
        <Menu size={17} />
      </button>
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-60 relative flex-shrink-0">
            <Content />
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={17} /></button>
          </div>
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
        </div>
      )}
    </>
  )
}
