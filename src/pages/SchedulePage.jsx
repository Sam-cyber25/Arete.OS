import { useState, useEffect, useCallback, useMemo } from 'react'
import { format, addDays, subDays }                 from 'date-fns'
import { useSchedule }                              from '../hooks/useSchedule'
import { useIsMobile }                              from '../hooks/useIsMobile'
import { getEventsForDate }                         from '../components/schedule/scheduleConstants'
import WeekStrip          from '../components/schedule/WeekStrip'
import DayHeader          from '../components/schedule/DayHeader'
import CategoryFilter     from '../components/schedule/CategoryFilter'
import HorizontalTimeline from '../components/schedule/HorizontalTimeline'
import AddEventSheet      from '../components/schedule/AddEventSheet'

const TODAY_STR = format(new Date(), 'yyyy-MM-dd')

export default function SchedulePage() {
  const { events, addEvent, updateEvent, deleteEvent } = useSchedule()
  const isMobile = useIsMobile()

  const [selectedDate,  setSelectedDate]  = useState(TODAY_STR)
  const [activeFilter,  setActiveFilter]  = useState('ALL')
  const [formOpen,      setFormOpen]      = useState(false)
  const [editingEvent,  setEditingEvent]  = useState(null)
  const [defaultTime,   setDefaultTime]   = useState(null)

  const isToday     = selectedDate === TODAY_STR
  const dayEvents   = useMemo(
    () => getEventsForDate(events, selectedDate),
    [events, selectedDate]
  )

  /* ── Navigation helpers ── */
  const goDay = useCallback((delta) => {
    setSelectedDate((d) => {
      const next = delta > 0 ? addDays(new Date(d + 'T00:00:00'), delta) : subDays(new Date(d + 'T00:00:00'), -delta)
      return format(next, 'yyyy-MM-dd')
    })
  }, [])

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const handler = (e) => {
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault()
        setEditingEvent(null)
        setDefaultTime(null)
        setFormOpen(true)
      }
      if (e.key === 'ArrowLeft')  goDay(-1)
      if (e.key === 'ArrowRight') goDay(1)
      if (e.key === 't' || e.key === 'T') setSelectedDate(TODAY_STR)
      if (e.key === 'Escape') setFormOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goDay])

  /* ── Event handlers ── */
  const handleAddAtTime = useCallback((time) => {
    setDefaultTime(time)
    setEditingEvent(null)
    setFormOpen(true)
  }, [])

  const handleEdit = useCallback((event) => {
    setEditingEvent(event)
    setDefaultTime(null)
    setFormOpen(true)
  }, [])

  const handleSave = useCallback((data) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, data)
    } else {
      addEvent({ ...data, id: `ev_${Date.now()}` })
    }
    setFormOpen(false)
    setEditingEvent(null)
    setDefaultTime(null)
  }, [editingEvent, addEvent, updateEvent])

  const handleDelete = useCallback((id) => {
    deleteEvent(id)
    setFormOpen(false)
    setEditingEvent(null)
  }, [deleteEvent])

  const handleClose = useCallback(() => {
    setFormOpen(false)
    setEditingEvent(null)
    setDefaultTime(null)
  }, [])

  return (
    <div
      style={{
        display:       'flex',
        flexDirection: 'column',
        height:        '100%',
        overflow:      'hidden',
        position:      'relative',
      }}
    >
      {/* Week strip */}
      <WeekStrip
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        events={events}
      />

      {/* Day header */}
      <DayHeader
        date={selectedDate}
        events={dayEvents}
        isToday={isToday}
        onAddEvent={() => { setEditingEvent(null); setDefaultTime(null); setFormOpen(true) }}
      />

      {/* Category filter */}
      <CategoryFilter
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Main horizontal timeline */}
      <HorizontalTimeline
        events={dayEvents}
        selectedDate={selectedDate}
        isToday={isToday}
        activeFilter={activeFilter}
        onEditEvent={handleEdit}
        onAddAtTime={handleAddAtTime}
      />

      {/* Add / Edit form */}
      <AddEventSheet
        open={formOpen}
        onClose={handleClose}
        editingEvent={editingEvent}
        defaultTime={defaultTime}
        selectedDate={selectedDate}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      {/* Keyboard hint — desktop only */}
      {!isMobile && (
        <div
          style={{
            position:      'fixed',
            bottom:        16,
            right:         24,
            fontFamily:    'JetBrains Mono, monospace',
            fontSize:      '9px',
            color:         'rgba(201,168,76,0.2)',
            letterSpacing: '0.1em',
            pointerEvents: 'none',
            zIndex:        1,
            userSelect:    'none',
          }}
        >
          A · ← → · T · Esc
        </div>
      )}
    </div>
  )
}
