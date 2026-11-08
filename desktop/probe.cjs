// The probe: drive and see the desktop app from outside, without a browser. Only started with --probe.
// A local HTTP server (127.0.0.1 only, random port, random token) that takes screenshots of the window and
// sends real mouse and keyboard input, so it behaves like a person using the app.
// Its address and token are written to .probe.json in the project folder for tools/probe.mjs.
const http = require('node:http')
const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')

const { app } = require('electron')
// next to the project while developing; in a packaged app (read-only bundle), in its data folder
const INFO = app.isPackaged ? path.join(app.getPath('userData'), '.probe.json') : path.join(__dirname, '..', '.probe.json')

// visible, clickable things on the page, each tagged with a ref the probe can click
const SNAPSHOT = `(() => {
  const els = [...document.querySelectorAll('button, a[href], input, select, textarea, [role=tab], [role=radio], [role=checkbox]')]
  let n = 0
  return els.filter((el) => {
    const r = el.getBoundingClientRect()
    const s = getComputedStyle(el)
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'
  }).map((el) => {
    const ref = 'p' + (++n)
    el.setAttribute('data-probe', ref)
    const r = el.getBoundingClientRect()
    const text = (el.innerText || el.value || el.getAttribute('aria-label') || el.placeholder || '').trim().replace(/\\s+/g, ' ').slice(0, 80)
    return { ref, tag: el.tagName.toLowerCase(), text, disabled: !!el.disabled, x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2), inView: r.bottom > 0 && r.top < innerHeight }
  })
})()`

// where to click: a ref from the snapshot, a CSS selector, exact text, or coordinates; scrolls it into view
const locate = (q) => `(() => {
  const q = ${JSON.stringify(q)}
  let el = null
  if (q.ref) el = document.querySelector('[data-probe="' + q.ref + '"]')
  else if (q.selector) el = document.querySelector(q.selector)
  else if (q.text) {
    const all = [...document.querySelectorAll('button, a[href], input, [role=tab], [role=radio], label, li, span')]
    const norm = (s) => (s || '').replace(/\\s+/g, ' ').trim().toLowerCase()
    const t = norm(q.text)
    const visible = (e) => e.getBoundingClientRect().width > 0
    el = all.find((e) => visible(e) && norm(e.innerText) === t) || all.find((e) => visible(e) && norm(e.innerText).includes(t))
  }
  if (!el) return null
  el.scrollIntoView({ block: 'center', inline: 'center' })
  const r = el.getBoundingClientRect()
  return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2), text: (el.innerText || '').trim().slice(0, 60) }
})()`

const KEYS = { enter: 'Enter', tab: 'Tab', escape: 'Escape', esc: 'Escape', backspace: 'Backspace', space: 'Space', up: 'Up', down: 'Down', left: 'Left', right: 'Right' }

exports.start = (win) => {
  const token = crypto.randomBytes(16).toString('hex')
  const logs = []
  const wc = win.webContents
  wc.on('console-message', (_e, level, message) => { logs.push({ level, message }); if (logs.length > 200) logs.shift() })

  const click = async (x, y) => {
    wc.focus()
    wc.sendInputEvent({ type: 'mouseMove', x, y })
    wc.sendInputEvent({ type: 'mouseDown', x, y, button: 'left', clickCount: 1 })
    wc.sendInputEvent({ type: 'mouseUp', x, y, button: 'left', clickCount: 1 })
  }
  const settle = (ms = 250) => new Promise((r) => setTimeout(r, ms))

  const routes = {
    async shot({ path: out }) {
      // force a fresh frame: an occluded window may otherwise hand back its last painted one
      wc.invalidate()
      await wc.executeJavaScript('new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))')
      await settle(150)
      const img = await wc.capturePage()
      const png = img.toPNG()
      const size = img.getSize()
      if (out) { fs.writeFileSync(out, png); return { path: out, ...size } }
      return { png: png.toString('base64'), ...size }
    },
    snapshot: () => wc.executeJavaScript(SNAPSHOT),
    async click(q) {
      let at = q.x != null ? { x: q.x, y: q.y } : await wc.executeJavaScript(locate(q))
      if (!at) throw new Error('nothing matches ' + JSON.stringify(q))
      await settle(120) // let the scroll finish
      if (q.x == null) at = (await wc.executeJavaScript(locate(q))) || at
      await click(at.x, at.y)
      await settle()
      return { clicked: at }
    },
    async type({ text }) {
      wc.focus()
      for (const ch of String(text)) wc.sendInputEvent({ type: 'char', keyCode: ch })
      await settle(100)
      return { typed: text.length }
    },
    async key({ key }) {
      const k = KEYS[String(key).toLowerCase()] || key
      wc.focus()
      wc.sendInputEvent({ type: 'keyDown', keyCode: k })
      // a real keyboard also sends a character for these, which is what activates a focused button on Enter
      const ch = k.length === 1 ? k : { Enter: '\r', Space: ' ', Tab: '\t' }[k]
      if (ch) wc.sendInputEvent({ type: 'char', keyCode: ch })
      wc.sendInputEvent({ type: 'keyUp', keyCode: k })
      await settle()
      return { key: k }
    },
    text: () => wc.executeJavaScript('document.body.innerText'),
    eval: ({ js }) => wc.executeJavaScript(js),
    async resize({ width, height }) { win.setContentSize(width, height); await settle(300); return win.getContentSize() },
    console: () => logs.splice(0),
    wait: ({ ms = 500 }) => settle(ms).then(() => ({ waited: ms })),
  }

  const server = http.createServer((req, res) => {
    const send = (code, body) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(body)) }
    if (req.headers['x-probe-token'] !== token) return send(403, { error: 'bad token' })
    const name = req.url.replace(/^\//, '')
    if (!routes[name]) return send(404, { error: 'no such command', commands: Object.keys(routes) })
    let raw = ''
    req.on('data', (c) => { raw += c })
    req.on('end', async () => {
      try { send(200, { ok: true, result: await routes[name](raw ? JSON.parse(raw) : {}) }) } catch (e) { send(500, { ok: false, error: e.message }) }
    })
  })
  server.listen(Number(process.env.PEDO_PROBE_PORT) || 0, '127.0.0.1', () => {
    const { port } = server.address()
    fs.writeFileSync(INFO, JSON.stringify({ port, token, pid: process.pid }))
    console.log(`probe listening on 127.0.0.1:${port}`)
  })
  win.on('closed', () => { server.close(); try { fs.unlinkSync(INFO) } catch { /* gone */ } })
}
