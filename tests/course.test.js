// Every word and line the course teaches must be something the translator stands behind:
// a word in its lexicon, or exactly what it writes for that English, honestly labelled.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { COURSES } from '../src/course/index.js'
import { buildLesson, buildReview } from '../src/learn/exercises.js'
import { checkTyped } from '../src/learn/check.js'
import { grade, introduce, today } from '../src/learn/srs.js'

for (const lang of ['S', 'Q', 'R']) {
  const course = COURSES[lang]

  test(`${lang}: every item is traced to Tolkien or clearly labelled`, () => {
    for (const l of course.lessons) {
      assert.ok(l.items.length > 0, `${l.id} has nothing to learn`)
      for (const it of l.items) {
        assert.notEqual(it.origin, 'unknown', `${l.id}: “${it.el}” (${it.en}) is not what the translator gives`)
        assert.ok(it.say && it.tengwar, `${l.id}: “${it.el}” has no pronunciation or Tengwar`)
      }
    }
  })

  test(`${lang}: fan-made items are only the expected everyday ones`, () => {
    const fan = course.lessons.flatMap((l) => l.items).filter((i) => i.origin === 'fan').map((i) => i.el)
    const allowed = { S: ['Navaer!', 'Le hannon'], Q: ['Hantanyel'], R: ['Navaer!', 'Le hannon'] }[lang]
    for (const f of fan) assert.ok(allowed.includes(f), `unexpected fan-made item ${f}`)
  })

  test(`${lang}: lesson ids are unique and every lesson builds playable steps`, () => {
    const ids = course.lessons.map((l) => l.id)
    assert.equal(new Set(ids).size, ids.length)
    for (const l of course.lessons) {
      const steps = buildLesson(l, course, 1)
      const asks = steps.filter((s) => s.t !== 'teach' && s.t !== 'learn')
      assert.ok(asks.length >= 4, `${l.id} has only ${asks.length} exercises`)
      for (const s of steps) {
        if (s.options) {
          assert.ok(s.options.includes(s.answer), `${l.id} ${s.t}: answer missing from options`)
          assert.equal(new Set(s.options).size, s.options.length, `${l.id} ${s.t}: duplicate options`)
        }
      }
    }
  })
}

test('typed answers: accents are pointed out, not failed', () => {
  assert.equal(checkTyped('namarie', 'Namárië!'), 'accents')
  assert.equal(checkTyped('Namárië', 'Namárië!'), 'right')
  assert.equal(checkTyped('namari', 'Namárië!'), 'wrong')
  assert.equal(checkTyped("I 'aladh", 'I ’aladh'), 'right')
})

test('spaced repetition: right answers space out, wrong ones come back today', () => {
  let c = introduce({}, 'S:aran')
  assert.equal(c.due, today() + 1)
  c = grade(c, true)
  assert.equal(c.box, 2)
  assert.ok(c.due > today())
  c = grade(c, false)
  assert.equal(c.box, 1)
  assert.equal(c.due, today())
})

test('review uses only items you have learned', () => {
  const course = COURSES.S
  const keys = course.lessons[0].items.slice(0, 3).map((i) => i.key)
  const steps = buildReview(keys, course, 7)
  assert.ok(steps.length === 3)
  for (const s of steps) assert.ok(keys.includes(s.item.key))
})

// ——— the Tengwar course ———
import { buildTengwarLesson, buildTengwarReview } from '../src/learn/exercises.js'
import { checkTengwar } from '../src/learn/check.js'

test('T: every Sindarin and Quenya line is one its course teaches, spelt by the engine', () => {
  const T = COURSES.T
  assert.ok(T.lessons.length >= 18)
  for (const l of T.lessons) {
    assert.ok(l.items.length > 0, `${l.id} has nothing to read`)
    for (const it of l.items) {
      assert.notEqual(it.origin, 'unknown', `${l.id}: “${it.el}” is not in its course`)
      assert.ok(it.tengwar && [...it.tengwar].every((c) => c === ' ' || c.codePointAt(0) >= 0xe000), `${l.id}: “${it.el}” is not all Tengwar`)
    }
  }
})

test('T: every lesson builds playable steps, and the name lesson ends with your name', () => {
  const T = COURSES.T
  const ids = T.lessons.map((l) => l.id)
  assert.equal(new Set(ids).size, ids.length)
  for (const l of T.lessons) {
    const steps = buildTengwarLesson(l, T, 7, { name: 'Tester' })
    const asks = steps.filter((s) => s.t.startsWith('tw-') || s.t === 'tengwar')
    assert.ok(asks.length >= 4, `${l.id} has only ${asks.length} exercises`)
    for (const s of steps.filter((x) => x.options)) {
      assert.ok(s.options.includes(s.answer), `${l.id} ${s.t}: answer missing`)
      assert.equal(new Set(s.options).size, s.options.length, `${l.id} ${s.t}: duplicate options`)
    }
    assert.equal(steps.at(-1).t === 'scribe', !!l.name, l.id)
  }
  assert.ok(buildTengwarReview([...T.byKey.keys()].slice(0, 20), T, 3, {}).length === 20)
})

test('T: typed Tengwar counts plain silmë for the turned form, and nothing else', () => {
  const silme = '', turned = '', dot = '', lambe = ''
  assert.equal(checkTengwar(turned + dot + lambe, turned + dot + lambe), 'right')
  assert.equal(checkTengwar(silme + dot + lambe, turned + dot + lambe), 'turned')
  assert.equal(checkTengwar(lambe, turned + dot + lambe), 'wrong')
  assert.equal(checkTengwar('  ', lambe), 'wrong')
})
