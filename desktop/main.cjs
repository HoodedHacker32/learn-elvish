// Pedo Edhellen for Windows (Electron). The window loads the same app as the web version; this file adds what a
// desktop app needs: saving to files, a tray icon, and one gentle daily reminder as a Windows notification.
const { app, BrowserWindow, ipcMain, Notification, Tray, Menu, shell, nativeImage } = require('electron')
const path = require('node:path')
const fs = require('node:fs')

const PROBE = process.argv.includes('--probe') || process.env.PEDO_PROBE === '1'
const DEV_URL = process.env.PEDO_DEV_URL // e.g. http://localhost:5194 while developing

// a separate data folder for testing, so a probe run never touches real progress
if (process.env.PEDO_DATA_DIR) app.setPath('userData', process.env.PEDO_DATA_DIR)
// Windows shows this name above each notification when no installed shortcut is registered (portable app)
app.setAppUserModelId('Pedo Edhellen')
if (!app.requestSingleInstanceLock()) app.quit()

let win = null
let tray = null
let quitting = false
let reminder = { enabled: false, time: '19:00', title: 'Pedo Edhellen', body: '', practisedToday: false }

const dataDir = () => path.join(app.getPath('userData'), 'data')
const safeKey = (key) => String(key).replace(/[^a-z0-9_-]/gi, '_').slice(0, 80)
const fileFor = (key) => path.join(dataDir(), safeKey(key) + '.json')

// ——— storage: one JSON file per key, written atomically ———
ipcMain.handle('store:read', (_e, key) => {
  try { return JSON.parse(fs.readFileSync(fileFor(key), 'utf8')) } catch { return null }
})
ipcMain.handle('store:write', (_e, key, value) => {
  fs.mkdirSync(dataDir(), { recursive: true })
  const tmp = fileFor(key) + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(value))
  fs.renameSync(tmp, fileFor(key))
  return true
})
ipcMain.handle('store:remove', (_e, key) => {
  try { fs.unlinkSync(fileFor(key)) } catch { /* already gone */ }
  return true
})

// ——— reminders: at most one a day, only when there is something to do and you have not practised ———
const lastFile = () => path.join(dataDir(), 'reminded.txt')
const todayStr = () => new Date().toDateString()
function remindedToday() { try { return fs.readFileSync(lastFile(), 'utf8') === todayStr() } catch { return false } }
function show(title, body) {
  if (!Notification.isSupported()) return
  const n = new Notification({ title, body, icon: path.join(__dirname, 'icon.png'), silent: false })
  n.on('click', () => { win ? (win.show(), win.focus()) : createWindow() })
  n.on('show', () => console.log('reminder shown'))
  n.on('failed', (_e, err) => console.log('reminder failed:', err))
  n.show()
}
function tick() {
  const r = reminder
  if (!r.enabled || (r.practisedToday && r.practisedOn === todayStr()) || !r.body || remindedToday()) return
  const now = new Date()
  const [h, m] = (r.time || '19:00').split(':').map(Number)
  if (now.getHours() < h || (now.getHours() === h && now.getMinutes() < m)) return
  fs.mkdirSync(dataDir(), { recursive: true })
  fs.writeFileSync(lastFile(), todayStr())
  show(r.title, r.body)
}
ipcMain.handle('reminders:schedule', (_e, settings) => { reminder = { ...reminder, ...settings, practisedOn: todayStr() }; updateTray(); return true })
ipcMain.handle('reminders:test', (_e, s) => { show(s.title, s.body); return true })

// ——— the app's own window buttons ———
ipcMain.handle('window:minimize', () => win?.minimize())
ipcMain.handle('window:toggleMaximize', () => (win?.isMaximized() ? win.unmaximize() : win?.maximize()))
ipcMain.handle('window:close', () => win?.close())
ipcMain.handle('window:isMaximized', () => !!win?.isMaximized())

// ——— window, tray ———
function createWindow() {
  win = new BrowserWindow({
    width: 1120, height: 840, minWidth: 380, minHeight: 560,
    backgroundColor: '#2b352f', title: 'Pedo Edhellen', icon: path.join(__dirname, 'icon.png'),
    // no OS title bar: the app's own header is the title bar, with its own window buttons
    frame: false, autoHideMenuBar: true, show: false,
    // under the probe the window keeps painting even when hidden behind others, so screenshots are current
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, sandbox: true, nodeIntegration: false, backgroundThrottling: !PROBE },
  })
  win.once('ready-to-show', () => win.show())
  // tell the page when the window is out of sight or not in use, so it can stop its gentle animations
  const idle = (v) => win?.webContents.send('window:idle', v)
  win.on('blur', () => idle(true)); win.on('focus', () => idle(false))
  win.on('minimize', () => idle(true)); win.on('restore', () => idle(false))
  const sendState = () => win?.webContents.send('window:state', { maximized: win.isMaximized() })
  win.on('maximize', sendState)
  win.on('unmaximize', sendState)
  // links (the translator, sources) open in the normal browser; the window never navigates away
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url)
    return { action: 'deny' }
  })
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file:') && !(DEV_URL && url.startsWith(DEV_URL))) { e.preventDefault(); if (/^https?:/.test(url)) shell.openExternal(url) }
  })
  // Closing really closes the window, freeing the page and its memory, so the app costs almost nothing in the
  // tray. Reminders live in this small main process and still arrive; the tray opens the window again.
  win.on('closed', () => { win = null })
  if (DEV_URL) win.loadURL(DEV_URL)
  else win.loadFile(path.join(__dirname, '..', 'dist-desktop', 'index.html'))
  if (PROBE) require('./probe.cjs').start(win)
}

function updateTray() {
  if (!tray) return
  tray.setToolTip(reminder.enabled ? `Pedo Edhellen · reminder at ${reminder.time}` : 'Pedo Edhellen')
}

app.whenReady().then(() => {
  createWindow()
  tray = new Tray(nativeImage.createFromPath(path.join(__dirname, 'tray.png')))
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Open Pedo Edhellen', click: () => (win ? (win.show(), win.focus()) : createWindow()) },
    { type: 'separator' },
    { label: 'Quit', click: () => { quitting = true; app.quit() } },
  ]))
  tray.on('click', () => (win ? (win.show(), win.focus()) : createWindow()))
  updateTray()
  setInterval(tick, 30_000)
})
app.on('second-instance', () => { if (win) { win.show(); win.focus() } })
app.on('before-quit', () => { quitting = true })
app.on('window-all-closed', () => { if (!reminder.enabled || PROBE) app.quit() })
