import { useLocalStorage } from './useLocalStorage'

/* ── Version-keyed seed ── */
const BOOKS_SEED_KEY = 'arete_books_seeded_v1'
if (!localStorage.getItem(BOOKS_SEED_KEY)) {
  localStorage.removeItem('arete_books')
  localStorage.setItem(BOOKS_SEED_KEY, '1')
}

const DEFAULT_BOOKS = [
  {
    id:         'b1',
    title:      'Meditations',
    author:     'Marcus Aurelius',
    status:     'READING',
    totalPages: 254,
    pagesRead:  45,
    rating:     null,
    notes:      'On the inner citadel. Discipline of desire.',
    startedAt:  new Date(Date.now() - 86400000 * 5).toISOString(),
    finishedAt: null,
    createdAt:  new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id:         'b2',
    title:      'The 48 Laws of Power',
    author:     'Robert Greene',
    status:     'QUEUED',
    totalPages: 452,
    pagesRead:  0,
    rating:     null,
    notes:      '',
    startedAt:  null,
    finishedAt: null,
    createdAt:  new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id:         'b3',
    title:      "Can't Hurt Me",
    author:     'David Goggins',
    status:     'COMPLETED',
    totalPages: 364,
    pagesRead:  364,
    rating:     5,
    notes:      'Callus the mind. 40% rule.',
    startedAt:  new Date(Date.now() - 86400000 * 30).toISOString(),
    finishedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    createdAt:  new Date(Date.now() - 86400000 * 30).toISOString(),
  },
]

export function useBooks() {
  const [books, setBooks] = useLocalStorage('books', DEFAULT_BOOKS)

  const addBook = (book) =>
    setBooks((prev) => [
      {
        ...book,
        id:         `b${Date.now()}`,
        pagesRead:  book.pagesRead  || 0,
        rating:     null,
        createdAt:  new Date().toISOString(),
        startedAt:  book.status === 'READING'   ? (book.startedAt  || new Date().toISOString()) : null,
        finishedAt: book.status === 'COMPLETED' ? (book.finishedAt || new Date().toISOString()) : null,
      },
      ...prev,
    ])

  const updateBook = (id, updates) =>
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b
        const next = { ...b, ...updates }
        /* Auto-fill pages when marking completed */
        if (updates.status === 'COMPLETED' && !next.finishedAt) {
          next.finishedAt = new Date().toISOString()
          next.pagesRead  = next.totalPages
        }
        /* Auto-set startedAt when switching to READING */
        if (updates.status === 'READING' && !next.startedAt) {
          next.startedAt = new Date().toISOString()
        }
        return next
      })
    )

  const deleteBook = (id) => setBooks((prev) => prev.filter((b) => b.id !== id))

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

  return { books, addBook, updateBook, deleteBook, stats }
}
