// A streak that stays in the background. Research on streaks (Silverman & Barasch 2023) found that a broken
// streak lowers motivation, especially when people blame themselves, and that being able to repair it softens
// this. So: 5 freezes every week (Monday to Sunday) cover missed days automatically, which means practising on
// two days a week keeps the run going, and the number shown first is days practised, which never goes down.
//
// Everything is worked out from the set of days you practised, so nothing can drift out of step.

export const FREEZES_PER_WEEK = 5
// day numbers count from 1 Jan 1970 (a Thursday); weeks start on Monday
export const weekOf = (day) => Math.floor((day + 3) / 7)
export const weekStart = (day) => weekOf(day) * 7 - 3

export function streakInfo(practiceDays, today) {
  const days = new Set(practiceDays)
  const first = practiceDays.length ? Math.min(...practiceDays) : null
  const used = new Map() // week → freezes used
  let start = null
  let practised = 0
  // today only counts once you practise; until then the run is measured up to yesterday
  let d = days.has(today) ? today : today - 1
  while (first != null && d >= first) {
    if (days.has(d)) {
      practised++
      start = d
    } else {
      const w = weekOf(d)
      if ((used.get(w) || 0) >= FREEZES_PER_WEEK) break
      used.set(w, (used.get(w) || 0) + 1)
    }
    d--
  }
  const thisWeek = weekOf(today)
  const ws = weekStart(today)
  const week = Array.from({ length: 7 }, (_, k) => {
    const day = ws + k
    const state = days.has(day) ? 'done' : day > today ? 'future' : day === today ? 'today' : start != null && day > start ? 'rested' : 'missed'
    return { day, state }
  })
  return {
    length: start == null ? 0 : (days.has(today) ? today : today - 1) - start + 1, // calendar days in the run
    practisedInRun: practised,
    total: days.size,
    freezesLeft: FREEZES_PER_WEEK - (used.get(thisWeek) || 0),
    week,
  }
}
