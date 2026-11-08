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
