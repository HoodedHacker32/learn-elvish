// Writing practice: watch a letter being written, trace it, then write it from memory.
// Stroke order and direction follow Måns Björkman's Amanyë Tenceli, in a plain pen hand.
import { useEffect, useMemo, useRef, useState } from 'react'
import { WritingPad } from './WritingPad.jsx'
import { LETTER_STROKES, MARK_STROKES, judgeWriting, checkTrace } from './recognize.js'
import { LETTERS, MARKS, TENGWAR_COURSE } from '../course/tengwar.js'
import { CSUR } from '../../../LoTR Elvish Translator/src/engine/tengwar.js'

const T = (cp) => String.fromCharCode(cp)
const CARRIER_MID = 112 // the short carrier's middle, where a vowel sign sits
const VOWELS = ['a', 'e', 'i', 'o', 'u', 'y', 'nasal', 'double', 'silent']
const MARK_CP = { a: 'threeDots', e: 'acute', i: 'dot', o: 'rightCurl', u: 'leftCurl', y: 'twoDots', nasal: 'nasalizer', double: 'doubler', silent: 'dotBelow' }

// the letter groups, as the lessons introduce them
const GROUPS = [
  ...TENGWAR_COURSE[0].lessons.map((l) => ({ title: l.title, items: l.letters.map((id) => ({ kind: 'letter', id })) })),
  { title: 'Carriers', items: ['shortCarrier', 'longCarrier'].map((id) => ({ kind: 'letter', id })) },
  { title: 'Vowel signs and bars', items: VOWELS.map((id) => ({ kind: 'mark', id })) },
]
const ALL_LETTERS = Object.keys(LETTER_STROKES)

function target(item) {
  if (item.kind === 'letter') {
    const strokes = LETTER_STROKES[item.id]
    return { strokes, base: [], text: T(CSUR[item.id]), name: LETTERS[item.id]?.name || item.id, sound: LETTERS[item.id]?.sound || '' }
  }
  const strokes = MARK_STROKES[MARK_CP[item.id]].map((s) => s.map(([x, y]) => [x + CARRIER_MID, y]))
  return { strokes, base: LETTER_STROKES.shortCarrier, text: T(CSUR.shortCarrier) + T(CSUR[MARK_CP[item.id]]), name: MARKS[item.id].name, sound: MARKS[item.id].sound, mark: true }
}

function extent(strokes) {
  const xs = strokes.flatMap((s) => s.map((p) => p[0]))
  const lo = Math.min(...xs, 0), hi = Math.max(...xs, 300)
  return [Math.floor(lo - 160), Math.ceil(hi + 160)]
}

const TOUCHLESS = typeof matchMedia === 'function' && matchMedia('(pointer: fine)').matches && !matchMedia('(any-pointer: coarse)').matches

export function Writing({ state, update }) {
  const [item, setItem] = useState(GROUPS[0].items[0])
  const [mode, setMode] = useState('watch')
  const [result, setResult] = useState(null)
  const [run, setRun] = useState(1)
  const pad = useRef(null)
  const tg = useMemo(() => target(item), [item])
  const width = useMemo(() => extent([...tg.strokes, ...tg.base]), [tg])
  const done = state.writing || {}
  const keyOf = (it) => `${it.kind}:${it.id}`

  useEffect(() => { setResult(null); pad.current?.clear(); if (mode === 'watch') setRun((n) => n + 1) }, [item, mode])

  const record = (field) => update((s) => {
    const w = s.writing || {}
    const k = keyOf(item)
    return { ...s, writing: { ...w, [k]: { ...(w[k] || {}), [field]: ((w[k] || {})[field] || 0) + 1 } } }
  })

  const check = () => {
    const ink = pad.current.strokes()
    if (!ink.length) return
    if (mode === 'trace' || tg.mark) {
      const r = checkTrace(ink, tg.strokes, tg.mark && mode === 'memory' ? 80 : 55)
      const notes = []
      if (r.reversed.length) notes.push(`Stroke ${r.reversed.join(' and ')} went the other way; follow the numbers from where they start.`)
      if (!r.order) notes.push('Try the strokes in the numbered order.')
      setResult({ ok: r.ok, text: r.ok ? (notes.length ? 'Good shape. ' + notes.join(' ') : 'Well traced.') : r.coverage < 0.82 ? 'Some of the letter is missing. Follow the whole guide.' : 'Some of your line strays from the guide. Try again, a little slower.' })
      if (r.ok) record(mode === 'trace' ? 'traced' : 'written')
      return
    }
    const { ok, looksLike, hint } = judgeWriting(ink, item.id, ALL_LETTERS)
    const looks = hint ? ` ${hint}` : looksLike ? ` It looks more like ${LETTERS[looksLike]?.name || looksLike}.` : ''
    setResult({ ok, text: ok ? `Yes, that is ${tg.name}.` : `Not quite.${looks} Watch it again, or trace it once more.` })
    if (ok) record('written')
  }

  return (
    <div className="writing">
      {TOUCHLESS && !state.settings.writingNoteSeen && (
        <div className="nudge" role="note">
          <span>Handwriting works best with a <strong>pen, stylus, touchscreen or drawing pad</strong>. A mouse or touchpad works, but is far from ideal.</span>
          <button className="btn btn--quiet" onClick={() => update((s) => ({ ...s, settings: { ...s.settings, writingNoteSeen: true } }))}>Got it</button>
        </div>
      )}

      <div className="writing__main card">
        <div className="writing__head">
          <div>
            <span className="label">{tg.mark ? 'Vowel sign' : 'Letter'}</span>
            <h2 className="card__h">{tg.name} <span className="writing__sound">{tg.sound}</span></h2>
          </div>
          <div className="track track--small" role="radiogroup" aria-label="Practice">
            {[['watch', 'Watch'], ['trace', 'Trace'], ['memory', 'From memory']].map(([k, label]) => (
              <button key={k} type="button" role="radio" aria-checked={mode === k} className={mode === k ? 'is-on' : ''} onClick={() => setMode(k)}>{label}</button>
            ))}
          </div>
        </div>

        <WritingPad ref={pad} width={width} guideText={tg.text} guideStrokes={tg.strokes}
          showGuide={mode !== 'memory' || tg.mark} showStarts={mode !== 'memory'} animate={mode === 'watch' ? run : 0} disabled={mode === 'watch'} />

        <p className={'writing__result' + (result ? (result.ok ? ' is-ok' : ' is-no') : '')} aria-live="polite">
          {result ? result.text : mode === 'watch' ? 'Watch the strokes, in order. Then trace it.' : mode === 'trace' ? 'Go over the faint letter, following the numbered strokes.' : tg.mark ? 'Write the sign over the carrier, from memory.' : 'Write the letter on the lines, from memory.'}
        </p>
        <div className="row">
          {mode === 'watch' ? (
            <>
              <button className="btn" onClick={() => setRun((n) => n + 1)}>Watch again</button>
              <button className="btn btn--primary" onClick={() => setMode('trace')}>Trace it</button>
            </>
          ) : (
            <>
              <button className="btn btn--quiet" onClick={() => { pad.current.undo(); setResult(null) }}>Undo</button>
              <button className="btn btn--quiet" onClick={() => { pad.current.clear(); setResult(null) }}>Clear</button>
              <button className="btn btn--primary" onClick={check}>Check</button>
              {result?.ok && mode === 'trace' && <button className="btn" onClick={() => setMode('memory')}>Now from memory</button>}
            </>
          )}
        </div>
        <p className="hint">Stroke order and direction follow Måns Björkman’s Amanyë Tenceli, from Tolkien’s own hand, in a plain pen style.</p>
      </div>

      <div className="writing__pick">
        {GROUPS.map((g) => (
          <section key={g.title}>
            <h3 className="writing__group">{g.title}</h3>
            <div className="writing__letters">
              {g.items.map((it) => {
                const t = target(it)
                const rec = done[keyOf(it)] || {}
                const on = keyOf(it) === keyOf(item)
                return (
                  <button key={keyOf(it)} type="button" className={'writing__letter' + (on ? ' is-on' : '') + (rec.written ? ' is-done' : rec.traced ? ' is-traced' : '')}
                    onClick={() => { setItem(it); setMode(rec.traced ? 'memory' : 'watch') }} title={t.name} aria-label={`${t.name}${rec.written ? ', written from memory' : rec.traced ? ', traced' : ''}`}>
                    <span className="tengwar">{t.text}</span>
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
