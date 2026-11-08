// Builds the Pedo Edhellen pages into dist-site/. Each page in site/ is plain HTML with a few tokens:
//   {{page:key|Title|Description}}  the head and the masthead (key marks the current page)
//   {{end}}                          the colophon, the notes script and the closing tags
//   {{tw:Text|S}} {{say:Text|S}}     Tengwar and pronunciation from the translator's own engine
//   {{icon:name}} {{mark:origin}}    drawn icons and the provenance leaf
//   {{size}}                         the size of the newest Windows build
//   {{download}}                     the Windows build on the repository's latest GitHub release
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, statSync, existsSync, cpSync, rmSync } from 'node:fs'
import { toTengwar } from '../../LoTR Elvish Translator/src/engine/tengwar.js'
import { respellLine } from '../../LoTR Elvish Translator/src/engine/pronounce.js'

const here = (p) => new URL(p, import.meta.url)
const out = here('../dist-site/')
for (const d of ['', 'fonts/', 'shots/']) mkdirSync(new URL(d, out), { recursive: true })

// the newest Windows build in release/ or a side folder like release-1.2.0/ (used when release/ is locked)
const exe = readdirSync(here('../')).filter((d) => /^release(-[\d.]+)?$/.test(d)).flatMap((d) => {
  const dir = here(`../${d}/`)
  return readdirSync(dir).filter((f) => f.endsWith('.exe')).map((f) => ({ f, url: new URL(f, dir), t: statSync(new URL(f, dir)).mtimeMs }))
}).sort((a, b) => b.t - a.t)[0]
const size = exe ? `${Math.round(statSync(exe.url).size / 1048576)} MB` : ''

// published at hoodedhacker32.github.io/learn-elvish; the .exe is too big for Pages, so it lives on the release
const REPO = 'https://github.com/HoodedHacker32/learn-elvish'
const DOWNLOAD = `${REPO}/releases/latest/download/PedoEdhellen-portable.exe`

const ICONS = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  out: '<path d="M7 17 17 7M9 7h8v8"/>',
  down: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
}
const icon = (n) => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`
const mark = (o) => `<svg class="mk mk--${o}" viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 13.5C2.5 7 6.5 2.5 13.5 2.5c0 7-4.5 11-11 11z"/><path d="M3 13 11 5"/></svg>`
const LEAF = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="#dcb862" d="M120 400C120 228 228 112 400 112c0 176-110 288-280 288z"/><path d="M138 384 352 168" stroke="#222a25" stroke-width="26" stroke-linecap="round"/></svg>'

const NAV = [['course', 'course.html', 'The course'], ['names', 'names.html', 'The names'], ['translator', 'translator.html', 'Lam Edhellen'], ['get', 'get.html', 'Get the app']]

const head = (key, title, desc) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="theme-color" content="#222a25">
<link rel="icon" href="icon-192.png">
<link rel="preload" href="fonts/marcellus-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fonts/figtree-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="site.css">
</head>
<body>
<header class="mast">
  <div class="wrap">
    <a class="mark" href="index.html"${key === 'home' ? ' aria-current="page"' : ''}>${LEAF}Pedo Edhellen</a>
    <nav aria-label="Pages">${NAV.map(([k, href, label]) => `<a href="${href}"${k === key ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav>
    ${/* the home and get pages already lead with their own buttons */ key === 'home' || key === 'get' ? '' : '<a class="press" href="app/">Open the web app</a>'}
  </div>
</header>
<main>`

const END = `</main>
<footer class="colophon">
  <div class="wrap">
    <div>
      <p>Pedo Edhellen means “Speak Elvish!” in Tolkien’s Sindarin. Vocabulary from <a href="https://eldamo.org">Eldamo</a> by Paul Strack (CC BY 4.0). Tengwar set in Alcarin Tengwar by Toshi Omagari (SIL Open Font License).</p>
      <p>The Elvish languages are J.R.R. Tolkien’s. Pedo Edhellen and Lam Edhellen are unofficial fan projects, not affiliated with the Tolkien Estate.</p>
    </div>
    <nav aria-label="Elsewhere">
      <a href="app/">The web app</a>
      <a href="get.html">Get the app</a>
      <a href="https://hoodedhacker32.github.io/elvish-translator/">Lam Edhellen, the translator</a>
      <a href="https://eldamo.org">Eldamo</a>
      <a href="${REPO}">Source code</a>
    </nav>
  </div>
</footer>
<script>
  // a footnote call and its note light up together, from either side
  for (const a of document.querySelectorAll('sup.fn a')) {
    const note = document.getElementById(a.hash.slice(1))
    if (!note) continue
    const on = (v) => { a.classList.toggle('is-lit', v); note.classList.toggle('is-lit', v) }
    for (const t of [a, note]) {
      t.addEventListener('mouseenter', () => on(true)); t.addEventListener('mouseleave', () => on(false))
    }
    a.addEventListener('focus', () => on(true)); a.addEventListener('blur', () => on(false))
  }
</script>
</body>
</html>
`

const pages = readdirSync(here('./')).filter((f) => f.endsWith('.html'))
for (const f of pages) {
  const html = readFileSync(here(f), 'utf8')
    .replace(/\{\{page:([^|}]+)\|([^|}]+)\|([^}]+)\}\}/, (_, k, t, d) => head(k, t, d))
    .replace('{{end}}', END)
    .replace(/\{\{tw:([^|}]+)\|([SQ])\}\}/g, (_, text, lang) => toTengwar(text, lang))
    .replace(/\{\{say:([^|}]+)\|([SQ])\}\}/g, (_, text, lang) => respellLine(text, lang))
    .replace(/\{\{icon:(\w+)\}\}/g, (_, n) => icon(n))
    .replace(/\{\{mark:(\w+)\}\}/g, (_, o) => mark(o))
    .replaceAll('{{size}}', size)
    .replaceAll('{{download}}', DOWNLOAD)
  if (/\{\{/.test(html)) throw new Error(`${f}: unreplaced token ${html.match(/\{\{[^}]*\}\}/)[0]}`)
  writeFileSync(new URL(f, out), html)
}

copyFileSync(here('site.css'), new URL('site.css', out))
copyFileSync(here('../../LoTR Elvish Translator/src/assets/fonts/AlcarinTengwar-Regular.woff2'), new URL('fonts/AlcarinTengwar-Regular.woff2', out))
for (const f of ['marcellus-latin-400-normal', 'figtree-latin-400-normal', 'figtree-latin-500-normal', 'figtree-latin-600-normal']) copyFileSync(here('../node_modules/@fontsource/' + f.split('-')[0] + '/files/' + f + '.woff2'), new URL('fonts/' + f + '.woff2', out))
for (const f of ['icon-192.png', 'icon-512.png']) copyFileSync(here('../public/' + f), new URL(f, out))
for (const f of readdirSync(here('shots/'))) copyFileSync(here('shots/' + f), new URL('shots/' + f, out))
// the web app at /app/ (built first by vite --mode pwa), and no Jekyll processing on GitHub Pages
const pwa = here('../dist-pwa/')
if (!existsSync(pwa)) throw new Error('Build the web app first: vite build --mode pwa')
rmSync(new URL('app/', out), { recursive: true, force: true })
cpSync(pwa, new URL('app/', out), { recursive: true })
writeFileSync(new URL('.nojekyll', out), '')
console.log(`dist-site: ${pages.join(', ')}${exe ? ` · download ${exe.f} (${size})` : ' · no Windows build yet (npm run dist:win)'}`)
