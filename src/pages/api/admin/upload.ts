import type { APIRoute } from 'astro'
import { getServerSupabase } from '../../../lib/auth'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 2 * 1024 * 1024

export const POST: APIRoute = async ({ request }) => {
  const headers = new Headers()
  const serverSupabase = getServerSupabase(request, (name, value, options) => {
    headers.append('Set-Cookie', serializeCookie(name, value, options))
  })

  const { data: { user }, error: authError } = await serverSupabase.auth.getUser()
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401, headers })
  }

  const { data: profile } = await serverSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Acceso denegado' }), { status: 403, headers })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file || file.size === 0) {
      return new Response(JSON.stringify({ error: 'No se envió ningún archivo' }), { status: 400, headers })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return new Response(JSON.stringify({ error: 'Formato no permitido. Usa JPEG, PNG o WebP.' }), { status: 400, headers })
    }

    if (file.size > MAX_SIZE) {
      return new Response(JSON.stringify({ error: 'La imagen supera los 2MB.' }), { status: 400, headers })
    }

    const ext = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp'
    const fileName = `${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ''))}.${ext}`

    const buffer = new Uint8Array(await file.arrayBuffer())

    const { error: uploadError } = await serverSupabase.storage
      .from('book-covers')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      return new Response(JSON.stringify({ error: uploadError.message }), { status: 500, headers })
    }

    const { data: { publicUrl } } = serverSupabase.storage
      .from('book-covers')
      .getPublicUrl(fileName)

    return new Response(JSON.stringify({ url: publicUrl }), { status: 200, headers })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500, headers })
  }
}

function serializeCookie(name: string, value: string, options: Record<string, unknown>): string {
  let cookie = `${name}=${value}`
  if (options.path) cookie += `; Path=${options.path}`
  if (typeof options.maxAge === 'number') cookie += `; Max-Age=${options.maxAge}`
  if (options.httpOnly) cookie += '; HttpOnly'
  if (options.sameSite) cookie += `; SameSite=${options.sameSite}`
  if (options.secure) cookie += '; Secure'
  return cookie
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60)
}
