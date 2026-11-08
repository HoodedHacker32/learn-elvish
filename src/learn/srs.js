// Spaced repetition: each thing you learn sits in a box. A right answer moves it up a box and it comes back
// later; a wrong one sends it back to box 1, due today. Days are counted in your own time zone.

const INTERVAL = [0, 1, 2, 4, 7, 15, 30, 60] // days until the next review, by box

export function dayNumber(d = new Date()) {
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000)
}
export const today = () => dayNumber()

// first meeting, at the end of a lesson
export function introduce(srs, key, missed = false) {
  if (srs[key]) return srs[key]
  return { box: 1, due: today() + (missed ? 0 : 1), r: 0, w: 0 }
}

export function grade(card, right) {
  const c = card || { box: 0, due: today(), r: 0, w: 0 }
  if (right) {
    const box = Math.min(c.box + 1, INTERVAL.length - 1)
    return { box, due: today() + INTERVAL[box], r: c.r + 1, w: c.w }
  }
  return { box: 1, due: today(), r: c.r, w: c.w + 1 }
}

export const dueKeys = (srs, lang) => Object.keys(srs).filter((k) => k.startsWith(lang + ':') && srs[k].due <= today())

// how well a card is known, for the notebook
export function strength(card) {
  if (!card) return 0
  return Math.min(card.box / 5, 1)
}
