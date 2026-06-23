import { createServerClient, parseCookieHeader } from '@supabase/ssr'
import { supabase } from './supabase'

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY!

export function getServerSupabase(
  request: Request,
  setCookie?: (name: string, value: string, options?: Record<string, unknown>) => void,
) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get('cookie') ?? '')
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          setCookie?.(name, value, options)
        })
      },
    },
  })
}

export async function signUp(email: string, password: string, fullName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${import.meta.env.PUBLIC_SITE_URL}/auth/callback`,
    },
  })
  return { data, error }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser()
  return data.user
}
