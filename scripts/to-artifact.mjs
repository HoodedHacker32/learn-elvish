// Turns Vite's single-file build into the page content an Artifact expects: no doctype, html, head or body
// tags (the host adds them), with the title, fonts and styles first.
import { readFileSync, writeFileSync } from 'node:fs'

const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8')
const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n')
const open = html.indexOf('<script type="module"')
const start = html.indexOf('>', open) + 1
const end = html.lastIndexOf('</script>')
if (open < 0 || end < start) throw new Error('no inline module script in dist/index.html')
const script = html.slice(start, end)

const page = `<title>Pedo Edhellen</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Marcellus&display=swap">
<style>${styles}</style>
<div id="root"></div>
<script type="module">${script}</script>
`
writeFileSync(new URL('../dist/pedo-edhellen.html', import.meta.url), page)
console.log(`dist/pedo-edhellen.html ${(page.length / 1024).toFixed(0)} KB`)
