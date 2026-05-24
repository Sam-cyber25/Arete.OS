import { useState, useEffect } from 'react'
import { supabase }            from '../lib/supabase'

/*
 * DB schema: id, user_id, title, content, priority, tags(jsonb), pinned(bool), created_at
 * UI shape:  id, title,   body,    priority, tags,         pinned,       createdAt
 * NOTE: DB uses `content`, UI components use `body` — mapped in toUI/fromUI
 */
const DEFAULT_NOTES = [
  {
    priority: 'high',
    title:    'Close Menon Follow-Up',
    content:  'Call Papa to inform institute. Discuss SEO upsell and subpages.',
    pinned:   false,
    tags:     [],
  },
  {
    priority: 'mid',
    title:    'AI Agents Module 2',
    content:  'Groq API integration. Set up n8n workflow for local business demo.',
    pinned:   false,
    tags:     [],
  },
  {
    priority: 'low',
    title:    'LootSpec Content',
    content:  'Post schedule for next week. Reel ideas: PC build timelapse, mod showcase.',
    pinned:   false,
    tags:     [],
  },
]

function toUI(row) {
  return {
    id:        row.id,
    priority:  row.priority ?? 'mid',
    title:     row.title    ?? '',
    body:      row.content  ?? '',    // DB: content → UI: body
    pinned:    row.pinned   ?? false,
    tags:      row.tags     ?? [],
    createdAt: row.created_at,
  }
}

export function useStickyNotes() {
  const [notes,   setNotes]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchNotes() }, [])

  const fetchNotes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('sticky_notes')
      .select('*')
      .order('created_at', { ascending: true })
    if (!error) {
      if ((data || []).length === 0) {
        await seedDefaultNotes()
      } else {
        setNotes(data.map(toUI))
      }
    }
    setLoading(false)
  }

  const seedDefaultNotes = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const rows = DEFAULT_NOTES.map((n) => ({ ...n, user_id: user.id }))
    const { data } = await supabase.from('sticky_notes').insert(rows).select()
    if (data) setNotes(data.map(toUI))
  }

  const addNote = async (priority) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('sticky_notes')
      .insert({
        user_id:  user.id,
        priority,
        title:    '',
        content:  '',       // DB column is `content`
        pinned:   false,
        tags:     [],
      })
      .select()
      .single()
    if (!error && data) {
      setNotes((prev) => [toUI(data), ...prev])
      return data.id
    }
    return null
  }

  const updateNote = async (id, updates) => {
    const dbUpdates = {}
    if ('priority' in updates) dbUpdates.priority = updates.priority
    if ('title'    in updates) dbUpdates.title    = updates.title
    if ('body'     in updates) dbUpdates.content  = updates.body   // UI: body → DB: content
    if ('pinned'   in updates) dbUpdates.pinned   = updates.pinned
    if ('tags'     in updates) dbUpdates.tags     = updates.tags
    const { data, error } = await supabase
      .from('sticky_notes')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()
    if (!error) setNotes((prev) => prev.map((n) => n.id === id ? toUI(data) : n))
  }

  const deleteNote = async (id) => {
    const { error } = await supabase.from('sticky_notes').delete().eq('id', id)
    if (!error) setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  const changePriority = (id, priority) => updateNote(id, { priority })

  const togglePin = async (id) => {
    const note = notes.find((n) => n.id === id)
    if (!note) return
    await updateNote(id, { pinned: !note.pinned })
  }

  /* Reorder is local-only — DB has no sort_order column */
  const reorder = (draggedId, targetId) => {
    setNotes((prev) => {
      const arr  = [...prev]
      const from = arr.findIndex((n) => n.id === draggedId)
      const to   = arr.findIndex((n) => n.id === targetId)
      if (from === -1 || to === -1 || from === to) return prev
      const [item] = arr.splice(from, 1)
      arr.splice(to, 0, item)
      return arr
    })
  }

  return { notes, loading, addNote, updateNote, deleteNote, changePriority, togglePin, reorder, refetch: fetchNotes }
}
