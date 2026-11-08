// Serves the app's web page locally, with everything it links to:
//   /                                    the page (dist-site/)
//   /download/PedoEdhellen-portable.exe  the newest Windows build in release/
//   /app/                                the web app (dist-pwa/), installable from this address
// Only this computer can reach it (127.0.0.1).
import { createServer } from 'node:http'
import { createReadStream, existsSync, readdirSync, statSync } from 'node:fs'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const PORT = Number(process.env.PORT) || 5196
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
  '.exe': 'application/vnd.microsoft.portable-executable',
}

// a path inside base, never outside it
function inside(base, rel) {
  const full = normalize(join(base, decodeURIComponent(rel)))
  return full.startsWith(resolve(base)) ? full : null
}

function newestExe() {
  const dir = join(ROOT, 'release')
  if (!existsSync(dir)) return null
  const f = readdirSync(dir).filter((x) => x.endsWith('.exe')).map((x) => join(dir, x)).sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0]
  return f || null
}

function send(res, file, extra = {}) {
  if (!file || !existsSync(file) || statSync(file).isDirectory()) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    return res.end('Not here. If you expected the Windows download, build it first with: npm run dist:win')
  }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream', 'content-length': statSync(file).size, ...extra })
  createReadStream(file).pipe(res)
}

createServer((req, res) => {
  const path = new URL(req.url, 'http://x').pathname
  if (path === '/download/PedoEdhellen-portable.exe') {
    return send(res, newestExe(), { 'content-disposition': 'attachment; filename="PedoEdhellen-portable.exe"' })
  }
  if (path === '/app') { res.writeHead(301, { location: '/app/' }); return res.end() }
  if (path.startsWith('/app/')) {
    const rel = path.slice(5) || 'index.html'
    return send(res, inside(join(ROOT, 'dist-pwa'), rel.endsWith('/') ? rel + 'index.html' : rel))
  }
  send(res, inside(join(ROOT, 'dist-site'), path === '/' ? 'index.html' : path.slice(1)))
}).listen(PORT, '127.0.0.1', () => console.log(`Pedo Edhellen page: http://localhost:${PORT}`))
