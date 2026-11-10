// Where the app runs decides how it saves, reminds and opens links. One interface, three hosts:
//   desktop   the Electron app (window.pedo, from desktop/preload.cjs): files in the app's data folder
//   artifact  the claude.ai page (window.claude): this browser, plus the artifact store for progress
//   web       the PWA or a plain browser: this browser's storage and the Notification API

const w = typeof window !== 'undefined' ? window : {}
export const PLATFORM = w.pedo ? 'desktop' : w.claude?.use ? 'artifact' : 'web'

const PREFIX = 'pedo-edhellen:'

function local() {
  return {
    async read(key) {
      try { const v = localStorage.getItem(PREFIX + key); return v == null ? null : JSON.parse(v) } catch { return null }
    },
    async write(key, value) {
      try { localStorage.setItem(PREFIX + key, JSON.stringify(value)) } catch { /* private window: this session only */ }
    },
    async remove(key) {
      try { localStorage.removeItem(PREFIX + key) } catch { /* nothing stored */ }
    },
  }
}

export const storage = PLATFORM === 'desktop' ? {
  read: (key) => w.pedo.store.read(key),
  write: (key, value) => w.pedo.store.write(key, value),
  remove: (key) => w.pedo.store.remove(key),
} : local()

// ——— reminders ———
// settings: { enabled, time: 'HH:MM', title, body }  The page decides what to say; the host decides when.

export const reminders = {
  supported() {
    if (PLATFORM === 'desktop') return true
    if (PLATFORM === 'artifact') return false
    return 'Notification' in w
  },
  async permission() {
    if (PLATFORM === 'desktop') return 'granted'
    if (!('Notification' in w)) return 'unsupported'
    return Notification.permission
  },
  async request() {
    if (PLATFORM === 'desktop') return 'granted'
    if (!('Notification' in w)) return 'unsupported'
    return Notification.requestPermission()
  },
  // what to show is recomputed whenever the app's state changes, so the reminder is always current
  async schedule(settings) {
    if (PLATFORM === 'desktop') return w.pedo.reminders.schedule(settings)
    if (PLATFORM === 'web') webReminder.set(settings)
  },
  async test(settings) {
    if (PLATFORM === 'desktop') return w.pedo.reminders.test(settings)
    if (PLATFORM === 'web') return webReminder.show(settings)
  },
}

// A PWA cannot wake itself without a push server, so it reminds while it is open or in the background.
const webReminder = {
  settings: null,
  timer: null,
  set(settings) {
    this.settings = settings
    clearInterval(this.timer)
    if (!settings?.enabled) return
    this.timer = setInterval(() => this.tick(), 60_000)
    this.tick()
  },
  async tick() {
    const s = this.settings
    if (!s?.enabled || !s.body || !('Notification' in w) || Notification.permission !== 'granted') return
    const now = new Date()
    const [h, m] = s.time.split(':').map(Number)
    const due = now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m)
    const key = PREFIX + 'reminded'
    const today = now.toDateString()
    let last = null
    try { last = localStorage.getItem(key) } catch { /* ignore */ }
    if (!due || last === today) return
    try { localStorage.setItem(key, today) } catch { /* ignore */ }
    this.show(s)
  },
  async show(s) {
    const reg = await navigator.serviceWorker?.getRegistration?.()
    if (reg) reg.showNotification(s.title, { body: s.body, icon: 'icon-192.png', tag: 'pedo-reminder' })
    else new Notification(s.title, { body: s.body })
  },
}

export const TRANSLATOR_URL = 'https://hoodedhacker32.github.io/elvish-translator/'
export const translatorLink = (text, lang) =>
  text ? `${TRANSLATOR_URL}#l=${lang}&d=from&t=${encodeURIComponent(text)}` : TRANSLATOR_URL
