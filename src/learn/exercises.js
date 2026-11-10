// Builds the sequence of steps for a lesson or a review: teaching notes, new items, then mixed practice.
// Pure and seeded, so a lesson can be rebuilt the same way and tested.
import { wordsOf } from './check.js'

export function rng(seed) {
  let s = seed >>> 0 || 1
  return () => {
    s ^= s << 13; s >>>= 0
    s ^= s >> 17
    s ^= s << 5; s >>>= 0
    return s / 4_294_967_296
  }
}
const shuffle = (arr, r) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const allItems = (course) => course.lessons.filter((l) => !l.tengwar).flatMap((l) => l.items)

// three wrong answers that look like real ones: same kind of item, different meaning
function options(answer, field, it, course, r, n = 4) {
  const sameKind = (i) => (it.kind === 'word' ? i.kind === 'word' : i.kind !== 'word')
  const pool = allItems(course).filter((i) => sameKind(i) && i[field] !== answer && i.en !== it.en && i.el !== it.el)
  const picks = []
  for (const i of shuffle(pool, r)) {
    if (picks.length >= n - 1) break
    if (!picks.includes(i[field])) picks.push(i[field])
  }
  return shuffle([answer, ...picks], r)
}

const syllables = (say) => say.split(/[-\s·]+/).filter(Boolean)
const canStress = (it) => it.kind === 'word' && syllables(it.say).length >= 2 && /[A-Z]/.test(it.say)

// the same respelling with the stress moved to each other syllable
function stressOptions(it, r) {
  const parts = it.say.split('-')
  const vars = parts.map((_, k) => parts.map((p, j) => (j === k ? p.toUpperCase() : p.toLowerCase())).join('-'))
  return shuffle([...new Set(vars)].slice(0, 4), r)
}

function tiles(it, course, r) {
  const words = wordsOf(it.el)
  const extra = shuffle(allItems(course).filter((i) => i.kind !== 'word' && i.el !== it.el).flatMap((i) => wordsOf(i.el)), r)
    .filter((w) => !words.some((x) => x.toLowerCase() === w.toLowerCase()))
  const decoys = [...new Set(extra)].slice(0, Math.min(3, Math.max(2, 6 - words.length)))
  return { answer: words, bank: shuffle([...words, ...decoys], r) }
}

function ask(it, kind, course, r) {
  switch (kind) {
    case 'pick-en': return { t: kind, item: it, answer: it.en, options: options(it.en, 'en', it, course, r) }
    case 'pick-el': return { t: kind, item: it, answer: it.el, options: options(it.el, 'el', it, course, r) }
    case 'tengwar': return { t: kind, item: it, answer: it.el, options: options(it.el, 'el', it, course, r) }
    case 'stress': { const o = stressOptions(it, r); return { t: kind, item: it, answer: it.say, options: o } }
    case 'type-el': return { t: kind, item: it, answer: it.el }
    case 'tiles': return { t: kind, item: it, ...tiles(it, course, r) }
    default: throw new Error(kind)
  }
}

const shortLine = (it) => wordsOf(it.el).length <= 3

// the practice exercise for an item, rotating so a lesson mixes kinds
function practiceKinds(it, k) {
  if (it.kind === 'word') return [k % 3 === 0 && canStress(it) ? 'stress' : 'type-el', k % 2 ? 'pick-el' : 'pick-en']
  if (it.kind === 'canon') return ['tiles', 'pick-en']
  return wordsOf(it.el).length >= 2 ? ['tiles', k % 2 ? 'pick-el' : 'pick-en'] : [shortLine(it) ? 'type-el' : 'pick-el']
}

export function buildLesson(lesson, course, seed = Date.now()) {
  const r = rng(seed)
  const steps = lesson.teach.map((note) => ({ t: 'teach', note }))
  if (lesson.tengwar) {
    for (const it of shuffle(lesson.items, r).slice(0, 12)) steps.push(ask(it, 'tengwar', course, r))
    return steps
  }
  // meet the new items two at a time, each pair followed by a quick check
  const items = lesson.items
  for (let i = 0; i < items.length; i += 2) {
    const pair = items.slice(i, i + 2)
    for (const it of pair) steps.push({ t: 'learn', item: it })
    pair.forEach((it, k) => steps.push(ask(it, k ? 'pick-el' : 'pick-en', course, r)))
  }
  // then mixed practice
  const practice = []
  items.forEach((it, k) => {
    for (const kind of practiceKinds(it, k)) practice.push(ask(it, kind, course, r))
  })
  for (const [q, a, gloss] of lesson.drill?.pairs || []) {
    const wrong = shuffle(lesson.drill.pairs.filter((p) => p[1] !== a).map((p) => p[1]), r).slice(0, 2)
    const naive = lesson.lang === 'S' ? q + 's' : q + 's'
    practice.push({ t: 'rule', ask: lesson.drill.ask, q, gloss, answer: a, options: shuffle([...new Set([a, ...wrong, naive])], r) })
  }
  if (items.length >= 4) {
    const pairs = shuffle(items.filter((i) => i.en.length <= 34), r).slice(0, 4)
    if (pairs.length === 4) practice.push({ t: 'match', pairs })
  }
  return [...steps, ...shuffle(practice, r)]
}

// a review: one exercise per due item, harder the better you know it
export function buildReview(keys, course, seed = Date.now(), srs = {}) {
  const r = rng(seed)
  return shuffle(keys, r).map((key) => {
    const it = course.byKey.get(key)
    const box = srs[key]?.box ?? 1
    if (it.kind === 'canon') return ask(it, box >= 3 ? 'tiles' : 'pick-en', course, r)
    if (box <= 1) return ask(it, 'pick-en', course, r)
    if (box === 2) return ask(it, 'pick-el', course, r)
    if (it.kind !== 'word' && !shortLine(it)) return ask(it, 'tiles', course, r)
    return ask(it, 'type-el', course, r)
  }).filter((s) => s.item)
}

// ——— the Tengwar course ———
// letters: see the letter → pick its sound; hear the sound → pick the letter; type it on the Tengwar keyboard.
// words and marks: read the Tengwar → pick the Latin; see the Latin → pick the Tengwar; type it.
const TYPE_MAX = 16 // longer lines are read and picked, not typed

function twOptions(it, field, pool, r, n = 4) {
  const picks = []
  for (const i of shuffle(pool, r)) {
    if (picks.length >= n - 1) break
    if (i[field] !== it[field] && !picks.includes(i[field])) picks.push(i[field])
  }
  return shuffle([it[field], ...picks], r)
}

// wrong answers come only from what the learner has met: this lesson and the ones before it, or, in a review,
// what they have learned (with the whole course as a fallback when that is too little)
function twAsk(it, kind, known, r) {
  const sameKind = (i) => i.kind === it.kind
  let pool = known.filter(sameKind)
  if (pool.length < 4) pool = [...new Map([...pool, ...known.allItems.filter(sameKind)].map((i) => [i.key, i])).values()]
  switch (kind) {
    case 'tw-sound': return { t: kind, item: it, answer: it.label, options: twOptions(it, 'label', pool, r) }
    case 'tw-letter': return { t: kind, item: it, answer: it.tengwar, options: twOptions(it, 'tengwar', pool, r), tengwarOptions: true }
    case 'tengwar': return { t: kind, item: it, answer: it.el, options: twOptions(it, 'el', pool, r) }
    case 'tw-pick': return { t: kind, item: it, answer: it.tengwar, options: twOptions(it, 'tengwar', pool, r), tengwarOptions: true }
    case 'tw-type': return { t: kind, item: it, answer: it.tengwar }
    default: throw new Error(kind)
  }
}

// numbers are read, not typed: the keyboard has no numeral keys
const typable = (it) => it.kind !== 'number' && [...it.tengwar].length <= TYPE_MAX

const withAll = (arr, course) => Object.assign(arr, { allItems: [...course.byKey.values()] })

export function buildTengwarLesson(lesson, course, seed = Date.now(), { name } = {}) {
  const r = rng(seed)
  const upTo = course.lessons.indexOf(lesson)
  const known = withAll(course.lessons.slice(0, upTo + 1).flatMap((l) => l.items), course)
  const steps = lesson.teach.map((note) => ({ t: 'teach', note }))
  const items = lesson.items
  for (let i = 0; i < items.length; i += 2) {
    const pair = items.slice(i, i + 2)
    for (const it of pair) steps.push({ t: 'learn', item: it })
    for (const it of pair) steps.push(twAsk(it, it.kind === 'letter' ? 'tw-sound' : 'tengwar', known, r))
  }
  const practice = []
  items.forEach((it, k) => {
    if (it.kind === 'letter') practice.push(twAsk(it, 'tw-letter', known, r), twAsk(it, k % 2 ? 'tw-sound' : 'tw-type', known, r))
    else {
      practice.push(twAsk(it, 'tw-pick', known, r))
      if (typable(it) && k % 2 === 0) practice.push(twAsk(it, 'tw-type', known, r))
      else practice.push(twAsk(it, 'tengwar', known, r))
    }
  })
  const out = [...steps, ...shuffle(practice, r)]
  // the name lesson ends with the learner's own name in Tengwar, ready to save
  if (lesson.name && name) out.push({ t: 'scribe', text: name, lang: 'E' })
  return out
}

export function buildTengwarReview(keys, course, seed = Date.now(), srs = {}) {
  const r = rng(seed)
  const known = withAll([...new Set([...keys, ...Object.keys(srs)])].map((k) => course.byKey.get(k)).filter(Boolean), course)
  return shuffle(keys, r).map((key) => {
    const it = course.byKey.get(key)
    if (!it) return null
    const box = srs[key]?.box ?? 1
    if (it.kind === 'letter') return twAsk(it, box <= 1 ? 'tw-sound' : box === 2 ? 'tw-letter' : 'tw-type', known, r)
    if (box <= 1) return twAsk(it, 'tengwar', known, r)
    if (box === 2 || !typable(it)) return twAsk(it, 'tw-pick', known, r)
    return twAsk(it, 'tw-type', known, r)
  }).filter(Boolean)
}
