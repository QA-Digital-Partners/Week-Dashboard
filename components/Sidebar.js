'use client'
import { LayoutDashboard, PlusCircle, Archive, XCircle } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'new', label: 'New Project', icon: PlusCircle },
  { id: 'archived', label: 'Archived', icon: Archive },
  { id: 'abandoned', label: 'Abandoned', icon: XCircle },
]

export default function Sidebar({ activeSection, onNavigate }) {
  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-[#1E293B] border-r border-[#334155] flex flex-col z-40">
      {/* Logo / Brand */}
      <div className="px-6 py-6 border-b border-[#334155]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">QA</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100">QA Digital</p>
            <p className="text-[10px] text-slate-500">Project Tracker</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeSection === id
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left
                ${isActive
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#273449]'
                }`}
            >
              <Icon size={16} className={isActive ? 'text-indigo-400' : ''} />
              {label}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#334155]">
        <p className="text-[10px] text-slate-600">Glen Burnie, MD</p>
      </div>
    </aside>
  )
}