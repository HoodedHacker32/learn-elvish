# Pedo Edhellen: learn Elvish

A free course in Tolkien's Sindarin and Quenya (plus a Roleplay phrasebook): short lessons, mixed practice,
spaced review, optional daily challenges, a reading room of Tolkien's own lines, and a gentle streak with five
rest days a week. Every word says whether Tolkien wrote it, built it, drafted it early, or never wrote it at all.

**Use it:** https://hoodedhacker32.github.io/learn-elvish/ (in the browser, installable, works offline), or the
Windows app from the [latest release](https://github.com/HoodedHacker32/learn-elvish/releases/latest).

The plan and the research behind it are in [docs/PLAN.md](docs/PLAN.md) and [docs/RESEARCH.md](docs/RESEARCH.md).

## Building it

The course reuses the vocabulary, grammar, pronunciation guide and Tengwar of
[Lam Edhellen](https://github.com/HoodedHacker32/elvish-translator), the companion translator, by relative path.
Clone the two side by side, with the translator in a folder named `LoTR Elvish Translator`:

```bash
git clone https://github.com/HoodedHacker32/elvish-translator "LoTR Elvish Translator"
git clone https://github.com/HoodedHacker32/learn-elvish "Elvish Lessons"
cd "Elvish Lessons" && npm install && npm test
```

| | How | Notes |
|---|---|---|
| Windows desktop | `npm run desktop`, or `npm run dist:win` for a portable `.exe` in `release/` | Own title bar, tray icon, one daily reminder as a Windows notification, progress saved as files in the app's data folder |
| Web app (phone and PC) | `npm run pwa`, then open http://localhost:5195 | Installable, works offline; reminders only while open |
| The website | `npm run site`, then open http://localhost:5196 | What it is, the meaning of the names, the downloads, the web app at /app/ and a link to Lam Edhellen. `npm run build:site` writes it to `dist-site/`, which is what GitHub Pages serves |

## Layout

- `src/course/`: the Sindarin, Quenya and Roleplay courses, and how they are assembled.
- `src/learn/`: exercises, answer checking, spaced repetition, streak, challenges, goals quiz, progress store.
- `src/accounts/`: local profiles behind an `AuthProvider` interface; `hosted.js` maps it to Supabase and Firebase.
- `src/platform/`: saving, reminders and links for desktop, PWA and Artifact.
- `desktop/`: Electron main process, preload bridge and the probe.
- `tests/`: course content against the translator, plus streak, challenges, quiz and accounts.

## Testing the desktop app with the probe

`npm run desktop:probe` starts the app with a local test server (127.0.0.1 only, random token in `.probe.json`).
Then, from another terminal:

```bash
node tools/probe.mjs shot screen.png
node tools/probe.mjs snap
node tools/probe.mjs click "Start" -- key Enter -- type mellon -- shot after.png
```

It sends real mouse and keyboard input and captures the window itself, so no browser is needed. Set
`PEDO_DATA_DIR` to a short folder (for example `C:\Temp\pedo-test`) to keep test runs away from real progress;
very long paths break Chromium's cache storage on Windows.

## Commands

```bash
npm install
npm test
npm run icons      # re-render the PNG icons from assets/icon.svg
```

Vocabulary: Eldamo by Paul Strack (CC BY 4.0), via the translator. Tengwar font: Alcarin Tengwar by Toshi Omagari
(SIL Open Font License). The Elvish languages are J.R.R. Tolkien's; this is an unofficial fan project.
