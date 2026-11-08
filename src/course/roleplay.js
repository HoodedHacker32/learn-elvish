// The Roleplay phrasebook: lines an Elf character can use at the table straight away. Mostly Sindarin (the
// Elvish spoken in Middle-earth), with a few solemn Quenya lines marked as such. Same checks as the main courses:
// every line is Tolkien's own or exactly what the translator builds, honestly labelled.
// lines: [Elvish, English, language if not Sindarin]

export const ROLEPLAY_COURSE = [
  {
    unit: 'Meeting and parting',
    lessons: [
      {
        id: 'r-meet',
        title: 'Greeting travellers',
        teach: [
          { h: 'How an Elf greets', p: 'Glorfindel greets Aragorn with mae govannen, “well met”. To a friend, mellon nín, “my friend”. Suilad, Tolkien’s word “greeting”, works as a warm hello.', ex: [['Mae govannen', 'well met'], ['Mellon nín', 'my friend']] },
          { h: 'For a grand entrance', p: 'High Elves of old greet in Quenya. Frodo uses the most famous greeting of all to hail Gildor’s company.', ex: [['Elen síla lúmenn’ omentielvo', 'a star shines on the hour of our meeting']] },
        ],
        lines: [['Mae govannen', 'well met'], ['Suilad!', 'hello'], ['Mellon nín', 'my friend'], ['Elen síla lúmenn’ omentielvo', 'a star shines on the hour of our meeting', 'Q']],
      },
      {
        id: 'r-names',
        title: 'Saying who you are',
        teach: [
          { h: 'Your name', p: 'Eneth nín means “my name”; put your character’s name after it. Im edhel, “I am an Elf”, needs no word for “am”: Sindarin leaves it out.', ex: [['Eneth nín Legolas', 'my name is Legolas'], ['Im edhel', 'I am an elf']] },
        ],
        lines: [['Eneth nín Legolas', 'my name is Legolas'], ['Im edhel', 'I am an elf'], ['Sevin megil', 'I have a sword']],
      },
      {
        id: 'r-part',
        title: 'Farewells',
        teach: [
          { h: 'Saying goodbye', p: 'Galadriel’s farewell is Quenya: namárië, “be well”. Tolkien left no Sindarin goodbye; players use the fan-made navaer, “be well”, and this app labels it so.', ex: [['Namárië!', 'be well (farewell)'], ['Navaer!', 'be well (goodbye)']] },
        ],
        lines: [['Namárië!', 'farewell', 'Q'], ['Navaer!', 'goodbye'], ['Le hannon', 'thank you']],
      },
    ],
  },
  {
    unit: 'On the road',
    lessons: [
      {
        id: 'r-road',
        title: 'Warnings and orders',
        teach: [
          { h: 'Short and sharp', p: 'Haldir’s Elves stop the Fellowship in Lothlórien with a single word, daro!, “stop!”. Glorfindel urges his horse on with noro lim, “run fast”.', ex: [['Daro!', 'stop!'], ['Noro lim, noro lim, Asfaloth!', 'run fast, run fast, Asfaloth!']] },
        ],
        lines: [['Daro!', 'stop'], ['Tiro', 'look'], ['Tolo', 'come'], ['Aphado nin', 'follow me'], ['Avo dhrego', 'do not flee'], ['Noro lim, noro lim, Asfaloth!', 'run fast, run fast, Asfaloth']],
      },
      {
        id: 'r-doors',
        title: 'Doors and passwords',
        teach: [
          { h: 'The door of Moria', p: 'Gandalf’s opening spell begins annon edhellen, “Elvish gate”. The answer is written above: pedo mellon a minno.', ex: [['Annon edhellen, edro hi ammen!', 'Elvish gate, open now for us!']] },
        ],
        lines: [['Pedo mellon a minno', 'speak, friend, and enter'], ['Annon edhellen, edro hi ammen!', 'Elvish gate, open now for us']],
      },
    ],
  },
  {
    unit: 'Battle and danger',
    lessons: [
      {
        id: 'r-battle',
        title: 'Battle cries',
        teach: [
          { h: 'Light against the dark', p: 'Tolkien’s cries call on light and fire. Lacho calad! drego morn! is an Elvish war-cry from Unfinished Tales; naur an edraith ammen! is Gandalf’s, lighting a fire on Caradhras.', ex: [['Lacho calad! Drego morn!', 'flame, light! flee, night!'], ['Naur an edraith ammen!', 'fire, to save us!']] },
          { h: 'When things go wrong', p: 'Tolkien’s Elves do not swear in our sense. An Elf cries ai!, “alas”, or rhach!, Tolkien’s word for a curse.', ex: [['Ai!', 'alas!'], ['Rhach!', 'curse!']] },
        ],
        lines: [['Lacho calad! Drego morn!', 'flame, light! flee, night!'], ['Naur an edraith ammen!', 'fire, to save us'], ['Drego', 'flee'], ['Cenin in yrch', 'I see the orcs'], ['In yrch telir', 'the orcs are coming']],
      },
    ],
  },
  {
    unit: 'Invocations',
    lessons: [
      {
        id: 'r-elbereth',
        title: 'Calling on Elbereth',
        teach: [
          { h: 'Words of power', p: 'Tolkien had words for magic (Sindarin curu, “craft, magic”), and Gandalf’s command at the door of Moria is a spell, but Elves in his books do not cast spells in words. In the dark they call on Elbereth, the Star-kindler: Frodo cries it at Weathertop, Sam at Cirith Ungol.', ex: [['A Elbereth Gilthoniel', 'O Elbereth, Star-kindler']] },
          { h: 'Morning and victory', p: 'Before the Battle of Unnumbered Tears, Fingon cried utúlie’n aurë, “the day has come”, and Turgon’s host answered auta i lómë, “the night is passing”. On the Field of Cormallen the host praises the hobbits in Sindarin.', ex: [['Utúlie’n aurë!', 'the day has come!'], ['Cuio i Pheriain anann!', 'long live the Halflings!']] },
        ],
        canon: ['A Elbereth Gilthoniel', 'A tiro nin, Fanuilos!', 'Utúlie’n aurë!', 'Auta i lómë!', 'Cuio i Pheriain anann!', 'Aglar’ni Pheriannath!', 'Aiya Eärendil Elenion Ancalima!'],
      },
    ],
  },
]
