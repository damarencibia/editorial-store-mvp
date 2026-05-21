export interface CartItem {
  bookId: number
  slug: string
  title: string
  author: string
  price: number
  coverUrl: string
  quantity: number
}

const CART_KEY = 'bookstore_cart'

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(CART_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as CartItem[]
  } catch {
    return []
  }
}

function saveCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

export function addItem(item: Omit<CartItem, 'quantity'>): CartItem[] {
  const cart = getCart()
  const existing = cart.find((i) => i.bookId === item.bookId)
  if (existing) {
    existing.quantity += 1
  } else {
    cart.push({ ...item, quantity: 1 })
  }
  saveCart(cart)
  return cart
}

export function removeItem(bookId: number): CartItem[] {
  const cart = getCart().filter((i) => i.bookId !== bookId)
  saveCart(cart)
  return cart
}

export function updateQuantity(bookId: number, quantity: number): CartItem[] {
  const cart = getCart()
  const item = cart.find((i) => i.bookId === bookId)
  if (item) {
    item.quantity = Math.max(0, quantity)
  }
  const updated = cart.filter((i) => i.quantity > 0)
  saveCart(updated)
  return updated
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY)
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0)
}

export function getCartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0)
}
