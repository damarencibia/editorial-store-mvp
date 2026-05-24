export function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2)
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function serializeCookie(
  name: string,
  value: string,
  options: Record<string, unknown>,
): string {
  let cookie = `${name}=${value}`
  if (options.path) cookie += `; Path=${options.path}`
  if (typeof options.maxAge === 'number') cookie += `; Max-Age=${options.maxAge}`
  if (options.httpOnly) cookie += '; HttpOnly'
  if (options.sameSite) cookie += `; SameSite=${options.sameSite}`
  if (options.secure) cookie += '; Secure'
  return cookie
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60)
}
