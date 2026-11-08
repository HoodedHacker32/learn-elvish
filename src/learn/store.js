// Your progress. It always lives on this device first (a file in the desktop app, this browser in the web app),
// so everything works offline. When you are signed in and online, a copy is kept in your account and the two
// are merged, so progress made on any device adds up.
import { useCallback, useEffect, useRef, useState } from 'react'
import { today } from './srs.js'
import { account } from '../accounts/index.js'
import { storage } from '../platform/index.js'

export const fresh = () => ({
  v: 2, track: 'S', xp: 0, days: {}, practiceDays: [], lessons: {}, srs: {}, daily: null,
  quiz: null, name: '', settings: { goal: 60, reminder: { enabled: true, time: '19:00' } }, updatedAt: 0,
})

// older saves (v1) had a streak object instead of a list of practice days
export function upgrade(s) {
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

// Two copies of progress, one per device, made into one. Nothing learned on either is lost: lessons keep their
// best score, each card keeps the copy that has been practised more, practice days are joined, and settings
// come from whichever copy was changed last.
export function mergeProgress(a, b) {
  if (!a) return b
  if (!b) return a
  const [older, newer] = (a.updatedAt || 0) >= (b.updatedAt || 0) ? [b, a] : [a, b]
  const days = { ...older.days }
  for (const [d, x] of Object.entries(newer.days || {})) days[d] = Math.max(days[d] || 0, x)
  const lessons = { ...older.lessons }
  for (const [id, l] of Object.entries(newer.lessons || {})) {
    const o = lessons[id]
    lessons[id] = o ? { done: o.done || l.done, score: Math.max(o.score || 0, l.score || 0), at: Math.max(o.at || 0, l.at || 0) } : l
  }
  const srs = { ...older.srs }
  const seen = (c) => (c?.r || 0) + (c?.w || 0)
  for (const [k, c] of Object.entries(newer.srs || {})) {
    const o = srs[k]
    srs[k] = !o || seen(c) > seen(o) || (seen(c) === seen(o) && c.due >= o.due) ? c : o
  }
  let daily = newer.daily || older.daily
  if (older.daily && newer.daily && older.daily.day === newer.daily.day) {
    const counts = { ...older.daily.counts }
    for (const [k, n] of Object.entries(newer.daily.counts || {})) counts[k] = Math.max(counts[k] || 0, n)
    daily = { ...newer.daily, counts }
  } else if (older.daily && newer.daily) daily = older.daily.day > newer.daily.day ? older.daily : newer.daily
  return {
    ...newer, days, lessons, srs, daily,
    xp: Math.max(older.xp || 0, newer.xp || 0),
    practiceDays: [...new Set([...(older.practiceDays || []), ...(newer.practiceDays || [])])].sort((x, y) => x - y),
    name: newer.name || older.name || '',
    updatedAt: Math.max(older.updatedAt || 0, newer.updatedAt || 0),
  }
}

const KEY = 'progress'

// before accounts, progress was kept per local profile: carry the last-used profile's progress (and name) over
async function loadLocal() {
  const saved = upgrade(await storage.read(KEY))
  if (saved) return saved
  const old = await storage.read('accounts')
  const p = old?.profiles?.find((x) => x.id === old.current) || old?.profiles?.[0]
  if (!p) return null
  const was = upgrade(await storage.read('progress-' + p.id))
  return was ? { ...was, name: was.name || p.name } : { ...fresh(), name: p.name }
}

const online = () => typeof navigator === 'undefined' || navigator.onLine !== false

// sync: 'device' (no account), 'offline', 'syncing', 'synced' or 'error'
export function useProgress(user) {
  const [state, setState] = useState(null)
  const [sync, setSync] = useState('device')
  const latest = useRef(null)
  const timer = useRef(null)
  const queue = useRef(Promise.resolve())
  const uid = user?.id || null

  // the device copy, at once
  useEffect(() => {
    let alive = true
    loadLocal().then((s) => {
      if (!alive) return
      const st = s || fresh()
      latest.current = st
      setState(st)
      if (!s) storage.write(KEY, st)
    })
    return () => { alive = false }
  }, [])

  // with an account: merge the online copy in, and push the result back
  const pull = useCallback(async () => {
    if (!uid || !latest.current) return
    if (!online()) { setSync('offline'); return }
    setSync('syncing')
    try {
      const there = upgrade(await account.load(uid))
      const merged = mergeProgress(latest.current, there)
      latest.current = merged
      setState(merged)
      await storage.write(KEY, merged)
      await account.save(uid, merged)
      setSync('synced')
    } catch {
      setSync(online() ? 'error' : 'offline')
    }
  }, [uid])

  useEffect(() => {
    if (!uid) { setSync('device'); return }
    if (state) pull()
    const back = () => pull()
    const gone = () => setSync('offline')
    window.addEventListener('online', back)
    window.addEventListener('offline', gone)
    return () => { window.removeEventListener('online', back); window.removeEventListener('offline', gone) }
    // pull once the device copy has loaded, and again whenever the account changes
  }, [uid, !!state, pull])

  const update = useCallback((fn) => {
    if (!latest.current) return
    const next = { ...fn(latest.current), updatedAt: Date.now() }
    latest.current = next
    setState(next)
    // one write at a time, coalesced to one per pause
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      queue.current = queue.current
        .then(() => storage.write(KEY, latest.current))
        .then(async () => {
          if (!uid) return
          if (!online()) { setSync('offline'); return }
          await account.save(uid, latest.current)
          setSync('synced')
        })
        .catch(() => setSync(online() ? 'error' : 'offline'))
    }, 400)
  }, [uid])

  return [state, update, sync]
}
