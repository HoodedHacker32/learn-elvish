// Is this the newest version of the app? Every web build publishes version.json beside the app. The app
// compares it with the build it is running, whenever it starts online, comes back online, or is reopened,
// so an installed web app never sits on an old copy without saying so.
import { PLATFORM } from './index.js'

/* global __APP_VERSION__, __APP_BUILD__ */
export const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'
export const APP_BUILD = typeof __APP_BUILD__ !== 'undefined' ? __APP_BUILD__ : 'dev'

// the desktop app checks the published web app's version; the web app checks its own folder
export const PUBLISHED = 'https://hoodedhacker32.github.io/learn-elvish/app/version.json'
export const DOWNLOAD_PAGE = 'https://hoodedhacker32.github.io/learn-elvish/get.html'

const newer = (a, b) => {
  const pa = String(a).split('.').map(Number), pb = String(b).split('.').map(Number)
  for (let i = 0; i < 3; i++) if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) > (pb[i] || 0)
  return false
}

// → { kind: 'reload' } on the web, { kind: 'download', version } on the desktop, or null when up to date
export async function checkForUpdate() {
  if (APP_BUILD === 'dev' || PLATFORM === 'artifact' || (typeof navigator !== 'undefined' && navigator.onLine === false)) return null
  try {
    const url = PLATFORM === 'desktop' ? PUBLISHED : new URL('version.json', location.href).href
    const res = await fetch(url + '?t=' + Date.now(), { cache: 'no-store' })
    if (!res.ok) return null
    const v = await res.json()
    if (PLATFORM === 'desktop') return newer(v.version, APP_VERSION) ? { kind: 'download', version: v.version } : null
    return v.build && v.build !== APP_BUILD ? { kind: 'reload', version: v.version } : null
  } catch {
    return null
  }
}

// throw away the offline copy and load the new version
export async function applyUpdate() {
  try {
    const keys = await caches.keys()
    await Promise.all(keys.map((k) => caches.delete(k)))
    const reg = await navigator.serviceWorker?.getRegistration?.()
    await reg?.update?.()
  } catch { /* a plain reload still fetches the new page */ }
  location.reload()
}
