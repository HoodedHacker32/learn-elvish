import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { readFileSync } from 'node:fs'

const PKG = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))
const BUILD = new Date().toISOString()
// the web app publishes its version beside itself, so a running copy can tell it is out of date
const versionFile = {
  name: 'version-file',
  generateBundle() { this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ version: PKG.version, build: BUILD }) }) },
}

// One app, three builds:
//   vite build --mode artifact   one self-contained page for claude.ai (dist/)
//   vite build --mode desktop    files the Electron app loads (dist-desktop/)
//   vite build --mode pwa        the installable web app with its service worker (dist-pwa/)
// The lessons reuse the translator's checked vocabulary from the sibling folder ../LoTR Elvish Translator.
// the desktop window may only run the app's own code, and fetch only Google Fonts, the account server and the version check
const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
  "font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://iahjlkgjxopahegtcvat.supabase.co wss://iahjlkgjxopahegtcvat.supabase.co https://hoodedhacker32.github.io"
const desktopCsp = {
  name: 'desktop-csp',
  transformIndexHtml: (html) => html.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`),
}

export default defineConfig(({ mode }) => ({
  base: './',
  define: { __APP_VERSION__: JSON.stringify(PKG.version), __APP_BUILD__: JSON.stringify(BUILD) },
  plugins: [react(), ...(mode === 'pwa' ? [versionFile] : []), ...(mode === 'artifact' ? [viteSingleFile()] : []), ...(mode === 'desktop' ? [desktopCsp] : [])],
  publicDir: mode === 'pwa' ? 'public' : false,
  server: { port: 5194, fs: { allow: ['..'] } },
  build: {
    outDir: { artifact: 'dist', desktop: 'dist-desktop', pwa: 'dist-pwa' }[mode] || 'dist',
    emptyOutDir: true,
    assetsInlineLimit: mode === 'artifact' ? 100_000_000 : 4096,
    cssCodeSplit: false,
  },
}))
