// Turns the course files into lessons the app can run. Every item gets its pronunciation, Tengwar and an
// honest label of where it comes from, all from the translator, so the lessons and the translator agree.
import { SINDARIN_COURSE } from './sindarin.js'
import { QUENYA_COURSE } from './quenya.js'
import { ROLEPLAY_COURSE } from './roleplay.js'
import { TENGWAR_COURSE, LETTERS, MARKS, PUNCTUATION, NUMBERS } from './tengwar.js'
import { TOLKIEN_PHRASES } from '../../../LoTR Elvish Translator/src/data/eldamo-phrases.js'
import { LEXICON, CANON, translate } from '../../../LoTR Elvish Translator/src/engine/translate.js'
import { respell, respellLine } from '../../../LoTR Elvish Translator/src/engine/pronounce.js'
import { toTengwar, toTengwarNumber, CSUR } from '../../../LoTR Elvish Translator/src/engine/tengwar.js'
import { SOURCES } from '../../../LoTR Elvish Translator/src/data/sources.js'

export const LANG_NAME = { S: 'Sindarin', Q: 'Quenya' }

// What the learner sees about each item's origin
export const ORIGIN = {
  tolkien: { label: 'Tolkien’s', long: 'Tolkien wrote this himself' },
  derived: { label: 'Tolkien’s, form worked out', long: 'Tolkien’s word; this exact form is worked out from his other forms of it' },
  built: { label: 'Built from Tolkien’s words', long: 'Every word is Tolkien’s, put together with grammar he showed' },
  early: { label: 'Early Tolkien', long: 'From Tolkien’s earlier drafts of the language, not his finished version' },
  fan: { label: 'Fan-made', long: 'Not Tolkien’s: made by people writing Elvish today to fill a gap' },
  english: { label: 'English in Tengwar', long: 'English spelt in Tengwar letter by letter, as in Tolkien’s own English samples' },
}

const RANK = { A: 0, D: 1, E: 2, N: 3 }
const FROM_STATUS = { A: 'tolkien', C: 'tolkien', D: 'derived', E: 'early', N: 'fan' }

function wordOrigin(el, lang) {
  const rows = LEXICON[lang].filter((r) => r[1].toLowerCase() === el.toLowerCase()).sort((a, b) => RANK[a[3]] - RANK[b[3]])
  if (!rows.length) return null
  return { origin: FROM_STATUS[rows[0][3]], source: SOURCES[rows[0][4]] || rows[0][4] }
}

function lineOrigin(el, en, lang) {
  const r = translate(en, lang)
  if (r.line !== el) return null
  if (r.trust.level === 'exact') return { origin: 'tolkien', source: r.canon?.where || '' }
  if (r.mode === 'everyday') return { origin: FROM_STATUS[r.everyday.status], source: r.everyday.where, literal: r.everyday.literal, note: r.everyday.note }
  if (r.trust.level === 'safe') return { origin: 'built', source: '' }
  if (r.trust.level === 'caution') {
    const st = r.items.map((i) => i.status)
    return { origin: st.includes('N') ? 'fan' : st.includes('E') ? 'early' : 'derived', source: '' }
  }
  return null
}

function item(lang, kind, el, en, extra = {}) {
  return {
    key: `${lang}:${el}`, lang, kind, el, en,
    say: kind === 'word' ? respell(el, lang) : respellLine(el, lang),
    tengwar: toTengwar(el, lang),
    ...extra,
  }
}

// id: the course's own key; lang: its main language (an item may carry its own, as in the phrasebook)
function build(course, id, lang, { tengwar = true } = {}) {
  const lessons = []
  const units = course.map((u) => ({ title: u.unit, lessons: [] }))
  course.forEach((u, ui) => {
    for (const l of u.lessons) {
      const items = []
      for (const [el, en, own] of l.words || []) {
        const lg = own || lang
        items.push(item(lg, 'word', el, en, wordOrigin(el, lg) || { origin: 'unknown', source: '' }))
      }
      for (const [el, en, own] of l.lines || []) {
        const lg = own || lang
        items.push(item(lg, 'line', el, en, lineOrigin(el, en, lg) || { origin: 'unknown', source: '' }))
      }
      for (const elvish of l.canon || []) {
        const c = CANON.find((x) => x.elvish === elvish)
        if (!c) { items.push(item(lang, 'canon', elvish, '?', { origin: 'unknown', source: '' })); continue }
        items.push(item(c.lang, 'canon', c.elvish, c.meaning, {
          origin: 'tolkien', source: c.where, who: c.who,
          parts: c.words.map(([w, gloss]) => ({ el: w, en: gloss })),
        }))
      }
      const lesson = { ...l, lang, course: id, unit: u.unit, unitIndex: ui, items }
      lessons.push(lesson)
      units[ui].lessons.push(lesson)
    }
  })
  if (tengwar) {
    // last unit: reading Tengwar, using every word taught
    const words = lessons.flatMap((l) => l.items.filter((i) => i.kind === 'word'))
    const lesson = {
      id: `${id.toLowerCase()}-tengwar`, lang, course: id, title: 'Reading Tengwar', unit: 'Tengwar', unitIndex: units.length,
      tengwar: true, items: words,
      teach: [
        { h: 'Tolkien’s Elvish letters', p: 'The Tengwar are the letters Tolkien designed for Elvish. Each consonant is a letter and each vowel a small mark written over one: in Quenya over the consonant before it, in Sindarin over the one after. Every word in this app is shown in Tengwar under the Latin spelling.', ex: [] },
        { h: 'Read by shape', p: 'In this lesson you see only the Tengwar. Pick the word it spells. Look for the shapes of words you know. To learn the letters one by one, and to type and write them, choose Tengwar at the top.', ex: [] },
      ],
    }
    units.push({ title: 'Tengwar', lessons: [lesson] })
    lessons.push(lesson)
  }
  return { id, lang, units, lessons, byKey: new Map(lessons.flatMap((l) => l.items).map((i) => [i.key, i])) }
}

const LANGUAGE_COURSES = {
  S: build(SINDARIN_COURSE, 'S', 'S'),
  Q: build(QUENYA_COURSE, 'Q', 'Q'),
  R: build(ROLEPLAY_COURSE, 'R', 'S', { tengwar: false }),
}

// ——— the Tengwar course: letters, signs and words, read and typed ———
const T = (...cps) => String.fromCharCode(...cps)
const APPENDIX_E = 'The Lord of the Rings, Appendix E'
// how a vowel sign or mark is shown on its own: vowels on the short carrier, other marks on tinco
const markGlyph = (cp) => (['threeDots', 'acute', 'dot', 'rightCurl', 'leftCurl', 'twoDots'].includes(cp) ? T(CSUR.shortCarrier, CSUR[cp]) : T(CSUR.tinco, CSUR[cp]))

function buildTengwar() {
  const lessons = []
  const units = TENGWAR_COURSE.map((u) => ({ title: u.unit, lessons: [] }))
  const lettersSoFar = []
  TENGWAR_COURSE.forEach((u, ui) => {
    for (const l of u.lessons) {
      const items = []
      for (const id of l.letters || []) {
        const L = LETTERS[id]
        lettersSoFar.push(id)
        items.push({ key: `T:l:${id}`, lang: 'T', kind: 'letter', id, el: L.name, en: L.sound, label: `${L.sound} · ${L.name}`, note: L.note, tengwar: T(CSUR[id]), say: '', origin: 'tolkien', source: APPENDIX_E })
      }
      for (const id of l.marks || []) {
        const M = MARKS[id]
        items.push({ key: `T:m:${id}`, lang: 'T', kind: 'mark', id, el: M.sound, en: M.name, label: `${M.sound} · ${M.name}`, tengwar: markGlyph(M.cp), say: '', origin: 'tolkien', source: APPENDIX_E })
      }
      if (l.punctuation) {
        for (const [id, meaning] of PUNCTUATION) items.push({ key: `T:p:${id}`, lang: 'T', kind: 'mark', id, el: meaning, en: meaning, label: meaning, tengwar: T(CSUR[id]), say: '', origin: 'tolkien', source: 'Tolkien’s Tengwar samples' })
      }
      if (l.numbers) {
        for (const n of NUMBERS) items.push({ key: `T:n:${n}`, lang: 'T', kind: 'number', el: String(n), en: `the number ${n}`, label: String(n), tengwar: toTengwarNumber(n), say: '', origin: 'tolkien', source: 'Tolkien’s Tengwar numerals' })
      }
      for (const [el, en, wl] of l.words || []) {
        // a Sindarin or Quenya word is the one its course teaches, with that course's honest label
        const from = wl === 'E' ? null : LANGUAGE_COURSES[wl].byKey.get(`${wl}:${el}`)
        items.push({
          key: `T:${wl}:${el}`, lang: wl, kind: 'tword', el, en: from?.en || en, label: el,
          tengwar: toTengwar(el, wl), say: wl === 'E' ? '' : from?.say || respellLine(el, wl),
          origin: wl === 'E' ? 'english' : from?.origin || 'unknown', source: from?.source || '',
        })
      }
      const lesson = {
        ...l, teach: l.teach.map((t) => ({ ex: [], ...t })), lang: 'T', course: 'T', unit: u.unit, unitIndex: ui, items,
        letterPool: [...lettersSoFar],
      }
      lessons.push(lesson)
      units[ui].lessons.push(lesson)
    }
  })
  return { id: 'T', lang: 'T', units, lessons, byKey: new Map(lessons.flatMap((l) => l.items).map((i) => [i.key, i])) }
}

export const COURSES = { ...LANGUAGE_COURSES, T: buildTengwar() }
export const COURSE_NAME = { S: 'Sindarin', Q: 'Quenya', R: 'Roleplay phrasebook', T: 'Tengwar' }
export { LETTERS }

// ——— the reading room: Tolkien's own short lines, word by word ———
const plainWord = (w) => w.toLowerCase().normalize('NFC').replace(/^[’'‘]+|[’'‘!?.,;:“”"()]+$/g, '')
const lineWords = (el) => el.split(/\s+/).map((w) => ({ w, key: plainWord(w) })).filter((x) => x.key)

export const READING = ['S', 'Q'].flatMap((lang) => {
  const seen = new Set()
  const canon = CANON.filter((c) => c.lang === lang).map((c) => ({ lang, el: c.elvish, en: c.meaning, where: c.where, who: c.who, famous: true }))
  const more = TOLKIEN_PHRASES.filter((p) => p.lang === lang && !p.uncertain && p.elvish.split(/\s+/).length >= 2 && p.elvish.split(/\s+/).length <= 7)
    .map((p) => ({ lang, el: p.elvish.charAt(0).toUpperCase() + p.elvish.slice(1), en: p.english, where: p.where, famous: false }))
  return [...canon, ...more].filter((x) => !seen.has(x.el.toLowerCase()) && seen.add(x.el.toLowerCase())).map((x) => ({ ...x, words: lineWords(x.el) }))
})

// the word forms someone knows in a language, from what they have learned
export function knownForms(srs, lang) {
  const known = new Set()
  for (const c of Object.values(COURSES)) {
    for (const it of c.byKey.values()) {
      if (it.lang !== lang || !srs[it.key]) continue
      for (const x of lineWords(it.el)) known.add(x.key)
      for (const p of it.parts || []) known.add(plainWord(p.el))
    }
  }
  return known
}
