'use client'
import { useState, useEffect } from 'react'
import { Send, Trash2, Loader2, StickyNote } from 'lucide-react'
import { NOTES_RESPONSABLE } from '@/data/projects'

export default function NotesPanel({ projectId }) {
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [author, setAuthor] = useState('Sebastian')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (projectId) fetchNotes()
  }, [projectId])

  const fetchNotes = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/notes`)
      const data = await res.json()
      setNotes(data)
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim() || !projectId) return
    setSaving(true)
    try {
      await fetch(`/api/projects/${projectId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNote.trim(), created_by: author }),
      })
      setNewNote('')
      await fetchNotes()
    } catch (error) {
      console.error('Error saving note:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (noteId) => {
    try {
      await fetch(`/api/projects/${projectId}/notes?noteId=${noteId}`, {
        method: 'DELETE',
      })
      await fetchNotes()
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Proyecto nuevo — aún sin ID en DB
  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-600 text-xs text-center">
        <StickyNote size={16} />
        <p>Guarda el proyecto primero<br />para poder agregar notas.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">

      {/* Input nueva nota */}
      <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-3 flex flex-col gap-2">
        <textarea
          rows={2}
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Escribe una nota de seguimiento..."
          className="w-full bg-transparent text-sm text-slate-200 placeholder-slate-600 focus:outline-none resize-none"
        />
        <div className="flex items-center justify-between pt-1 border-t border-[#334155]">
          <select
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="bg-transparent text-xs text-slate-400 focus:outline-none"
          >
            {NOTES_RESPONSABLE.map((pm) => (
              <option key={pm} value={pm} className="bg-[#1E293B]">{pm}</option>
            ))}
          </select>
          <button
            onClick={handleAddNote}
            disabled={!newNote.trim() || saving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-all"
          >
            {saving
              ? <Loader2 size={12} className="animate-spin" />
              : <Send size={12} />
            }
            Add Note
          </button>
        </div>
      </div>

      {/* Lista de notas */}
      {loading ? (
        <div className="flex items-center justify-center py-6 gap-2 text-slate-500">
          <Loader2 size={14} className="animate-spin" />
          <span className="text-xs">Loading notes...</span>
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 gap-2 text-slate-600">
          <StickyNote size={18} />
          <span className="text-xs">No hay notas aún</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-[#0F172A] border border-[#273449] rounded-xl p-3 group"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-slate-300 leading-relaxed flex-1">{note.note}</p>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-red-400 transition-all flex-shrink-0"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-medium text-indigo-400">{note.created_by}</span>
                <span className="text-[10px] text-slate-600">{formatDate(note.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}