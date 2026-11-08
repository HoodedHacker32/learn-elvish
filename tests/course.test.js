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
