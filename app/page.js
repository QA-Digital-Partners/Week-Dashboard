'use client'
import { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/Sidebar'
import ProjectCard from '@/components/ProjectCard'
import EditModal from '@/components/EditModal'
import { LayoutDashboard, PlusCircle, Loader2, Search, ArrowUpDown } from 'lucide-react'
import WpClientCard from '@/components/WpClientCard'
import WpClientModal from '@/components/WpClientModal'
import WpMaintenanceSummary from '@/components/WpMaintenanceSummary'
import { monthKey, quarterOf, shiftMonth, computeProgress } from '@/lib/wpTasks'

const WP_FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'monthly_pending', label: 'Pendiente mes' },
  { id: 'quarterly_pending', label: 'Pendiente trimestre' },
  { id: 'up_to_date', label: 'Al día' },
]

export default function Home() {
  const [section, setSection] = useState('dashboard')
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingProject, setEditingProject] = useState(null)
  const [wpClients, setWpClients] = useState([])
  const [wpModal, setWpModal] = useState(null)
  const [wpMonth, setWpMonth] = useState(monthKey())
  const [wpMaintenance, setWpMaintenance] = useState({ monthly: {}, quarterly: {} })
  const wpSaveQueue = useRef({})
  const wpQuarter = quarterOf(wpMonth)
  const [wpHistory, setWpHistory] = useState([])
  const [wpSearch, setWpSearch] = useState('')
  const [wpFilter, setWpFilter] = useState('all')
  const [wpSort, setWpSort] = useState('name')

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWpClients = async () => {
    try {
      const res = await fetch('/api/wp-clients')
      const data = await res.json()
      setWpClients(data)
    } catch (error) {
      console.error('Error fetching wp clients:', error)
    }
  }

  const fetchWpMaintenance = async (month) => {
    try {
      const res = await fetch(`/api/wp-maintenance?month=${month}&quarter=${quarterOf(month)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const byClient = (rows) => Object.fromEntries(rows.map((r) => [r.client_id, r]))
      setWpMaintenance({ monthly: byClient(data.monthly), quarterly: byClient(data.quarterly) })
    } catch (error) {
      console.error('Error fetching maintenance:', error)
    }
  }

  const fetchWpHistory = async () => {
    try {
      const res = await fetch('/api/wp-maintenance?history=1')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setWpHistory(data.months)
    } catch (error) {
      console.error('Error fetching maintenance history:', error)
    }
  }

  useEffect(() => {
    fetchProjects()
    fetchWpClients()
  }, [])

  useEffect(() => {
    fetchWpMaintenance(wpMonth)
    fetchWpHistory()
  }, [wpMonth])

  // Navegación: del mes actual en adelante libremente; hacia atrás solo meses con información guardada
  const wpPastMonths = wpHistory.filter((m) => m < monthKey())
  const prevWpMonth = (month) => {
    if (month > monthKey()) return shiftMonth(month, -1)
    return wpPastMonths.filter((m) => m < month).pop() || null
  }
  const nextWpMonth = (month) => {
    if (month >= monthKey()) return shiftMonth(month, 1)
    return wpPastMonths.find((m) => m > month) || monthKey()
  }

  // Actualización optimista; los guardados de un mismo cliente/periodo se envían en orden
  const handleWpRecordChange = (clientId, periodType, record) => {
    setWpMaintenance((prev) => ({
      ...prev,
      [periodType]: { ...prev[periodType], [clientId]: { ...prev[periodType][clientId], ...record } },
    }))
    const queueKey = `${clientId}:${periodType}:${record.period}`
    const previous = wpSaveQueue.current[queueKey] || Promise.resolve()
    wpSaveQueue.current[queueKey] = previous.then(async () => {
      try {
        const res = await fetch('/api/wp-maintenance', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        })
        const saved = await res.json()
        if (!res.ok) throw new Error(saved.error)
        setWpMaintenance((prev) => {
          const current = prev[periodType][clientId]
          if (current?.period !== saved.period) return prev
          return { ...prev, [periodType]: { ...prev[periodType], [clientId]: { ...current, updated_at: saved.updated_at } } }
        })
      } catch (error) {
        console.error('Error saving maintenance:', error)
      }
    })
  }

  const handleAddProject = () => {
    setEditingProject({
      id: null,
      name: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      pm: 'Sebastian',
      status: 'Active',
      statusResponsable: 'Juan Camilo',
      gantt: '',
      archived: false,
      abandoned: false,
    })
  }

  const handleSave = async (updated) => {
    try {
      if (!updated.id) {
        await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: updated.name,
            start_date: updated.startDate,
            end_date: updated.endDate || null,
            pm: updated.pm,
            status: updated.status,
            status_responsable: updated.statusResponsable,
            gantt: updated.gantt || '',
            archived: false,
            abandoned: false,
          }),
        })
      } else {
        await fetch(`/api/projects/${updated.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: updated.name,
            start_date: updated.startDate,
            end_date: updated.endDate || null,
            pm: updated.pm,
            status: updated.status,
            status_responsable: updated.statusResponsable,
            gantt: updated.gantt || '',
            archived: updated.archived || false,
            abandoned: updated.abandoned || false,
          }),
        })
      }
      await fetchProjects()
    } catch (error) {
      console.error('Error saving project:', error)
    }
  }

  const handleDelete = async (projectId) => {
    try {
      await fetch(`/api/projects/${projectId}`, { method: 'DELETE' })
      await fetchProjects()
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  const handleWpSave = async (client) => {
    try {
      if (!client.id) {
        await fetch('/api/wp-clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(client),
        })
      } else {
        await fetch(`/api/wp-clients?id=${client.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(client),
        })
      }
      await fetchWpClients()
    } catch (error) {
      console.error('Error saving wp client:', error)
    }
  }

  const handleWpDelete = async (clientId) => {
    try {
      await fetch(`/api/wp-clients?id=${clientId}`, { method: 'DELETE' })
      await fetchWpClients()
    } catch (error) {
      console.error('Error deleting wp client:', error)
    }
  }

  const normalize = (p) => ({
    id: p.id,
    name: p.name,
    // La API devuelve '2026-09-30T00:00:00.000Z'; solo se usa año-mes-día
    startDate: p.start_date?.slice(0, 10) || '',
    endDate: p.end_date?.slice(0, 10) || '',
    pm: p.pm,
    status: p.status,
    statusResponsable: p.status_responsable,
    gantt: p.gantt,
    archived: p.archived,
    abandoned: p.abandoned,
  })

  const activeProjects = projects
    .filter((p) => p.status !== 'Completed' && p.status !== 'Abandoned')
    .map(normalize)

  const archivedProjects = projects
    .filter((p) => p.status === 'Completed')
    .map(normalize)

  const abandonedProjects = projects
    .filter((p) => p.status === 'Abandoned')
    .map(normalize)

  const renderGrid = (list, emptyMsg) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-48 gap-2 text-slate-500">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading projects...</span>
        </div>
      )
    }
    if (list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-sm">
          {emptyMsg}
        </div>
      )
    }
    return (
      <div className="flex flex-col gap-4">
        {list.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={(p) => setEditingProject(p)}
            onDelete={handleDelete}
          />
        ))}
      </div>
    )
  }

  const renderContent = () => {
    if (section === 'new') {
      return (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <PlusCircle size={24} className="text-indigo-400" />
          </div>
          <div className="text-center">
            <h3 className="text-slate-200 font-semibold mb-1">Create a new project</h3>
            <p className="text-slate-500 text-sm">Fill in the details to start tracking</p>
          </div>
          <button
            onClick={handleAddProject}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all"
          >
            + Add Project
          </button>
        </div>
      )
    }
    if (section === 'wordpress') {
      const query = wpSearch.trim().toLowerCase()
      const rows = wpClients.map((client) => ({
        client,
        monthly: computeProgress('monthly', wpMaintenance.monthly[client.id]?.tasks),
        quarterly: computeProgress('quarterly', wpMaintenance.quarterly[client.id]?.tasks),
      }))
      const counts = {
        all: rows.length,
        monthly_pending: rows.filter((r) => r.monthly.pending > 0).length,
        quarterly_pending: rows.filter((r) => r.quarterly.pending > 0).length,
        up_to_date: rows.filter((r) => r.monthly.pending === 0 && r.quarterly.pending === 0).length,
      }
      const visible = rows
        .filter(({ client }) =>
          !query ||
          client.name?.toLowerCase().includes(query) ||
          client.company?.toLowerCase().includes(query) ||
          client.website?.toLowerCase().includes(query)
        )
        .filter((r) => {
          if (wpFilter === 'monthly_pending') return r.monthly.pending > 0
          if (wpFilter === 'quarterly_pending') return r.quarterly.pending > 0
          if (wpFilter === 'up_to_date') return r.monthly.pending === 0 && r.quarterly.pending === 0
          return true
        })
        .sort((a, b) => {
          const byName = (a.client.company || a.client.name).localeCompare(b.client.company || b.client.name)
          if (wpSort === 'monthly') return a.monthly.percentage - b.monthly.percentage || byName
          if (wpSort === 'quarterly') return a.quarterly.percentage - b.quarterly.percentage || byName
          return byName
        })

      return (
        <div>
          <WpMaintenanceSummary
            clients={wpClients}
            month={wpMonth}
            quarter={wpQuarter}
            maintenance={wpMaintenance}
            onMonthChange={setWpMonth}
            canGoBack={prevWpMonth(wpMonth) !== null}
            onShift={(delta) => setWpMonth((m) => (delta < 0 ? prevWpMonth(m) || m : nextWpMonth(m)))}
          />
          {wpClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-sm">
              No hay clientes WordPress. Agrega uno con el botón de arriba.
            </div>
          ) : (
            <>
            {/* Barra de búsqueda, filtros y orden */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  value={wpSearch}
                  onChange={(e) => setWpSearch(e.target.value)}
                  placeholder="Buscar empresa, cliente o sitio…"
                  className="w-full bg-[#1E293B] border border-[#334155] focus:border-indigo-500/50 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors"
                />
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {WP_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setWpFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                      ${wpFilter === f.id
                        ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                        : 'bg-[#1E293B] text-slate-400 border-[#334155] hover:text-slate-200 hover:border-slate-500'}`}
                  >
                    {f.label}
                    <span className="ml-1.5 text-slate-500 tabular-nums">{counts[f.id]}</span>
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 lg:ml-auto text-xs text-slate-500">
                <ArrowUpDown size={13} />
                <select
                  value={wpSort}
                  onChange={(e) => setWpSort(e.target.value)}
                  className="bg-[#1E293B] border border-[#334155] rounded-lg px-2 py-1.5 text-xs text-slate-300 outline-none"
                >
                  <option value="name">Empresa (A–Z)</option>
                  <option value="monthly">Menor avance mensual</option>
                  <option value="quarterly">Menor avance trimestral</option>
                </select>
              </label>
            </div>

            {visible.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-slate-500 text-sm bg-[#1E293B]/50 border border-dashed border-[#334155] rounded-2xl">
                Ningún cliente coincide con la búsqueda o el filtro.
              </div>
            ) : (
            <div className="flex flex-col gap-2">
              {visible.map(({ client }) => (
                <WpClientCard
                  key={client.id}
                  client={client}
                  month={wpMonth}
                  quarter={wpQuarter}
                  monthlyRecord={wpMaintenance.monthly[client.id]}
                  quarterlyRecord={wpMaintenance.quarterly[client.id]}
                  onRecordChange={handleWpRecordChange}
                  onEdit={(c) => setWpModal(c)}
                  onDelete={handleWpDelete}
                />
              ))}
            </div>
            )}
            </>
          )}
        </div>
      )
    }
    if (section === 'archived') return renderGrid(archivedProjects, 'No archived projects yet.')
    if (section === 'abandoned') return renderGrid(abandonedProjects, 'No abandoned projects.')
    return renderGrid(activeProjects, 'No active projects. Create one from New Project.')
  }

  const SECTION_TITLES = {
    dashboard: 'Active Projects',
    new: 'New Project',
    archived: 'Archived Projects',
    abandoned: 'Abandoned Projects',
    wordpress: 'WP Maintenance',
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200">
      <Sidebar activeSection={section} onNavigate={setSection} />

      <main className="ml-60 min-h-screen">
        <div className="sticky top-0 z-30 bg-[#0F172A]/90 backdrop-blur border-b border-[#334155] px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard size={18} className="text-indigo-400" />
            <h1 className="text-base font-semibold text-slate-100">{SECTION_TITLES[section]}</h1>
            {section === 'dashboard' && (
              <span className="text-xs bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full font-medium">
                {activeProjects.length} active
              </span>
            )}
            {section === 'wordpress' && (
              <span className="text-xs bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full font-medium">
                {wpClients.length} {wpClients.length === 1 ? 'cliente' : 'clientes'}
              </span>
            )}
          </div>
          {section === 'dashboard' && (
            <button
              onClick={handleAddProject}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all"
            >
              <PlusCircle size={14} />
              New Project
            </button>
          )}
          {section === 'wordpress' && (
            <button
              onClick={() => setWpModal({ company: '', name: '', website: '', phone: '', email: '' })}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all"
            >
              <PlusCircle size={14} />
              New Client
            </button>
          )}
        </div>

        <div className="p-8">
          {renderContent()}
        </div>
      </main>

      {editingProject && (
        <EditModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSave={handleSave}
        />
      )}

      {wpModal !== null && (
        <WpClientModal
          client={wpModal}
          onClose={() => setWpModal(null)}
          onSave={handleWpSave}
        />
      )}
    </div>
  )
}