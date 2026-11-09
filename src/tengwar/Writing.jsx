// Writing practice: watch a letter being written, trace it, then write it from memory.
// Stroke order and direction follow Måns Björkman's Amanyë Tenceli, in a plain pen hand.
import { useEffect, useMemo, useRef, useState } from 'react'
import { WritingPad } from './WritingPad.jsx'
import { clusters, clusterTarget, judgeCluster } from './words.js'
import { COURSES } from '../course/index.js'
import { toTengwar } from '../../../LoTR Elvish Translator/src/engine/tengwar.js'
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

function LetterPractice({ state, update }) {
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

// ——— whole words, one box per tengwa ———
const LANG = { S: 'Sindarin', Q: 'Quenya', E: 'English' }
function wordList(name) {
  const seen = new Set()
  const words = [...COURSES.T.byKey.values()]
    .filter((i) => i.kind === 'tword' && !seen.has(i.key) && seen.add(i.key))
    .map((i) => ({ key: i.key, el: i.el, en: i.en, lang: i.lang, tengwar: i.tengwar, boxes: clusters(i.tengwar) }))
    .filter((w) => w.boxes && w.boxes.length <= 12)
  const mine = name && clusters(toTengwar(name, 'E'))
  return mine ? [{ key: 'name', el: name, en: 'your name', lang: 'E', tengwar: toTengwar(name, 'E'), boxes: mine }, ...words] : words
}

function WordPractice({ state, update }) {
  const words = useMemo(() => wordList(state.name), [state.name])
  const [word, setWord] = useState(words[0])
  const [i, setI] = useState(0)
  const [mode, setMode] = useState('trace')
  const [result, setResult] = useState(null)
  const pad = useRef(null)
  const box = word.boxes[i]
  const tg = useMemo(() => box && clusterTarget(box), [box])
  const width = useMemo(() => (tg ? extent(tg.all) : [-160, 460]), [tg])
  const finished = i >= word.boxes.length
  const field = mode === 'trace' ? 'traced' : 'written'

  const start = (w, m = mode) => { setWord(w); setI(0); setMode(m); setResult(null); pad.current?.clear() }
  const check = () => {
    const ink = pad.current.strokes()
    if (!ink.length) return
    const r = judgeCluster(ink, box, mode, ALL_LETTERS)
    setResult(r)
    if (!r.ok) return
    setTimeout(() => {
      pad.current?.clear(); setResult(null)
      const next = i + 1
      setI(next)
      if (next >= word.boxes.length) update((s) => {
        const all = s.writing || {}, k = 'word:' + word.key, rec = all[k] || {}
        return { ...s, writing: { ...all, [k]: { ...rec, [field]: (rec[field] || 0) + 1 } } }
      })
    }, 650)
  }

  return (
    <div className="writing__words">
      <div className="writing__main card">
        <div className="writing__head">
          <div>
            <span className="label">{LANG[word.lang]}{word.key === 'name' ? ' · your name' : ''}</span>
            <h2 className="card__h">{word.el} {word.en !== word.el && word.key !== 'name' && <span className="writing__sound">“{word.en}”</span>}</h2>
          </div>
          <div className="track track--small" role="radiogroup" aria-label="Practice">
            {[['trace', 'Trace'], ['memory', 'From memory']].map(([k, label]) => (
              <button key={k} type="button" role="radio" aria-checked={mode === k} className={mode === k ? 'is-on' : ''} onClick={() => start(word, k)}>{label}</button>
            ))}
          </div>
        </div>

        <ol className="boxes" aria-label="The word, letter by letter">
          {word.boxes.map((b, k) => (
            <li key={k} className={'boxes__box' + (k < i ? ' is-done' : k === i ? ' is-now' : '')}>
              <span className="tengwar">{k < i || mode === 'trace' ? b.text : ' '}</span>
            </li>
          ))}
        </ol>

        {finished ? (
          <div className="writing__finished">
            <p className="tengwar tengwar--hero">{word.tengwar}</p>
            <p className="writing__result is-ok">{mode === 'trace' ? 'Traced, every letter. Now try it from memory.' : 'Written from memory. Well done.'}</p>
            <div className="row">
              {mode === 'trace' && <button className="btn btn--primary" onClick={() => start(word, 'memory')}>From memory</button>}
              <button className="btn" onClick={() => start(word)}>Again</button>
            </div>
          </div>
        ) : (
          <>
            <WritingPad ref={pad} width={width} guideText={box.text} guideStrokes={tg.all} showGuide={mode === 'trace'} showStarts={mode === 'trace'} animate={0} />
            <p className={'writing__result' + (result ? (result.ok ? ' is-ok' : ' is-no') : '')} aria-live="polite">
              {result ? result.text : `Letter ${i + 1} of ${word.boxes.length}: ${mode === 'trace' ? 'trace the letter, then its vowel sign.' : 'write it from memory, with its vowel sign.'}`}
            </p>
            <div className="row">
              <button className="btn btn--quiet" onClick={() => { pad.current.undo(); setResult(null) }}>Undo</button>
              <button className="btn btn--quiet" onClick={() => { pad.current.clear(); setResult(null) }}>Clear</button>
              <button className="btn btn--primary" onClick={check}>Check</button>
            </div>
          </>
        )}
      </div>

      <div className="writing__pick">
        {['E', 'S', 'Q'].map((lg) => (
          <section key={lg}>
            <h3 className="writing__group">{LANG[lg]}</h3>
            <div className="writing__wordlist">
              {words.filter((w) => w.lang === lg).map((w) => {
                const rec = (state.writing || {})['word:' + w.key] || {}
                return (
                  <button key={w.key} type="button" className={'writing__word' + (w.key === word.key ? ' is-on' : '') + (rec.written ? ' is-done' : rec.traced ? ' is-traced' : '')}
                    onClick={() => start(w, rec.traced ? 'memory' : 'trace')}>
                    {w.key === 'name' ? `${w.el} (you)` : w.el}
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

export function Writing({ state, update }) {
  const [tab, setTab] = useState('letters')
  return (
    <div className="writing-page">
      {TOUCHLESS && !state.settings.writingNoteSeen && (
        <div className="nudge" role="note">
          <span>Handwriting works best with a <strong>pen, stylus, touchscreen or drawing pad</strong>. A mouse or touchpad works, but is far from ideal.</span>
          <button className="btn btn--quiet" onClick={() => update((s) => ({ ...s, settings: { ...s.settings, writingNoteSeen: true } }))}>Got it</button>
        </div>
      )}
      <div className="track writing-page__tabs" role="tablist" aria-label="Practise">
        {[['letters', 'Letters and signs'], ['words', 'Words']].map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'is-on' : ''} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>
      {tab === 'letters' ? <LetterPractice state={state} update={update} /> : <WordPractice state={state} update={update} />}
    </div>
  )
}
