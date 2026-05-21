import { reactive } from 'vue'
import * as cartLib from './cart'
import type { CartItem } from './cart'

export const cartStore = reactive({
  items: cartLib.getCart() as CartItem[],

  get count(): number {
    return cartLib.getCartCount(this.items)
  },

  get total(): number {
    return cartLib.getCartTotal(this.items)
  },

  addItem(item: Omit<CartItem, 'quantity'>): void {
    this.items = cartLib.addItem(item)
  },

  removeItem(bookId: number): void {
    this.items = cartLib.removeItem(bookId)
  },

  updateQuantity(bookId: number, qty: number): void {
    this.items = cartLib.updateQuantity(bookId, qty)
  },

  clear(): void {
    cartLib.clearCart()
    this.items = []
  },
})
