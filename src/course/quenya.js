// The Quenya course: the ancient high tongue of the Elves, Tolkien's most complete language.
// Same format and the same checks as the Sindarin course.

export const QUENYA_COURSE = [
  {
    unit: 'Sounds and greetings',
    lessons: [
      {
        id: 'q-sounds',
        title: 'How Quenya sounds',
        teach: [
          { h: 'Pure vowels, every letter spoken', p: 'As in Sindarin, a is “ah”, e is “eh”, i is “ee”, o is “oh”, u is “oo”. The dots in ë only remind you to say the final e: lómë is “LOH-meh”.', ex: [['lómë', 'night'], ['aurë', 'day']] },
          { h: 'c and qu', p: 'c is always “k”: cirya, “ship”, is “KIR-yah”. qu is “kw”, as in Quenya itself.', ex: [['cirya', 'ship']] },
          { h: 'Where the weight goes', p: 'Two-syllable words are stressed first. In longer words the stress sits on the second-to-last syllable when it is long (a long vowel, or two consonants after it), and otherwise on the one before.', ex: [['alda', 'tree'], ['calima', 'bright']] },
        ],
        words: [['elen', 'star'], ['alda', 'tree'], ['lómë', 'night'], ['aurë', 'day'], ['cirya', 'ship'], ['Isil', 'moon'], ['Anar', 'sun']],
      },
      {
        id: 'q-greet',
        title: 'Greetings',
        teach: [
          { h: 'Hail and farewell', p: 'Aiya means “hail!”, as in Frodo’s cry aiya Eärendil. Namárië, “be well”, is Galadriel’s farewell.', ex: [['Aiya!', 'hail! (hello)'], ['Namárië!', 'be well (goodbye)']] },
          { h: 'A star on our meeting', p: 'When Frodo meets Gildor’s Elves he greets them with elen síla lúmenn’ omentielvo, “a star shines on the hour of our meeting”.', ex: [['Elen síla lúmenn’ omentielvo', 'a star shines on the hour of our meeting']] },
          { h: 'Please and thank you', p: 'Mecin, “please”, is Tolkien’s own. Hantanyel, “I thank you”, is fan-made: Tolkien wrote only hantalë, “thanksgiving”.', ex: [['Mecin', 'please'], ['Hantanyel', 'I thank you']] },
          { h: '“How are you?”', p: 'Tolkien never wrote it. He did ask questions with manen, “how”, and fans say manen nalyë?, but the closest greeting he wrote himself is á na márië!, “be well!”.', ex: [['Á na márië!', 'be well!']] },
        ],
        lines: [['Aiya!', 'hello'], ['Namárië!', 'goodbye'], ['Elen síla lúmenn’ omentielvo', 'a star shines on the hour of our meeting'], ['Mecin', 'please'], ['Hantanyel', 'thank you'], ['Alla!', 'welcome'], ['Á na márië!', 'how are you']],
      },
    ],
  },
  {
    unit: 'Naming things',
    lessons: [
      {
        id: 'q-nouns',
        title: 'People and things',
        teach: [
          { h: 'No word for “a”', p: 'Like Sindarin, Quenya has no word for “a”. Elda means “Elf” or “an Elf”.', ex: [['Elda', 'elf']] },
        ],
        words: [['Elda', 'elf'], ['aran', 'king'], ['tári', 'queen'], ['meldo', 'friend'], ['atar', 'father'], ['amil', 'mother'], ['hína', 'child']],
      },
      {
        id: 'q-things',
        title: 'The world and what you carry',
        teach: [
          { h: 'Words you know from the songs', p: 'Lassë is a leaf, as in laurië lantar lassi, “like gold fall the leaves”.', ex: [['lassë', 'leaf']] },
        ],
        words: [['lassë', 'leaf'], ['macil', 'sword'], ['rocco', 'horse'], ['massa', 'bread'], ['corma', 'ring'], ['ondo', 'stone'], ['lúmë', 'hour']],
      },
      {
        id: 'q-plural',
        title: 'Many: -r and -i',
        teach: [
          { h: 'Two plural endings', p: 'A word ending in a vowel adds -r: alda → aldar, Elda → Eldar. A word ending in -ë or a consonant takes -i instead: lassë → lassi, elen → eleni.', ex: [['aldar', 'trees'], ['lassi', 'leaves'], ['eleni', 'stars']] },
        ],
        lines: [['Aldar', 'trees'], ['Eleni', 'stars'], ['Lassi', 'leaves'], ['Eldar', 'elves'], ['Ciryar', 'ships'], ['Arani', 'kings'], ['Macili', 'swords'], ['Roccor', 'horses']],
        drill: { ask: 'Make it plural', pairs: [['alda', 'aldar', 'tree'], ['elen', 'eleni', 'star'], ['lassë', 'lassi', 'leaf'], ['cirya', 'ciryar', 'ship'], ['aran', 'arani', 'king'], ['macil', 'macili', 'sword'], ['rocco', 'roccor', 'horse']] },
      },
      {
        id: 'q-the',
        title: 'The word for “the”',
        teach: [
          { h: 'i, with no changes', p: 'I means “the” for one or many, and nothing after it changes: i alda, “the tree”; i eleni, “the stars”.', ex: [['I alda', 'the tree'], ['I eleni', 'the stars']] },
        ],
        lines: [['I alda', 'the tree'], ['I elen', 'the star'], ['I eleni', 'the stars'], ['I Eldar', 'the elves'], ['I lassi', 'the leaves']],
      },
    ],
  },
  {
    unit: 'Describing',
    lessons: [
      {
        id: 'q-adj',
        title: 'Describing words',
        teach: [
          { h: 'Before the noun', p: 'Quenya usually puts the describing word first, as in Tolkien’s enwina lúmë, “the old darkness”.', ex: [['Enwina lúmë', 'the old darkness'], ['I calima elen', 'the bright star']] },
          { h: 'Plural descriptions change too', p: 'With a plural, -a becomes -ë and -ëa becomes -ië: laurëa “golden” becomes laurië, as in laurië lassi, “golden leaves”.', ex: [['Laurië lassi', 'golden leaves']] },
        ],
        words: [['mára', 'good'], ['calima', 'bright'], ['morë', 'dark'], ['tára', 'tall'], ['laurëa', 'golden'], ['saila', 'wise']],
        lines: [['I calima elen', 'the bright star'], ['Túra cirya', 'a great ship'], ['Laurië lassi', 'golden leaves'], ['Enwina lúmë', 'the old darkness']],
      },
      {
        id: 'q-is',
        title: 'Is and are: ná and nar',
        teach: [
          { h: 'ná and nar', p: 'Unlike Sindarin, Quenya says “is” out loud: ná for one, nar for many. A description after nar is plural too.', ex: [['I alda ná tára', 'the tree is tall'], ['I eleni nar calimë', 'the stars are bright']] },
        ],
        lines: [['I alda ná tára', 'the tree is tall'], ['I lómë ná morë', 'the night is dark'], ['I eleni nar calimë', 'the stars are bright'], ['I Eldar nar sailë', 'the elves are wise'], ['I Anar ná laurëa', 'the sun is golden']],
      },
    ],
  },
  {
    unit: 'Whose and where',
    lessons: [
      {
        id: 'q-mine',
        title: 'My, your, our',
        teach: [
          { h: 'Endings, not words', p: 'Quenya says “my” with an ending: -nya. Your is -lya, our is -lva, his or her is -rya. After a consonant an i joins them: macil → macilinya.', ex: [['Meldonya', 'my friend'], ['Cormalya', 'your ring']] },
          { h: 'Saying your name', p: 'Essenya ná …, “my name is …”.', ex: [['Essenya ná Aragorn', 'my name is Aragorn']] },
        ],
        lines: [['Meldonya', 'my friend'], ['Macilinya', 'my sword'], ['Cormalya', 'your ring'], ['Atarinya', 'my father'], ['Esselya', 'your name'], ['Aranelva', 'our king'], ['Essenya ná Aragorn', 'my name is Aragorn']],
      },
      {
        id: 'q-of',
        title: 'Of, to and from',
        teach: [
          { h: 'Of: -o and -ion', p: 'Quenya marks “of” with an ending. For many, -ion: elenion, “of stars”, as in aiya Eärendil elenion ancalima.', ex: [['Elenion', 'of the stars'], ['I aran Eldaron', 'the king of elves']] },
          { h: 'To and from: -nna and -llo', p: 'Tolkien wrote Endorenna, “to Middle-earth”, and Rómello, “from the east”. -nna means “to”, -llo means “from”.', ex: [['Endorenna', 'to Middle-earth'], ['Rómello', 'from the east']] },
        ],
        lines: [['Elenion', 'of the stars'], ['I aran Eldaron', 'the king of elves'], ['I cala elenion', 'the light of the stars']],
      },
    ],
  },
  {
    unit: 'Doing things',
    lessons: [
      {
        id: 'q-verbs',
        title: 'I, you, we, they',
        teach: [
          { h: 'Person endings', p: 'Quenya puts the person on the end of the verb: -n “I”, -lyë “you”, -lmë “we”, -ntë “they”. Linda- “sing” gives lindan, “I sing”.', ex: [['Lindan', 'I sing'], ['Lindalyë', 'you sing'], ['Lindalmë', 'we sing']] },
          { h: 'Many doers: -r', p: 'With a plural subject the verb takes -r: i Eldar lindar, “the elves sing”.', ex: [['I Eldar lindar', 'the elves sing']] },
        ],
        words: [['linda', 'sing'], ['cen', 'see'], ['quet', 'speak'], ['lanta', 'fall']],
        lines: [['Lindan', 'I sing'], ['Cenin', 'I see'], ['Quetin', 'I speak'], ['Melinyel', 'I love you'], ['Lindalyë', 'you sing'], ['Lindalmë', 'we sing'], ['Lindantë', 'they sing'], ['I Eldar lindar', 'the elves sing'], ['I lassi lantar', 'the leaves fall']],
      },
      {
        id: 'q-time',
        title: 'Will, did, not',
        teach: [
          { h: 'Will: -uva', p: 'The future adds -uva: hiruva, “will find”, as in Galadriel’s nai hiruvalyë Valimar, “may you find Valimar”.', ex: [['Hiruvalyë Valimar', 'you will find Valimar'], ['Linduvan', 'I will sing']] },
          { h: 'Did: -në and changed stems', p: 'The past often adds -në, or changes the stem: cen- “see” becomes cennen, “I saw”.', ex: [['Cennen i aran', 'I saw the king']] },
          { h: 'Not: lá', p: 'Lá before the verb means “not”: lá cenin, “I do not see”.', ex: [['Lá cenin', 'I do not see']] },
        ],
        lines: [['Linduvan', 'I will sing'], ['Hiruvalyë Valimar', 'you will find Valimar'], ['Lindanen', 'I sang'], ['Cennen i aran', 'I saw the king'], ['Lá cenin', 'I do not see']],
      },
      {
        id: 'q-can-have',
        title: 'Can, have, like',
        teach: [
          { h: 'Can: pol-', p: 'Tolkien wrote polin quetë, “I can speak”.', ex: [['Polin quetë', 'I can speak']] },
          { h: 'Have: harya-', p: 'Harya- means “to have, possess”: haryan macil, “I have a sword”.', ex: [['Haryan macil', 'I have a sword']] },
          { h: 'Like: “it is good to me”', p: 'Tolkien’s finished Quenya has no verb “to like” (in the 1930s he noted one, tyaz-, but left no forms of it). He wrote nás mára nin, literally “it is good to me”.', ex: [['Nás mára nin', 'I like it'], ['Massa ná mára nin', 'I like bread']] },
        ],
        lines: [['Polin quetë', 'I can speak'], ['Haryan macil', 'I have a sword'], ['Nás mára nin', 'I like it'], ['Massa ná mára nin', 'I like bread']],
      },
    ],
  },
  {
    unit: 'Tolkien’s own words',
    lessons: [
      {
        id: 'q-tolkien-1',
        title: 'Galadriel’s farewell',
        teach: [
          { h: 'Reading real lines', p: 'Every line in this lesson is Tolkien’s. Read each one word by word, then rebuild it from memory.', ex: [] },
        ],
        canon: ['Namárië! Nai hiruvalyë Valimar.', 'Ai! laurië lantar lassi súrinen', 'Elen síla lúmenn’ omentielvo', 'Aiya Eärendil Elenion Ancalima!'],
      },
      {
        id: 'q-tolkien-2',
        title: 'Kings and battles',
        teach: [
          { h: 'The great moments', p: 'Elendil’s words on reaching Middle-earth, which Aragorn repeats at his crowning, and the cries before the Battle of Unnumbered Tears.', ex: [] },
        ],
        canon: ['Et Eärello Endorenna utúlien.', 'Utúlie’n aurë!', 'Auta i lómë!', 'A vanimar, vanimálion nostari!'],
      },
    ],
  },
]
