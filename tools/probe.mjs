#!/usr/bin/env node
// Drive the desktop app started with `npm run desktop:probe`.
//   node tools/probe.mjs shot out.png        screenshot of the window
//   node tools/probe.mjs snap                clickable elements with refs (p1, p2 …)
//   node tools/probe.mjs click "Start"       click by visible text, or #p3 (a ref), or css=.selector, or 120,340
//   node tools/probe.mjs type mellon         type text into the focused field
//   node tools/probe.mjs key Enter           press a key (Enter, Tab, Escape, Backspace, 1, 2 …)
//   node tools/probe.mjs text                the page's visible text
//   node tools/probe.mjs eval "document.title"
//   node tools/probe.mjs resize 400 800      window content size
//   node tools/probe.mjs console             console messages since last asked
//   node tools/probe.mjs wait 800
// Several commands can be chained with " -- ": probe.mjs click Start -- key Enter -- shot a.png
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const info = JSON.parse(readFileSync(new URL('../.probe.json', import.meta.url), 'utf8'))

async function call(cmd, body = {}) {
  const res = await fetch(`http://127.0.0.1:${info.port}/${cmd}`, {
    method: 'POST', headers: { 'x-probe-token': info.token, 'content-type': 'application/json' }, body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.error || res.statusText)
  return json.result
}

function parse([cmd, ...args]) {
  const a = args.join(' ')
  switch (cmd) {
    case 'shot': return ['shot', { path: resolve(args[0] || 'probe.png') }]
    case 'snap': return ['snapshot', {}]
    case 'click': {
      if (/^#p\d+$/.test(a)) return ['click', { ref: a.slice(1) }]
      if (a.startsWith('css=')) return ['click', { selector: a.slice(4) }]
      const m = a.match(/^(\d+),\s*(\d+)$/)
      if (m) return ['click', { x: +m[1], y: +m[2] }]
      return ['click', { text: a }]
    }
    case 'type': return ['type', { text: a }]
    case 'key': return ['key', { key: a }]
    case 'text': return ['text', {}]
    case 'eval': return ['eval', { js: a }]
    case 'resize': return ['resize', { width: +args[0], height: +args[1] }]
    case 'console': return ['console', {}]
    case 'wait': return ['wait', { ms: +args[0] || 500 }]
    default: throw new Error(`unknown command “${cmd}”. See the top of tools/probe.mjs.`)
  }
}

const argv = process.argv.slice(2)
const groups = [[]]
for (const x of argv) x === '--' ? groups.push([]) : groups.at(-1).push(x)
for (const g of groups.filter((x) => x.length)) {
  const [cmd, body] = parse(g)
  const out = await call(cmd, body)
  if (cmd === 'snapshot') for (const e of out) console.log(`#${e.ref.padEnd(4)} ${e.tag.padEnd(6)} ${e.disabled ? '(off) ' : ''}${e.inView ? '' : '(scroll) '}${e.text}`)
  else console.log(typeof out === 'string' ? out : JSON.stringify(out))
}
