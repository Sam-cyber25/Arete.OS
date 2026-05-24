import { useState, useEffect } from 'react'
import { supabase }            from '../lib/supabase'

const DEFAULT_BOOKS = [
  {
    title:      'Meditations',
    author:     'Marcus Aurelius',
    status:     'READING',
    totalPages: 254,
    pagesRead:  45,
    rating:     null,
    notes:      'On the inner citadel. Discipline of desire.',
    startedAt:  new Date(Date.now() - 86400000 * 5).toISOString(),
    finishedAt: null,
  },
  {
    title:      'The 48 Laws of Power',
    author:     'Robert Greene',
    status:     'QUEUED',
    totalPages: 452,
    pagesRead:  0,
    rating:     null,
    notes:      '',
    startedAt:  null,
    finishedAt: null,
  },
  {
    title:      "Can't Hurt Me",
    author:     'David Goggins',
    status:     'COMPLETED',
    totalPages: 364,
    pagesRead:  364,
    rating:     5,
    notes:      'Callus the mind. 40% rule.',
    startedAt:  new Date(Date.now() - 86400000 * 30).toISOString(),
    finishedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
]

function toUI(row) {
  return {
    id:         row.id,
    title:      row.title,
    author:     row.author      ?? '',
    status:     row.status      ?? 'QUEUED',
    totalPages: row.total_pages ?? 0,
    pagesRead:  row.pages_read  ?? 0,
    rating:     row.rating      ?? null,
    notes:      row.notes       ?? '',
    startedAt:  row.started_at  ?? null,
    finishedAt: row.finished_at ?? null,
    createdAt:  row.created_at,
  }
}

export function useBooks() {
  const [books,   setBooks]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchBooks() }, [])

  const fetchBooks = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) {
      if ((data || []).length === 0) {
        await seedDefaultBooks()
      } else {
        setBooks(data.map(toUI))
      }
    }
    setLoading(false)
  }

  const seedDefaultBooks = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const rows = DEFAULT_BOOKS.map((b) => ({
      user_id:     user.id,
      title:       b.title,
      author:      b.author,
      status:      b.status,
      total_pages: b.totalPages,
      pages_read:  b.pagesRead,
      rating:      b.rating,
      notes:       b.notes,
      started_at:  b.startedAt,
      finished_at: b.finishedAt,
    }))
    const { data } = await supabase.from('books').insert(rows).select()
    if (data) setBooks(data.map(toUI))
  }

  const addBook = async (book) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('books')
      .insert({
        user_id:     user.id,
        title:       book.title,
        author:      book.author      ?? '',
        status:      book.status      ?? 'QUEUED',
        total_pages: book.totalPages  ?? 0,
        pages_read:  book.pagesRead   ?? 0,
        rating:      null,
        notes:       book.notes       ?? '',
        started_at:  book.status === 'READING'   ? (book.startedAt  || new Date().toISOString()) : null,
        finished_at: book.status === 'COMPLETED' ? (book.finishedAt || new Date().toISOString()) : null,
      })
      .select()
      .single()
    if (!error) setBooks((prev) => [toUI(data), ...prev])
  }

  const updateBook = async (id, updates) => {
    const book = books.find((b) => b.id === id)
    if (!book) return

    const dbUpdates = {}
    if ('title'      in updates) dbUpdates.title       = updates.title
    if ('author'     in updates) dbUpdates.author      = updates.author
    if ('status'     in updates) dbUpdates.status      = updates.status
    if ('totalPages' in updates) dbUpdates.total_pages = updates.totalPages
    if ('pagesRead'  in updates) dbUpdates.pages_read  = updates.pagesRead
    if ('rating'     in updates) dbUpdates.rating      = updates.rating
    if ('notes'      in updates) dbUpdates.notes       = updates.notes
    if ('startedAt'  in updates) dbUpdates.started_at  = updates.startedAt
    if ('finishedAt' in updates) dbUpdates.finished_at = updates.finishedAt

    /* Auto-fill pages when marking completed */
    if (updates.status === 'COMPLETED') {
      if (!book.finishedAt && !('finishedAt' in updates))
        dbUpdates.finished_at = new Date().toISOString()
      if (!('pagesRead' in updates))
        dbUpdates.pages_read = book.totalPages
    }
    /* Auto-set startedAt when switching to READING */
    if (updates.status === 'READING' && !book.startedAt && !('startedAt' in updates)) {
      dbUpdates.started_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('books')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()
    if (!error) setBooks((prev) => prev.map((b) => b.id === id ? toUI(data) : b))
  }

  const deleteBook = async (id) => {
    const { error } = await supabase.from('books').delete().eq('id', id)
    if (!error) setBooks((prev) => prev.filter((b) => b.id !== id))
  }

  const stats = {
    total:      books.length,
    reading:    books.filter((b) => b.status === 'READING').length,
    completed:  books.filter((b) => b.status === 'COMPLETED').length,
    queued:     books.filter((b) => b.status === 'QUEUED').length,
    totalPages: books.reduce((sum, b) => sum + (b.pagesRead || 0), 0),
    avgRating: (() => {
      const rated = books.filter((b) => b.rating !== null)
      if (!rated.length) return null
      return (rated.reduce((s, b) => s + b.rating, 0) / rated.length).toFixed(1)
    })(),
  }

  return { books, loading, addBook, updateBook, deleteBook, stats, refetch: fetchBooks }
}
