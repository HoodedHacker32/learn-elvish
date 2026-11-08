// Renders assets/icon.svg to every PNG the desktop app, its tray and the PWA need.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { Resvg } from '@resvg/resvg-js'

const svg = readFileSync(new URL('../assets/icon.svg', import.meta.url), 'utf8')
// a maskable icon keeps the leaf inside the safe circle and fills the square edge to edge
const maskable = svg.replace('rx="112"', 'rx="0"').replace(/<path d="M120/, '<g transform="translate(51 51) scale(0.8)"><path d="M120').replace(/<\/svg>/, '</g></svg>')

const out = (file, size, src = svg) => {
  const png = new Resvg(src, { fitTo: { mode: 'width', value: size } }).render().asPng()
  writeFileSync(new URL('../' + file, import.meta.url), png)
  console.log(file, size)
}
mkdirSync(new URL('../public', import.meta.url), { recursive: true })
mkdirSync(new URL('../build', import.meta.url), { recursive: true })
out('desktop/icon.png', 256)
out('desktop/tray.png', 32)
out('build/icon.png', 512)
out('public/icon-192.png', 192)
out('public/icon-512.png', 512)
out('public/icon-maskable-512.png', 512, maskable)
writeFileSync(new URL('../public/icon.svg', import.meta.url), svg)
