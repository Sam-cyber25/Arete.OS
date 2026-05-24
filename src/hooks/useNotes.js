import { useState, useEffect } from 'react'
import { supabase }            from '../lib/supabase'
import { isThisWeek }          from 'date-fns'

function toUI(row) {
  return {
    id:        row.id,
    title:     row.title   ?? '',
    content:   row.content ?? '',
    tags:      row.tags    ?? [],
    source:    row.source  ?? 'manual',
    createdAt: row.created_at,
  }
}

const DEFAULT_NOTES = [
  {
    title:   'Project Arête — Origin',
    content: 'Project Arête — Started April 2025. Six goals. Build character. Academic excellence, freelance income, body recomposition, spiritual practice, MMA, and complete character transformation.',
    tags:    ['arete', 'goals', 'life'],
    source:  'manual',
  },
  {
    title:   'Menon Institute — Deployment',
    content: 'Menon Institute website live on Vercel. WhatsApp enquiry forms working. Lead capture system functional. Client satisfied with the result.',
    tags:    ['freelance', 'web', 'client'],
    source:  'manual',
  },
  {
    title:   'AI Agents — Module I Complete',
    content: 'AI Agents Module I complete. Next: Groq API integration. Claude API setup done. Starting on autonomous agent patterns with memory and tool use.',
    tags:    ['ai', 'learning', 'groq'],
    source:  'manual',
  },
]

export function useNotes() {
  const [notes,   setNotes]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchNotes() }, [])

  const fetchNotes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) {
      if (data.length === 0) {
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
    const { data } = await supabase.from('notes').insert(rows).select()
    if (data) setNotes(data.map(toUI))
  }

  const addNote = async (note) => {
    const { data: { user } } = await supabase.auth.getUser()
    const tags = Array.isArray(note.tags)
      ? note.tags
      : (note.tags ? note.tags.split(',').map((t) => t.trim()).filter(Boolean) : [])
    const { data, error } = await supabase
      .from('notes')
      .insert({ title: note.title || '', content: note.content, tags, source: note.source || 'manual', user_id: user.id })
      .select()
      .single()
    if (!error) setNotes((prev) => [toUI(data), ...prev])
  }

  const updateNote = async (id, updates) => {
    const dbUpdates = {}
    if ('title'   in updates) dbUpdates.title   = updates.title
    if ('content' in updates) dbUpdates.content = updates.content
    if ('tags'    in updates) dbUpdates.tags    = updates.tags
    const { data, error } = await supabase
      .from('notes')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()
    if (!error) setNotes((prev) => prev.map((n) => n.id === id ? toUI(data) : n))
  }

  const deleteNote = async (id) => {
    const { error } = await supabase.from('notes').delete().eq('id', id)
    if (!error) setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  const notesThisWeek = notes.filter((n) =>
    n.createdAt && isThisWeek(new Date(n.createdAt), { weekStartsOn: 1 })
  ).length

  const allTags  = notes.flatMap((n) => n.tags)
  const tagCounts = allTags.reduce((acc, tag) => { acc[tag] = (acc[tag] || 0) + 1; return acc }, {})
  const mostUsedTag = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null

  return { notes, loading, addNote, updateNote, deleteNote, notesThisWeek, mostUsedTag, refetch: fetchNotes }
}
