import { useState, useEffect, useRef, useCallback } from 'react'
import { motion }                                    from 'framer-motion'
import OrnamentalDivider                             from '../components/layout/OrnamentalDivider'

const PAGE = {
  initial:    { opacity: 0, y: 8 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
}

const STORAGE_KEY = 'arete_whiteboard'
const MAX_BOARDS  = 5

const COLORS = ['#C8BAA0', '#C9A84C', '#8B3A3A', '#4A6741', '#8A7A65']
const TOOLS  = [
  { id: 'select',   label: 'Select'   },
  { id: 'pen',      label: 'Pen'      },
  { id: 'line',     label: 'Line'     },
  { id: 'rect',     label: 'Rect'     },
  { id: 'ellipse',  label: 'Ellipse'  },
  { id: 'text',     label: 'Text'     },
  { id: 'arrow',    label: 'Arrow'    },
  { id: 'eraser',   label: 'Eraser'   },
  null, // divider
  { id: 'process',  label: 'Process'  },
  { id: 'decision', label: 'Decision' },
  { id: 'startend', label: 'Start/End'},
  { id: 'connect',  label: 'Connect'  },
]
const WIDTHS = [
  { id: 'thin',  value: 1,   label: 'Thin'  },
  { id: 'med',   value: 2,   label: 'Med'   },
  { id: 'thick', value: 4,   label: 'Thick' },
]

// ── Load / save helpers ───────────────────────────────────────
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return {
    boards:        [{ id: 'b1', name: 'Board I',   shapes: [] }],
    currentBoardId: 'b1',
  }
}

function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
}

// ── Canvas drawing ────────────────────────────────────────────
function screenToCanvas(x, y, vp) {
  return { x: (x - vp.x) / vp.scale, y: (y - vp.y) / vp.scale }
}

function drawArrowhead(ctx, x1, y1, x2, y2) {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const size  = 12
  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - size * Math.cos(angle - Math.PI / 6), y2 - size * Math.sin(angle - Math.PI / 6))
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - size * Math.cos(angle + Math.PI / 6), y2 - size * Math.sin(angle + Math.PI / 6))
  ctx.stroke()
}

function drawShape(ctx, shape) {
  ctx.strokeStyle = shape.color || '#C8BAA0'
  ctx.fillStyle   = shape.color || '#C8BAA0'
  ctx.lineWidth   = shape.width || 1.5
  ctx.lineCap     = 'round'
  ctx.lineJoin    = 'round'

  switch (shape.type) {
    case 'pen': {
      if (!shape.points || shape.points.length < 2) return
      ctx.beginPath()
      ctx.moveTo(shape.points[0].x, shape.points[0].y)
      for (let i = 1; i < shape.points.length; i++) {
        ctx.lineTo(shape.points[i].x, shape.points[i].y)
      }
      ctx.stroke()
      break
    }
    case 'line': {
      ctx.beginPath()
      ctx.moveTo(shape.x1, shape.y1)
      ctx.lineTo(shape.x2, shape.y2)
      ctx.stroke()
      break
    }
    case 'arrow': {
      ctx.beginPath()
      ctx.moveTo(shape.x1, shape.y1)
      ctx.lineTo(shape.x2, shape.y2)
      ctx.stroke()
      drawArrowhead(ctx, shape.x1, shape.y1, shape.x2, shape.y2)
      break
    }
    case 'rect': {
      ctx.beginPath()
      ctx.strokeRect(shape.x, shape.y, shape.w, shape.h)
      break
    }
    case 'ellipse': {
      if (shape.rx === 0 || shape.ry === 0) return
      ctx.beginPath()
      ctx.ellipse(shape.cx, shape.cy, Math.abs(shape.rx), Math.abs(shape.ry), 0, 0, Math.PI * 2)
      ctx.stroke()
      break
    }
    case 'text': {
      ctx.font = `${shape.fontSize || 18}px 'Cormorant Garamond', serif`
      ctx.fillText(shape.text || '', shape.x, shape.y)
      break
    }
    case 'process': {
      ctx.strokeRect(shape.x, shape.y, shape.w, shape.h)
      if (shape.label) {
        ctx.font = `14px 'Cinzel', serif`
        ctx.textAlign = 'center'
        ctx.fillText(shape.label, shape.x + shape.w / 2, shape.y + shape.h / 2 + 5)
        ctx.textAlign = 'left'
      }
      break
    }
    case 'decision': {
      const cx = shape.cx, cy = shape.cy, rx = shape.rx, ry = shape.ry
      ctx.beginPath()
      ctx.moveTo(cx, cy - ry)
      ctx.lineTo(cx + rx, cy)
      ctx.lineTo(cx, cy + ry)
      ctx.lineTo(cx - rx, cy)
      ctx.closePath()
      ctx.stroke()
      if (shape.label) {
        ctx.font = `14px 'Cinzel', serif`
        ctx.textAlign = 'center'
        ctx.fillText(shape.label, cx, cy + 5)
        ctx.textAlign = 'left'
      }
      break
    }
    case 'startend': {
      const r = Math.min(shape.h / 2, 24)
      ctx.beginPath()
      ctx.moveTo(shape.x + r, shape.y)
      ctx.lineTo(shape.x + shape.w - r, shape.y)
      ctx.arcTo(shape.x + shape.w, shape.y, shape.x + shape.w, shape.y + r, r)
      ctx.lineTo(shape.x + shape.w, shape.y + shape.h - r)
      ctx.arcTo(shape.x + shape.w, shape.y + shape.h, shape.x + shape.w - r, shape.y + shape.h, r)
      ctx.lineTo(shape.x + r, shape.y + shape.h)
      ctx.arcTo(shape.x, shape.y + shape.h, shape.x, shape.y + shape.h - r, r)
      ctx.lineTo(shape.x, shape.y + r)
      ctx.arcTo(shape.x, shape.y, shape.x + r, shape.y, r)
      ctx.closePath()
      ctx.stroke()
      if (shape.label) {
        ctx.font = `14px 'Cinzel', serif`
        ctx.textAlign = 'center'
        ctx.fillText(shape.label, shape.x + shape.w / 2, shape.y + shape.h / 2 + 5)
        ctx.textAlign = 'left'
      }
      break
    }
    default: break
  }
}

function drawGrid(ctx, vp, w, h) {
  const spacing = 30 * vp.scale
  const offsetX = ((vp.x % spacing) + spacing) % spacing
  const offsetY = ((vp.y % spacing) + spacing) % spacing

  ctx.fillStyle = 'rgba(201,168,76,0.04)'
  for (let x = offsetX; x < w; x += spacing) {
    for (let y = offsetY; y < h; y += spacing) {
      ctx.beginPath()
      ctx.arc(x, y, 1, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

// ── Hit testing ───────────────────────────────────────────────
function hitTest(shape, x, y) {
  const THRESH = 8
  switch (shape.type) {
    case 'pen': {
      if (!shape.points) return false
      return shape.points.some((p) => Math.hypot(p.x - x, p.y - y) < THRESH)
    }
    case 'line': case 'arrow': {
      const dx = shape.x2 - shape.x1, dy = shape.y2 - shape.y1
      const len = Math.hypot(dx, dy)
      if (len === 0) return false
      const t = Math.max(0, Math.min(1, ((x - shape.x1) * dx + (y - shape.y1) * dy) / (len * len)))
      return Math.hypot(x - (shape.x1 + t * dx), y - (shape.y1 + t * dy)) < THRESH
    }
    case 'rect': case 'process': case 'startend': {
      return x >= shape.x && x <= shape.x + shape.w && y >= shape.y && y <= shape.y + shape.h
    }
    case 'ellipse': case 'decision': {
      return Math.hypot((x - shape.cx) / (shape.rx || 1), (y - shape.cy) / (shape.ry || 1)) <= 1
    }
    case 'text': {
      return Math.hypot(x - shape.x, y - shape.y) < 24
    }
    default: return false
  }
}

// ── Main Whiteboard component ─────────────────────────────────
export default function WhiteboardPage() {
  const canvasRef      = useRef(null)
  const persistTimer   = useRef(null)
  const rafRef         = useRef(null)
  const needsRedraw    = useRef(true)

  // Persisted state
  const [wb, setWb]    = useState(loadState)

  const currentBoard   = wb.boards.find((b) => b.id === wb.currentBoardId) || wb.boards[0]
  const shapes         = currentBoard?.shapes || []

  // History (undo/redo)
  const [history,   setHistory]   = useState([shapes])
  const [histIdx,   setHistIdx]   = useState(0)
  const currentShapes = history[histIdx] || []

  // Tool state
  const [tool,      setTool]      = useState('pen')
  const [color,     setColor]     = useState('#C8BAA0')
  const [width,     setWidth]     = useState(1.5)
  const [vp,        setVp]        = useState({ x: 0, y: 0, scale: 1 })
  const [selected,  setSelected]  = useState(null)
  const [textInput, setTextInput] = useState(null) // { x, y, canvasX, canvasY }
  const [clearConfirm, setClearConfirm] = useState(false)

  // Drawing in-progress refs (avoid re-renders during drag)
  const drawing     = useRef(false)
  const pts         = useRef([])
  const startPt     = useRef(null)
  const panning     = useRef(false)
  const panStart    = useRef(null)
  const connectSrc  = useRef(null) // for CONNECT tool
  const [preview,   setPreview]   = useState(null)
  const [cursor,    setCursor]    = useState('default')

  // Sync currentShapes → board state and persist
  const pushShapes = useCallback((newShapes) => {
    const newHist = history.slice(0, histIdx + 1).concat([newShapes])
    setHistory(newHist)
    setHistIdx(newHist.length - 1)

    setWb((prev) => {
      const updated = {
        ...prev,
        boards: prev.boards.map((b) =>
          b.id === prev.currentBoardId ? { ...b, shapes: newShapes } : b
        ),
      }
      clearTimeout(persistTimer.current)
      persistTimer.current = setTimeout(() => saveState(updated), 5000)
      return updated
    })

    needsRedraw.current = true
  }, [history, histIdx])

  const undo = () => {
    if (histIdx > 0) { setHistIdx(histIdx - 1); needsRedraw.current = true }
  }
  const redo = () => {
    if (histIdx < history.length - 1) { setHistIdx(histIdx + 1); needsRedraw.current = true }
  }

  // ── Render loop ─────────────────────────────────────────────
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { width: w, height: h } = canvas

    ctx.clearRect(0, 0, w, h)

    // Grid
    drawGrid(ctx, vp, w, h)

    // Viewport transform
    ctx.save()
    ctx.translate(vp.x, vp.y)
    ctx.scale(vp.scale, vp.scale)

    // All shapes
    currentShapes.forEach((s) => drawShape(ctx, s))

    // Preview shape
    if (preview) drawShape(ctx, { ...preview, color, width })

    // Selection handles
    if (selected) {
      const s = currentShapes.find((sh) => sh.id === selected)
      if (s) {
        ctx.strokeStyle = '#C9A84C'
        ctx.lineWidth   = 1
        ctx.setLineDash([4, 3])
        // draw bounding box approximation...
        ctx.setLineDash([])
      }
    }

    ctx.restore()

    // Zoom indicator
    ctx.font = '10px JetBrains Mono, monospace'
    ctx.fillStyle = 'rgba(74,63,50,0.8)'
    ctx.fillText(`${Math.round(vp.scale * 100)}%`, w - 46, h - 12)
  }, [currentShapes, preview, vp, selected, color, width])

  // RAF render loop — only draws when dirty
  useEffect(() => {
    function loop() {
      if (needsRedraw.current) {
        render()
        needsRedraw.current = false
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [render])

  // Mark dirty whenever relevant state changes
  useEffect(() => { needsRedraw.current = true }, [currentShapes, preview, vp, selected])

  // ── Canvas sizing ────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width  = rect.width  * dpr
      canvas.height = rect.height * dpr
      const ctx = canvas.getContext('2d')
      ctx.scale(dpr, dpr)
      needsRedraw.current = true
    }
    resize()
    const obs = new ResizeObserver(resize)
    obs.observe(canvas)
    return () => obs.disconnect()
  }, [])

  // ── Keyboard shortcuts ───────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.preventDefault(); undo() }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') { e.preventDefault(); redo() }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selected) {
          pushShapes(currentShapes.filter((s) => s.id !== selected))
          setSelected(null)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, currentShapes, undo, redo, pushShapes])

  // ── Pointer events ───────────────────────────────────────────
  const getCanvasPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return screenToCanvas(e.clientX - rect.left, e.clientY - rect.top, vp)
  }

  const onMouseDown = (e) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      // Pan
      panning.current = true
      panStart.current = { mx: e.clientX, my: e.clientY, vx: vp.x, vy: vp.y }
      setCursor('grabbing')
      return
    }
    if (e.button !== 0) return

    const { x, y } = getCanvasPos(e)

    if (tool === 'select') {
      // Find clicked shape (reverse order = top first)
      const hit = [...currentShapes].reverse().find((s) => hitTest(s, x, y))
      setSelected(hit ? hit.id : null)
      return
    }

    if (tool === 'text') {
      const rect = canvasRef.current.getBoundingClientRect()
      setTextInput({ canvasX: x, canvasY: y, screenX: e.clientX - rect.left, screenY: e.clientY - rect.top })
      return
    }

    if (tool === 'eraser') {
      drawing.current = true
      return
    }

    if (tool === 'connect') {
      const hit = [...currentShapes].reverse().find((s) => hitTest(s, x, y))
      if (!connectSrc.current) {
        connectSrc.current = hit || null
      } else if (hit && hit.id !== connectSrc.current.id) {
        // Get center of both shapes (approximate)
        const src = connectSrc.current
        const srcCenter = getShapeCenter(src)
        const dstCenter = getShapeCenter(hit)
        pushShapes([...currentShapes, { id: `s${Date.now()}`, type: 'arrow', color, width, ...srcCenter, ...{ x1: srcCenter.x, y1: srcCenter.y, x2: dstCenter.x, y2: dstCenter.y } }])
        connectSrc.current = null
      }
      return
    }

    drawing.current = true
    startPt.current = { x, y }
    pts.current     = [{ x, y }]
  }

  const onMouseMove = (e) => {
    if (panning.current) {
      const dx = e.clientX - panStart.current.mx
      const dy = e.clientY - panStart.current.my
      setVp((v) => ({ ...v, x: panStart.current.vx + dx, y: panStart.current.vy + dy }))
      return
    }
    if (!drawing.current) return

    const { x, y } = getCanvasPos(e)

    if (tool === 'eraser') {
      const ERASER_R = 20 / vp.scale
      pushShapes(currentShapes.filter((s) => !hitTest(s, x, y)))
      return
    }

    if (tool === 'pen') {
      pts.current.push({ x, y })
      setPreview({ type: 'pen', points: [...pts.current] })
      return
    }

    const s = startPt.current
    if (!s) return

    switch (tool) {
      case 'line':
        setPreview({ type: 'line', x1: s.x, y1: s.y, x2: x, y2: y })
        break
      case 'arrow':
        setPreview({ type: 'arrow', x1: s.x, y1: s.y, x2: x, y2: y })
        break
      case 'rect':
        setPreview({ type: 'rect', x: Math.min(s.x, x), y: Math.min(s.y, y), w: Math.abs(x - s.x), h: Math.abs(y - s.y) })
        break
      case 'ellipse':
        setPreview({ type: 'ellipse', cx: (s.x + x) / 2, cy: (s.y + y) / 2, rx: Math.abs(x - s.x) / 2, ry: Math.abs(y - s.y) / 2 })
        break
      case 'process':
        setPreview({ type: 'process', x: Math.min(s.x, x), y: Math.min(s.y, y), w: Math.abs(x - s.x), h: Math.abs(y - s.y), label: '' })
        break
      case 'decision':
        setPreview({ type: 'decision', cx: (s.x + x) / 2, cy: (s.y + y) / 2, rx: Math.abs(x - s.x) / 2, ry: Math.abs(y - s.y) / 2, label: '' })
        break
      case 'startend':
        setPreview({ type: 'startend', x: Math.min(s.x, x), y: Math.min(s.y, y), w: Math.abs(x - s.x), h: Math.abs(y - s.y), label: '' })
        break
      default: break
    }
  }

  const onMouseUp = (e) => {
    if (panning.current) { panning.current = false; setCursor('default'); return }
    if (!drawing.current) return
    drawing.current = false

    if (tool === 'eraser') { setPreview(null); return }

    const shape = preview
    setPreview(null)
    if (!shape) return

    const id = `s${Date.now()}`
    pushShapes([...currentShapes, { id, ...shape, color, width }])
    pts.current    = []
    startPt.current = null
  }

  const onWheel = (e) => {
    if (!e.ctrlKey && !e.metaKey) return
    e.preventDefault()
    const factor = e.deltaY > 0 ? 0.9 : 1.1
    setVp((v) => {
      const newScale = Math.min(3, Math.max(0.25, v.scale * factor))
      const rect = canvasRef.current.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      return {
        scale: newScale,
        x: mx - (mx - v.x) * (newScale / v.scale),
        y: my - (my - v.y) * (newScale / v.scale),
      }
    })
  }

  // ── Text input commit ─────────────────────────────────────────
  const commitText = (text) => {
    if (text.trim() && textInput) {
      pushShapes([...currentShapes, {
        id: `s${Date.now()}`,
        type: 'text',
        x: textInput.canvasX,
        y: textInput.canvasY,
        text,
        color,
        width,
        fontSize: 18,
      }])
    }
    setTextInput(null)
  }

  // ── Board management ──────────────────────────────────────────
  const addBoard = () => {
    if (wb.boards.length >= MAX_BOARDS) return
    const id   = `b${Date.now()}`
    const name = `Board ${['I','II','III','IV','V'][wb.boards.length]}`
    const updated = { ...wb, boards: [...wb.boards, { id, name, shapes: [] }], currentBoardId: id }
    setWb(updated)
    saveState(updated)
    setHistory([[]])
    setHistIdx(0)
  }

  const switchBoard = (id) => {
    setWb((prev) => ({ ...prev, currentBoardId: id }))
    const board = wb.boards.find((b) => b.id === id)
    const s = board?.shapes || []
    setHistory([s])
    setHistIdx(0)
  }

  const clearBoard = () => {
    if (!clearConfirm) { setClearConfirm(true); setTimeout(() => setClearConfirm(false), 3000); return }
    pushShapes([])
    setClearConfirm(false)
  }

  const saveImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `arete-whiteboard-${Date.now()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  // cursor style
  const cursorClass = {
    select: 'wb-cursor-select',
    pen:    'wb-cursor-pen',
    eraser: 'wb-cursor-eraser',
    text:   'wb-cursor-text',
  }[tool] || 'wb-cursor-pen'

  return (
    <motion.div {...PAGE} className="flex flex-col" style={{ height: '100%', position: 'relative' }}>
      {/* ── Top bar ── */}
      <div
        className="flex items-center justify-between flex-shrink-0 pb-4 mb-0"
        style={{ borderBottom: '1px solid var(--divider)' }}
      >
        <div className="flex items-center gap-4">
          <div>
            <p className="font-cinzel uppercase tracking-widest" style={{ fontSize: '10px', color: 'var(--bronze)', letterSpacing: '0.25em' }}>
              Tabula
            </p>
            <p className="font-cormorant" style={{ fontSize: '20px', color: 'var(--text)', fontWeight: 600, lineHeight: 1.1 }}>
              Whiteboard
            </p>
          </div>

          {/* Board selector */}
          <div className="flex items-center gap-2" style={{ marginLeft: 16 }}>
            <select
              value={wb.currentBoardId}
              onChange={(e) => switchBoard(e.target.value)}
              className="font-cinzel"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: '10px', padding: '4px 8px', outline: 'none', letterSpacing: '0.12em' }}
            >
              {wb.boards.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            {wb.boards.length < MAX_BOARDS && (
              <button
                className="font-cinzel"
                style={{ fontSize: '10px', color: 'var(--muted)', border: '1px solid var(--border)', padding: '4px 10px', letterSpacing: '0.1em' }}
                onClick={addBoard}
              >
                + New Board
              </button>
            )}
          </div>
        </div>

        {/* Right toolbar */}
        <div className="flex items-center gap-4">
          {/* Color swatches */}
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width:      14,
                  height:     14,
                  background: c,
                  border:     color === c ? '2px solid var(--gold)' : '2px solid transparent',
                  outline:    'none',
                }}
              />
            ))}
          </div>

          {/* Stroke width */}
          <div className="flex gap-2">
            {WIDTHS.map((w) => (
              <button
                key={w.id}
                onClick={() => setWidth(w.value)}
                className="font-cinzel uppercase"
                style={{
                  fontSize:      '9px',
                  letterSpacing: '0.1em',
                  color:         width === w.value ? 'var(--gold)' : 'var(--faint)',
                  borderBottom:  width === w.value ? '1px solid var(--gold)' : '1px solid transparent',
                }}
              >
                {w.label}
              </button>
            ))}
          </div>

          {/* Undo / Redo */}
          <button className="btn-ghost" style={{ fontSize: '9px' }} onClick={undo}>Undo</button>
          <button className="btn-ghost" style={{ fontSize: '9px' }} onClick={redo}>Redo</button>
          <button
            className="btn-ghost"
            style={{ fontSize: '9px', color: clearConfirm ? 'var(--danger)' : undefined }}
            onClick={clearBoard}
          >
            {clearConfirm ? 'Confirm?' : 'Clear'}
          </button>
          <button className="btn-ghost" style={{ fontSize: '9px' }} onClick={saveImage}>Save PNG</button>
        </div>
      </div>

      <OrnamentalDivider opacity={0.15} />

      {/* ── Canvas area + left toolbar ── */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Left toolbar */}
        <div
          className="flex flex-col gap-1 flex-shrink-0 overflow-y-auto"
          style={{ width: 72, borderRight: '1px solid var(--border)', paddingTop: 8 }}
        >
          {TOOLS.map((t, i) =>
            t === null ? (
              <div key={`div${i}`} style={{ height: 1, background: 'var(--divider)', margin: '6px 8px' }} />
            ) : (
              <button
                key={t.id}
                onClick={() => { setTool(t.id); connectSrc.current = null }}
                className="font-cinzel uppercase text-center transition-colors"
                style={{
                  fontSize:      '8px',
                  letterSpacing: '0.1em',
                  color:         tool === t.id ? 'var(--gold)' : 'var(--muted)',
                  borderLeft:    tool === t.id ? '2px solid var(--gold)' : '2px solid transparent',
                  padding:       '8px 6px',
                  lineHeight:    1.3,
                }}
              >
                {t.label}
              </button>
            )
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1 relative" style={{ overflow: 'hidden', background: 'var(--bg)' }}>
          <canvas
            ref={canvasRef}
            className={cursorClass}
            style={{ width: '100%', height: '100%', display: 'block' }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onWheel={onWheel}
            onContextMenu={(e) => e.preventDefault()}
          />

          {/* Text input overlay */}
          {textInput && (
            <input
              autoFocus
              className="font-cormorant"
              style={{
                position:  'absolute',
                left:      textInput.screenX,
                top:       textInput.screenY - 20,
                background: 'transparent',
                border:    'none',
                borderBottom: '1px solid var(--gold)',
                color:     color,
                fontSize:  `${18 * vp.scale}px`,
                outline:   'none',
                minWidth:  120,
              }}
              onBlur={(e) => commitText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitText(e.target.value)
                if (e.key === 'Escape') setTextInput(null)
              }}
            />
          )}

          {/* Connect mode indicator */}
          {tool === 'connect' && connectSrc.current && (
            <div
              className="absolute bottom-3 left-1/2 font-cinzel uppercase"
              style={{ transform: 'translateX(-50%)', fontSize: '9px', color: 'var(--gold)', letterSpacing: '0.2em', background: 'var(--surface)', padding: '4px 12px', border: '1px solid var(--border)' }}
            >
              Click target shape
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ── Helpers ───────────────────────────────────────────────────
function getShapeCenter(shape) {
  switch (shape.type) {
    case 'rect': case 'process': case 'startend':
      return { x: shape.x + (shape.w || 0) / 2, y: shape.y + (shape.h || 0) / 2 }
    case 'ellipse': case 'decision':
      return { x: shape.cx, y: shape.cy }
    case 'line': case 'arrow':
      return { x: (shape.x1 + shape.x2) / 2, y: (shape.y1 + shape.y2) / 2 }
    case 'pen':
      if (!shape.points?.length) return { x: 0, y: 0 }
      const mid = shape.points[Math.floor(shape.points.length / 2)]
      return { x: mid.x, y: mid.y }
    default:
      return { x: shape.x || 0, y: shape.y || 0 }
  }
}
