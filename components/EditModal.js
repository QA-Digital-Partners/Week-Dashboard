'use client'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { STATUS_OPTIONS, PM_OPTIONS, STATUS_RESPONSABLE } from '@/data/projects'
import NotesPanel from '@/components/NotesPanel'

export default function EditModal({ project, onClose, onSave }) {
  const [form, setForm] = useState({ ...project })

  useEffect(() => {
    setForm({ ...project })
  }, [project])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // Solo guarda, no cierra
  const handleSave = () => {
    onSave(form)
    onClose()
  }

  // Solo cierra, no guarda
  const handleCancel = () => {
    setForm({ ...project }) // resetea cualquier cambio
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      {/* Backdrop — solo cierra, no guarda */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleCancel}
      />

      <div className="relative w-full max-w-2xl bg-[#1E293B] border border-[#334155] rounded-2xl shadow-2xl z-10 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#334155] flex-shrink-0">
          <h2 className="text-base font-semibold text-slate-100">Edit Project</h2>
          <button
            onClick={handleCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#273449] transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body con dos columnas */}
        <div className="flex flex-1 overflow-hidden">

          {/* Columna izquierda — datos del proyecto */}
          <div className="flex-1 p-5 space-y-4 overflow-y-auto border-r border-[#334155]">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">Project Details</p>

            {[
              { label: 'Project Name', field: 'name', type: 'text' },
              { label: 'Start Date', field: 'startDate', type: 'date' },
              { label: 'End Date', field: 'endDate', type: 'date' },
              { label: 'GANTT Link', field: 'gantt', type: 'url' },
            ].map(({ label, field, type }) => (
              <div key={field}>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                  {label}
                </label>
                <input
                  type={type}
                  value={form[field] || ''}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                />
              </div>
            ))}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">PM</label>
              <select
                value={form.pm || ''}
                onChange={(e) => handleChange('pm', e.target.value)}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              >
                {PM_OPTIONS.map((pm) => (
                  <option key={pm} value={pm} className="bg-[#1E293B]">{pm}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Status</label>
              <select
                value={form.status || ''}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s} className="bg-[#1E293B]">{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                Status Responsable
              </label>
              <select
                value={form.statusResponsable || ''}
                onChange={(e) => handleChange('statusResponsable', e.target.value)}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              >
                {STATUS_RESPONSABLE.map((pm) => (
                  <option key={pm} value={pm} className="bg-[#1E293B]">{pm}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Columna derecha — notas */}
          <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-3">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">Notes & Tracking</p>
            <NotesPanel projectId={project.id} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-[#334155] flex-shrink-0">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-[#273449] rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}