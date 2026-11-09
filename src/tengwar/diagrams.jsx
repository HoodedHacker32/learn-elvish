// Diagrams for the Tengwar lessons, drawn like plates in a textbook: Tolkien's table, the parts of a letter on
// the guide lines, the vowel signs, and word maps that show what each letter of a word says.
import { CSUR, toTengwar } from '../../../LoTR Elvish Translator/src/engine/tengwar.js'
import { LETTER_STROKES, MARK_STROKES } from './recognize.js'
import { LETTERS } from '../course/tengwar.js'

const T = (cp) => String.fromCharCode(cp)
const NAME = Object.fromEntries(Object.entries(CSUR).map(([k, v]) => [v, k]))
const isMarkCp = (cp) => cp >= 0xe040 && cp <= 0xe05f
const nameOf = (id) => LETTERS[id]?.name || id

// ——— Tolkien's table ———
const COLS = [['I', 'tinco', 'teeth', 't'], ['II', 'parma', 'lips', 'p'], ['III', 'calma', 'front of the palate', 'c'], ['IV', 'quesse', 'back of the palate', 'qu']]
const GRADES = [
  ['stem down, one bow', ['tinco', 'parma', 'calma', 'quesse']],
  ['stem down, two bows', ['ando', 'umbar', 'anga', 'ungwe']],
  ['stem up, one bow', ['thule', 'formen', 'harma', 'hwesta']],
  ['stem up, two bows', ['anto', 'ampa', 'anca', 'unque']],
  ['short stem, two bows', ['numen', 'malta', 'noldo', 'nwalme']],
  ['short stem, one bow', ['ore', 'vala', 'anna', 'vilya']],
]

export function TableDiagram({ highlight = [] }) {
  const lit = new Set(highlight)
  return (
    <figure className="dgm dgm--table">
      <div className="dgm-table" role="table" aria-label="Tolkien’s table of the tengwar">
        <div role="row" className="dgm-table__row dgm-table__head">
          <span role="columnheader" />
          {COLS.map(([n, , place]) => <span key={n} role="columnheader"><b>{n}</b><small>{place}</small></span>)}
        </div>
        {GRADES.map(([rule, ids], g) => (
          <div role="row" key={g} className="dgm-table__row">
            <span role="rowheader" className="dgm-table__rule"><b>{g + 1}</b><small>{rule}</small></span>
            {ids.map((id) => (
              <span role="cell" key={id} className={'dgm-table__cell' + (lit.has(id) ? ' is-lit' : '')} title={`${nameOf(id)}: ${LETTERS[id]?.sound || ''}`}>
                <span className="tengwar">{T(CSUR[id])}</span>
                <small>{lit.has(id) ? nameOf(id) : ''}</small>
              </span>
            ))}
          </div>
        ))}
      </div>
      <figcaption>Tolkien’s table. Each column is a place in the mouth; each row changes the stem or the bow in the same way. This lesson’s letters are lit.</figcaption>
    </figure>
  )
}

// ——— the parts of a letter ———
const CLOSED = new Set(['parma', 'quesse', 'umbar', 'ungwe', 'formen', 'hwesta', 'ampa', 'unque', 'malta', 'nwalme', 'vala', 'vilya'])
const isStem = (s) => {
  const xs = s.map((p) => p[0]), ys = s.map((p) => p[1])
  const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys)
  return h > 260 && w < 0.35 * h
}
const path = (s) => s.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${-y}`).join('')

function describe(id) {
  const strokes = LETTER_STROKES[id] || []
  const stem = strokes.find(isStem)
  if (!stem) return ''
  const ys = stem.map((p) => p[1])
  const up = Math.max(...ys) > 560, down = Math.min(...ys) < -150
  const stemSay = up && down ? 'stem up and down' : up ? 'stem up' : down ? 'stem down' : 'short stem'
  const bows = strokes.filter((s) => s !== stem)
  const sx = stem.reduce((a, p) => a + p[0], 0) / stem.length
  const bx = bows.flat().reduce((a, p) => a + p[0], 0) / Math.max(1, bows.flat().length)
  const side = bows.length ? (bx > sx ? 'bow right' : 'bow left') : ''
  return [stemSay, side, CLOSED.has(id) ? 'closed' : bows.length ? 'open' : ''].filter(Boolean).join(', ')
}

// one letter on the guide lines, its stem and its bows in two colours
export function LetterPlate({ id, label = true, size = 'm' }) {
  const strokes = LETTER_STROKES[id] || []
  const xs = strokes.flat().map((p) => p[0])
  const x0 = Math.min(...xs, 0) - 90, x1 = Math.max(...xs, 300) + 90
  return (
    <figure className={'dgm-letter dgm-letter--' + size}>
      <svg viewBox={`${x0} -800 ${x1 - x0} 1200`} role="img" aria-label={`${nameOf(id)}: ${describe(id)}`}>
        {[[712, 'asc'], [400, 'x'], [0, 'base'], [-312, 'desc']].map(([y, k]) => <line key={k} className={'dgm-line dgm-line--' + k} x1={x0} x2={x1} y1={-y} y2={-y} />)}
        <text className="dgm-glyph" x="0" y="0">{T(CSUR[id])}</text>
        {strokes.map((s, i) => <path key={i} className={isStem(s) ? 'dgm-stem' : 'dgm-bow'} d={path(s)} />)}
      </svg>
      {label === 'describe' ? (describe(id) && <figcaption><small>{describe(id)}</small></figcaption>)
        : label && <figcaption><b>{nameOf(id)}</b> {LETTERS[id]?.sound?.split(' · ')[0]}<small>{describe(id)}</small></figcaption>}
    </figure>
  )
}

export function AnatomyDiagram({ letters, caption }) {
  return (
    <figure className="dgm">
      <div className="dgm-row">{letters.map((id) => <LetterPlate key={id} id={id} />)}</div>
      <figcaption>
        <span className="dgm-key"><i className="dgm-key__stem" /><span>stem (<i lang="qya">telco</i>)</span></span>
        <span className="dgm-key"><i className="dgm-key__bow" /><span>bow (<i lang="qya">lúva</i>)</span></span>
        {caption}
      </figcaption>
    </figure>
  )
}

// ——— vowel signs ———
const SIGN = { threeDots: 'a', acute: 'e', dot: 'i', rightCurl: 'o', leftCurl: 'u', twoDots: 'y', nasalizer: 'n or m before', doubler: 'doubled', dotBelow: 'silent e' }
export function SignsDiagram({ signs }) {
  const carrier = LETTER_STROKES.shortCarrier
  return (
    <figure className="dgm">
      <div className="dgm-row">
        {signs.map((m) => {
          const onTinco = ['nasalizer', 'doubler', 'dotBelow'].includes(m)
          const base = onTinco ? LETTER_STROKES.tinco : carrier
          const mid = onTinco ? 300 : 112
          const marks = MARK_STROKES[m].map((s) => s.map(([x, y]) => [x + mid, y]))
          return (
            <figure key={m} className="dgm-letter dgm-letter--s">
              <svg viewBox="-200 -800 760 1200" role="img" aria-label={`${SIGN[m]}`}>
                {[[400, 'x'], [0, 'base']].map(([y, k]) => <line key={k} className={'dgm-line dgm-line--' + k} x1="-200" x2="560" y1={-y} y2={-y} />)}
                {base.map((s, i) => <path key={i} className="dgm-faint" d={path(s)} />)}
                {marks.map((s, i) => (s.length === 2 && Math.abs(s[0][0] - s[1][0]) < 3
                  ? <circle key={i} className="dgm-dot" cx={s[0][0]} cy={-s[0][1]} r="34" />
                  : <path key={i} className="dgm-sign" d={path(s)} />))}
              </svg>
              <figcaption><b>{SIGN[m]}</b></figcaption>
            </figure>
          )
        })}
      </div>
      <figcaption><span>{signs.some((m) => SIGN[m].length === 1)
        ? <>The vowel signs (<i lang="qya">tehtar</i>), shown on a carrier, because a sign needs a letter to sit on.</>
        : 'Shown on tinco. Bars and the dot below sit on whatever letter they belong to.'}</span></figcaption>
    </figure>
  )
}

// ——— word maps ———
const SOUND = {
  S: { tinco: 't', parma: 'p', calma: 'c', ando: 'd', umbar: 'b', anga: 'g', thule: 'th', formen: 'f', harma: 'ch', anto: 'dh', ampa: 'v', numen: 'n', malta: 'm', noldo: 'ng', ore: 'r', romen: 'r', lambe: 'l', alda: 'lh', arda: 'rh', silme: 's', silmeNuquerna: 's', esse: 'ss', esseNuquerna: 'ss', hyarmen: 'h', hwestaSindarinwa: 'hw', vilya: 'w', yanta: 'i', ure: 'u' },
  Q: { tinco: 't', parma: 'p', calma: 'c', quesse: 'qu', ando: 'nd', umbar: 'mb', anga: 'ng', ungwe: 'ngw', thule: 'th', formen: 'f', hwesta: 'hw', anto: 'nt', ampa: 'mp', anca: 'nc', unque: 'nqu', numen: 'n', malta: 'm', noldo: 'ñ', nwalme: 'nw', ore: 'r', romen: 'r', vala: 'v', anna: 'y', lambe: 'l', alda: 'ld', arda: 'rd', silme: 's', silmeNuquerna: 's', esse: 'ss', esseNuquerna: 'ss', hyarmen: 'h', yanta: 'i', ure: 'u' },
  E: { tinco: 't', parma: 'p', calma: 'ch', quesse: 'c/k', ando: 'd', umbar: 'b', anga: 'j', ungwe: 'g', thule: 'th', formen: 'f', harma: 'sh', hwesta: 'ch', anto: 'th', ampa: 'v', unque: 'gh', numen: 'n', malta: 'm', nwalme: 'ng', ore: 'r', romen: 'r', vala: 'w', anna: 'y', lambe: 'l', silme: 's', silmeNuquerna: 's', esse: 's', esseNuquerna: 's', hyarmen: 'h', hwestaSindarinwa: 'wh', yanta: 'e', extAndo: 'the', extUmbar: 'of' },
}
const VOWEL = { threeDots: 'a', acute: 'e', dot: 'i', rightCurl: 'o', leftCurl: 'u', twoDots: 'y', twoDotsBelow: 'y', doubleAcute: 'ee' }

// a Tengwar word → one entry per tengwa with what it says, the vowel before or after as the language puts it
export function wordMap(tengwar, lang) {
  const out = []
  for (const ch of tengwar) {
    const cp = ch.codePointAt(0)
    if (ch === ' ') { out.push({ space: true }); continue }
    if (cp >= 0xe060 && cp <= 0xe06f) { out.push({ text: ch, say: cp === CSUR.pusta ? ',' : cp === CSUR.doublePusta ? '.' : cp === CSUR.exclamation ? '!' : '?', punct: true }); continue }
    if (cp >= 0xe070) { out.push({ text: ch, say: 'number' }); continue }
    const n = NAME[cp]
    if (isMarkCp(cp) && out.length && !out[out.length - 1].space) {
      const c = out[out.length - 1]
      c.text += ch
      if (VOWEL[n]) c.vowel = (c.vowel || '') + VOWEL[n]
      else if (n === 'doubler') c.double = true
      else if (n === 'nasalizer') c.nasal = true
      else if (n === 'dotBelow') c.silent = true
      continue
    }
    out.push({ text: ch, base: n })
  }
  for (const c of out) {
    if (c.space || c.punct || c.say) continue
    const carrier = c.base === 'shortCarrier' || c.base === 'longCarrier'
    let cons = carrier ? '' : (SOUND[lang]?.[c.base] ?? '?')
    if (c.double && cons) cons += cons.length === 1 ? cons : ''
    if (c.nasal) cons = (lang === 'E' ? 'n/m+' : 'n/m+') + cons
    const v = (c.vowel || '') + (c.base === 'longCarrier' ? ' (long)' : '')
    c.say = !v ? cons : !cons ? v : lang === 'Q' ? `${cons}+${v}` : `${v}+${cons}`
    if (c.silent) c.say += ' (+silent e)'
  }
  return out
}

export function WordMap({ tengwar, lang, latin }) {
  const map = wordMap(tengwar, lang)
  return (
    <figure className="dgm dgm--word">
      <ol className="wordmap" aria-label={`${latin}, letter by letter`}>
        {map.map((c, i) => c.space ? <li key={i} className="wordmap__gap" aria-hidden="true" />
          : <li key={i} className={'wordmap__cell' + (c.punct ? ' is-punct' : '')}><span className="tengwar">{c.text}</span><small>{c.say}</small></li>)}
      </ol>
      <figcaption>{lang === 'Q' ? 'Quenya: a vowel sign is read after the letter it sits on.' : 'Read each vowel sign before the letter it sits on.'}</figcaption>
    </figure>
  )
}

// ——— picking the diagram for a teaching note ———
export function Diagram({ d, lesson }) {
  if (!d) return null
  if (d.type === 'table') return <TableDiagram highlight={d.highlight || lesson?.letters || []} />
  if (d.type === 'anatomy') return <AnatomyDiagram letters={d.letters || lesson?.letters || []} caption={d.caption} />
  if (d.type === 'signs') return <SignsDiagram signs={d.signs} />
  if (d.type === 'words') return (
    <div className="dgm-stack">
      {d.words.map(([latin, lang]) => (
        <div key={latin + lang}>
          <p className="dgm-word__latin">{latin}<small> · {lang === 'Q' ? 'Quenya' : lang === 'S' ? 'Sindarin' : 'English'}</small></p>
          <WordMap tengwar={toTengwar(latin, lang)} lang={lang} latin={latin} />
        </div>
      ))}
    </div>
  )
  return null
}
