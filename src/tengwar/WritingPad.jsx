// A pad to write one tengwa on, with a pen, a finger or a mouse.
// Built to stay smooth on an older iPad: one canvas, only the newest bit of line is drawn while you write,
// coalesced pointer points for a smooth line, and nothing is checked until the pen lifts.
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

// font units: ascender 712, x-height 400, baseline 0, descender −312 (y up); the pad shows a little more
const TOP = 820, BOTTOM = -420

export const WritingPad = forwardRef(function WritingPad({ width, guideText, guideStrokes, showGuide, showStarts, onStroke, disabled, animate }, ref) {
  const box = useRef(null)
  const canvas = useRef(null)
  const strokes = useRef([])
  const current = useRef(null)
  const penSeen = useRef(false)
  const [, redraw] = useState(0)
  const [x0, x1] = width
  const W = x1 - x0, H = TOP - BOTTOM

  // font units ↔ the canvas
  const toUnits = (e) => {
    const r = canvas.current.getBoundingClientRect()
    return [x0 + ((e.clientX - r.left) / r.width) * W, TOP - ((e.clientY - r.top) / r.height) * H]
  }
  const ctxRef = useRef(null)
  const toPx = ([x, y]) => {
    const c = canvas.current
    return [((x - x0) / W) * c.width, ((TOP - y) / H) * c.height]
  }

  const size = () => {
    const c = canvas.current
    if (!c) return
    const r = c.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    c.width = Math.round(r.width * dpr); c.height = Math.round(r.height * dpr)
    const ctx = c.getContext('2d', { desynchronized: true })
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    ctx.lineWidth = Math.max(3, (c.width / W) * 34)
    ctx.strokeStyle = getComputedStyle(c).color
    ctxRef.current = ctx
    paintAll()
  }
  const paintAll = () => {
    const ctx = ctxRef.current, c = canvas.current
    if (!ctx) return
    ctx.clearRect(0, 0, c.width, c.height)
    for (const s of strokes.current) paintStroke(s)
  }
  const paintStroke = (s) => {
    const ctx = ctxRef.current
    if (!s.length) return
    ctx.beginPath()
    const [a, b] = toPx(s[0])
    ctx.moveTo(a, b)
    if (s.length === 1) ctx.lineTo(a + 0.1, b)
    for (let i = 1; i < s.length; i++) { const [x, y] = toPx(s[i]); ctx.lineTo(x, y) }
    ctx.stroke()
  }

  useEffect(() => {
    size()
    const ro = new ResizeObserver(size)
    ro.observe(canvas.current)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [x0, x1])

  useImperativeHandle(ref, () => ({
    strokes: () => strokes.current.map((s) => s.map(([x, y]) => [Math.round(x), Math.round(y)])),
    clear: () => { strokes.current = []; paintAll(); redraw((n) => n + 1) },
    undo: () => { strokes.current.pop(); paintAll(); redraw((n) => n + 1) },
  }))

  const down = (e) => {
    if (disabled) return
    // once a pen has touched the pad, a resting palm (a touch) is ignored
    if (e.pointerType === 'pen') penSeen.current = true
    if (e.pointerType === 'touch' && penSeen.current) return
    e.preventDefault()
    canvas.current.setPointerCapture(e.pointerId)
    current.current = { id: e.pointerId, pts: [toUnits(e)] }
    strokes.current.push(current.current.pts)
    paintStroke(current.current.pts)
  }
  const move = (e) => {
    const cur = current.current
    if (!cur || cur.id !== e.pointerId) return
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]
    const ctx = ctxRef.current
    ctx.beginPath()
    let [px, py] = toPx(cur.pts[cur.pts.length - 1])
    ctx.moveTo(px, py)
    for (const ev of evs.length ? evs : [e]) {
      const p = toUnits(ev)
      cur.pts.push(p)
      ;[px, py] = toPx(p)
      ctx.lineTo(px, py)
    }
    ctx.stroke()
  }
  const up = (e) => {
    const cur = current.current
    if (!cur || cur.id !== e.pointerId) return
    current.current = null
    redraw((n) => n + 1)
    onStroke?.(strokes.current.length)
  }

  const guideD = (s) => s.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${-y}`).join(' ')
  return (
    <div className="pad" ref={box} style={{ aspectRatio: `${W} / ${H}`, width: `min(100%, calc(62vh * ${(W / H).toFixed(4)}))` }}>
      <svg className="pad__guides" viewBox={`${x0} ${-TOP} ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
        {[[712, 'asc'], [400, 'x'], [0, 'base'], [-312, 'desc']].map(([y, k]) => <line key={k} className={'pad__line pad__line--' + k} x1={x0} x2={x1} y1={-y} y2={-y} />)}
        {showGuide && guideText && <text className="pad__glyph" x="0" y="0">{guideText}</text>}
        {showStarts && guideStrokes?.map((s, i) => (
          <g key={i} className="pad__start">
            <circle cx={s[0][0]} cy={-s[0][1]} r="26" />
            <text x={s[0][0] + 34} y={-s[0][1] - 26}>{i + 1}</text>
          </g>
        ))}
        {animate && guideStrokes?.map((s, i) => (
          <path key={animate + ':' + i} className="pad__anim" d={guideD(s)} pathLength="1" style={{ '--i': i }} />
        ))}
      </svg>
      <canvas ref={canvas} className="pad__ink" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        aria-label="Writing area" role="img" />
    </div>
  )
})
