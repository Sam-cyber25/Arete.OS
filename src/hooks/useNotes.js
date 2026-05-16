import { useLocalStorage } from './useLocalStorage'
import { isThisWeek } from 'date-fns'

// ── Version-keyed seed: forces re-seed of default notes on version bump ──
const NOTES_SEED_KEY = 'arete_memory_seeded_v3'
if (!localStorage.getItem(NOTES_SEED_KEY)) {
  localStorage.removeItem('arete_notes')
  localStorage.setItem(NOTES_SEED_KEY, '1')
}

const DEFAULT_NOTES = [
  {
    id: 'n1',
    title: 'Project Arête — Origin',
    content: 'Project Arête — Started April 2025. Six goals. Build character. Academic excellence, freelance income, body recomposition, spiritual practice, MMA, and complete character transformation.',
    tags: ['arete', 'goals', 'life'],
    source: 'manual',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'n2',
    title: 'Menon Institute — Deployment',
    content: 'Menon Institute website live on Vercel. WhatsApp enquiry forms working. Lead capture system functional. Client satisfied with the result.',
    tags: ['freelance', 'web', 'client'],
    source: 'manual',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'n3',
    title: 'AI Agents — Module I Complete',
    content: 'AI Agents Module I complete. Next: Groq API integration. Claude API setup done. Starting on autonomous agent patterns with memory and tool use.',
    tags: ['ai', 'learning', 'groq'],
    source: 'manual',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export function useNotes() {
  const [notes, setNotes] = useLocalStorage('notes', DEFAULT_NOTES)

  const addNote = (note) => {
    const now = new Date().toISOString()
    setNotes((prev) => [
      {
        id: `n${Date.now()}`,
        title: note.title || '',
        content: note.content,
        tags: Array.isArray(note.tags)
          ? note.tags
          : (note.tags ? note.tags.split(',').map((t) => t.trim()).filter(Boolean) : []),
        source: note.source || 'manual',
        createdAt: now,
        updatedAt: now,
      },
      ...prev,
    ])
  }

  const updateNote = (id, updates) =>
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n))
    )

  const deleteNote = (id) => setNotes((prev) => prev.filter((n) => n.id !== id))

  const notesThisWeek = notes.filter((n) =>
    isThisWeek(new Date(n.createdAt), { weekStartsOn: 1 })
  ).length

  const allTags = notes.flatMap((n) => n.tags)
  const tagCounts = allTags.reduce((acc, tag) => { acc[tag] = (acc[tag] || 0) + 1; return acc }, {})
  const mostUsedTag = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null

  return { notes, addNote, updateNote, deleteNote, notesThisWeek, mostUsedTag }
}
