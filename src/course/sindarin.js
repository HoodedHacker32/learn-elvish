// The Sindarin course: the language the Elves speak in The Lord of the Rings.
// words: [Elvish, English]. Each must be in the translator's lexicon, which supplies its status and source.
// lines: [Elvish, English]. Each must be exactly what the translator writes for that English, rated
//   Tolkien's own, built from his words, or (for everyday expressions) clearly marked fan-made.
// tests/course.test.js checks every one of them.

export const SINDARIN_COURSE = [
  {
    unit: 'Sounds and greetings',
    lessons: [
      {
        id: 's-sounds',
        title: 'How Sindarin sounds',
        teach: [
          { h: 'Say every letter', p: 'Sindarin is spelled the way it sounds. The vowels are pure, as in Italian: a is “ah”, e is “eh”, i is “ee”, o is “oh”, u is “oo”. An e at the end of a word is always spoken.', ex: [['mellon', 'friend'], ['aran', 'king']] },
          { h: 'Four letters to watch', p: 'c is always “k”. ch is the rough sound at the end of Scottish “loch”, never “church”. dh is the “th” in “this”. th is the “th” in “thin”. Tap or roll every r.', ex: [['calad', 'light'], ['roch', 'horse'], ['edhel', 'elf'], ['Ithil', 'moon']] },
          { h: 'A mark means long', p: 'A vowel with a mark (â, î, ô, û, í) is held a little longer. It is the same vowel, just slower.', ex: [['sîr', 'river']] },
          { h: 'Where the weight goes', p: 'Two-syllable words are stressed on the first syllable. In the pronunciation guide the stressed part is in CAPITALS.', ex: [['mellon', 'friend']] },
        ],
        words: [['mellon', 'friend'], ['aran', 'king'], ['calad', 'light'], ['roch', 'horse'], ['edhel', 'elf'], ['Ithil', 'moon'], ['sîr', 'river']],
      },
      {
        id: 's-greet',
        title: 'Greetings',
        teach: [
          { h: 'Elves greet with a wish', p: 'Tolkien’s Elves do not say “hello”. When Glorfindel meets Aragorn he says mae govannen, “well met”. Suilad, Tolkien’s word for “a greeting”, is used today as a friendly hello.', ex: [['Mae govannen', 'well met'], ['Suilad!', 'greeting! (hello)']] },
          { h: 'Some greetings are fan-made', p: 'Tolkien left no Sindarin “goodbye” or “thank you”. Fans fill the gap with navaer (“be well”) and le hannon (“I thank you”, from the films). This app always tells you when a word is not Tolkien’s.', ex: [['Navaer!', 'be well (goodbye)'], ['Le hannon', 'I thank you']] },
          { h: 'The door of Moria', p: 'The most famous Sindarin words are written over the door of Moria: pedo mellon a minno, “speak, friend, and enter”.', ex: [['Pedo mellon a minno', 'speak, friend, and enter']] },
        ],
        lines: [['Mae govannen', 'well met'], ['Suilad!', 'hello'], ['Mellon nín', 'my friend'], ['Navaer!', 'goodbye'], ['Le hannon', 'thank you'], ['Pedo mellon a minno', 'speak, friend, and enter']],
      },
    ],
  },
  {
    unit: 'Naming things',
    lessons: [
      {
        id: 's-people',
        title: 'People',
        teach: [
          { h: 'No word for “a”', p: 'Sindarin has no word for “a” or “an”. Aran means “king” and also “a king”.', ex: [['aran', 'a king']] },
          { h: 'Elves, Men and Orcs', p: 'Edhel is an Elf, adan is one of Men (a human), orch is an Orc. You will meet them all again in their plural forms.', ex: [['edhel', 'elf'], ['adan', 'man (human)'], ['orch', 'orc']] },
        ],
        words: [['adan', 'man (human)'], ['hîr', 'lord'], ['ion', 'son'], ['iell', 'daughter'], ['adar', 'father'], ['orch', 'orc']],
      },
      {
        id: 's-world',
        title: 'The world',
        teach: [
          { h: 'Words in the map', p: 'Many names in Middle-earth are plain Sindarin words. Amon Hen is “hill of the eye”; Barad-dûr is “dark tower”; Annon is a gate.', ex: [['amon', 'hill'], ['barad', 'tower'], ['annon', 'gate']] },
          { h: 'Sun and stars', p: 'Anor is the sun and gil a star. The moon, Ithil, you already know.', ex: [['Anor', 'sun'], ['gil', 'star']] },
        ],
        words: [['galadh', 'tree'], ['gil', 'star'], ['Anor', 'sun'], ['taur', 'forest'], ['amon', 'hill'], ['nen', 'water'], ['annon', 'gate'], ['barad', 'tower'], ['orod', 'mountain'], ['lass', 'leaf']],
      },
      {
        id: 's-things',
        title: 'Things you carry',
        teach: [
          { h: 'Hope', p: 'Estel means “hope”. It is also the name Aragorn was given as a boy in Rivendell.', ex: [['estel', 'hope']] },
        ],
        words: [['cor', 'ring'], ['megil', 'sword'], ['bas', 'bread'], ['estel', 'hope'], ['eneth', 'name'], ['lam', 'tongue, language']],
      },
    ],
  },
  {
    unit: 'The, and more than one',
    lessons: [
      {
        id: 's-the',
        title: 'The word for “the”',
        teach: [
          { h: 'i means “the”', p: 'Put i before a word to say “the”: i aran, “the king”. Words starting with a vowel do not change.', ex: [['I aran', 'the king'], ['I edhel', 'the elf']] },
          { h: 'i softens the next sound', p: 'After i, a hard first sound goes soft: c becomes g (cor → i gor), m becomes v (megil → i vegil), and g disappears (galadh → i ’aladh). Linguists call this lenition; this course calls it softening.', ex: [['I gor', 'the ring'], ['I vegil', 'the sword'], ['I ’aladh', 'the tree']] },
        ],
        lines: [['I aran', 'the king'], ['I gor', 'the ring'], ['I ’aladh', 'the tree'], ['I vegil', 'the sword'], ['I roch', 'the horse'], ['I ’il', 'the star']],
      },
      {
        id: 's-plural',
        title: 'Many: change the vowels',
        teach: [
          { h: 'No -s, change the vowels', p: 'Sindarin makes plurals by changing the vowels inside the word: a becomes e (or ai at the end), o becomes y, e becomes i. You know some already from the map: the Edain are Men, the Emyn Muil are hills, the Ennyn Durin are the doors of Durin.', ex: [['aran → erain', 'king → kings'], ['orch → yrch', 'orc → orcs'], ['edhel → edhil', 'elf → elves']] },
        ],
        lines: [['Erain', 'kings'], ['Edhil', 'elves'], ['Yrch', 'orcs'], ['Gelaidh', 'trees'], ['Emyn', 'hills'], ['Gîl', 'stars']],
        drill: { ask: 'Make it plural', pairs: [['aran', 'erain', 'king'], ['edhel', 'edhil', 'elf'], ['orch', 'yrch', 'orc'], ['galadh', 'gelaidh', 'tree'], ['amon', 'emyn', 'hill'], ['annon', 'ennyn', 'gate'], ['gil', 'gîl', 'star']] },
      },
      {
        id: 's-the-plural',
        title: '“The” for many',
        teach: [
          { h: 'in for plurals', p: 'For “the” with a plural, Sindarin uses in: in edhil, “the elves”. Before some sounds the n melts into the next word: i ngîl, “the stars”; i ngelaidh, “the trees”.', ex: [['In edhil', 'the elves'], ['I ngîl', 'the stars']] },
        ],
        lines: [['In edhil', 'the elves'], ['In erain', 'the kings'], ['In yrch', 'the orcs'], ['I ngîl', 'the stars'], ['I ngelaidh', 'the trees'], ['In ennyn', 'the gates']],
      },
    ],
  },
  {
    unit: 'Describing',
    lessons: [
      {
        id: 's-adj',
        title: 'Describing words',
        teach: [
          { h: 'The description comes after', p: 'Sindarin puts the describing word after the thing: mellon maer, “a good friend” (literally “friend good”).', ex: [['Mellon maer', 'a good friend']] },
          { h: 'No word for “is”', p: 'Sindarin usually leaves out “is” and “are”. I aran maer can mean “the good king” or “the king is good”.', ex: [['I aran maer', 'the king is good']] },
        ],
        words: [['maer', 'good'], ['morn', 'dark'], ['calen', 'green'], ['lim', 'swift'], ['beleg', 'great'], ['dû', 'night']],
        lines: [['Mellon maer', 'a good friend'], ['I amon calen', 'the green hill'], ['I roch lim', 'the swift horse'], ['I dhû morn', 'the night is dark'], ['I aran maer', 'the king is good']],
      },
      {
        id: 's-my',
        title: 'My and your',
        teach: [
          { h: 'nín and lín follow the word', p: 'Nín means “my” and lín means “your”. Like describing words, they come after: mellon nín, “my friend”.', ex: [['Mellon nín', 'my friend'], ['Megil lín', 'your sword']] },
          { h: 'Saying your name', p: 'Eneth nín means “my name”. Add your name after it, with no word for “is”.', ex: [['Eneth nín Aragorn', 'my name is Aragorn']] },
        ],
        words: [['nín', 'my'], ['lín', 'your']],
        lines: [['Mellon nín', 'my friend'], ['Eneth nín', 'my name'], ['Megil lín', 'your sword'], ['Roch nín', 'my horse'], ['Mellon lín', 'your friend'], ['Eneth nín Aragorn', 'my name is Aragorn']],
      },
    ],
  },
  {
    unit: 'Doing things',
    lessons: [
      {
        id: 's-verbs',
        title: 'I do: the -in ending',
        teach: [
          { h: 'Add -in for “I”', p: 'Put -in on a verb to say “I”: ped- “speak” gives pedin, “I speak”. No separate word for “I” is needed.', ex: [['Pedin', 'I speak'], ['Cenin', 'I see']] },
          { h: 'Verbs ending in -a take -on', p: 'Linna- “sing” gives linnon, “I sing”. Minna- “enter” gives minnon.', ex: [['Linnon', 'I sing']] },
        ],
        words: [['ped', 'speak'], ['cen', 'see'], ['linna', 'sing'], ['tir', 'look'], ['minna', 'enter'], ['mel', 'love']],
        lines: [['Pedin', 'I speak'], ['Cenin', 'I see'], ['Linnon', 'I sing'], ['Tirin', 'I look'], ['Minnon', 'I enter'], ['Cenin i ngîl', 'I see the stars'], ['Cenin i aran', 'I see the king']],
      },
      {
        id: 's-love',
        title: 'I love you',
        teach: [
          { h: '“You” goes first', p: 'When “you” is the one being loved or seen, le goes before the verb: le melin, “I love you” (literally “you I-love”). Tolkien wrote the same order in le linnathon, “to you I will sing”.', ex: [['Le melin', 'I love you']] },
        ],
        lines: [['Le melin', 'I love you'], ['Melin i ngîl', 'I love the stars']],
      },
      {
        id: 's-commands',
        title: 'Commands',
        teach: [
          { h: 'Add -o to command', p: 'A command ends in -o: pedo, “speak!”; minno, “enter!”; noro, “run!”. Tolkien wrote all three.', ex: [['Pedo', 'speak!'], ['Noro', 'run!']] },
          { h: 'Don’t: avo', p: 'Put avo before a command to say “don’t”. It softens the next sound: drego “flee!” becomes avo dhrego, “don’t flee!”.', ex: [['Avo dhrego', 'do not flee']] },
        ],
        words: [['nor', 'run'], ['drega', 'flee']],
        lines: [['Pedo', 'speak'], ['Minno', 'enter'], ['Tiro', 'look'], ['Noro', 'run'], ['Drego', 'flee'], ['Daro!', 'stop'], ['Avo dhrego', 'do not flee'], ['Tiro na i ngîl', 'look at the stars']],
      },
    ],
  },
  {
    unit: 'Time and not',
    lessons: [
      {
        id: 's-future',
        title: 'Will: the -tha ending',
        teach: [
          { h: 'Will = -tha', p: 'For the future, add -tha before the person ending: linna- “sing” becomes linnathon, “I will sing”. Tolkien wrote linnathon in his hymn to Elbereth.', ex: [['Linnathon', 'I will sing']] },
        ],
        lines: [['Linnathon', 'I will sing'], ['Tolithon', 'I will come'], ['Le cenithon', 'I will see you'], ['Linnathon na i Ithil', 'I will sing to the moon']],
      },
      {
        id: 's-not',
        title: 'Not: ú-',
        teach: [
          { h: 'ú- means not', p: 'Put ú- in front of a verb to say “not”. It softens the next sound: pedin “I speak” becomes ú-bedin, “I do not speak”.', ex: [['Ú-bedin', 'I do not speak'], ['Ú-linnathon', 'I will not sing']] },
        ],
        lines: [['Ú-bedin', 'I do not speak'], ['Ú-genin i aran', 'I do not see the king'], ['Ú-linnathon', 'I will not sing']],
      },
      {
        id: 's-have',
        title: 'Have and have not',
        teach: [
          { h: 'sevin, “I have”', p: 'Tolkien wrote sevin, “I have”, in his notes of 1959.', ex: [['Sevin cor', 'I have a ring']] },
          { h: 'To lack', p: 'For “have no”, Tolkien used a different verb, pen- “to lack”: penim vast, “we have no bread” (literally “we lack bread”). The object is softened: bas becomes vast.', ex: [['Penim vast', 'we have no bread']] },
        ],
        lines: [['Sevin cor', 'I have a ring'], ['Sevin megil', 'I have a sword'], ['Sevin estel', 'I have hope'], ['Penim vast', 'we have no bread']],
      },
    ],
  },
  {
    unit: 'Tolkien’s own words',
    lessons: [
      {
        id: 's-tolkien-1',
        title: 'At the door and on the road',
        teach: [
          { h: 'Reading real lines', p: 'Every line in this lesson is Tolkien’s. Read each one word by word, then rebuild it from memory.', ex: [] },
        ],
        canon: ['Mae govannen', 'Pedo mellon a minno', 'Daro!', 'Noro lim, noro lim, Asfaloth!', 'Lacho calad! Drego morn!'],
      },
      {
        id: 's-tolkien-2',
        title: 'Songs and cries',
        teach: [
          { h: 'The great moments', p: 'These lines come from songs, battles and the crowning of a king.', ex: [] },
        ],
        canon: ['A Elbereth Gilthoniel', 'Annon edhellen, edro hi ammen!', 'Naur an edraith ammen!', 'Cuio i Pheriain anann!', 'Ónen i-Estel Edain, ú-chebin estel anim.'],
      },
    ],
  },
]
