import type { User } from '@supabase/supabase-js'
import { supabase } from './supabase'

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
  serverSupabase: ReturnType<typeof import('./auth')['getServerSupabase']>,
) {
  const { data: { user } } = await serverSupabase.auth.getUser()
  if (!user) return null

  const { data } = await serverSupabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data as Profile | null
}
