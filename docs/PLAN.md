# Pedo Edhellen — plan

A course that teaches Tolkien's Elvish well enough to use it (for the first user: roleplaying an Elf in a D&D
campaign), built on what research says works, and engaging without the guilt machinery of streak-driven apps.

## 1. What the research says, and what the app does about it

Sources are peer-reviewed or primary; app-marketing pages and course-sellers were left out. Details in
[RESEARCH.md](RESEARCH.md).

| Finding | Source | In the app |
|---|---|---|
| Practice testing (retrieval with feedback) and spaced practice are the two most effective study techniques; rereading and highlighting are weak. | Dunlosky et al. 2013, *Psych. Science in the Public Interest* | Every lesson is mostly retrieval with instant, specific feedback. No "read the list" pages after the first meeting. |
| The best gap between reviews grows with how long you want to remember; too short a gap hurts more than too long. | Cepeda et al. 2008, *Psych. Science*; Kim & Webb 2022 (L2 vocabulary meta-analysis) | Expanding review schedule (1, 2, 4, 7, 15, 30, 60 days); a miss comes back the same day. |
| Producing a word (L1 → L2, typing) builds productive knowledge that recognition tasks don't. | Webb 2005, *SSLA*; Barcroft (retrieval, output) | Exercises move from recognise → choose Elvish → type it / build the sentence, as an item gets stronger. |
| Interleaving similar material helps telling things apart. | Brunmair & Richter 2019, *Psych. Bulletin* | Practice mixes the lesson's items with older ones and mixes exercise kinds. |
| A broken streak lowers later engagement, more so when people blame themselves; being able to repair it softens this. Apps should not focus on broken streaks. | Silverman & Barasch 2023, *J. Consumer Research* | 5 freezes every week, applied automatically; "days practised" (which never goes down) is shown first; nothing ever says "you broke your streak". |
| Retention-driven gamification causes "goal drift" (protecting the metric instead of learning) and guilt about stopping ("exit dark patterns"). | Kuo, Zhao & Scott, IDC; Gray et al. CHI 2020 | No hearts, no gems, no leagues, no "the owl is sad", no penalties for leaving a lesson. Progress is measured in what you can do (words you know, Tolkien lines you can read). |
| Attention-capture patterns (fake urgency, social pressure notifications) harm users. | Monge Roffarello et al. CHI 2023 | At most one reminder a day, at a time you choose, only if there is something useful to do, never if you already practised; off with one switch. |
| Competence and autonomy support motivation in learning apps (Self-Determination Theory). | Jeon 2022; Ryan & Deci | Optional daily challenges you pick from; lesson length you choose; visible mastery; a goal quiz so the course fits your purpose. |

## 2. Features

- **Courses**: Sindarin, Quenya, and focused courses (Roleplay phrasebook; Tengwar). A goals quiz on first run
  recommends a course and daily length; it can be retaken.
- **Lessons**: teach → meet items → mixed retrieval practice; misses come back at the end.
- **Review**: spaced repetition over everything learned.
- **Daily challenges** (optional): three a day, chosen from your level (items learned, lessons done, what's due,
  recent accuracy). Completing them earns a mark on the week; ignoring them costs nothing.
- **Streak, kept small**: shown as a quiet number beside "days practised" and a seven-dot week. 5 freezes per
  week (Mon–Sun) cover missed days automatically, so practising twice a week keeps it going.
- **Reading room**: Tolkien's own lines, with the words you know lit up and a "you can read N%" measure.
- **Notebook**: words, how well you know each, grammar notes.
- **Honesty**: every word labelled Tolkien's / built from his words / early Tolkien / fan-made. Any claim that
  Tolkien left nothing is checked against Eldamo across every stage of his languages.
- **Link to Lam Edhellen** (the translator) in the header and on every word.
- **Accounts**: local profiles now (optional password, hashed with PBKDF2 via WebCrypto). Behind an
  `AuthProvider` interface so Supabase or Firebase can replace it without touching the app.
- **Notifications**: desktop (Windows toast, from the tray); PWA (while installed and open/backgrounded; true
  push needs a server, noted below).
- **Motion**: warm and lively but restrained: cards rise in, the right answer glows, a falling-leaf burst on
  finishing a lesson, numbers count up, the next lesson breathes. All of it off under reduced-motion.

## 3. Architecture

```
src/                 one React app for every platform
  course/            course content + assembly (uses the translator in ../LoTR Elvish Translator)
  learn/             exercises, checking, spaced repetition, streak, challenges, quiz
  accounts/          AuthProvider interface, LocalAuthProvider, Supabase/Firebase stubs
  platform/          storage, notifications, links: desktop | web (PWA) | artifact
desktop/             Electron main + preload, tray, reminders, the probe test server
tools/probe.mjs      command-line driver for the probe (screenshot, click, type, key, text, eval)
public/              PWA manifest, service worker, icons
```

- **Desktop (Windows now)**: Electron. Chosen over Tauri because Electron's `capturePage` and real input events
  make the built-in test tool simple and exact. Packaged with electron-builder (portable .exe).
- **PWA (phone and PC prototype)**: the same build with a manifest and a cache-first service worker, installable.
- **Artifact**: the existing claude.ai version keeps working from the same source.

### Accounts, now and later

`AuthProvider`: `listProfiles()`, `signUp({name, password?})`, `signIn(id, password?)`, `signOut()`,
`current()`, `remove(id)`. `ProgressRepository`: `load(userId)`, `save(userId, state)`. Local versions store
JSON through the platform layer. A Supabase provider maps these to `auth.signUp / signInWithPassword` and a
`progress` table keyed by `auth.uid()` with row-level security; Firebase maps to Auth + a Firestore document per
user. Progress documents are versioned (`v`) and timestamped (`updatedAt`) so a later sync can merge
last-writer-wins per field.

### The probe (desktop test tool)

Start the app with `npm run desktop:probe`. It opens a local-only HTTP server (127.0.0.1, random token written
to a file) that can: take a screenshot of the window to a PNG, list clickable elements with refs, click by ref,
text, selector or coordinates, type, press keys, read the page text, run a script, and resize the window. It uses
real input events, so it behaves like a person using the app. `node tools/probe.mjs shot out.png`, `click
"Start"`, `type mellon`, `key Enter`, `text`. Never enabled in a normal launch.

## 4. Later

- Hosted sync (Supabase), then real push reminders (Web Push from a scheduled function).
- Phone builds (Capacitor or Tauri mobile) from the same app once the PWA proves the layout.
- More courses (Tengwar writing, Tolkien's poems), audio recorded by a person (the robot voice was dropped).
