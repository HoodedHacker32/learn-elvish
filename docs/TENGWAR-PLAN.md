# The Tengwar course: plan

Agreed with the user over four rounds of questions (8 November 2026). Nothing here is built yet.

## What it is

A fourth track beside Sindarin, Quenya and Roleplay: **Tengwar**, about 20 lessons, teaching how to read,
type and write Tolkien's letters for Sindarin, Quenya and English. Handwriting is practised in a separate
**Writing mode**, so the lessons work on any device.

The Sindarin and Quenya courses keep their short "Reading Tengwar" lesson, which links to the new track.

## Decisions

| | Decided |
|---|---|
| Modes | Sindarin and Quenya with vowel marks (tehtar), as the app and translator already write them. English, spelling-based (orthographic) first, with the sound-based (phonemic) style shown as an alternative. The Mode of Beleriand is mentioned, not taught |
| Handwriting style | A plain pen hand: even lines, with the stroke order and direction of Måns Björkman's *Amanyë Tenceli* formal hand, which is drawn from the styles Tolkien used |
| Handwriting checking | Trace over guides, freehand checked by shape, and an animation of the stroke order |
| Where writing lives | A separate Writing mode. It recommends a pen, stylus, touchscreen or drawing pad, and says that a mouse or touchpad works but is far from ideal |
| Typing | An on-screen Tengwar keyboard in the app. On phones and tablets it replaces the normal keyboard. A guide to typing Tengwar on your own devices. How to use transcribers such as Tecendil and the translator's Copy Tengwar |
| Taking Tengwar elsewhere | Save as an image (PNG and SVG), copy as Unicode text (CSUR), copy for keyboard-mapped fonts (Tengwar Annatar) |
| Fonts in the guide | Alcarin Tengwar (Unicode/CSUR, SIL Open Font Licence, already used by the app) first. Tengwar Annatar (keyboard-mapped, freeware, Johan Winge) as the easy option for Word and Docs, with its trade-off explained |
| Extras | Write your own name; punctuation; numerals; reading Tolkien's inscriptions |
| Speed | The iPad 9 is the baseline device and must feel smooth |
| Test builds | An unlisted preview page on GitHub Pages (search engines told to skip it, not linked from anywhere). Every push gets the identity scan first |
| Test devices | iPad 9 with Metapen A8 (Safari and installed web app), iPhone (finger), Windows PC (mouse only) |

## The lessons (about 20)

**1. The letters** (5 lessons). Each lesson: see the letters, read them in words you know, type them.
1. The four shapes: tinco, parma, calma, quesse (the four *témar*, or series)
2. Doubled bows, voiced: ando, umbar, anga, ungwe
3. Raised stems: thúle, formen, harma, hwesta, then anto, ampa, anca, unque
4. Short stems: númen, malta, noldo, nwalme, then óre, vala, anna, vilya
5. The extra letters: rómen, arda, lambe, alda, silme and esse (and their turned forms), hyarmen, yanta, úre, and the carriers

**2. Vowel marks** (2)

6. The five tehtar, short and long, and the carriers
7. Where they go: on the letter before in Quenya, on the letter after in Sindarin. Also the nasal bar, the doubling mark and the s-hook

**3. Sindarin** (3). 8–10: the words and lines from the Sindarin course (mellon, mae govannen, pedo mellon a
minno…), ending with a line from the King's Letter.

**4. Quenya** (3). 11–13: the Quenya course's words, elen síla lúmenn' omentielvo, and Namárië.

**5. English** (3)

14. Spelling-based English and its special letters (th, the silent e, double letters)
15. **Write your own name**: written, typed, and saved as an image
16. Phrases, with the sound-based style shown alongside

**6. Beyond the letters** (3–4)

17. Punctuation
18. Numerals (base 12 and base 10, with their dots and lines)
19–20. Reading Tolkien's inscriptions: the style of the Ring inscription, the title pages, Namárië

Each lesson also feeds the review queue, like every other lesson.

**Exercise types:** pick the Latin for a Tengwar word; pick the Tengwar for a Latin word; type a word on the
Tengwar keyboard; transcribe a line; and, in Writing mode, trace, write from memory, and watch the strokes.

## Writing mode

- **Stroke data.** Our own centre-line paths for every tengwa and tehta, in the plain pen hand, with stroke order and
  direction following Björkman's table: the stem first (top to bottom), then the bows (left to right), then any
  closing stroke. Letters the table doesn't show are drawn by the same rules and labelled as our extension.
- **Tracing.** A faint letter with numbered start points. The line is checked when the pen lifts: did it follow
  the path, in the right direction, in the right order.
- **Freehand.** Write a letter from memory, and the $P point-cloud recogniser (a small, well-known matching method, a few
  hundred lines of JavaScript, no AI model or download) compares it with every letter's template. Words are
  written one tengwa per box, with its vowel mark over it, so each box is recognised on its own.
- **Stroke animation.** Each letter drawn stroke by stroke, with a note that the order follows Amanyë Tenceli.
- **Speed on the iPad 9.** A plain canvas. Pointer Events (pen, finger and mouse alike), coalesced points for
  smooth lines, `touch-action: none`. Only the newest segment is redrawn, there are no effects while drawing,
  and recognition runs only when the pen lifts. When a pen is in use, palm touches are ignored.
  The delay between pen and line is measured on the iPad itself.
- **Device note.** On first opening: a pen, stylus, touchscreen or drawing pad is recommended; a mouse or
  touchpad works, but not well.

## Typing

- **The Tengwar keyboard.** Laid out as Tolkien's own table (four columns, six rows), with a row of vowel
  marks and the extra letters. On phones and tablets the text field asks for no system keyboard, so only
  the Tengwar one shows. On a PC it works with a mouse.
- **Output.** Unicode text (CSUR, displayed in Alcarin Tengwar), plus conversions for saving as an image and
  copying for keyboard-mapped fonts.
- **The guide: typing on your own devices.**
  - **Fonts:** Alcarin Tengwar and Tengwar Annatar — where to get them, and how to install them on Windows,
    Mac, iPad/iPhone and Android.
  - **Keyboards:** a Unicode Tengwar keyboard for Windows and Mac (Keyman's Tengwar keyboard, or the Free Tengwar
    Font Project's layouts). No ready-made one was found for iPad or iPhone, so there the advice is the app's
    keyboard plus "Save as image" or "Copy".
  - **Transcribers:** how to use Tecendil and the translator's Copy Tengwar, and how to check what they produce.

## Accuracy

- Spelling follows Tolkien's usage for each mode, checked against Tecendil's handbook and Tolkien's own samples
  (the Mellonath Daeron index of Tolkien's Tengwar samples).
- The English mode is new to the engine and gets its own tests, written from Tolkien's English examples.
- Tengwar is not in Unicode (an SMP range was pencilled in on the 2023 roadmap and later removed). Text uses the unofficial
  ConScript (CSUR) private-use mapping, as all Unicode Tengwar fonts do, and the guide says so.

## Building it, in order

1. **Engine** (done, 8 November): fixed 13 letters that were on the wrong code points, and added the English orthographic mode, numerals and Annatar conversion, all with tests. Export as PNG/SVG moved to step 2, since it draws in the browser.
2. **The Tengwar keyboard and the reading and typing lessons** (done, 8 November): 19 lessons; physical keys follow Annatar; the Write in Tengwar desk saves PNG/SVG and copies Unicode or Annatar text.
3. **Writing mode** (letters and vowel signs done, 9 November): strokes taken from Alcarin Tengwar's own outlines (scripts/tengwar-strokes.py) in Björkman's order; Watch, Trace and From memory; the $P recogniser plus checks of where the stem reaches and which telling parts are present. In tests every letter written roughly is accepted and no letter passes for another. Whole words (done, 9 November): one box per tengwa with its signs; the letter is traced or recognised, and each sign above or below is checked for place, shape and number of dots. 63 of the course's 67 words can be written (not yet the shorthands for the, of).
4. **The guide pages** (done, 9 November): one source (src/course/tengwar-guide.js) for the app's "Tengwar on your devices" page and the website's tengwar.html: the two kinds of Tengwar text, Alcarin Tengwar and Tengwar Annatar, installing on each platform, typing (Keyman, Alcarin's Mac layout, the Annatar key chart), where it shows up (not Google Docs), and checking transcribers.
5. **Testing** on the preview page, on the iPad + Metapen A8, the iPhone and the PC, then release as 1.3.0.

## Still to check while building

- ~~The exact Tengwar Annatar key mapping~~: done, from Winge's tables. It reproduces his own example.
- ~~Installing a font on iPad/iPhone~~: only through a font installer app, and only for apps that use installed fonts (Pages, Keynote, Numbers).
- ~~Download pages and licences~~: Alcarin Tengwar on GitHub (Tosche/Alcarin-Tengwar, SIL OFL); Tengwar Annatar's own page is gone, FontSpace hosts it (freeware, non-commercial; pass on all files unchanged).
- Whether the Metapen A8 reports tilt to the browser (pressure is not needed either way).

## Sources

- Måns Björkman, *Amanyë Tenceli*, Calligraphy: https://at.boktypografen.se/teng_calligraphy.htm
- Arno Gourdol, Tecendil Tengwar Handbook: https://tecendil.com/tengwar-handbook/
- Free Tengwar Font Project: https://freetengwar.sourceforge.net/
- Keyman Tengwar keyboard: https://keyman.com/keyboards/tengwar
- Unicode status: https://en.wikipedia.org/wiki/Tengwar and https://scriptsource.org/cms/scripts/page.php?item_id=entry_detail&uid=cqzxcrst6l
