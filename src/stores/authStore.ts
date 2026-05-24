import { reactive } from 'vue'

export const auth = reactive({
  user: null as import('@supabase/supabase-js').User | null,
  loading: true,
})

let initialized = false

export async function initAuth() {
  if (initialized) return
  initialized = true

  const { supabase } = await import('../lib/supabase')

  const { data: { session } } = await supabase.auth.getSession()
  auth.user = session?.user ?? null
  auth.loading = false

  supabase.auth.onAuthStateChange((_event, session) => {
    auth.user = session?.user ?? null
  })
}
