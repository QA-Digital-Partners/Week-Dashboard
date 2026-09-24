'use client'
import { useState } from 'react'
import {
  Pencil, Trash2, Globe, User, Phone, Mail, Check, ChevronDown, CalendarDays, CalendarRange, NotebookPen, Minus,
} from 'lucide-react'
import {
  PERIODS, computeProgress, progressTone, monthLabel, quarterLabel,
} from '@/lib/wpTasks'

const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const shortDate = (iso) => {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
}

function MiniProgress({ icon: Icon, title, progress, active, onClick }) {
  const tone = progressTone(progress.percentage)
  return (
    <button
      onClick={onClick}
      title={`${title}: ${progress.resolved} de ${progress.total} tareas`}
      className={`w-full text-left rounded-lg px-3 py-2 border transition-all
        ${active
          ? 'bg-indigo-500/10 border-indigo-500/40'
          : 'border-transparent hover:bg-[#0F172A] hover:border-[#273449]'}`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-slate-500 font-medium">
          <Icon size={11} className={active ? 'text-indigo-400' : ''} />
          {title}
        </span>
        <span className="text-[11px] tabular-nums">
          <span className={`font-semibold ${tone.text}`}>{progress.percentage}%</span>
          <span className="text-slate-600 ml-1.5">{progress.resolved}/{progress.total}</span>
        </span>
      </div>
      <div className="w-full bg-[#0F172A] rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${tone.bar}`}
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
    </button>
  )
}

function TaskRow({ item, entry, onToggle, onToggleNa }) {
  const isDone = entry?.status === 'done'
  const isNa = entry?.status === 'na'
  return (
    <div
      className={`group/task flex items-center gap-3 px-3 py-2 rounded-lg border transition-all
        ${isDone
          ? 'bg-emerald-500/10 border-emerald-500/20'
          : isNa
          ? 'bg-[#0F172A] border-[#273449] opacity-70'
          : 'bg-[#0F172A] border-[#273449] hover:border-slate-500'}`}
    >
      <button
        onClick={onToggle}
        disabled={isNa}
        aria-pressed={isDone}
        className="flex items-center gap-3 flex-1 min-w-0 text-left disabled:cursor-not-allowed"
      >
        <span
          className={`w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 transition-all
            ${isDone ? 'bg-emerald-500' : isNa ? 'bg-slate-600' : 'bg-[#273449] border border-slate-600'}`}
        >
          {isDone && <Check size={10} strokeWidth={3} className="text-white" />}
          {isNa && <Minus size={10} strokeWidth={3} className="text-slate-300" />}
        </span>
        <span className={`text-xs leading-snug ${isDone ? 'text-emerald-300' : isNa ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
          {item.label}
        </span>
      </button>
      {isDone && entry.date && (
        <span className="text-[10px] text-emerald-400/70 flex-shrink-0 tabular-nums">{shortDate(entry.date)}</span>
      )}
      {item.optional && !isDone && (
        <button
          onClick={onToggleNa}
          title="Marcar como no aplica"
          className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md border flex-shrink-0 transition-all
            ${isNa
              ? 'bg-slate-600/40 text-slate-300 border-slate-500'
              : 'text-slate-500 border-[#334155] hover:text-slate-300 hover:border-slate-500'}`}
        >
          N/A
        </button>
      )}
    </div>
  )
}

export default function WpClientCard({
  client, month, quarter, monthlyRecord, quarterlyRecord, onRecordChange, onEdit, onDelete,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [tab, setTab] = useState('monthly')

  const records = { monthly: monthlyRecord, quarterly: quarterlyRecord }
  const periods = { monthly: month, quarterly: quarter }
  const record = records[tab]
  const tasks = record?.tasks || {}

  const monthlyProgress = computeProgress('monthly', monthlyRecord?.tasks)
  const quarterlyProgress = computeProgress('quarterly', quarterlyRecord?.tasks)

  const save = (periodType, patch) => {
    const current = records[periodType]
    const next = {
      clientId: client.id,
      periodType,
      period: periods[periodType],
      tasks: current?.tasks || {},
      notes: current?.notes || '',
      ...patch,
    }
    onRecordChange(client.id, periodType, next)
  }

  const setTaskStatus = (key, status) => {
    const nextTasks = { ...tasks }
    if (tasks[key]?.status === status) delete nextTasks[key]
    else nextTasks[key] = { status, date: todayISO() }
    save(tab, { tasks: nextTasks })
  }

  const setGroup = (group, complete) => {
    const nextTasks = { ...tasks }
    group.items.forEach((item) => {
      if (complete) {
        if (!nextTasks[item.key]) nextTasks[item.key] = { status: 'done', date: todayISO() }
      } else {
        delete nextTasks[item.key]
      }
    })
    save(tab, { tasks: nextTasks })
  }

  const saveNotes = (notes) => {
    if (notes !== (record?.notes || '')) save(tab, { notes })
  }

  const openTab = (periodType) => {
    setTab(periodType)
    setExpanded(true)
  }

  const lastUpdate = [monthlyRecord?.updated_at, quarterlyRecord?.updated_at].filter(Boolean).sort().pop()

  return (
    <div className={`bg-[#1E293B] border rounded-2xl transition-all duration-200 group
      ${expanded ? 'border-indigo-500/40' : 'border-[#334155] hover:border-slate-500'}`}>

      {/* Fila compacta */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 px-4 py-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-3 flex-1 min-w-0 text-left"
          aria-expanded={expanded}
        >
          <ChevronDown
            size={16}
            className={`text-slate-500 flex-shrink-0 transition-transform ${expanded ? 'rotate-180 text-indigo-400' : ''}`}
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors truncate">
              {client.company || client.name}
            </h3>
            {lastUpdate && (
              <p className="text-[11px] text-slate-500 mt-0.5">
                Actualizado {new Date(lastUpdate).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
              </p>
            )}
          </div>
        </button>

        <div className="grid grid-cols-2 gap-2 lg:w-[420px] flex-shrink-0">
          <MiniProgress
            icon={CalendarDays}
            title="Mensual"
            progress={monthlyProgress}
            active={expanded && tab === 'monthly'}
            onClick={() => (expanded && tab === 'monthly' ? setExpanded(false) : openTab('monthly'))}
          />
          <MiniProgress
            icon={CalendarRange}
            title="Trimestral"
            progress={quarterlyProgress}
            active={expanded && tab === 'quarterly'}
            onClick={() => (expanded && tab === 'quarterly' ? setExpanded(false) : openTab('quarterly'))}
          />
        </div>

        {/* Botones */}
        <div className="flex items-center gap-1 flex-shrink-0 lg:w-[132px] justify-end">
          <button
            onClick={() => onEdit(client)}
            title="Editar cliente"
            className="p-2 rounded-xl bg-[#273449] hover:bg-indigo-500/20 hover:text-indigo-400 text-slate-400 transition-all border border-transparent hover:border-indigo-500/30"
          >
            <Pencil size={14} />
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onDelete(client.id)}
                className="px-2 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-medium border border-red-500/30 transition-all"
              >
                Eliminar
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-1 rounded-lg bg-[#273449] text-slate-400 text-xs font-medium transition-all"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              title="Eliminar cliente"
              className="p-2 rounded-xl bg-[#273449] hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-all border border-transparent hover:border-red-500/30"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Checklist */}
      {expanded && (
        <div className="px-5 pb-5 pt-4 border-t border-[#273449]">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-4 empty:hidden">
            {client.company && client.name && (
              <span className="flex items-center gap-1 text-xs font-medium text-indigo-400">
                <User size={11} />
                {client.name}
              </span>
            )}
            {client.website && (
              <a
                href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <Globe size={11} />
                {client.website}
              </a>
            )}
            {client.phone && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Phone size={11} />
                {client.phone}
              </span>
            )}
            {client.email && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Mail size={11} />
                {client.email}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex p-1 bg-[#0F172A] border border-[#273449] rounded-xl">
              {Object.entries(PERIODS).map(([key, p]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all
                    ${tab === key ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-slate-500">
              {tab === 'monthly' ? monthLabel(month) : quarterLabel(quarter)}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-5">
            {PERIODS[tab].groups.map((group) => {
              const resolved = group.items.filter((i) => tasks[i.key]).length
              const allDone = resolved === group.items.length
              return (
                <div key={group.id}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold">
                      {group.label}
                      <span className="ml-2 text-slate-600 font-medium tabular-nums">{resolved}/{group.items.length}</span>
                    </h4>
                    <button
                      onClick={() => setGroup(group, !allDone)}
                      className="text-[10px] text-slate-500 hover:text-indigo-400 transition-colors"
                    >
                      {allDone ? 'Desmarcar' : 'Marcar todo'}
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {group.items.map((item) => (
                      <TaskRow
                        key={item.key}
                        item={item}
                        entry={tasks[item.key]}
                        onToggle={() => setTaskStatus(item.key, 'done')}
                        onToggleNa={() => setTaskStatus(item.key, 'na')}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Registro / notas */}
          <div className="mt-5">
            <label className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-slate-400 font-semibold mb-2">
              <NotebookPen size={12} />
              {tab === 'monthly' ? 'Registro del mantenimiento' : 'Notas del trimestre'}
            </label>
            <textarea
              key={`${tab}-${periods[tab]}`}
              defaultValue={record?.notes || ''}
              onBlur={(e) => saveNotes(e.target.value)}
              rows={3}
              placeholder={tab === 'monthly'
                ? 'Fecha del mantenimiento, problemas encontrados, acciones tomadas…'
                : 'Hallazgos de la revisión trimestral, recomendaciones al cliente…'}
              className="w-full bg-[#0F172A] border border-[#273449] focus:border-indigo-500/50 rounded-xl px-3 py-2.5 text-xs text-slate-200 placeholder-slate-600 outline-none resize-y transition-colors"
            />
          </div>
        </div>
      )}
    </div>
  )
}
