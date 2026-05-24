import { reactive } from 'vue'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '../lib/profiles'

export const auth = reactive({
  user: null as User | null,
  profile: null as Profile | null,
  loading: true,
})

let initialized = false

async function fetchOrCreateProfile(userId: string, email: string | undefined) {
  const { supabase } = await import('../lib/supabase')

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (data) return data as Profile

  const { data: created } = await supabase
    .from('profiles')
    .insert({ id: userId, email, role: 'customer' })
    .select()
    .single()

  return (created ?? null) as Profile | null
}

export async function initAuth() {
  if (initialized) return
  initialized = true

  const { supabase } = await import('../lib/supabase')

  const { data: { session } } = await supabase.auth.getSession()
  auth.user = session?.user ?? null

  if (auth.user) {
    auth.profile = await fetchOrCreateProfile(auth.user.id, auth.user.email)
  }

  auth.loading = false

  supabase.auth.onAuthStateChange(async (_event, session) => {
    auth.user = session?.user ?? null

    if (auth.user) {
      auth.profile = await fetchOrCreateProfile(auth.user.id, auth.user.email)
    } else {
      auth.profile = null
    }
  })
}

export function isAdmin(): boolean {
  return auth.profile?.role === 'admin'
}
