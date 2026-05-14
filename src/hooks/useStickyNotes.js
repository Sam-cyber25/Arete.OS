import { useLocalStorage } from './useLocalStorage'

const DEFAULT_NOTES = [
  {
    id:        'sn1',
    priority:  'high',
    title:     'Close Menon Follow-Up',
    body:      'Call Papa to inform institute. Discuss SEO upsell and subpages.',
    pinned:    false,
    createdAt: Date.now() - 86400000,
    tags:      [],
  },
  {
    id:        'sn2',
    priority:  'mid',
    title:     'AI Agents Module 2',
    body:      'Groq API integration. Set up n8n workflow for local business demo.',
    pinned:    false,
    createdAt: Date.now() - 43200000,
    tags:      [],
  },
  {
    id:        'sn3',
    priority:  'low',
    title:     'LootSpec Content',
    body:      'Post schedule for next week. Reel ideas: PC build timelapse, mod showcase.',
    pinned:    false,
    createdAt: Date.now(),
    tags:      [],
  },
]

export function useStickyNotes() {
  const [notes, setNotes] = useLocalStorage('sticky_notes', DEFAULT_NOTES)

  const addNote = (priority) => {
    const id = `sn${Date.now()}`
    setNotes((prev) => [
      { id, priority, title: '', body: '', pinned: false, createdAt: Date.now(), tags: [] },
      ...prev,
    ])
    return id
  }

  const updateNote = (id, updates) =>
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)))

  const deleteNote = (id) =>
    setNotes((prev) => prev.filter((n) => n.id !== id))

  const changePriority = (id, priority) =>
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, priority } : n)))

  const togglePin = (id) =>
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)))

  const reorder = (draggedId, targetId) =>
    setNotes((prev) => {
      const arr = [...prev]
      const from = arr.findIndex((n) => n.id === draggedId)
      const to   = arr.findIndex((n) => n.id === targetId)
      if (from === -1 || to === -1 || from === to) return prev
      const [item] = arr.splice(from, 1)
      arr.splice(to, 0, item)
      return arr
    })

  return { notes, addNote, updateNote, deleteNote, changePriority, togglePin, reorder }
}
