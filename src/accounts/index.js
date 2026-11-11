// Optional accounts. Progress always lives on the device first, so the app works offline with no account.
// Signing in (email and password, through Supabase) keeps a copy online, so it follows you between devices.
// Table: progress(user_id uuid primary key references auth.users, doc jsonb, updated_at timestamptz),
// with row-level security allowing each person to read and write only their own row.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js'

export const accountsAvailable = !!(SUPABASE_URL && SUPABASE_ANON_KEY)
const WEB_APP = 'https://hoodedhacker32.github.io/learn-elvish/app/'
const AVATARS = 'avatars'

// Limits, checked on the device before anything is sent. The server has the same limits and is what really
// enforces them (anyone could skip this app and call it directly): the picture store refuses files over 64 KB
// or that are not WebP or JPEG, and the progress table refuses documents of 2 MB or more.
export const LIMITS = {
  pictureIn: 25 * 1024 * 1024, // a photo to choose from; larger is refused before it is even opened
  pictureOut: 60 * 1024, // the saved 96 × 96 picture (it is usually 2–6 KB)
  progress: 1_500_000, // bytes of synced progress (a year of daily use is well under 200 KB)
  name: 40,
}

let client = null
async function sb() {
  if (!accountsAvailable) return null
  if (!client) {
    const { createClient } = await import('@supabase/supabase-js')
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: 'pedo-edhellen:session', detectSessionInUrl: true },
    })
  }
  return client
}

export class AccountError extends Error {
  constructor(message) { super(message); this.code = 'account' }
}

const asUser = (u) => u && { id: u.id, email: u.email, name: u.user_metadata?.name || '', avatar: u.user_metadata?.avatar || '' }

// what Supabase says, in plain words
function plain(error) {
  const m = error?.message || ''
  if (/invalid login/i.test(m)) return 'That email and password do not match an account.'
  if (/already registered|already exists/i.test(m)) return 'There is already an account with that email. Sign in instead.'
  if (/email not confirmed/i.test(m)) return 'Confirm your email first: open the link we sent you, then sign in.'
  if (/password should be at least/i.test(m)) return 'Choose a password of at least 8 characters.'
  if (/fetch|network/i.test(m)) return 'Could not reach the server. Check your connection.'
  if (/rate limit|too many/i.test(m)) return 'Too many emails sent just now. Wait a few minutes and try again.'
  if (/same.*password|different from the old/i.test(m)) return 'Choose a password different from your old one.'
  if (/payload too large|exceeded the maximum/i.test(m)) return 'That picture is too large.'
  return m || 'Something went wrong. Try again.'
}

export const account = {
  async current() {
    const s = await sb()
    if (!s) return null
    const { data } = await s.auth.getSession()
    return asUser(data.session?.user)
  },
  onChange(cb) {
    let unsub = () => {}
    sb().then((s) => {
      if (!s) return
      const { data } = s.auth.onAuthStateChange((_e, session) => cb(asUser(session?.user)))
      unsub = () => data.subscription.unsubscribe()
    })
    return () => unsub()
  },
  // → { user } when signed in straight away, or { confirm: true } when the email must be confirmed first
  async signUp({ email, password, name }) {
    const s = await sb()
    if (!s) throw new AccountError('Accounts are not available.')
    const redirect = typeof location !== 'undefined' ? location.origin + location.pathname : undefined
    const { data, error } = await s.auth.signUp({ email, password, options: { data: { name: name || '' }, emailRedirectTo: redirect } })
    if (error) throw new AccountError(plain(error))
    return data.session ? { user: asUser(data.user) } : { confirm: true }
  },
  async signIn({ email, password }) {
    const s = await sb()
    if (!s) throw new AccountError('Accounts are not available.')
    const { data, error } = await s.auth.signInWithPassword({ email, password })
    if (error) throw new AccountError(plain(error))
    return asUser(data.user)
  },
  // a link to choose a new password; it opens the web app, which then asks for the new one
  async resetPassword(email) {
    const s = await sb()
    if (!s) throw new AccountError('Accounts are not available.')
    const here = typeof location !== 'undefined' && /^https?:/.test(location.protocol) ? location.origin + location.pathname : WEB_APP
    const { error } = await s.auth.resetPasswordForEmail(email, { redirectTo: here })
    if (error) throw new AccountError(plain(error))
  },
  async setPassword(password) {
    const s = await sb()
    const { error } = await s.auth.updateUser({ password })
    if (error) throw new AccountError(plain(error))
  },
  // called when someone arrives from a reset link: the app should ask for a new password
  onRecovery(cb) {
    let unsub = () => {}
    sb().then((s) => {
      if (!s) return
      const { data } = s.auth.onAuthStateChange((e) => { if (e === 'PASSWORD_RECOVERY') cb() })
      unsub = () => data.subscription.unsubscribe()
    })
    return () => unsub()
  },
  // Deletes the account and, with it, everything kept online: the progress row goes with the account, and the
  // picture is removed first. The database function can only ever delete the account of whoever calls it.
  async deleteAccount(userId) {
    const s = await sb()
    if (!s) throw new AccountError('Accounts are not available.')
    await s.storage.from(AVATARS).remove([`${userId}/avatar.webp`]).catch(() => {})
    const { error } = await s.rpc('delete_my_account')
    if (error) throw new AccountError(plain(error))
    await s.auth.signOut({ scope: 'local' }).catch(() => {})
  },
  // ——— the profile: a display name and a small picture ———
  async setName(name) {
    const s = await sb()
    const { error } = await s.auth.updateUser({ data: { name: String(name || '').slice(0, LIMITS.name) } })
    if (error) throw new AccountError(plain(error))
  },
  // the picture is cropped and shrunk on the device first (see shrinkAvatar), so each is a few kilobytes
  async setAvatar(userId, blob) {
    if (!blob || blob.size > LIMITS.pictureOut || !/^image\/(webp|jpeg)$/.test(blob.type)) throw new AccountError('That picture could not be made small enough. Try another one.')
    const s = await sb()
    const path = `${userId}/avatar.webp`
    const { error } = await s.storage.from(AVATARS).upload(path, blob, { upsert: true, contentType: blob.type, cacheControl: '3600' })
    if (error) throw new AccountError(plain(error))
    const url = s.storage.from(AVATARS).getPublicUrl(path).data.publicUrl + '?v=' + Date.now()
    const { error: e2 } = await s.auth.updateUser({ data: { avatar: url } })
    if (e2) throw new AccountError(plain(e2))
    return url
  },
  async removeAvatar(userId) {
    const s = await sb()
    await s.storage.from(AVATARS).remove([`${userId}/avatar.webp`])
    const { error } = await s.auth.updateUser({ data: { avatar: '' } })
    if (error) throw new AccountError(plain(error))
  },
  async signOut() {
    const s = await sb()
    await s?.auth.signOut()
  },
  async load(userId) {
    const s = await sb()
    const { data, error } = await s.from('progress').select('doc').eq('user_id', userId).maybeSingle()
    if (error) throw new AccountError(plain(error))
    return data?.doc || null
  },
  async save(userId, doc) {
    // far more than real progress ever needs: a document this big is a fault, so keep it on the device only
    if (new Blob([JSON.stringify(doc)]).size > LIMITS.progress) throw new AccountError('Your progress is too large to keep online. It is still saved on this device.')
    const s = await sb()
    const { error } = await s.from('progress').upsert({ user_id: userId, doc, updated_at: new Date().toISOString() })
    if (error) throw new AccountError(plain(error))
  },
}

// A picture, cropped to the middle square and shrunk to 96 × 96 on the device, as WebP (JPEG where WebP cannot
// be made). That is a few kilobytes, so storage stays tiny however many people sign up.
export async function shrinkAvatar(file, size = 96) {
  if (file.size > LIMITS.pictureIn) throw new AccountError('That picture is too large. Choose one under 25 MB.')
  const img = await createImageBitmap(file)
  const side = Math.min(img.width, img.height)
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')
  g.imageSmoothingQuality = 'high'
  g.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size)
  img.close?.()
  const as = (type, q) => new Promise((ok) => c.toBlob(ok, type, q))
  // step the quality down until it fits (it nearly always fits first time)
  for (const q of [0.8, 0.6, 0.4]) {
    const webp = await as('image/webp', q)
    const out = webp && webp.type === 'image/webp' ? webp : await as('image/jpeg', q)
    if (out && out.size <= LIMITS.pictureOut) return out
  }
  throw new AccountError('That picture could not be made small enough. Try another one.')
}
