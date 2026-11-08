// Comparing what the learner typed with the Elvish. Accent marks matter in Elvish (they change the sound),
// so an answer that is right except for accents counts, but is pointed out.

const tidy = (s) => s.normalize('NFC').toLowerCase().replace(/[’'`]/g, '’').replace(/[!?.,;:"“”()]/g, ' ').replace(/\s+/g, ' ').trim()
const bare = (s) => tidy(s).normalize('NFD').replace(/[̀-ͯ]/g, '')

// 'right' | 'accents' (right letters, missing or wrong accent marks) | 'wrong'
export function checkTyped(typed, answer) {
  if (!typed.trim()) return 'wrong'
  if (tidy(typed) === tidy(answer)) return 'right'
  if (bare(typed) === bare(answer)) return 'accents'
  return 'wrong'
}

// The words of a line, without punctuation, for the sentence-building exercise
export const wordsOf = (el) => el.replace(/[!?.,;:]/g, ' ').split(/\s+/).filter(Boolean)
export const sameWords = (a, b) => a.length === b.length && a.every((w, i) => tidy(w) === tidy(b[i]))

// Comparing typed Tengwar with the answer. Writing plain silmë or essë where the turned-over form belongs
// is right in substance, so it counts, and the app points out the turned form.
const NUQUERNA = [[0xe025, 0xe024], [0xe027, 0xe026]]
const plainTengwar = (s) => [...s.replace(/\s+/g, ' ').trim()].map((c) => {
  const cp = c.codePointAt(0)
  const n = NUQUERNA.find(([turned]) => turned === cp)
  return n ? String.fromCharCode(n[1]) : c
}).join('')
// 'right' | 'turned' (right except silmë/essë nuquerna) | 'wrong'
export function checkTengwar(typed, answer) {
  const t = typed.replace(/\s+/g, ' ').trim(), a = answer.replace(/\s+/g, ' ').trim()
  if (!t) return 'wrong'
  if (t === a) return 'right'
  if (plainTengwar(t) === plainTengwar(a)) return 'turned'
  return 'wrong'
}
