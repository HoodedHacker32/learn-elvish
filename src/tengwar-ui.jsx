// The Tengwar keyboard, typed Tengwar answers, and the desk for writing anything in Tengwar and taking it
// elsewhere: as a picture (PNG or SVG), as Unicode text (ConScript), or as text for Tengwar Annatar.
import { useEffect, useMemo, useRef, useState } from 'react'
import { CSUR, ANNATAR_LETTERS, ANNATAR_TEHTAR, toTengwar, toAnnatar } from '../../LoTR Elvish Translator/src/engine/tengwar.js'
import { LETTERS } from './course/tengwar.js'

const T = (cp) => String.fromCharCode(cp)
// a phone or tablet with no keyboard is told to tap; a computer is told about the Annatar keys too
const TOUCH = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches
const EMPTY = TOUCH ? 'Tap the letters below' : 'Tap the letters, or type them with the Annatar keys (1 tinco, q parma…)'
const VOWEL_SIGNS = ['threeDots', 'acute', 'dot', 'rightCurl', 'leftCurl', 'twoDots']

// laid out as Tolkien's table: the four columns side by side, two grades to a row
const ROWS = [
  ['tinco', 'parma', 'calma', 'quesse', 'ando', 'umbar', 'anga', 'ungwe'],
  ['thule', 'formen', 'harma', 'hwesta', 'anto', 'ampa', 'anca', 'unque'],
  ['numen', 'malta', 'noldo', 'nwalme', 'ore', 'vala', 'anna', 'vilya'],
  ['romen', 'arda', 'lambe', 'alda', 'silme', 'silmeNuquerna', 'esse', 'esseNuquerna'],
  ['hyarmen', 'hwestaSindarinwa', 'yanta', 'ure', 'shortCarrier', 'longCarrier', 'extAndo', 'extUmbar'],
  ['threeDots', 'acute', 'dot', 'rightCurl', 'leftCurl', 'twoDots', 'dotBelow', 'nasalizer'],
  ['doubler', 'pusta', 'doublePusta', 'exclamation', 'question', 'space', 'back'],
]
const KEY_LABEL = {
  threeDots: 'a', acute: 'e', dot: 'i', rightCurl: 'o', leftCurl: 'u', twoDots: 'y', dotBelow: 'silent e', nasalizer: 'n/m',
  doubler: 'double', pusta: 'pause', doublePusta: 'stop', exclamation: '!', question: '?', extAndo: 'the', extUmbar: 'of',
}
const labelOf = (id) => KEY_LABEL[id] || (LETTERS[id] ? LETTERS[id].sound.split(/[ ·(]/)[0] || LETTERS[id].name : id)
const nameOf = (id) => LETTERS[id]?.name || { extAndo: '“the” (extended ando)', extUmbar: '“of” (extended umbar)' }[id] || id
// a vowel sign is shown on a carrier, any other mark on tinco, so it can be seen on its own
const faceOf = (id) => (VOWEL_SIGNS.includes(id) ? T(CSUR.shortCarrier) + T(CSUR[id]) : ['dotBelow', 'nasalizer', 'doubler'].includes(id) ? T(CSUR.tinco) + T(CSUR[id]) : T(CSUR[id]))

// the physical keyboard follows Tengwar Annatar's layout (Dan Smith's encoding): 1 tinco, q parma, a calma…
const PHYSICAL = (() => {
  const m = new Map()
  for (const [name, key] of Object.entries(ANNATAR_LETTERS)) if (CSUR[name] != null && key.length === 1) m.set(key, name)
  for (const [name, keys] of Object.entries(ANNATAR_TEHTAR)) {
    if (CSUR[name] == null || Array.isArray(keys)) continue
    for (const k of keys) if (!m.has(k)) m.set(k, name)
  }
  return m
})()

export function TengwarKeyboard({ onKey, lit }) {
  return (
    <div className="twkb" role="group" aria-label="Tengwar keyboard">
      {ROWS.map((row, ri) => (
        <div className="twkb__row" key={ri}>
          {row.map((id) => {
            if (id === 'space') return <button key={id} type="button" className="twkb__key twkb__key--wide" onClick={() => onKey(' ')} aria-label="Space">space</button>
            if (id === 'back') return <button key={id} type="button" className="twkb__key twkb__key--back" onClick={() => onKey('back')} aria-label="Delete">⌫</button>
            return (
              <button key={id} type="button" className={'twkb__key' + (lit === id ? ' is-lit' : '') + (ri >= 5 ? ' twkb__key--mark' : '')}
                onClick={() => onKey(T(CSUR[id]))} title={nameOf(id)} aria-label={nameOf(id)}>
                <span className="twkb__glyph">{faceOf(id)}</span>
                <span className="twkb__lab">{labelOf(id)}</span>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// A Tengwar answer field with its keyboard. On phones and tablets nothing asks for the system keyboard,
// so only this one shows; on a computer the real keys type Tengwar as in Tengwar Annatar.
export function TengwarTyper({ onAnswer, answered, initial = '' }) {
  const [v, setV] = useState(initial)
  const [lit, setLit] = useState(null)
  const press = (k) => {
    if (answered) return
    if (k === 'back') setV((s) => [...s].slice(0, -1).join(''))
    else setV((s) => s + k)
  }
  useEffect(() => {
    const key = (e) => {
      if (answered || e.ctrlKey || e.metaKey || e.altKey || /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return
      if (e.key === 'Backspace') { e.preventDefault(); press('back'); return }
      if (e.key === 'Enter') { if (v.trim()) { e.preventDefault(); onAnswer(v) } return }
      if (e.key === ' ') { e.preventDefault(); press(' '); return }
      const name = PHYSICAL.get(e.key)
      if (!name) return
      e.preventDefault()
      press(T(CSUR[name]))
      setLit(name); setTimeout(() => setLit((l) => (l === name ? null : l)), 220)
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  })
  return (
    <div className="twtyper">
      <div className="twfield" role="textbox" aria-readonly="true" aria-label="Your answer in Tengwar">
        {v ? <span className="twfield__text">{v}</span> : <span className="twfield__empty">{EMPTY}</span>}
        {!answered && <span className="twfield__caret" aria-hidden="true" />}
      </div>
      {!answered && <TengwarKeyboard onKey={press} lit={lit} />}
      {!answered && <button className="btn btn--primary" type="button" disabled={!v.trim()} onClick={() => onAnswer(v)}>Check</button>}
    </div>
  )
}

// ——— taking Tengwar elsewhere ———

async function fontReady(px) {
  try { await document.fonts.load(`${px}px "Alcarin Tengwar"`) } catch { /* drawn with whatever is loaded */ }
}

function wrap(ctx, text, max) {
  const lines = []
  for (const para of text.split('\n')) {
    let line = ''
    for (const word of para.split(' ')) {
      const test = line ? line + ' ' + word : word
      if (ctx.measureText(test).width > max && line) { lines.push(line); line = word } else line = test
    }
    lines.push(line)
  }
  return lines
}

const INK = '#222a25', PAPER = '#f4efe2'

export async function tengwarPng(text) {
  const px = 96
  await fontReady(px)
  const c = document.createElement('canvas')
  const ctx = c.getContext('2d')
  ctx.font = `${px}px "Alcarin Tengwar"`
  const lines = wrap(ctx, text, 1800)
  const w = Math.ceil(Math.max(...lines.map((l) => ctx.measureText(l).width))) + px * 1.2
  const lh = px * 1.7
  c.width = Math.max(w, 400); c.height = Math.ceil(lines.length * lh + px * 0.9)
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, c.width, c.height)
  ctx.font = `${px}px "Alcarin Tengwar"`; ctx.fillStyle = INK; ctx.textBaseline = 'alphabetic'
  lines.forEach((l, i) => ctx.fillText(l, px * 0.6, px * 1.25 + i * lh))
  return new Promise((res) => c.toBlob(res, 'image/png'))
}

// the font as data, loaded only when an SVG is made (a fetch of the font file would be blocked in the
// Windows app, which loads its pages from local files)
let fontData = null
async function fontBase64() {
  if (fontData) return fontData
  fontData = (await import('../../LoTR Elvish Translator/src/assets/fonts/AlcarinTengwar-Regular.woff2?base64')).default
  return fontData
}

// an SVG that carries its own font, so it looks the same wherever it is opened
export async function tengwarSvg(text) {
  const px = 96
  await fontReady(px)
  const ctx = document.createElement('canvas').getContext('2d')
  ctx.font = `${px}px "Alcarin Tengwar"`
  const lines = wrap(ctx, text, 1800)
  const w = Math.ceil(Math.max(...lines.map((l) => ctx.measureText(l).width))) + px * 1.2
  const lh = px * 1.7
  const h = Math.ceil(lines.length * lh + px * 0.9)
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  const font = await fontBase64()
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.max(w, 400)}" height="${h}" viewBox="0 0 ${Math.max(w, 400)} ${h}">` +
    `<style>@font-face{font-family:'Alcarin Tengwar';src:url(data:font/woff2;base64,${font}) format('woff2')}text{font-family:'Alcarin Tengwar';font-size:${px}px;fill:${INK}}</style>` +
    `<rect width="100%" height="100%" fill="${PAPER}"/>` +
    lines.map((l, i) => `<text x="${px * 0.6}" y="${px * 1.25 + i * lh}">${esc(l)}</text>`).join('') + '</svg>'
  return new Blob([svg], { type: 'image/svg+xml' })
}

// share where the device offers it (iPad and iPhone: Save Image, Messages…), otherwise download
async function deliver(blob, filename) {
  const file = new File([blob], filename, { type: blob.type })
  try {
    if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: filename }); return 'shared' }
  } catch (e) { if (e?.name === 'AbortError') return 'cancelled' }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob); a.download = filename
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 4000)
  return 'saved'
}

async function copy(text) {
  try { await navigator.clipboard.writeText(text); return true } catch { return false }
}

const fileName = (latin) => (latin || 'tengwar').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'tengwar'

export function TakeAway({ tengwar, latin }) {
  const [msg, setMsg] = useState('')
  const say = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3500) }
  return (
    <div className="takeaway">
      <div className="takeaway__btns">
        <button className="btn" type="button" disabled={!tengwar} onClick={async () => { const r = await deliver(await tengwarPng(tengwar), fileName(latin) + '.png'); if (r !== 'cancelled') say(r === 'shared' ? 'Shared.' : 'Saved as a picture.') }}>Save as picture</button>
        <button className="btn btn--quiet" type="button" disabled={!tengwar} onClick={async () => { const r = await deliver(await tengwarSvg(tengwar), fileName(latin) + '.svg'); if (r !== 'cancelled') say('Saved as an SVG, which scales to any size.') }}>SVG</button>
        <button className="btn btn--quiet" type="button" disabled={!tengwar} onClick={async () => say((await copy(tengwar)) ? 'Copied as Tengwar text. It shows where a Tengwar font such as Alcarin Tengwar is installed.' : 'Copying is not allowed here.')}>Copy text</button>
        <button className="btn btn--quiet" type="button" disabled={!tengwar} onClick={async () => say((await copy(toAnnatar(tengwar))) ? 'Copied for Tengwar Annatar. Paste it into Word or Pages and set the font to Tengwar Annatar (Google Docs cannot use it: send a picture there).' : 'Copying is not allowed here.')}>Copy for Annatar</button>
      </div>
      <p className="takeaway__msg" aria-live="polite">{msg}</p>
    </div>
  )
}

// The desk: write anything (English, Sindarin or Quenya) and see it in Tengwar, or type the Tengwar directly.
export function TengwarDesk({ startText = '' }) {
  const [mode, setMode] = useState('E')
  const [text, setText] = useState(startText)
  const [direct, setDirect] = useState(false)
  const [typed, setTyped] = useState('')
  const tengwar = useMemo(() => (direct ? typed : toTengwar(text, mode)), [direct, typed, text, mode])
  return (
    <section className="desk card" aria-label="Write in Tengwar">
      <div className="desk__head">
        <h2 className="card__h">Write in Tengwar</h2>
        <div className="track track--small" role="radiogroup" aria-label="Spell it as">
          {[['E', 'English'], ['S', 'Sindarin'], ['Q', 'Quenya'], ['K', 'Keyboard']].map(([k, label]) => (
            <button key={k} type="button" role="radio" aria-checked={k === 'K' ? direct : !direct && mode === k} className={(k === 'K' ? direct : !direct && mode === k) ? 'is-on' : ''}
              onClick={() => { if (k === 'K') setDirect(true); else { setDirect(false); setMode(k) } }}>{label}</button>
          ))}
        </div>
      </div>
      {direct ? (
        <DeskTyper value={typed} onChange={setTyped} />
      ) : (
        <input className="desk__input" value={text} onChange={(e) => setText(e.target.value)} placeholder={mode === 'E' ? 'Your name, a word, a line…' : mode === 'S' ? 'Mae govannen' : 'Elen síla lúmenn’ omentielvo'}
          aria-label="Text to write in Tengwar" autoComplete="off" spellCheck="false" />
      )}
      <p className="desk__out tengwar" aria-label="In Tengwar">{tengwar || ' '}</p>
      <TakeAway tengwar={tengwar} latin={direct ? 'tengwar' : text} />
      <p className="hint">English is spelt letter by letter, as in Tolkien’s own English samples. Sindarin and Quenya are spelt as in the courses.</p>
    </section>
  )
}

function DeskTyper({ value, onChange }) {
  const [lit, setLit] = useState(null)
  const ref = useRef(value)
  ref.current = value
  const press = (k) => onChange(k === 'back' ? [...ref.current].slice(0, -1).join('') : ref.current + k)
  useEffect(() => {
    const key = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return
      if (e.key === 'Backspace') { e.preventDefault(); press('back'); return }
      if (e.key === ' ') { e.preventDefault(); press(' '); return }
      const name = PHYSICAL.get(e.key)
      if (!name) return
      e.preventDefault(); press(T(CSUR[name])); setLit(name); setTimeout(() => setLit(null), 220)
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  })
  return (
    <>
      <div className="twfield" role="textbox" aria-readonly="true" aria-label="Tengwar you have typed">
        {value ? <span className="twfield__text">{value}</span> : <span className="twfield__empty">{EMPTY}</span>}
        <span className="twfield__caret" aria-hidden="true" />
      </div>
      <TengwarKeyboard onKey={press} lit={lit} />
    </>
  )
}
