// the interface fonts, bundled with the app (nothing is fetched from Google or anyone else)
import '@fontsource/figtree/latin-400.css'
import '@fontsource/figtree/latin-500.css'
import '@fontsource/figtree/latin-600.css'
import '@fontsource/figtree/latin-700.css'
import '@fontsource/marcellus/latin-400.css'
import { createRoot } from 'react-dom/client'
import tengwarFont from '../../LoTR Elvish Translator/src/assets/fonts/AlcarinTengwar-Regular.woff2'
import App from './App.jsx'
import { PLATFORM } from './platform/index.js'
import './styles.css'

// the Tengwar font travels with the app
const face = document.createElement('style')
face.textContent = `@font-face{font-family:'Alcarin Tengwar';src:url(${tengwarFont}) format('woff2');font-display:swap}`
document.head.appendChild(face)

// the installable web app: work offline and allow reminders
if (import.meta.env.MODE === 'pwa' && PLATFORM === 'web' && 'serviceWorker' in navigator) {
  const link = document.createElement('link')
  link.rel = 'manifest'
  link.href = 'manifest.webmanifest'
  document.head.appendChild(link)
  // the page may already have finished loading by the time this module runs
  const register = () => navigator.serviceWorker.register('sw.js').catch(() => {})
  if (document.readyState === 'complete') register()
  else window.addEventListener('load', register)
}

createRoot(document.getElementById('root')).render(<App />)

// Battery: looping animations (the breathing next lesson, today's leaf, the caret) stop whenever the app is out
// of sight or, on the desktop, not the window in use.
{
  const root = document.documentElement
  const set = (idle) => root.classList.toggle('is-idle', idle)
  document.addEventListener('visibilitychange', () => set(document.hidden))
  window.pedo?.window?.onIdle?.((idle) => set(idle))
}
