// Writing whole words: one box per tengwa, with the vowel sign or bar that belongs to it. Each box is judged as
// the letter (traced, or recognised from memory) plus its signs, which must sit over (or under) that letter.
import { CSUR } from '../../../LoTR Elvish Translator/src/engine/tengwar.js'
import { LETTER_STROKES, MARK_STROKES, judgeWriting, checkTrace, nearestShape } from './recognize.js'

const NAME = Object.fromEntries(Object.entries(CSUR).map(([k, v]) => [v, k]))
const isMark = (cp) => cp >= 0xe040 && cp <= 0xe05f
const STROKE_SIGNS = ['acute', 'rightCurl', 'leftCurl', 'nasalizer', 'doubler']
const SIGN_NAME = { acute: 'an acute (e)', rightCurl: 'a right curl (o)', leftCurl: 'a left curl (u)', nasalizer: 'a bar above', doubler: 'a bar below' }

// a Tengwar string → [{ base, marks, text }], or null if it has a sign the pad cannot teach yet
export function clusters(tengwar) {
  const out = []
  for (const ch of tengwar) {
    const cp = ch.codePointAt(0)
    if (ch === ' ' || (cp >= 0xe060 && cp <= 0xe06f)) continue // spaces and punctuation are not written in boxes
    const name = NAME[cp]
    if (isMark(cp)) {
      if (!out.length || !MARK_STROKES[name]) return null
      out[out.length - 1].marks.push(name)
      out[out.length - 1].text += ch
      continue
    }
    if (!LETTER_STROKES[name]) return null
    out.push({ base: name, marks: [], text: ch })
  }
  return out.length ? out : null
}

// where a sign sits: over the middle of the letter's body (the part within the x-height), as the font puts it
function bodyMiddle(base) {
  const xs = LETTER_STROKES[base].flatMap((s) => s.filter(([, y]) => y > -20 && y < 420).map(([x]) => x))
  return xs.length ? (Math.min(...xs) + Math.max(...xs)) / 2 : 112
}

export function clusterTarget(c) {
  const mid = bodyMiddle(c.base)
  const marks = c.marks.map((m) => ({ name: m, strokes: MARK_STROKES[m].map((s) => s.map(([x, y]) => [x + mid, y])) }))
  return { base: LETTER_STROKES[c.base], marks, all: [...LETTER_STROKES[c.base], ...marks.flatMap((m) => m.strokes)] }
}

// a stroke is a sign if it is small and above the x-height, or small and under the baseline
function isSignStroke(s) {
  const xs = s.map((p) => p[0]), ys = s.map((p) => p[1])
  const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys)
  const high = Math.min(...ys) > 420, low = Math.max(...ys) < -40
  return (high || low) && ((Math.max(w, h) < 320 && h < 260) || h < 120)
}

// → { ok, text }
export function judgeCluster(ink, c, mode, candidates) {
  const tg = clusterTarget(c)
  const signs = ink.filter(isSignStroke), body = ink.filter((s) => !isSignStroke(s))
  if (!body.length) return { ok: false, text: 'Write the letter first, then its vowel sign.' }
  // the letter
  if (mode === 'trace') {
    const r = checkTrace(body, tg.base)
    if (!r.ok) return { ok: false, text: 'The letter does not follow the guide yet. Try again, a little slower.' }
  } else {
    const r = judgeWriting(body, c.base, candidates)
    if (!r.ok) return { ok: false, text: r.hint || (r.looksLike ? `The letter looks more like ${r.looksLike}.` : 'That letter is not quite right.') }
  }
  // its signs
  if (!tg.marks.length && signs.length) return { ok: false, text: 'This letter has no vowel sign.' }
  // signs above the letter and signs below it are judged apart (mellon's lambë has an acute above, a bar below)
  const mid = bodyMiddle(c.base)
  const above = (x) => Math.min(...x.map((p) => p[1])) > 0
  for (const side of [true, false]) {
    const wantMarks = tg.marks.filter((m) => above(m.strokes.flat()) === side)
    const drawn = signs.filter((x) => above(x) === side)
    if (!wantMarks.length && drawn.length) return { ok: false, text: side ? 'Nothing goes above this letter.' : 'Nothing goes below this letter.' }
    if (!wantMarks.length) continue
    if (!drawn.length) return { ok: false, text: side ? 'The letter is right. Now add its vowel sign.' : 'Add the mark below the letter.' }
    const want = wantMarks.flatMap((m) => m.strokes)
    const fit = (target) => { const r = checkTrace(drawn, target, 70); return r.coverage * r.precision }
    const sameSide = Object.keys(MARK_STROKES).filter((m) => !c.marks.includes(m) && (MARK_STROKES[m][0][0][1] > 0) === side)
    const best = sameSide.map((m) => fit(MARK_STROKES[m].map((st) => st.map(([x, y]) => [x + mid, y])))).sort((a, b) => b - a)[0] ?? 0
    const mine = fit(want)
    // dots are taps: the count must match too
    const taps = (st) => st.filter((x) => { const xs = x.map((p) => p[0]), ys = x.map((p) => p[1]); return Math.max(...xs) - Math.min(...xs) < 45 && Math.max(...ys) - Math.min(...ys) < 45 }).length
    if (taps(drawn) !== taps(want)) return { ok: false, text: taps(want) ? `This sign is ${taps(want) === 1 ? 'one dot' : taps(want) + ' dots'}.` : 'This sign is a stroke, not dots.' }
    if (mine < 0.45 || best > mine) return { ok: false, text: 'The vowel sign is not the right one, or not over the letter.' }
    // a stroke sign (an acute, a curl, a bar) must also have the right shape: a curl has a hook, an acute none
    const wanted = wantMarks.find((m) => STROKE_SIGNS.includes(m.name))
    if (wanted && !taps(want)) {
      const shapes = Object.fromEntries(STROKE_SIGNS.filter((m) => (MARK_STROKES[m][0][0][1] > 0) === side).map((m) => [m, MARK_STROKES[m]]))
      const seen = nearestShape(drawn, shapes)
      if (seen !== wanted.name) return { ok: false, text: `That sign looks like ${SIGN_NAME[seen] || seen}; this one is ${SIGN_NAME[wanted.name] || wanted.name}.` }
    }
  }
  return { ok: true, text: 'Right.' }
}
