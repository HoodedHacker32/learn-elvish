// The streak, daily challenges, goals quiz and local accounts.
import { test } from 'node:test'
import assert from 'node:assert/strict'

// a tiny stand-in for the browser's storage, so the local account system runs under node
const mem = new Map()
globalThis.localStorage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) }

const { streakInfo, weekStart, FREEZES_PER_WEEK } = await import('../src/learn/streak.js')
const { todaysChallenges, countSession, progressOf } = await import('../src/learn/challenges.js')
const { recommend } = await import('../src/learn/quiz.js')
const { COURSES } = await import('../src/course/index.js')
const { fresh } = await import('../src/learn/store.js')

const MON = weekStart(20760) // a Monday

test('streak: five freezes a week cover missed days, so two days a week keeps it going', () => {
  assert.equal(FREEZES_PER_WEEK, 5)
  // practised Monday and Thursday for three weeks
  const days = [0, 3, 7, 10, 14, 17].map((k) => MON + k)
  const s = streakInfo(days, MON + 18)
  assert.equal(s.total, 6)
  assert.equal(s.length, 18) // Monday of week one to Friday of week three (yesterday)
  // one day a week is not enough: 6 missed days in a week breaks the run
  assert.equal(streakInfo([MON, MON + 7], MON + 8).length, 1)
})

test('streak: today does not count against you before you practise', () => {
  assert.equal(streakInfo([MON, MON + 1], MON + 2).length, 2)
  assert.equal(streakInfo([MON, MON + 1, MON + 2], MON + 2).length, 3)
  assert.equal(streakInfo([], MON).length, 0)
  const w = streakInfo([MON], MON + 2).week
  assert.deepEqual(w.slice(0, 4).map((d) => d.state), ['done', 'rested', 'today', 'future'])
})

test('daily challenges: three, the same all day, scaled to the learner', () => {
  const course = COURSES.S
  const beginner = fresh()
  const a = todaysChallenges(beginner, course, 20760, 'u1')
  assert.equal(a.length, 3)
  assert.ok(a.some((c) => c.id === 'lesson'))
  assert.deepEqual(a, todaysChallenges(beginner, course, 20760, 'u1'))
  // someone further on gets bigger goals
  const later = fresh()
  for (const l of course.lessons.slice(0, 8)) {
    later.lessons[l.id] = { done: true, score: 90 }
    for (const it of l.items) later.srs[it.key] = { box: 4, due: 0, r: 4, w: 0 }
  }
  const b = todaysChallenges(later, course, 20760, 'u1')
  const review = b.find((c) => c.id === 'review') || todaysChallenges(later, course, 20761, 'u1').find((c) => c.id === 'review')
  assert.ok(review && review.goal > 5)
  // counting a session
  const daily = countSession(null, 20760, [{ t: 'type-el', result: 'right' }, { t: 'type-el', result: 'accents' }, { t: 'pick-en', result: 'wrong' }])
  assert.equal(daily.counts.typedRight, 2)
  assert.equal(daily.counts.bestRun, 2)
  assert.equal(progressOf({ metric: 'typedRight', goal: 5 }, daily, 20760), 2)
  assert.equal(progressOf({ metric: 'typedRight', goal: 5 }, daily, 20761), 0) // a new day starts fresh
})

test('goals quiz: a D&D roleplayer gets Sindarin and the phrasebook, with the reasons', () => {
  const r = recommend({ use: ['roleplay'], elves: 'own', need: 'battle', time: '10' })
  assert.equal(r.track, 'S')
  assert.equal(r.focus, 'R')
  assert.match(r.why.join(' '), /D&D/)
  assert.equal(recommend({ use: ['songs'], elves: 'high', time: '5' }).track, 'Q')
})

test('local accounts: profiles, hashed passwords, separate progress', async () => {
  const { LocalAuthProvider, LocalProgressRepository } = await import('../src/accounts/local.js')
  const auth = new LocalAuthProvider()
  const repo = new LocalProgressRepository()
  const a = await auth.signUp({ name: 'Tester', password: 'mellon' })
  const b = await auth.signUp({ name: 'Guest' })
  assert.equal((await auth.listProfiles()).length, 2)
  assert.ok(![...mem.values()].some((v) => v.includes('mellon')), 'password must never be stored as text')
  await assert.rejects(auth.signIn(a.id, 'wrong'), (e) => e.code === 'wrong_password')
  assert.equal((await auth.signIn(a.id, 'mellon')).name, 'Tester')
  await assert.rejects(auth.signUp({ name: 'tester' }), (e) => e.code === 'name_taken')
  await repo.save(a.id, { xp: 10 })
  await repo.save(b.id, { xp: 99 })
  assert.equal((await repo.load(a.id)).xp, 10)
  await auth.remove(b.id)
  assert.equal(await repo.load(b.id), null)
})
