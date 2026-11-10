// The guide to Tengwar outside the app: fonts, typing, where Tengwar shows up, and transcribers.
// One source for the app's Guide page and the website's Tengwar page. Checked November 2026.
// Blocks: { p }, { list: [...] }, { steps: [...] }, { note }, { keys: true } (the Annatar key chart).
// In text, [label](url) becomes a link.

export const GUIDE = [
  {
    id: 'kinds',
    h: 'Two kinds of Tengwar text',
    blocks: [
      { p: 'Tengwar is not part of Unicode yet, so there are two ways to store it on a computer.' },
      { list: [
        '**Unicode text (ConScript).** Real Tengwar characters, in the private area the ConScript Unicode Registry set aside for them. This is what this app and the [Lam Edhellen](https://hoodedhacker32.github.io/elvish-translator/) translator copy. It reads as Tengwar wherever a font like Alcarin Tengwar is installed, and as empty boxes everywhere else.',
        '**Keyboard-mapped text.** Ordinary letters and numbers that a font such as Tengwar Annatar draws as Tengwar: “1” is tinco, “q” is parma. It is easy to type in Word, but without the font it is a jumble like “iT5^t$”.',
      ] },
      { p: 'Use Unicode text when you can. Use keyboard-mapped text for a document you will print or export yourself. To send Tengwar to someone else, send a picture: it looks right everywhere.' },
    ],
  },
  {
    id: 'fonts',
    h: 'Two fonts to install',
    blocks: [
      { list: [
        '**[Alcarin Tengwar](https://github.com/Tosche/Alcarin-Tengwar)** by Toshi Omagari: the font this app uses, for Unicode text. Free under the SIL Open Font Licence. It has Tengwar only, no Latin letters. Download it from the “Fonts Static” folder on its GitHub page.',
        '**[Tengwar Annatar](https://www.fontspace.com/tengwar-annatar-font-f2244)** by Johan Winge: the classic keyboard-mapped font, the one most Tengwar guides and Tecendil cite. Free for non-commercial use. If you pass it on, Winge asks that every file of the download goes with it, unchanged.',
      ] },
      { note: 'For anything commercial, Tolkien’s Tengwar may need permission from the Tolkien Estate, whatever the font’s own licence says.' },
    ],
  },
  {
    id: 'install',
    h: 'Installing a font',
    blocks: [
      { steps: [
        '**Windows:** unzip the download, right-click the .otf or .ttf file and choose Install (or Install for all users).',
        '**Mac:** double-click the font file and choose Install in Font Book.',
        '**iPad and iPhone:** there is no built-in way. A font installer app from the App Store can add it, and then it works in apps that use installed fonts, such as Pages, Keynote and Numbers, but not everywhere.',
        '**Android:** there is no general way to add a font for every app. Some apps let you load a font file themselves; otherwise, use a picture.',
      ] },
    ],
  },
  {
    id: 'typing',
    h: 'Typing Tengwar',
    blocks: [
      { list: [
        '**In this app:** the Tengwar keyboard on the Tengwar page, laid out as Tolkien’s table. On a phone or tablet it replaces the normal keyboard. On a computer your own keys type Tengwar in the Annatar layout below.',
        '**Windows and Mac, Unicode text:** install a Tengwar keyboard. [Keyman’s Tengwar keyboard](https://keyman.com/keyboards/tengwar) (Windows and Mac) types ConScript characters for fonts like Alcarin Tengwar, and Alcarin Tengwar’s own download includes a Mac keyboard layout.',
        '**Windows and Mac, keyboard-mapped:** no keyboard to install. Set the font to Tengwar Annatar and type the keys in the chart below.',
        '**iPad, iPhone and Android:** there is no ready-made Tengwar keyboard. Type in this app’s Write in Tengwar desk, then save it as a picture or copy it.',
      ] },
      { p: 'The Annatar keys. Each vowel sign has four keys, one for each shape of letter it sits on (two bows, one bow, a raised stem, a carrier); this app picks the right one when it copies for Annatar.' },
      { keys: true },
    ],
  },
  {
    id: 'where',
    h: 'Where Tengwar shows up',
    blocks: [
      { list: [
        '**Word, Pages, Keynote, LibreOffice:** yes, with the font installed. Unicode text needs Alcarin Tengwar; keyboard-mapped text needs Tengwar Annatar.',
        '**Google Docs:** no. Docs only uses its own fonts, so paste a picture instead.',
        '**Messages, email, social media:** only people who have a Tengwar font installed would see it. Send a picture.',
        '**Printing, a frame, a card:** save a picture (an SVG prints sharp at any size), or print from Word or Pages with the font installed.',
      ] },
    ],
  },
  {
    id: 'transcribers',
    h: 'Transcribers, and checking them',
    blocks: [
      { p: 'A transcriber turns Latin letters into Tengwar for you. [Tecendil](https://tecendil.com) is the best known: it writes Sindarin, Quenya and English in several modes. The [Lam Edhellen](https://hoodedhacker32.github.io/elvish-translator/) translator’s Copy Tengwar gives the same Unicode text as this app.' },
      { p: 'Choose the mode that matches the language, then check the result against what you have learned:' },
      { list: [
        'Quenya vowel signs sit on the letter before; Sindarin and English ones on the letter after.',
        'r before a vowel is rómen; otherwise órë.',
        'silmë and essë turn over when a vowel sits on them.',
        'In English, a silent final e is a dot below, and “the”, “of” and “and” have Tolkien’s shorthands.',
      ] },
      { note: 'For a tattoo or engraving, the Elvish community advises writing your English in Tengwar rather than translating it: Tolkien’s way of writing English is well understood, while what we know of his Elvish keeps changing as his notes are published.' },
    ],
  },
]

// [label](url) and **bold** (which may hold a link) → pieces: [{ text, href? } | { bold: true, parts }]
export function inline(s) {
  const out = []
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g
  let last = 0, m
  while ((m = re.exec(s))) {
    if (m.index > last) out.push({ text: s.slice(last, m.index) })
    out.push(m[1] ? { text: m[1], href: m[2] } : { bold: true, parts: inline(m[3]) })
    last = re.lastIndex
  }
  if (last < s.length) out.push({ text: s.slice(last) })
  return out
}

// the Annatar key chart, in the order of Tolkien's table (shared by the app and the website)
export const KEY_ROWS = [
  ['tinco', 'parma', 'calma', 'quesse'], ['ando', 'umbar', 'anga', 'ungwe'], ['thule', 'formen', 'harma', 'hwesta'],
  ['anto', 'ampa', 'anca', 'unque'], ['numen', 'malta', 'noldo', 'nwalme'], ['ore', 'vala', 'anna', 'vilya'],
  ['romen', 'arda', 'lambe', 'alda'], ['silme', 'silmeNuquerna', 'esse', 'esseNuquerna'],
  ['hyarmen', 'hwestaSindarinwa', 'yanta', 'ure'], ['shortCarrier', 'longCarrier', 'extAndo', 'extUmbar'],
]
export const KEY_SIGNS = [['threeDots', 'a'], ['acute', 'e'], ['dot', 'i'], ['rightCurl', 'o'], ['leftCurl', 'u'], ['twoDots', 'y'], ['dotBelow', 'silent e'], ['nasalizer', 'n/m'], ['doubler', 'double']]
