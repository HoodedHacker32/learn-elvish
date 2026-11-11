// "What do you want Elvish for?" A few questions on first run (and any time after) that recommend a course,
// a daily length, and say plainly why.

export const QUIZ = [
  {
    id: 'use', multi: true, q: 'What do you want to use Elvish for?',
    options: [
      { id: 'roleplay', label: 'Roleplay', hint: 'An Elf character in D&D, a LARP or a game' },
      { id: 'read', label: 'Understanding Tolkien', hint: 'The Elvish in the books and films' },
      { id: 'write', label: 'Writing it', hint: 'Tengwar, calligraphy, a tattoo or an inscription' },
      { id: 'songs', label: 'Songs and poems', hint: 'Galadriel’s lament, the hymn to Elbereth' },
      { id: 'speak', label: 'Talking with other fans', hint: 'Greetings, simple sentences' },
      { id: 'curious', label: 'Curiosity', hint: 'How Tolkien built a language' },
    ],
  },
  {
    id: 'elves', q: 'Which Elves are you drawn to?',
    options: [
      { id: 'middle', label: 'Elves of Middle-earth', hint: 'Legolas, Arwen, Elrond, Rivendell and Lórien' },
      { id: 'high', label: 'The High Elves of old', hint: 'Galadriel’s song, Valinor, the ancient Noldor' },
      { id: 'own', label: 'My own world or a game’s', hint: 'A D&D setting, a homebrew campaign' },
      { id: 'unsure', label: 'Not sure yet', hint: '' },
    ],
  },
  {
    id: 'need', q: 'In a scene, what do you most want to be able to say?', when: (a) => a.use?.includes('roleplay'),
    options: [
      { id: 'greet', label: 'Greetings and farewells', hint: 'Meeting travellers, leaving an inn' },
      { id: 'battle', label: 'Battle cries and warnings', hint: 'Light against the dark, “flee!”' },
      { id: 'ritual', label: 'Invocations and oaths', hint: 'Calling on Elbereth, solemn words' },
      { id: 'talk', label: 'Short sentences of my own', hint: 'I see the king, we have no bread' },
    ],
  },
  {
    id: 'time', q: 'How long would you like to practise on a normal day?',
    options: [
      { id: '5', label: 'About 5 minutes', hint: 'A short lesson or a review' },
      { id: '10', label: 'About 10 minutes', hint: 'A lesson and a review' },
      { id: '20', label: '20 minutes or more', hint: 'Steady progress' },
    ],
  },
]

export const GOALS = { 5: 150, 10: 300, 20: 600 } // points a day: about 30 a minute, 10 for each right answer

export function recommend(a) {
  const uses = a.use || []
  const why = []
  let track = 'S'
  if (a.elves === 'high' || (uses.includes('songs') && a.elves !== 'middle')) {
    track = 'Q'
    why.push('Quenya is the ancient tongue of the High Elves, and the language of Galadriel’s lament and most of Tolkien’s poems. It is also his most complete language.')
  } else {
    why.push('Sindarin is the Elvish the Elves of Middle-earth actually speak in The Lord of the Rings, from mae govannen to the door of Moria.')
  }
  if (a.elves === 'own') {
    why.push('Games like D&D have their own Elvish, a different invented language with only a small published vocabulary. Tolkien’s Sindarin is the most complete Elvish you can really speak, so most players borrow it.')
  }
  let focus = null
  if (uses.includes('roleplay')) {
    focus = 'R'
    why.push('The Roleplay phrasebook course gives you lines to use at the table straight away, all checked against Tolkien, while the main course teaches you to build your own.')
    if (a.need === 'battle') why.push('It includes Tolkien’s own battle cries, like lacho calad! drego morn!')
    // checked in Eldamo: Sindarin curu “craft, magic”, 1930s Noldorin lhûth “spell, charm”, but no incantations
    if (a.need === 'ritual') why.push('It includes Tolkien’s invocations to Elbereth. He had words for magic (Sindarin curu, “craft, magic”; in the 1930s lhûth, “spell, charm”), and Gandalf’s command at the door of Moria is in the course too, but his Elves do not cast spells in words.')
  }
  if (uses.includes('write')) why.push('Every word is shown in Tengwar, and the Tengwar lesson at the end of each course teaches you to read them.')
  if (uses.includes('read')) why.push('The reading room shows Tolkien’s own lines and lights up the words you already know.')
  const minutes = a.time || '10'
  return { track, focus, goal: GOALS[minutes] || 300, minutes, why }
}
