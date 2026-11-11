// Choosing the part of a picture to use: a round frame over the picture, which you drag to move and zoom with
// the slider, the mouse wheel or two fingers. The arrow keys move it and + and − zoom, for a keyboard.
// → onSave({ x, y, side }): the square to keep, in the picture's own pixels.
import { useEffect, useRef, useState } from 'react'

const FRAME = 240 // the frame's size on screen, in CSS pixels
const MAX_ZOOM = 5

export function AvatarCropper({ file, busy, onSave, onCancel }) {
  const [src, setSrc] = useState(null)
  const [nat, setNat] = useState(null) // the picture's own size
  const [zoom, setZoom] = useState(1)
  const [centre, setCentre] = useState(null) // the frame's middle, in the picture's pixels
  const [bad, setBad] = useState(false)
  const pointers = useRef(new Map())
  const pinch = useRef(null)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setSrc(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  // at zoom 1 the picture just covers the frame; the frame shows `side` of the picture's pixels
  const short = nat ? Math.min(nat.w, nat.h) : 1
  const side = short / zoom
  const scale = FRAME / side // screen pixels per picture pixel
  const clamp = (c, z = zoom) => {
    const half = short / z / 2
    return { x: Math.min(Math.max(c.x, half), nat.w - half), y: Math.min(Math.max(c.y, half), nat.h - half) }
  }
  const zoomTo = (z) => {
    const next = Math.min(MAX_ZOOM, Math.max(1, z))
    setZoom(next)
    setCentre((c) => (c ? clamp(c, next) : c))
  }
  const move = (dx, dy) => setCentre((c) => clamp({ x: c.x - dx / scale, y: c.y - dy / scale }))

  const down = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom }
    }
  }
  const drag = (e) => {
    const last = pointers.current.get(e.pointerId)
    if (!last) return
    const now = { x: e.clientX, y: e.clientY }
    pointers.current.set(e.pointerId, now)
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()]
      zoomTo(pinch.current.zoom * (Math.hypot(a.x - b.x, a.y - b.y) / pinch.current.dist))
    } else if (pointers.current.size === 1) move(now.x - last.x, now.y - last.y)
  }
  const up = (e) => {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) pinch.current = null
  }
  const key = (e) => {
    const step = e.shiftKey ? 30 : 8
    const k = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[e.key]
    if (k) { e.preventDefault(); move(...k) } else if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomTo(zoom * 1.1) } else if (e.key === '-') { e.preventDefault(); zoomTo(zoom / 1.1) }
  }
  // the wheel zooms; a listener of our own, so the page does not scroll instead
  const frame = useRef(null)
  useEffect(() => {
    const el = frame.current
    if (!el) return
    const wheel = (e) => { e.preventDefault(); setZoom((z) => { const next = Math.min(MAX_ZOOM, Math.max(1, z * Math.exp(-e.deltaY / 400))); setCentre((c) => (c ? clamp(c, next) : c)); return next }) }
    el.addEventListener('wheel', wheel, { passive: false })
    return () => el.removeEventListener('wheel', wheel)
  })

  return (
    <div className="cropper" role="dialog" aria-label="Choose the part of the picture to use">
      <div ref={frame} className="cropper__frame" style={{ width: FRAME, height: FRAME }} tabIndex={0}
        onPointerDown={down} onPointerMove={drag} onPointerUp={up} onPointerCancel={up} onKeyDown={key}
        aria-label="Picture. Drag to move it; use the slider, the wheel or two fingers to zoom.">
        {src && (
          <img src={src} alt="" draggable={false} onError={() => setBad(true)}
            onLoad={(e) => {
              const n = { w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight }
              setNat(n); setCentre({ x: n.w / 2, y: n.h / 2 })
            }}
            style={nat && centre ? { width: nat.w * scale, height: nat.h * scale, left: FRAME / 2 - centre.x * scale, top: FRAME / 2 - centre.y * scale } : { visibility: 'hidden' }} />
        )}
        <span className="cropper__ring" aria-hidden="true" />
      </div>
      {bad && <p className="error">This picture could not be opened here. Try a JPEG, PNG or WebP (an iPhone photo can be shared as JPEG).</p>}
      <label className="cropper__zoom">
        <span aria-hidden="true">−</span>
        <input type="range" min="1" max={MAX_ZOOM} step="0.01" value={zoom} onChange={(e) => zoomTo(Number(e.target.value))} aria-label="Zoom" />
        <span aria-hidden="true">+</span>
      </label>
      <p className="hint">Drag to move it. Zoom with the slider, the wheel or two fingers.</p>
      <div className="row">
        <button className="btn btn--primary" disabled={!centre || busy} onClick={() => onSave({ x: centre.x - side / 2, y: centre.y - side / 2, side })}>{busy ? 'Saving…' : 'Use this'}</button>
        <button className="btn btn--quiet" disabled={busy} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
