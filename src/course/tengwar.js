// The Tengwar course: reading and typing Tolkien's letters for Sindarin, Quenya and English.
// Letters are named as in Tolkien's table (The Lord of the Rings, Appendix E). Sounds are the ones the app's
// own spelling uses: Sindarin and Quenya in the general-use modes, English spelt letter by letter as in
// Tolkien's English samples (tabled by Måns Björkman, Amanyë Tenceli).
// words: [Latin, meaning, language S|Q|E]. Sindarin and Quenya words must be ones those courses teach.

export const LETTERS = {
  tinco: { name: 'tinco', sound: 't' },
  parma: { name: 'parma', sound: 'p' },
  calma: { name: 'calma', sound: 'c (k)', note: 'In Sindarin it is c, always said k. In English it is ch.' },
  quesse: { name: 'quessë', sound: 'qu (kw)', note: 'In Quenya it is qu. In English it is k, c and ck.' },
  ando: { name: 'ando', sound: 'd · nd', note: 'Sindarin d; Quenya nd.' },
  umbar: { name: 'umbar', sound: 'b · mb', note: 'Sindarin b; Quenya mb.' },
  anga: { name: 'anga', sound: 'g · ng', note: 'Sindarin g; Quenya ng (as in “finger”); English j.' },
  ungwe: { name: 'ungwë', sound: 'ngw', note: 'Quenya ngw; English g.' },
  thule: { name: 'thúlë', sound: 'th', note: 'The th in “thin”.' },
  formen: { name: 'formen', sound: 'f · ph' },
  harma: { name: 'harma', sound: 'ch · h', note: 'Sindarin ch, as in Scottish “loch”. English sh.' },
  hwesta: { name: 'hwesta', sound: 'hw', note: 'Quenya hw. English ch when it says k, as in “Michael”.' },
  anto: { name: 'anto', sound: 'dh · nt', note: 'Sindarin dh (the th in “this”); Quenya nt.' },
  ampa: { name: 'ampa', sound: 'v · mp', note: 'Sindarin v; Quenya mp; English v.' },
  anca: { name: 'anca', sound: 'nc', note: 'Quenya nc (as in “ink”).' },
  unque: { name: 'unquë', sound: 'nqu', note: 'Quenya nqu. English gh, as in “Hugh”.' },
  numen: { name: 'númen', sound: 'n' },
  malta: { name: 'malta', sound: 'm' },
  noldo: { name: 'noldo', sound: 'ng · ñ', note: 'Sindarin ng (as in “sing”).' },
  nwalme: { name: 'nwalmë', sound: 'nw', note: 'Quenya nw. English ng, as in “ring”.' },
  ore: { name: 'órë', sound: 'r (end)', note: 'r at the end of a word or before another consonant.' },
  vala: { name: 'vala', sound: 'v · w', note: 'Quenya v and w; English w.' },
  anna: { name: 'anna', sound: 'y', note: 'The y in “yes”.' },
  vilya: { name: 'vilya', sound: 'w', note: 'Sindarin w.' },
  romen: { name: 'rómen', sound: 'r (before a vowel)', note: 'r with a vowel after it.' },
  arda: { name: 'arda', sound: 'rh · rd', note: 'Sindarin rh; Quenya rd.' },
  lambe: { name: 'lambë', sound: 'l' },
  alda: { name: 'alda', sound: 'lh · ld', note: 'Sindarin lh; Quenya ld.' },
  silme: { name: 'silmë', sound: 's' },
  silmeNuquerna: { name: 'silmë nuquerna', sound: 's (with a vowel on it)', note: 'Silmë turned upside down, so a vowel sign fits over it.' },
  esse: { name: 'essë', sound: 'ss · z', note: 'Quenya ss; English s said z, as in “is”.' },
  esseNuquerna: { name: 'essë nuquerna', sound: 'ss · z (with a vowel on it)', note: 'Essë turned upside down, so a vowel sign fits over it.' },
  hyarmen: { name: 'hyarmen', sound: 'h' },
  hwestaSindarinwa: { name: 'hwesta sindarinwa', sound: 'hw · wh', note: 'Sindarin hw; English wh.' },
  yanta: { name: 'yanta', sound: 'i (after a vowel)', note: 'The i of ai, ei, oi, ui; in English, a second e as in “Michael”.' },
  ure: { name: 'úrë', sound: 'u (after a vowel)', note: 'The u of au.' },
  shortCarrier: { name: 'short carrier', sound: '(a vowel on its own)', note: 'A short stem that carries a vowel sign when no consonant can.' },
  longCarrier: { name: 'long carrier', sound: '(a long vowel)', note: 'A tall stem that carries a long vowel.' },
}

// vowel signs and other marks, drawn on a short carrier so they can be seen on their own
export const MARKS = {
  a: { cp: 'threeDots', name: 'three dots', sound: 'a' },
  e: { cp: 'acute', name: 'acute', sound: 'e' },
  i: { cp: 'dot', name: 'dot', sound: 'i' },
  o: { cp: 'rightCurl', name: 'right curl', sound: 'o' },
  u: { cp: 'leftCurl', name: 'left curl', sound: 'u' },
  y: { cp: 'twoDots', name: 'two dots', sound: 'y (Sindarin)' },
  nasal: { cp: 'nasalizer', name: 'bar above', sound: 'n or m before it' },
  double: { cp: 'doubler', name: 'bar below', sound: 'doubled letter' },
  silent: { cp: 'dotBelow', name: 'dot below', sound: 'silent e (English)' },
}

export const PUNCTUATION = [
  ['pusta', 'a short pause (comma)'],
  ['doublePusta', 'a full stop'],
  ['exclamation', 'an exclamation mark'],
  ['question', 'a question mark'],
]

export const NUMBERS = [1, 2, 3, 7, 10, 12, 21, 1954]

export const TENGWAR_COURSE = [
  {
    unit: 'The letters',
    lessons: [
      {
        id: 't-four', title: 'Four shapes', letters: ['tinco', 'parma', 'calma', 'quesse'],
        teach: [
          { h: 'Tolkien’s table', p: 'The Tengwar were made by Fëanor, Tolkien tells us, as a system. Each main letter is a stem (telco) and a bow (lúva). The four columns of Tolkien’s table are four places in the mouth: tinco at the teeth, parma at the lips, calma at the front of the roof of the mouth, quessë at the back.' },
          { h: 'Read by shape', p: 'Bow on the right of the stem: tinco and parma. Bow on the left: calma and quessë. A closed bow marks the second and fourth columns: parma and quessë.' },
        ],
      },
      {
        id: 't-voiced', title: 'Doubled bows', letters: ['ando', 'umbar', 'anga', 'ungwe'],
        teach: [
          { h: 'Two bows, a voice', p: 'Double the bow and the sound is voiced: t becomes d, p becomes b. In Quenya these letters stand for nd, mb, ng and ngw, sounds that only come after a nasal.' },
        ],
      },
      {
        id: 't-raised', title: 'Raised stems', letters: ['thule', 'formen', 'harma', 'hwesta', 'anto', 'ampa', 'anca', 'unque'],
        teach: [
          { h: 'A stem that rises', p: 'Raise the stem above the line and the sound is breathed: t becomes th, p becomes f. With two bows and a raised stem you get the voiced or nasal partner: anto, ampa, anca, unquë.' },
          { h: 'One letter, more than one sound', p: 'Sindarin and Quenya use some letters differently. The app shows each letter’s sound in both, so you always know which you are reading.' },
        ],
      },
      {
        id: 't-short', title: 'Short stems', letters: ['numen', 'malta', 'noldo', 'nwalme', 'ore', 'vala', 'anna', 'vilya'],
        teach: [
          { h: 'Stems that shrink', p: 'Cut the stem short and the sound is a nasal (two bows: n, m, ng, nw) or a soft sound (one bow: r, v, y, w).' },
        ],
      },
      {
        id: 't-extra', title: 'The other letters', letters: ['romen', 'lambe', 'silme', 'silmeNuquerna', 'hyarmen', 'arda', 'alda', 'esse', 'hwestaSindarinwa', 'yanta', 'ure'],
        teach: [
          { h: 'Outside the table', p: 'A few letters stand outside the four columns: rómen and órë are both r (rómen before a vowel), lambë is l, silmë is s and hyarmen is h.' },
          { h: 'Turned over', p: 'Silmë is tall, so when a vowel sign has to sit on it, it is written upside down: silmë nuquerna, “silmë turned over”. Essë turns over the same way.' },
        ],
      },
    ],
  },
  {
    unit: 'Vowel signs',
    lessons: [
      {
        id: 't-tehtar', title: 'The five vowel signs', marks: ['a', 'e', 'i', 'o', 'u'], letters: ['shortCarrier', 'longCarrier'],
        teach: [
          { h: 'Vowels are marks', p: 'In these modes a vowel is not a letter but a small sign written over one, a tehta: three dots for a, an acute for e, a dot for i, a curl one way for o and the other way for u.' },
          { h: 'The carriers', p: 'When there is no consonant for a vowel to sit on, it goes on a carrier: a short stem for a short vowel, a tall one for a long vowel.' },
        ],
      },
      {
        id: 't-where', title: 'Where the signs go', marks: ['y', 'nasal', 'double'],
        words: [['elen', 'star', 'Q'], ['alda', 'tree', 'Q'], ['mellon', 'friend', 'S'], ['aran', 'king', 'S']],
        teach: [
          { h: 'Before or after', p: 'In Quenya a vowel sign sits on the consonant before it: in elen, the e after l sits on lambë. In Sindarin it sits on the consonant after it: in mellon, the e before ll sits on lambë.' },
          { h: 'Bars', p: 'A bar below a letter doubles it (the ll of mellon). A bar above shows an n or m before it.' },
        ],
      },
    ],
  },
  {
    unit: 'Sindarin',
    lessons: [
      {
        id: 't-s1', title: 'Sindarin words', words: [['mellon', 'friend', 'S'], ['aran', 'king', 'S'], ['calad', 'light', 'S'], ['edhel', 'elf', 'S'], ['Ithil', 'moon', 'S'], ['sîr', 'river', 'S'], ['gil', 'star', 'S'], ['cor', 'ring', 'S']],
        teach: [{ h: 'Spelling Sindarin', p: 'Sindarin is written as it sounds. Remember: each vowel sign sits on the consonant after it, and a vowel at the end of a word goes on a carrier.' }],
      },
      {
        id: 't-s2', title: 'More Sindarin', words: [['galadh', 'tree', 'S'], ['annon', 'gate', 'S'], ['barad', 'tower', 'S'], ['lass', 'leaf', 'S'], ['megil', 'sword', 'S'], ['estel', 'hope', 'S'], ['taur', 'forest', 'S'], ['amon', 'hill', 'S']],
        teach: [{ h: 'Two letters as one', p: 'dh is anto and ch is harma, one letter each. A doubled letter takes a bar below. In taur the u after a is written with úrë.' }],
      },
      {
        id: 't-s3', title: 'Sindarin lines', words: [['Mae govannen', 'well met', 'S'], ['Pedo mellon a minno', 'speak, friend, and enter', 'S'], ['Le melin', 'I love you', 'S'], ['Lacho calad! Drego morn!', 'flame light! flee night!', 'S'], ['A Elbereth Gilthoniel', 'O Elbereth Star-kindler', 'S']],
        teach: [{ h: 'Whole lines', p: 'These are lines you know from the Sindarin course. Read them word by word; the punctuation is Tolkien’s own dots.' }],
      },
    ],
  },
  {
    unit: 'Quenya',
    lessons: [
      {
        id: 't-q1', title: 'Quenya words', words: [['elen', 'star', 'Q'], ['alda', 'tree', 'Q'], ['lómë', 'night', 'Q'], ['Isil', 'moon', 'Q'], ['Anar', 'sun', 'Q'], ['Elda', 'elf', 'Q'], ['aran', 'king', 'Q'], ['tári', 'queen', 'Q']],
        teach: [{ h: 'Spelling Quenya', p: 'In Quenya each vowel sign sits on the consonant before it. A long vowel (á, ó) sits on the long carrier.' }],
      },
      {
        id: 't-q2', title: 'More Quenya', words: [['lassë', 'leaf', 'Q'], ['macil', 'sword', 'Q'], ['corma', 'ring', 'Q'], ['ondo', 'stone', 'Q'], ['lúmë', 'hour', 'Q'], ['mára', 'good', 'Q'], ['calima', 'bright', 'Q'], ['meldo', 'friend', 'Q']],
        teach: [{ h: 'nd, mb, ld', p: 'Quenya’s nd is ando, mb is umbar and ld is alda: one letter for two sounds.' }],
      },
      {
        id: 't-q3', title: 'Quenya lines', words: [['Elen síla lúmenn’ omentielvo', 'a star shines on the hour of our meeting', 'Q'], ['Namárië!', 'farewell!', 'Q'], ['Aiya Eärendil Elenion Ancalima!', 'hail Eärendil, brightest of stars!', 'Q'], ['Auta i lómë!', 'the night is passing!', 'Q']],
        teach: [{ h: 'Tolkien’s lines', p: 'Lines Tolkien wrote in Quenya. Look for the long carrier in síla and lúmenn, and rómen in Namárië.' }],
      },
    ],
  },
  {
    unit: 'English',
    lessons: [
      {
        id: 't-e1', title: 'English letters', words: [['march', 'march', 'E'], ['west', 'west', 'E'], ['happy', 'happy', 'E'], ['ring', 'ring', 'E'], ['return', 'return', 'E'], ['wish', 'wish', 'E'], ['just', 'just', 'E'], ['there', 'there', 'E']],
        teach: [
          { h: 'Spelling, not sound', p: 'Tolkien wrote English in Tengwar letter by letter, following the spelling. Some letters change job: calma is ch, quessë is k and c, anga is j, ungwë is g, harma is sh and nwalmë is ng.' },
          { h: 'Signs on the next letter', p: 'As in Sindarin, a vowel sign sits on the letter after it. A silent e at the end is a dot below the letter before it, and th in “this” or “there” is anto.' },
        ],
      },
      {
        id: 't-e2', title: 'Shorthands', words: [['the', 'the', 'E'], ['of', 'of', 'E'], ['and', 'and', 'E'], ['of the', 'of the', 'E'], ['the lord of the rings', 'the lord of the rings', 'E'], ['want', 'want', 'E']],
        teach: [{ h: 'Tolkien’s shortcuts', p: 'Tolkien wrote “the” as ando with a stem reaching up and down, “of” as umbar the same way, and “of the” as “of” with a bar below. “And” is ando with a bar above.' }],
      },
      {
        id: 't-e3', title: 'Write your name', name: true, words: [['Frodo', 'Frodo', 'E'], ['Samwise', 'Samwise', 'E'], ['Bilbo', 'Bilbo', 'E'], ['Gandalf', 'Gandalf', 'E'], ['Aragorn', 'Aragorn', 'E'], ['Tolkien', 'Tolkien', 'E']],
        teach: [{ h: 'Names in Tengwar', p: 'Names are spelt like any English word. Practise on these, then see your own name, and save it as a picture if you like.' }],
      },
    ],
  },
  {
    unit: 'Beyond the letters',
    lessons: [
      {
        id: 't-punct', title: 'Punctuation', punctuation: true,
        words: [['Daro!', 'stop!', 'S'], ['Noro lim, noro lim, Asfaloth!', 'run swift, run swift, Asfaloth!', 'S']],
        teach: [{ h: 'Dots for pauses', p: 'Tolkien marked pauses with dots: one dot (pusta) for a short pause, two for a full stop. His exclamation and question marks have their own shapes.' }],
      },
      {
        id: 't-numbers', title: 'Numbers', numbers: true,
        teach: [
          { h: 'Backwards, and by twelves', p: 'Tengwar numbers are written with the smallest digit first: 1954 is written 4, 5, 9, 1. The Elves counted in twelves, so Tolkien marked which base a number uses. Here, as in Tecendil’s handbook, a dot over each digit means base ten.' },
        ],
      },
      {
        id: 't-read', title: 'Reading Tolkien’s lines', words: [['Annon edhellen, edro hi ammen!', 'Elvish gate, open now for us!', 'S'], ['Namárië! Nai hiruvalyë Valimar.', 'farewell! may you find Valimar', 'Q'], ['Et Eärello Endorenna utúlien.', 'out of the Great Sea to Middle-earth I am come', 'Q'], ['Ai! laurië lantar lassi súrinen', 'ah! like gold fall the leaves in the wind', 'Q']],
        teach: [
          { h: 'As Tolkien wrote them', p: 'These lines are Tolkien’s. Read them in Tengwar. On the Doors of Durin the Sindarin was written in the Mode of Beleriand, with vowels as letters; here it is in the general mode you have learned.' },
        ],
      },
    ],
  },
]
