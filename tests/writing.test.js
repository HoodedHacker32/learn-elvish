// Handwriting checks: every letter written on the guide lines is recognised, and no letter is mistaken for
// another, even written roughly. The "hand" here is each letter's own strokes with a seeded wobble.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { LETTER_STROKES, MARK_STROKES, judgeWriting, checkTrace, recognise } from '../src/tengwar/recognize.js'

const names = Object.keys(LETTER_STROKES)
function hand(strokes, amp, seed = 3) {
  let k = seed
  const j = () => ((k = (k * 9301 + 49297) % 233280) / 233280 - 0.5) * amp
  return strokes.map((s) => {
    const out = [s[0]]
    for (let i = 1; i < s.length; i++) {
      const [a, b] = s[i - 1], [x, y] = s[i]
      for (let t = 1; t <= 6; t++) out.push([a + ((x - a) * t) / 6 + j(), b + ((y - b) * t) / 6 + j()])
    }
    return out
  })
}

test('every tengwa and vowel sign has strokes', () => {
  assert.equal(names.length, 38)
  for (const n of names) assert.ok(LETTER_STROKES[n].length >= 1, n)
  for (const m of ['threeDots', 'acute', 'dot', 'rightCurl', 'leftCurl', 'twoDots', 'dotBelow', 'nasalizer', 'doubler']) assert.ok(MARK_STROKES[m].length >= 1, m)
})

test('a letter written roughly on the lines is accepted as itself', () => {
  for (const amp of [0, 50, 70]) for (const n of names) assert.ok(judgeWriting(hand(LETTER_STROKES[n], amp), n, names).ok, `${n} at ±${amp / 2}`)
})

test('a different letter is never accepted in its place', () => {
  for (const n of names) for (const m of names) {
    if (m !== n) assert.ok(!judgeWriting(hand(LETTER_STROKES[m], 50), n, names).ok, `${m} accepted as ${n}`)
  }
})

test('a stem in the wrong place is pointed out', () => {
  const thule = LETTER_STROKES.thule // raised stem, written for tinco (stem below the line)
  const r = judgeWriting(thule, 'tinco', names)
  assert.equal(r.ok, false)
  assert.match(r.hint, /below the baseline/)
})

test('tracing: the letter itself passes, another letter does not, and a backwards stroke is noticed', () => {
  assert.ok(checkTrace(LETTER_STROKES.parma, LETTER_STROKES.parma).ok)
  assert.ok(!checkTrace(LETTER_STROKES.calma, LETTER_STROKES.parma).ok)
  const back = LETTER_STROKES.tinco.map((s, i) => (i === 0 ? [...s].reverse() : s))
  const r = checkTrace(back, LETTER_STROKES.tinco)
  assert.ok(r.ok)
  assert.deepEqual(r.reversed, [1])
  assert.equal(recognise(LETTER_STROKES.anto, names)[0].name, 'anto')
})

// ——— whole words ———
import { clusters, clusterTarget, judgeCluster } from '../src/tengwar/words.js'
import { COURSES } from '../src/course/index.js'
import { toTengwar } from '../../LoTR Elvish Translator/src/engine/tengwar.js'

test('the course words split into one box per tengwa, each written correctly passes', () => {
  const words = [...COURSES.T.byKey.values()].filter((i) => i.kind === 'tword')
  const boxed = words.filter((w) => clusters(w.tengwar))
  assert.ok(boxed.length >= 60, `only ${boxed.length} words can be written`)
  assert.equal(clusters(toTengwar('mellon', 'S')).length, 3) // malta, lambe with e and the bar, númen with o
  for (const w of boxed) for (const c of clusters(w.tengwar)) {
    const t = clusterTarget(c)
    assert.ok(judgeCluster(hand(t.all, 40), c, 'memory', names).ok, `${w.el}: ${c.base} ${c.marks}`)
    assert.ok(judgeCluster(t.all, c, 'trace', names).ok, `${w.el}: ${c.base} traced`)
  }
})

test('a missing, extra or wrong vowel sign is caught', () => {
  const marks = Object.keys(MARK_STROKES)
  for (const a of marks) for (const b of marks) {
    if (a === b) continue
    const ink = [...LETTER_STROKES.tinco, ...clusterTarget({ base: 'tinco', marks: [b] }).marks[0].strokes]
    assert.ok(!judgeCluster(ink, { base: 'tinco', marks: [a] }, 'memory', names).ok, `${b} accepted for ${a}`)
  }
  assert.match(judgeCluster(LETTER_STROKES.lambe, { base: 'lambe', marks: ['threeDots'] }, 'memory', names).text, /add its vowel sign/)
  const extra = [...LETTER_STROKES.lambe, ...clusterTarget({ base: 'lambe', marks: ['dot'] }).marks[0].strokes]
  assert.match(judgeCluster(extra, { base: 'lambe', marks: [] }, 'memory', names).text, /no vowel sign/)
})
