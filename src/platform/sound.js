// Small sounds, made in code (no audio files): a soft tap, a right and a gentler wrong answer, and a short chime
// when a lesson ends. They sit under any music you are playing, and on iPhone and iPad they follow the silent
// switch (the page asks for an "ambient" audio session). Off in Settings means off everywhere.
let ctx = null
let enabled = true

export const sound = {
  set(on) { enabled = !!on },
  get on() { return enabled },
  play(name) {
    if (!enabled) return
    const a = audio()
    if (!a) return
    const now = a.currentTime + 0.005
    try { SOUNDS[name]?.(a, now) } catch { /* sound is a nicety; never let it break anything */ }
  },
}

function audio() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    // iOS 17+: mix with other audio and respect the ring/silent switch
    try { if (navigator.audioSession) navigator.audioSession.type = 'ambient' } catch { /* older browsers */ }
    ctx = new AC({ latencyHint: 'interactive' })
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

// let the audio context start on the first touch or click (browsers keep it silent until then), and let it
// sleep when the app is hidden so it costs no battery
if (typeof window !== 'undefined') {
  const wake = () => { if (enabled) audio() }
  window.addEventListener('pointerdown', wake, { once: true, capture: true })
  window.addEventListener('keydown', wake, { once: true, capture: true })
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return
    if (document.hidden) ctx.suspend().catch(() => {})
  })
}

// a note: a sine (or triangle) with a quick rise and a soft fall
function note(a, t, freq, { dur = 0.18, gain = 0.06, type = 'sine', glide } = {}) {
  const o = a.createOscillator(), g = a.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (glide) o.frequency.exponentialRampToValueAtTime(glide, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(a.destination)
  o.start(t)
  o.stop(t + dur + 0.02)
}

const SOUNDS = {
  // a tiny wooden tick
  tap(a, t) { note(a, t, 1800, { dur: 0.03, gain: 0.025, type: 'triangle', glide: 900 }) },
  // two rising notes, a fifth apart
  right(a, t) { note(a, t, 659.25, { dur: 0.16, gain: 0.05 }); note(a, t + 0.08, 987.77, { dur: 0.24, gain: 0.05 }) },
  // one low, soft note, falling a little: noticed, not scolded
  wrong(a, t) { note(a, t, 246.94, { dur: 0.22, gain: 0.05, type: 'triangle', glide: 220 }) },
  // a short rising chime for a finished lesson
  done(a, t) {
    ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => note(a, t + i * 0.09, f, { dur: 0.5 - i * 0.05, gain: 0.045 }))
  },
}
