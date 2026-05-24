import type { User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { getServerSupabase } from './auth'

export interface Profile {
  id: string
  email: string | null
  role: 'customer' | 'admin'
  full_name: string | null
  created_at: string
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  return data as Profile | null
}

export async function isAdmin(user: User | null): Promise<boolean> {
  if (!user) return false
  const profile = await getProfile(user.id)
  return profile?.role === 'admin'
}

export async function getServerProfile(
  serverSupabase: ReturnType<typeof getServerSupabase>,
): Promise<Profile | null> {
  const { data: { user } } = await serverSupabase.auth.getUser()
  if (!user) return null

  const { data } = await serverSupabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data as Profile | null
}

export async function getServerProfileFromRequest(
  request: Request,
  setCookie?: (name: string, value: string, options?: Record<string, unknown>) => void,
): Promise<{ supabase: ReturnType<typeof getServerSupabase>; profile: Profile | null }> {
  const serverSupabase = getServerSupabase(request, setCookie)
  const profile = await getServerProfile(serverSupabase)
  return { supabase: serverSupabase, profile }
}
