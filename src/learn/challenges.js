// Optional daily challenges: three a day, fitted to where you are. They are invitations, not chores: nothing
// is lost by ignoring them, and finishing one adds a mark to your week.
import { rng } from './exercises.js'
import { dueKeys } from './srs.js'

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n))

// a rough level from what you have done in this course
export function levelOf(state, course) {
  const learned = Object.keys(state.srs).filter((k) => k.startsWith(course.lang + ':') && course.byKey.has(k))
  const lessons = course.lessons.filter((l) => state.lessons[l.id]?.done).length
  const strong = learned.filter((k) => state.srs[k].box >= 3).length
  return { learned: learned.length, lessons, strong, due: dueKeys(state.srs, course.lang).filter((k) => course.byKey.has(k)).length }
}

export function todaysChallenges(state, course, day, userId = '') {
  const lv = levelOf(state, course)
  const next = course.lessons.find((l) => !state.lessons[l.id]?.done)
  const canonKnown = course.lessons.some((l) => state.lessons[l.id]?.done && l.items.some((i) => i.kind === 'canon'))
  const pool = []
  if (next) pool.push({ id: 'lesson', title: `Finish a new lesson`, detail: next.title, goal: 1, metric: 'lessons', weight: 3 })
  if (lv.due) {
    const n = clamp(lv.due, 3, 5 + Math.floor(lv.learned / 8))
    pool.push({ id: 'review', title: `Review ${n} things you have learned`, detail: `${lv.due} are ready`, goal: n, metric: 'reviewed', weight: 3 })
  }
  if (lv.learned >= 3) {
    const k = clamp(3 + Math.floor(lv.strong / 6), 3, 12)
    pool.push({ id: 'typed', title: `Write ${k} answers from memory`, detail: 'Typing exercises, in a lesson or review', goal: k, metric: 'typedRight', weight: 2 })
  }
  const run = clamp(5 + Math.floor(lv.learned / 15), 5, 15)
  pool.push({ id: 'clean', title: `Get ${run} right in a row`, detail: 'In any lesson or review', goal: run, metric: 'bestRun', weight: 1 })
  if (canonKnown) pool.push({ id: 'line', title: 'Rebuild one of Tolkien’s own lines', detail: 'Lesson or review', goal: 1, metric: 'canonRight', weight: 1 })
  pool.push({ id: 'read', title: lv.learned >= 10 ? 'Read a Tolkien line in the reading room' : 'Look at a Tolkien line in the reading room', detail: 'See how much you can already follow', goal: 1, metric: 'linesRead', weight: 1 })
  if (lv.learned >= 8) pool.push({ id: 'tengwar', title: `Read ${clamp(3 + Math.floor(lv.learned / 20), 3, 10)} words in Tengwar`, detail: 'The Tengwar lesson', goal: clamp(3 + Math.floor(lv.learned / 20), 3, 10), metric: 'tengwarRight', weight: 1 })

  // the same three all day, different tomorrow; the heaviest two kinds first when they apply
  const r = rng(day * 2654435761 + [...userId].reduce((s, c) => s + c.charCodeAt(0), 0))
  const ordered = pool.map((c) => ({ c, key: c.weight + r() })).sort((a, b) => b.key - a.key).map((x) => x.c)
  return ordered.slice(0, 3)
}

// fold one finished session into today's counts
export function countSession(daily, day, log) {
  const counts = daily?.day === day ? { ...daily.counts } : {}
  const add = (k, n) => { counts[k] = (counts[k] || 0) + n }
  let run = 0
  let best = 0
  for (const x of log) {
    if (!x.t) continue
    const right = x.result !== 'wrong'
    run = right ? run + 1 : 0
    best = Math.max(best, run)
    if (right && x.t === 'type-el') add('typedRight', 1)
    if (right && x.t === 'tengwar') add('tengwarRight', 1)
    if (right && x.kind === 'canon' && x.t === 'tiles') add('canonRight', 1)
  }
  counts.bestRun = Math.max(counts.bestRun || 0, best)
  return { day, counts }
}

export const progressOf = (ch, daily, day) => Math.min(ch.goal, daily?.day === day ? daily.counts[ch.metric] || 0 : 0)
