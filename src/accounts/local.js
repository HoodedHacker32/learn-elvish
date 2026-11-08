// Local accounts: profiles on this device. A password is optional; when set it is stored only as a salted
// PBKDF2-SHA256 hash (WebCrypto), never as text. Good enough to keep two people's progress apart on a shared
// computer; not a substitute for a hosted account system.
import { storage } from '../platform/index.js'

const ACCOUNTS = 'accounts'
const ITERATIONS = 210_000

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
const unhex = (s) => new Uint8Array(s.match(/../g).map((h) => parseInt(h, 16)))

async function hash(password, salt, iterations = ITERATIONS) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256)
  return hex(bits)
}

// constant-time comparison of two hex strings
function same(a, b) {
  if (a.length !== b.length) return false
  let d = 0
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return d === 0
}

const publicProfile = (p) => p && { id: p.id, name: p.name, hasPassword: !!p.hash, created: p.created }

export class LocalAuthProvider {
  async #data() {
    return (await storage.read(ACCOUNTS)) || { profiles: [], current: null }
  }
  async #save(d) { await storage.write(ACCOUNTS, d) }

  async listProfiles() {
    return (await this.#data()).profiles.map(publicProfile)
  }

  async current() {
    const d = await this.#data()
    return publicProfile(d.profiles.find((p) => p.id === d.current))
  }

  async signUp({ name, password }) {
    const { AuthError } = await import('./index.js')
    const clean = (name || '').trim().slice(0, 40)
    if (!clean) throw new AuthError('name_required', 'Enter a name for this profile.')
    const d = await this.#data()
    if (d.profiles.some((p) => p.name.toLowerCase() === clean.toLowerCase())) throw new AuthError('name_taken', 'There is already a profile with that name.')
    const p = { id: 'u_' + hex(crypto.getRandomValues(new Uint8Array(9))), name: clean, created: Date.now() }
    if (password) {
      const salt = crypto.getRandomValues(new Uint8Array(16))
      Object.assign(p, { salt: hex(salt), iterations: ITERATIONS, hash: await hash(password, salt) })
    }
    d.profiles.push(p)
    d.current = p.id
    await this.#save(d)
    return publicProfile(p)
  }

  async #check(p, password) {
    const { AuthError } = await import('./index.js')
    if (!p) throw new AuthError('not_found', 'That profile no longer exists.')
    if (p.hash && !same(await hash(password || '', unhex(p.salt), p.iterations), p.hash)) {
      throw new AuthError('wrong_password', 'That password is not right.')
    }
  }

  async signIn(id, password) {
    const d = await this.#data()
    const p = d.profiles.find((x) => x.id === id)
    await this.#check(p, password)
    d.current = id
    await this.#save(d)
    return publicProfile(p)
  }

  async signOut() {
    const d = await this.#data()
    d.current = null
    await this.#save(d)
  }

  async remove(id, password) {
    const d = await this.#data()
    await this.#check(d.profiles.find((x) => x.id === id), password)
    d.profiles = d.profiles.filter((x) => x.id !== id)
    if (d.current === id) d.current = null
    await this.#save(d)
    await storage.remove('progress-' + id)
  }
}

export class LocalProgressRepository {
  load(userId) { return storage.read('progress-' + userId) }
  save(userId, progress) { return storage.write('progress-' + userId, progress) }
}
