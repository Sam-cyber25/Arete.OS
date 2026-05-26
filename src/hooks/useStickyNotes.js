import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useStickyNotes() {
  const [notes,   setNotes]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchNotes() }, [])

  const fetchNotes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('sticky_notes')
      .select('*')
      .order('pinned',     { ascending: false })
      .order('created_at', { ascending: false })

    if (error) { console.error(error); setLoading(false); return }

    if ((data || []).length === 0) {
      await seedDefaults()
    } else {
      setNotes(data)
    }
    setLoading(false)
  }

  const seedDefaults = async () => {
    // No default notes — start with an empty board
    setNotes([])
  }

  const addNote = async ({ title, content, priority, tags = [] }) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase
      .from('sticky_notes')
      .insert({ title, content, priority, tags, pinned: false, user_id: user.id })
      .select()
      .single()
    if (!error && data) setNotes((prev) => [data, ...prev])
  }

  const updateNote = async (id, updates) => {
    const { data, error } = await supabase
      .from('sticky_notes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (!error && data) setNotes((prev) => prev.map((n) => n.id === id ? data : n))
  }

  const deleteNote = async (id) => {
    const { error } = await supabase
      .from('sticky_notes')
      .delete()
      .eq('id', id)
    if (error) { console.error('Delete error:', error); return }
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  const togglePin = async (id) => {
    const note = notes.find((n) => n.id === id)
    if (!note) return
    await updateNote(id, { pinned: !note.pinned })
  }

  const movePriority = async (id, direction) => {
    const note = notes.find((n) => n.id === id)
    if (!note) return
    const order = ['LOW', 'MID', 'HIGH']
    const currentIndex = order.indexOf(note.priority)
    const newIndex = direction === 'up'
      ? Math.min(currentIndex + 1, 2)
      : Math.max(currentIndex - 1, 0)
    if (newIndex === currentIndex) return
    await updateNote(id, { priority: order[newIndex] })
  }

  return { notes, loading, addNote, updateNote, deleteNote, togglePin, movePriority, refetch: fetchNotes }
}
