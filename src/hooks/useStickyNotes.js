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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const defaults = [
      { title: 'Close Menon Follow-Up', content: 'Call Papa to inform institute. Discuss SEO upsell and subpages.', priority: 'HIGH', tags: ['kairos', 'client'], pinned: true  },
      { title: 'AI Agents Module 2',    content: 'Groq API integration. Set up n8n workflow for local business demo.',  priority: 'MID', tags: ['ai', 'learning'],  pinned: false },
      { title: 'LootSpec Content',      content: 'Post schedule for next week. Reel ideas: PC build timelapse, mod showcase.', priority: 'LOW', tags: ['lootspec'], pinned: false },
    ]
    const { data, error } = await supabase
      .from('sticky_notes')
      .insert(defaults.map((n) => ({ ...n, user_id: user.id })))
      .select()
    if (!error && data) setNotes(data)
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

  return { notes, loading, addNote, updateNote, deleteNote, togglePin, refetch: fetchNotes }
}
