'use client'
import { ChevronLeft, ChevronRight, CalendarDays, CalendarRange, CheckCircle2, AlertCircle } from 'lucide-react'
import {
  computeProgress, progressTone, monthLabel, quarterLabel, monthInQuarter, monthKey,
} from '@/lib/wpTasks'

function ProgressRing({ percentage, color, size = 64 }) {
  const stroke = 6
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} className="-rotate-90 flex-shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#273449" strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (percentage / 100) * c}
        style={{ transition: 'stroke-dashoffset 500ms ease' }}
      />
    </svg>
  )
}

function OverallTile({ icon: Icon, title, subtitle, percentage, detail }) {
  const tone = progressTone(percentage)
  return (
    <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-5 flex items-center gap-4">
      <div className="relative">
        <ProgressRing percentage={percentage} color={tone.ring} />
        <span className={`absolute inset-0 flex items-center justify-center text-sm font-semibold tabular-nums ${tone.text}`}>
          {percentage}%
        </span>
      </div>
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-slate-500 font-medium">
          <Icon size={12} />
          {title}
        </p>
        <p className="text-sm text-slate-100 font-semibold mt-0.5 truncate">{subtitle}</p>
        <p className="text-[11px] text-slate-500 mt-1">{detail}</p>
      </div>
    </div>
  )
}

function CountTile({ icon: Icon, label, value, total, accent }) {
  return (
    <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-5">
      <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-slate-500 font-medium">
        <Icon size={12} className={accent} />
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-100 tabular-nums">
        {value}
        {total !== undefined && <span className="text-sm text-slate-500 font-medium"> / {total}</span>}
      </p>
    </div>
  )
}

export default function WpMaintenanceSummary({ clients, month, quarter, maintenance, canGoBack, onMonthChange, onShift }) {
  const monthly = clients.map((c) => computeProgress('monthly', maintenance.monthly[c.id]?.tasks))
  const quarterly = clients.map((c) => computeProgress('quarterly', maintenance.quarterly[c.id]?.tasks))

  const sum = (list, key) => list.reduce((acc, p) => acc + p[key], 0)
  const pct = (list) => {
    const total = sum(list, 'total')
    return total ? Math.round((sum(list, 'resolved') / total) * 100) : 0
  }

  const monthlyUpToDate = monthly.filter((p) => p.percentage === 100).length
  const quarterlyUpToDate = quarterly.filter((p) => p.percentage === 100).length
  const pendingTasks = sum(monthly, 'pending') + sum(quarterly, 'pending')
  const isCurrentMonth = month === monthKey()
  const isPastMonth = month < monthKey()

  return (
    <div className="mb-8">
      {/* Selector de periodo */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onShift(-1)}
            disabled={!canGoBack}
            title={canGoBack ? 'Mes anterior' : 'No hay meses anteriores con información guardada'}
            className="p-2 rounded-xl bg-[#1E293B] border border-[#334155] text-slate-400 hover:text-slate-100 hover:border-slate-500 transition-all disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Mes anterior"
          >
            <ChevronLeft size={14} />
          </button>
          <div className="px-4 py-1.5 min-w-44 text-center">
            <p className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-100">
              {monthLabel(month)}
              {isPastMonth && (
                <span className="text-[10px] font-medium uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded-md">
                  Histórico
                </span>
              )}
            </p>
            <p className="text-[11px] text-slate-500">
              {quarterLabel(quarter)} · mes {monthInQuarter(month)} de 3
            </p>
          </div>
          <button
            onClick={() => onShift(1)}
            className="p-2 rounded-xl bg-[#1E293B] border border-[#334155] text-slate-400 hover:text-slate-100 hover:border-slate-500 transition-all"
            aria-label="Mes siguiente"
          >
            <ChevronRight size={14} />
          </button>
        </div>
        {!isCurrentMonth && (
          <button
            onClick={() => onMonthChange(monthKey())}
            className="text-xs text-indigo-400 hover:text-indigo-300 px-3 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 transition-all"
          >
            Ir al mes actual
          </button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <OverallTile
          icon={CalendarDays}
          title="Avance mensual"
          subtitle={monthLabel(month)}
          percentage={pct(monthly)}
          detail={`${sum(monthly, 'resolved')} de ${sum(monthly, 'total')} tareas en ${clients.length} sitios`}
        />
        <OverallTile
          icon={CalendarRange}
          title="Avance trimestral"
          subtitle={quarterLabel(quarter)}
          percentage={pct(quarterly)}
          detail={`${sum(quarterly, 'resolved')} de ${sum(quarterly, 'total')} tareas en ${clients.length} sitios`}
        />
        <CountTile
          icon={CheckCircle2}
          accent="text-emerald-400"
          label="Sitios al día (mes / trimestre)"
          value={`${monthlyUpToDate} · ${quarterlyUpToDate}`}
          total={clients.length}
        />
        <CountTile
          icon={AlertCircle}
          accent="text-amber-400"
          label="Tareas pendientes"
          value={pendingTasks}
        />
      </div>
    </div>
  )
}
