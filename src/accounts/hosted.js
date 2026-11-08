// Hosted accounts, for later. Each class implements the same interface as local.js, so switching is one line in
// accounts/index.js. Neither is wired up yet: they throw until a project URL and key are configured.
//
// Supabase
//   signUp       supabase.auth.signUp({ email, password, options: { data: { name } } })
//   signIn       supabase.auth.signInWithPassword({ email, password })
//   signOut      supabase.auth.signOut()
//   current      supabase.auth.getUser()
//   progress     table progress(user_id uuid primary key references auth.users, doc jsonb, updated_at timestamptz)
//                with row-level security: using (auth.uid() = user_id)
//   load/save    select doc where user_id = uid / upsert { user_id, doc, updated_at }
//
// Firebase
//   signUp       createUserWithEmailAndPassword(auth, email, password) then updateProfile(user, { displayName })
//   signIn       signInWithEmailAndPassword(auth, email, password)
//   signOut      signOut(auth)
//   current      auth.currentUser
//   progress     Firestore document progress/{uid}, rule: allow read, write: if request.auth.uid == uid
//
// Local profiles can be uploaded on first sign-in: read progress-<localId> and save it under the hosted id,
// keeping whichever copy has the later updatedAt.

class NotConfigured extends Error {
  constructor(service) { super(`${service} accounts are not set up yet.`); this.code = 'not_configured' }
}

export class SupabaseAuthProvider {
  constructor(config) { this.config = config }
  async listProfiles() { throw new NotConfigured('Supabase') }
  async current() { throw new NotConfigured('Supabase') }
  async signUp() { throw new NotConfigured('Supabase') }
  async signIn() { throw new NotConfigured('Supabase') }
  async signOut() { throw new NotConfigured('Supabase') }
  async remove() { throw new NotConfigured('Supabase') }
}

export class FirebaseAuthProvider {
  constructor(config) { this.config = config }
  async listProfiles() { throw new NotConfigured('Firebase') }
  async current() { throw new NotConfigured('Firebase') }
  async signUp() { throw new NotConfigured('Firebase') }
  async signIn() { throw new NotConfigured('Firebase') }
  async signOut() { throw new NotConfigured('Firebase') }
  async remove() { throw new NotConfigured('Firebase') }
}
