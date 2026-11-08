// Accounts. The app only talks to an AuthProvider and a ProgressRepository, so the local versions here can be
// swapped for a hosted service (see supabase.js / firebase.js) without touching the rest of the app.
//
// AuthProvider
//   listProfiles()                 -> [{ id, name, hasPassword, created }]
//   signUp({ name, password? })    -> profile          (signed in afterwards)
//   signIn(id, password?)          -> profile          (throws AuthError 'wrong_password')
//   signOut()
//   current()                      -> profile | null
//   remove(id, password?)
// ProgressRepository
//   load(userId)                   -> progress | null
//   save(userId, progress)
import { LocalAuthProvider, LocalProgressRepository } from './local.js'

export class AuthError extends Error {
  constructor(code, message) { super(message); this.code = code }
}

// The one place to change when moving to a hosted service.
export const auth = new LocalAuthProvider()
export const progressRepo = new LocalProgressRepository()
