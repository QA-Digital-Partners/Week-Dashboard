'use client'
import { useState, useEffect } from 'react'
import { Pencil, Trash2, CalendarDays, User, FileText, BarChart2, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import StatusChip from '@/components/StatusChip'

function DataField({ icon: Icon, label, value, isLink }) {
  if (isLink) {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-medium flex items-center gap-1">
          <Icon size={10} />
          {label}
        </span>
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
        >
          Ver GANTT <ExternalLink size={10} />
        </a>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-widest text-slate-500 font-medium flex items-center gap-1">
        <Icon size={10} />
        {label}
      </span>
      <span className="text-sm text-slate-200 font-medium leading-snug">{value || '—'}</span>
    </div>
  )
}

export default function ProjectCard({ project, onEdit, onDelete }) {
  const [notes, setNotes] = useState([])
  const [showNotes, setShowNotes] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    fetchNotes()
  }, [project.id])

  const fetchNotes = async () => {
    try {
      const res = await fetch(`/api/projects/${project.id}/notes`)
      const data = await res.json()
      setNotes(data)
    } catch (error) {
      console.error('Error fetching notes:', error)
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const latestNote = notes[0]

  return (
    <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-5 hover:border-indigo-500/50 transition-all duration-200 group">

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <h3 className="text-base font-semibold text-slate-100 leading-tight group-hover:text-white transition-colors">
            {project.name}
          </h3>
          <StatusChip status={project.status} />
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-1 flex-shrink-0">

          {/* Editar */}
          <button
            onClick={() => onEdit(project)}
            className="p-2 rounded-xl bg-[#273449] hover:bg-indigo-500/20 hover:text-indigo-400 text-slate-400 transition-all duration-150 border border-transparent hover:border-indigo-500/30"
            title="Edit project"
          >
            <Pencil size={14} />
          </button>

          {/* Eliminar — con confirmación inline */}
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-400 mr-1">¿Eliminar?</span>
              <button
                onClick={() => onDelete(project.id)}
                className="px-2 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-medium border border-red-500/30 transition-all"
              >
                Sí
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-1 rounded-lg bg-[#273449] hover:bg-[#334155] text-slate-400 text-xs font-medium transition-all"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-2 rounded-xl bg-[#273449] hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-all duration-150 border border-transparent hover:border-red-500/30"
              title="Delete project"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-[#273449] mb-4" />

      {/* Data fields */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-4">
        <DataField icon={CalendarDays} label="Start Date" value={project.startDate} />
        <DataField icon={CalendarDays} label="End Date" value={project.endDate} />
        <DataField icon={User} label="PM" value={project.pm} />
        <DataField icon={User} label="Responsable" value={project.statusResponsable} />
        <DataField icon={BarChart2} label="GANTT" value={project.gantt} isLink={!!project.gantt} />
      </div>

      {/* Notas */}
      {notes.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#273449]">
          <div className="flex items-start gap-2">
            <FileText size={12} className="text-slate-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-slate-400 leading-relaxed">{latestNote.note}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-medium text-indigo-400">{latestNote.created_by}</span>
                <span className="text-[10px] text-slate-600">{formatDate(latestNote.created_at)}</span>
                {notes.length > 1 && (
                  <button
                    onClick={() => setShowNotes(!showNotes)}
                    className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-0.5 transition-colors ml-1"
                  >
                    {showNotes ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                    {showNotes ? 'Hide' : `+${notes.length - 1} more`}
                  </button>
                )}
              </div>
            </div>
          </div>

          {showNotes && notes.slice(1).map((note) => (
            <div key={note.id} className="flex items-start gap-2 mt-3 pl-4 border-l border-[#334155]">
              <div className="flex-1">
                <p className="text-xs text-slate-500 leading-relaxed">{note.note}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-medium text-indigo-400/70">{note.created_by}</span>
                  <span className="text-[10px] text-slate-600">{formatDate(note.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}