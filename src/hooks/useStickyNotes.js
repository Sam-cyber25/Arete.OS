import { useState, useEffect } from 'react'
import { supabase }            from '../lib/supabase'

/*
 * DB schema: id, user_id, title, content, priority, tags(jsonb), pinned(bool), created_at
 * This hook stores raw DB rows — no UI field mapping needed.
 * Components access DB column names directly (title, content, priority, pinned, created_at).
 * Priority values: 'HIGH' | 'MID' | 'LOW'
 */

const DEFAULT_NOTES = [
  { title: 'Close Menon Follow-Up', content: 'Call Papa to inform institute. Discuss SEO upsell and subpages.', priority: 'HIGH', tags: [], pinned: false },
  { title: 'AI Agents Module 2',    content: 'Groq API integration. Set up n8n workflow for local business demo.',  priority: 'MID', tags: [], pinned: false },
  { title: 'LootSpec Content',      content: 'Post schedule for next week. Reel ideas: PC build timelapse, mod showcase.', priority: 'LOW', tags: [], pinned: false },
]

export function useStickyNotes() {
  const [notes,   setNotes]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchNotes() }, [])

  const fetchNotes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('sticky_notes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch sticky notes error:', error)
      setLoading(false)
      return
    }

    if ((data || []).length === 0) {
      await seedNotes()
    } else {
      setNotes(data)
    }
    setLoading(false)
  }

  const seedNotes = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase
      .from('sticky_notes')
      .insert(DEFAULT_NOTES.map((n) => ({ ...n, user_id: user.id })))
      .select()
    if (!error && data) setNotes(data)
  }

  const addNote = async ({ title, content, priority }) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase
      .from('sticky_notes')
      .insert({ title, content, priority, user_id: user.id, tags: [], pinned: false })
      .select()
      .single()
    if (!error && data) setNotes((prev) => [data, ...prev])
  }

  const updateNote = async (id, updates) => {
    /* updates must use DB column names: title, content, priority, pinned, tags */
    const { data, error } = await supabase
      .from('sticky_notes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (!error && data) setNotes((prev) => prev.map((n) => n.id === id ? data : n))
  }

  const deleteNote = async (id) => {
    /* Guard: id must be a UUID, not a legacy client-side string like 'sn1' */
    if (!id || typeof id !== 'string' || /^[a-zA-Z][\w-]*\d+$/.test(id)) {
      console.error('Invalid sticky note ID — not a UUID:', id)
      return
    }
    const { error } = await supabase
      .from('sticky_notes')
      .delete()
      .eq('id', id)
    if (error) { console.error('Delete sticky error:', error); return }
    /* Only remove from local state after confirmed Supabase delete */
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  const togglePin = async (id) => {
    const note = notes.find((n) => n.id === id)
    if (!note) return
    await updateNote(id, { pinned: !note.pinned })
  }

  /* Returns notes for a given priority, pinned first */
  const byPriority = (priority) =>
    notes
      .filter((n) => n.priority === priority)
      .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))

  return { notes, loading, addNote, updateNote, deleteNote, togglePin, byPriority, refetch: fetchNotes }
}
