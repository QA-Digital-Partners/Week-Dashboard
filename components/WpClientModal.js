'use client'
import { useState } from 'react'
import { X } from 'lucide-react'

export default function WpClientModal({ client, onClose, onSave }) {
  const [form, setForm] = useState({
    company: '',
    name: '',
    website: '',
    phone: '',
    email: '',
    ...client,
  })

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    onSave(form)
    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCancel} />

      <div className="relative w-full max-w-md bg-[#1E293B] border border-[#334155] rounded-2xl shadow-2xl z-10">

        <div className="flex items-center justify-between p-5 border-b border-[#334155]">
          <h2 className="text-base font-semibold text-slate-100">
            {client?.id ? 'Edit Client' : 'New Client'}
          </h2>
          <button onClick={handleCancel} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#273449] transition-all">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {[
            { label: 'Company', field: 'company', type: 'text', placeholder: 'Ej: BMA Landscape' },
            { label: 'Client Name', field: 'name', type: 'text', placeholder: 'Ej: Bryan' },
            { label: 'Website', field: 'website', type: 'text', placeholder: 'Ej: americansplumbing.com' },
            { label: 'Phone', field: 'phone', type: 'text', placeholder: 'Ej: +1 301 555 0000' },
            { label: 'Email', field: 'email', type: 'email', placeholder: 'Ej: contact@client.com' },
          ].map(({ label, field, type, placeholder }) => (
            <div key={field}>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                {label}
              </label>
              <input
                type={type}
                value={form[field] || ''}
                onChange={(e) => handleChange(field, e.target.value)}
                placeholder={placeholder}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-[#334155]">
          <button onClick={handleCancel} className="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-[#273449] rounded-xl transition-all">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!form.name.trim()}
            className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all"
          >
            Save Client
          </button>
        </div>
      </div>
    </div>
  )
}