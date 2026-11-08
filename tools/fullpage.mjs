#!/usr/bin/env node
// Full-page screenshots through the probe: loads each URL in the probe-driven window at a given width, scrolls
// a screen at a time, captures each, and stitches them with ImageMagick.
//   node tools/fullpage.mjs <width> <height> <outdir> <url> [url…]
import { readFileSync, mkdirSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, resolve } from 'node:path'

const [width, height, outdir, ...urls] = process.argv.slice(2)
const info = JSON.parse(readFileSync(new URL('../.probe.json', import.meta.url), 'utf8'))
const call = async (cmd, body = {}) => {
  const r = await fetch(`http://127.0.0.1:${info.port}/${cmd}`, { method: 'POST', headers: { 'x-probe-token': info.token }, body: JSON.stringify(body) })
  const j = await r.json()
  if (!j.ok) throw new Error(j.error)
  return j.result
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

mkdirSync(outdir, { recursive: true })
await call('resize', { width: +width, height: +height })
for (const url of urls) {
  await call('eval', { js: `location.href = ${JSON.stringify(url)}` })
  await wait(2200) // past every entrance animation
  await call('eval', { js: "document.documentElement.style.scrollBehavior = 'auto'" })
  const total = await call('eval', { js: 'document.documentElement.scrollHeight' })
  const view = await call('eval', { js: 'innerHeight' })
  const parts = []
  const tmp = resolve(outdir, '_parts')
  mkdirSync(tmp, { recursive: true })
  for (let y = 0, k = 0; y < total; y += view, k++) {
    await call('eval', { js: `scrollTo(0, ${y})` })
    await wait(250)
    const file = join(tmp, `${k}.png`)
    await call('shot', { path: file })
    parts.push(file)
  }
  // the last screen overlaps the one before it; crop the overlap off
  const name = (new URL(url).pathname.replace(/^\/|\.html$/g, '') || 'index') + `-${width}.png`
  const dest = resolve(outdir, name)
  const scale = (await call('eval', { js: 'devicePixelRatio' })) || 1
  const overlap = Math.round((parts.length * view - total) * scale)
  if (parts.length > 1 && overlap > 0) execFileSync('magick', [parts.at(-1), '-gravity', 'south', '-crop', `x${Math.round(view * scale) - overlap}+0+0`, '+repage', parts.at(-1)])
  execFileSync('magick', [...parts, '-append', '-resize', `${width}x`, dest])
  rmSync(tmp, { recursive: true, force: true })
  console.log(dest)
}
