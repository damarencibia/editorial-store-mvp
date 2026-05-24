import { reactive } from 'vue'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '../lib/profiles'

export const auth = reactive({
  user: null as User | null,
  profile: null as Profile | null,
  loading: true,
})

let initialized = false

export async function initAuth() {
  if (initialized) return
  initialized = true

  const { supabase } = await import('../lib/supabase')

  const { data: { session } } = await supabase.auth.getSession()
  auth.user = session?.user ?? null

  if (auth.user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', auth.user.id)
      .single()
    auth.profile = data as Profile | null
  }

  auth.loading = false

  supabase.auth.onAuthStateChange(async (_event, session) => {
    auth.user = session?.user ?? null

    if (auth.user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', auth.user.id)
        .single()
      auth.profile = data as Profile | null
    } else {
      auth.profile = null
    }
  })
}

export function isAdmin(): boolean {
  return auth.profile?.role === 'admin'
}
