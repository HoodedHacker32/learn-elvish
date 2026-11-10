// Checking handwriting without any trained model.
//
// From memory: the $P point-cloud recogniser (Vatavu, Anthony & Wobbrock, 2012). What you wrote and every
// letter's template are each turned into 32 points, scaled and centred, and matched point to point; the nearest
// template wins. Stroke order and direction do not matter to it, so it judges the shape alone.
//
// Tracing: the guide is the letter itself, so tracing is judged by place as well as shape: how much of the guide
// your ink covers, and how much of your ink lies on the guide.
import STROKES from './strokes.js'

export const LETTER_STROKES = STROKES.letters
export const MARK_STROKES = STROKES.marks

const N = 48
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
const pathLength = (pts) => { let d = 0; for (let i = 1; i < pts.length; i++) if (pts[i].s === pts[i - 1].s) d += dist(pts[i - 1], pts[i]); return d }

// points: [{ x, y, s }] where s is the stroke number
function resample(points, n = N) {
  const I = pathLength(points) / (n - 1)
  if (!I) return Array.from({ length: n }, () => ({ ...points[0] }))
  const pts = points.map((p) => ({ ...p }))
  const out = [{ ...pts[0] }]
  let D = 0
  for (let i = 1; i < pts.length; i++) {
    if (pts[i].s !== pts[i - 1].s) continue
    const d = dist(pts[i - 1], pts[i])
    if (D + d >= I && d > 0) {
      const t = (I - D) / d
      const q = { x: pts[i - 1].x + t * (pts[i].x - pts[i - 1].x), y: pts[i - 1].y + t * (pts[i].y - pts[i - 1].y), s: pts[i].s }
      out.push(q)
      pts.splice(i, 0, q)
      D = 0
    } else D += d
  }
  while (out.length < n) out.push({ ...pts[pts.length - 1] })
  return out.slice(0, n)
}

function normalise(points) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const p of points) { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y) }
  const size = Math.max(maxX - minX, maxY - minY) || 1
  const sc = points.map((p) => ({ x: (p.x - minX) / size, y: (p.y - minY) / size, s: p.s }))
  const cx = sc.reduce((a, p) => a + p.x, 0) / sc.length, cy = sc.reduce((a, p) => a + p.y, 0) / sc.length
  return sc.map((p) => ({ x: p.x - cx, y: p.y - cy, s: p.s }))
}

function cloudDistance(a, b, start) {
  const matched = new Array(a.length).fill(false)
  let sum = 0, i = start
  do {
    let min = Infinity, index = -1
    for (let j = 0; j < matched.length; j++) {
      if (matched[j]) continue
      const d = dist(a[i], b[j])
      if (d < min) { min = d; index = j }
    }
    matched[index] = true
    const weight = 1 - ((i - start + a.length) % a.length) / a.length
    sum += weight * min
    i = (i + 1) % a.length
  } while (i !== start)
  return sum
}

function greedyMatch(a, b) {
  const step = Math.floor(Math.pow(a.length, 0.5))
  let min = Infinity
  for (let i = 0; i < a.length; i += step) min = Math.min(min, cloudDistance(a, b, i), cloudDistance(b, a, i))
  return min
}

// strokes: [[x, y], …][] in font units → a normalised cloud
export function cloud(strokes) {
  const pts = strokes.flatMap((s, k) => s.map(([x, y]) => ({ x, y, s: k })))
  return normalise(resample(pts))
}

const templates = new Map()
const templateOf = (name) => {
  if (!templates.has(name)) templates.set(name, cloud(LETTER_STROKES[name]))
  return templates.get(name)
}

// a finer cloud of the same shape, for telling near-twins apart
const fine = new Map()
const fineOf = (name, strokes) => {
  if (!fine.has(name)) fine.set(name, normalise(resample(strokes.flatMap((s, k) => s.map(([x, y]) => ({ x, y, s: k }))), 128)))
  return fine.get(name)
}

// Letters that differ only by a closing bar (tinco and parma, anto and ampa…) can score almost alike. Then look
// only at the parts one has and the other lacks, and ask which of those your ink actually covers.
// → how much of what only a has, and of what only b has, your ink covers (0–1 each)
function evidence(strokes, a, b) {
  const ink = normalise(resample(strokes.flatMap((s, k) => s.map(([x, y]) => ({ x, y, s: k }))), 128))
  const A = fineOf(a, LETTER_STROKES[a]), B = fineOf(b, LETTER_STROKES[b])
  const only = (P, Q) => P.filter((p) => Q.every((q) => dist(p, q) > 0.06))
  const covered = (P) => (P.length ? P.filter((p) => ink.some((q) => dist(p, q) < 0.07)).length / P.length : 0)
  return [covered(only(A, B)), covered(only(B, A))]
}

// → [{ name, score }] best first; score runs from 0 (nothing like it) to 1 (the same shape)
export function recognise(strokes, candidates) {
  if (!strokes.length || strokes.every((s) => s.length < 2)) return []
  const c = cloud(strokes)
  const ranked = candidates.filter((n) => LETTER_STROKES[n]).map((name) => {
    const d = greedyMatch(c, templateOf(name))
    return { name, score: Math.max(0, 1 - d / 12) }
  }).sort((a, b) => b.score - a.score)
  // only a clear difference in the telling parts overturns the first choice
  if (ranked.length > 1 && ranked[0].score - ranked[1].score < 0.05) {
    const [ca, cb] = evidence(strokes, ranked[0].name, ranked[1].name)
    if (cb - ca > 0.2) [ranked[0], ranked[1]] = [ranked[1], ranked[0]]
  }
  return ranked
}

// On the guide lines the parts that tell two letters apart (a closing bar, a second bow) sit in known places,
// so compare there: how much of what only a has, and of what only b has, your ink covers.
function placedEvidence(strokes, a, b) {
  const A = dense(LETTER_STROKES[a]), B = dense(LETTER_STROKES[b])
  // compared exactly where it was written: the guide lines and the letter's start give the place and size
  // (fitting the writing to a letter's box was tried, and let wrong letters stretch into place)
  const ink = dense(strokes)
  const only = (P, Q, far) => P.filter((p) => nearest(p, Q) > far)
  const covered = (P, r, none) => (P.length ? P.filter((p) => nearest(p, ink) < r).length / P.length : none)
  // a letter with nothing of its own needs nothing; a rival with nothing of its own shows nothing. The rival's
  // parts count only where they lie well away from the letter asked for, so a near miss is not held against you.
  return [covered(only(A, B, 45), 55, 1), covered(only(B, A, 75), 40, 0)]
}

// Writing a letter you were asked for: right if it is the best match, or a whisker behind it while your ink
// shows the parts that make it that letter. → { ok, looksLike }
// Written on the guide lines, a letter's stem shows its family: rising above the x-height (thúlë), dropping
// below the baseline (tinco), both (the extended letters) or neither (númen). Font units: x-height 400, baseline 0.
export function reach(strokes) {
  const ys = strokes.flatMap((s) => s.map((p) => p[1]))
  return { up: Math.max(...ys) > 560, down: Math.min(...ys) < -150 }
}
const sameReach = (a, b) => a.up === b.up && a.down === b.down

export function judgeWriting(strokes, want, candidates) {
  const mine = reach(strokes), wanted = reach(LETTER_STROKES[want])
  if (!sameReach(mine, wanted)) {
    const what = wanted.up && !mine.up ? 'The stem should rise above the top line.' : wanted.down && !mine.down ? 'The stem should drop below the baseline.'
      : !wanted.up && mine.up ? 'This letter stays below the top line.' : 'This letter sits on the baseline, without going below it.'
    return { ok: false, hint: what }
  }
  candidates = candidates.filter((n) => sameReach(reach(LETTER_STROKES[n]), mine))
  const ranked = recognise(strokes, candidates)
  if (!ranked.length) return { ok: false }
  const top = ranked[0], me = ranked.find((r) => r.name === want)
  if (!me || me.score < 0.75) return { ok: false, looksLike: top.score >= 0.75 && top.name !== want ? top.name : null }
  // the nearest rival: whichever letter scores closest to (or above) the one asked for
  const rival = ranked.find((r) => r.name !== want)
  if (rival && rival.score >= me.score - 0.06) {
    const [mineOwn, rivalOwn] = placedEvidence(strokes, want, rival.name)
    if (mineOwn >= 0.75 && rivalOwn < 0.5) return { ok: true }
    return { ok: false, looksLike: rival.name }
  }
  // a twin a little further behind (calma behind quessë, noldo behind ñwalmë) still means the part that makes
  // this letter itself, usually its closing bar, has to be there: leaving it off writes the other letter
  if (top.name === want && rival && rival.score >= me.score - 0.15) {
    const [mineOwn] = placedEvidence(strokes, want, rival.name)
    if (mineOwn < 0.6) return { ok: false, looksLike: rival.name }
  }
  return top.name === want ? { ok: true } : { ok: false, looksLike: top.name }
}

// ——— tracing ———
function dense(strokes, step = 12) {
  const out = []
  for (const s of strokes) {
    for (let i = 0; i < s.length; i++) {
      const [x, y] = s[i]
      out.push({ x, y })
      if (i + 1 < s.length) {
        const [x2, y2] = s[i + 1]
        const n = Math.floor(Math.hypot(x2 - x, y2 - y) / step)
        for (let k = 1; k < n; k++) out.push({ x: x + ((x2 - x) * k) / n, y: y + ((y2 - y) * k) / n })
      }
    }
  }
  return out
}
const nearest = (p, pts) => { let m = Infinity; for (const q of pts) { const d = dist(p, q); if (d < m) m = d } return m }

// → { ok, coverage, precision, reversed: [stroke numbers drawn the other way], order: true when in order }
export function checkTrace(ink, target, tol = 55) {
  const t = dense(target), w = dense(ink)
  if (!w.length) return { ok: false, coverage: 0, precision: 0, reversed: [], order: true }
  const coverage = t.filter((p) => nearest(p, w) <= tol).length / t.length
  const precision = w.filter((p) => nearest(p, t) <= tol).length / w.length
  // which guide stroke each of your strokes follows, and whether you went its way
  const which = ink.map((s) => {
    const pts = dense([s])
    let best = -1, bestD = Infinity
    target.forEach((g, gi) => { const gd = dense([g]); const d = pts.reduce((a, p) => a + nearest(p, gd), 0) / pts.length; if (d < bestD) { bestD = d; best = gi } })
    const g = target[best]
    const [sx, sy] = s[0], [ex, ey] = s[s.length - 1]
    const fwd = Math.hypot(sx - g[0][0], sy - g[0][1]) + Math.hypot(ex - g[g.length - 1][0], ey - g[g.length - 1][1])
    const back = Math.hypot(sx - g[g.length - 1][0], sy - g[g.length - 1][1]) + Math.hypot(ex - g[0][0], ey - g[0][1])
    return { stroke: best, reversed: g.length > 1 && back + 20 < fwd && s.length > 2 }
  })
  const firsts = [...new Set(which.map((w2) => w2.stroke))]
  const order = firsts.every((v, i) => i === 0 || v > firsts[i - 1])
  return { ok: coverage >= 0.82 && precision >= 0.78, coverage, precision, reversed: which.filter((x) => x.reversed).map((x) => x.stroke + 1), order }
}

// the nearest shape among a few named templates ({ name: strokes }), by the same point-cloud match
export function nearestShape(strokes, templates) {
  const c = cloud(strokes)
  let best = null, bestD = Infinity
  for (const [name, t] of Object.entries(templates)) {
    const d = greedyMatch(c, cloud(t))
    if (d < bestD) { bestD = d; best = name }
  }
  return best
}
