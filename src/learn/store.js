// Your progress, per profile. Saved through the account layer's ProgressRepository (a file on the desktop,
// this browser in the PWA); on claude.ai it is also kept in your private space in the artifact's store.
import { useCallback, useEffect, useRef, useState } from 'react'
import { today } from './srs.js'
import { progressRepo } from '../accounts/index.js'
import { PLATFORM } from '../platform/index.js'

export const fresh = () => ({
  v: 2, track: 'S', xp: 0, days: {}, practiceDays: [], lessons: {}, srs: {}, daily: null,
  quiz: null, settings: { goal: 60, reminder: { enabled: true, time: '19:00' } }, updatedAt: 0,
})

// older saves (v1) had a streak object instead of a list of practice days
function upgrade(s) {
  if (!s) return null
  if (s.v === 2) return { ...fresh(), ...s, settings: { ...fresh().settings, ...s.settings } }
  if (s.v === 1) {
    const practiceDays = Object.keys(s.days || {}).map(Number)
    return { ...fresh(), ...s, v: 2, practiceDays, quiz: null }
  }
  return null
}

// add points for today; today becomes a practice day
export function earn(state, xp) {
  const d = today()
  const practiceDays = state.practiceDays.includes(d) ? state.practiceDays : [...state.practiceDays, d]
  return { ...state, xp: state.xp + xp, days: { ...state.days, [d]: (state.days[d] || 0) + xp }, practiceDays }
}

export function useProgress(userId) {
  const [state, setState] = useState(null)
  const [sync, setSync] = useState(PLATFORM === 'artifact' ? 'connecting' : 'device')
  const latest = useRef(null)
  const remote = useRef(null)
  const timer = useRef(null)
  const writing = useRef(Promise.resolve())

  useEffect(() => {
    if (!userId) { setState(null); return }
    let alive = true
    ;(async () => {
      const saved = upgrade(await progressRepo.load(userId)) || fresh()
      if (!alive) return
      latest.current = saved
      setState(saved)
      if (PLATFORM !== 'artifact') return
      // claude.ai: also keep it in this person's private space, so it follows them between devices
      try {
        const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')])
        const id = db && user ? await user.id() : null
        if (!id || !alive) { setSync('device'); return }
        const doc = db.doc(`data/users/${id}/progress-${userId}`)
        const snap = await doc.get()
        const there = snap.exists ? upgrade(snap.data()) : null
        remote.current = doc
        if (there && there.updatedAt > latest.current.updatedAt) {
          latest.current = there
          setState(there)
          progressRepo.save(userId, there)
        } else if (latest.current.updatedAt > 0) await doc.set(latest.current)
        if (alive) setSync('account')
      } catch {
        if (alive) setSync('device')
      }
    })()
    return () => { alive = false }
  }, [userId])

  const update = useCallback((fn) => {
    if (!latest.current) return
    const next = { ...fn(latest.current), updatedAt: Date.now() }
    latest.current = next
    setState(next)
    // one write at a time, coalesced to one per pause
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      writing.current = writing.current
        .then(() => progressRepo.save(userId, latest.current))
        .then(() => remote.current?.set(latest.current))
        .catch(() => setSync('device'))
    }, 400)
  }, [userId])

  return [state, update, sync]
}
