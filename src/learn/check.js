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
