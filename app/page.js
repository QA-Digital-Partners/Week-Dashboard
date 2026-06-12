'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import ProjectCard from '@/components/ProjectCard'
import EditModal from '@/components/EditModal'
import { LayoutDashboard, PlusCircle, Loader2 } from 'lucide-react'

export default function Home() {
  const [section, setSection] = useState('dashboard')
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingProject, setEditingProject] = useState(null)

  // Cargar proyectos desde la API
  useEffect(() => {
    fetchProjects()
  }, [])

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

// Abrir modal con proyecto vacío SIN guardar en DB todavía
const handleAddProject = () => {
  setEditingProject({
    id: null, // null indica que es nuevo
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

  // Guardar — distingue entre crear nuevo y editar existente
  const handleSave = async (updated) => {
    try {
      if (!updated.id) {
        // Es un proyecto nuevo — hacer POST
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
        // Es un proyecto existente — hacer PUT
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

  // Borrar — Eliminar el proyecto
  const handleDelete = async (projectId) => {
  try {
    await fetch(`/api/projects/${projectId}`, {
      method: 'DELETE',
    })
    await fetchProjects()
  } catch (error) {
    console.error('Error deleting project:', error)
  }
}

  // Normalizar campos de DB (snake_case) a camelCase para los componentes
  const normalize = (p) => ({
    id: p.id,
    name: p.name,
    startDate: p.start_date,
    endDate: p.end_date,
    pm: p.pm,
    status: p.status,
    statusResponsable: p.status_responsable,
    notes: p.notes,
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
    if (section === 'archived') return renderGrid(archivedProjects, 'No archived projects yet.')
    if (section === 'abandoned') return renderGrid(abandonedProjects, 'No abandoned projects.')
    return renderGrid(activeProjects, 'No active projects. Create one from New Project.')
  }

  const SECTION_TITLES = {
    dashboard: 'Active Projects',
    new: 'New Project',
    archived: 'Archived Projects',
    abandoned: 'Abandoned Projects',
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
    </div>
  )
}