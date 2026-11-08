// Optional accounts. Progress always lives on the device first, so the app works offline with no account.
// Signing in (email and password, through Supabase) keeps a copy online, so it follows you between devices.
// Table: progress(user_id uuid primary key references auth.users, doc jsonb, updated_at timestamptz),
// with row-level security allowing each person to read and write only their own row.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js'

export const accountsAvailable = !!(SUPABASE_URL && SUPABASE_ANON_KEY)

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

const asUser = (u) => u && { id: u.id, email: u.email, name: u.user_metadata?.name || '' }

// what Supabase says, in plain words
function plain(error) {
  const m = error?.message || ''
  if (/invalid login/i.test(m)) return 'That email and password do not match an account.'
  if (/already registered|already exists/i.test(m)) return 'There is already an account with that email. Sign in instead.'
  if (/email not confirmed/i.test(m)) return 'Confirm your email first: open the link we sent you, then sign in.'
  if (/password should be at least/i.test(m)) return 'Choose a password of at least 8 characters.'
  if (/fetch|network/i.test(m)) return 'Could not reach the server. Check your connection.'
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
    const s = await sb()
    const { error } = await s.from('progress').upsert({ user_id: userId, doc, updated_at: new Date().toISOString() })
    if (error) throw new AccountError(plain(error))
  },
}
