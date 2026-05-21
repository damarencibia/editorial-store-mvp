<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex justify-end"
    >
      <div class="fixed inset-0 bg-black/40" @click="open = false" />
      <div class="relative z-50 flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        <div class="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 class="text-lg font-semibold">Cart ({{ cartStore.count }})</h2>
          <button
            @click="open = false"
            class="cursor-pointer rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div v-if="cartStore.items.length === 0" class="flex flex-1 items-center justify-center p-8 text-gray-400">
          <p>Your cart is empty</p>
        </div>

        <div v-else class="flex-1 overflow-y-auto px-4 py-4">
          <div
            v-for="item in cartStore.items"
            :key="item.bookId"
            class="flex gap-4 border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0"
          >
            <a :href="`/book/${item.slug}`" class="h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
              <img :src="item.coverUrl" :alt="item.title" class="h-full w-full object-cover" />
            </a>
            <div class="flex flex-1 flex-col justify-between">
              <div>
                <a :href="`/book/${item.slug}`" class="text-sm font-medium hover:text-indigo-600 transition-colors">
                  {{ item.title }}
                </a>
                <p class="text-xs text-gray-500">{{ item.author }}</p>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <button
                    @click="cartStore.updateQuantity(item.bookId, item.quantity - 1)"
                    class="cursor-pointer flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    -
                  </button>
                  <span class="w-6 text-center text-sm font-medium">{{ item.quantity }}</span>
                  <button
                    @click="cartStore.updateQuantity(item.bookId, item.quantity + 1)"
                    class="cursor-pointer flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    +
                  </button>
                </div>
                <span class="text-sm font-semibold">${{ formatPrice(item.price * item.quantity) }}</span>
              </div>
            </div>
            <button
              @click="cartStore.removeItem(item.bookId)"
              class="cursor-pointer self-start p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
            </button>
          </div>
        </div>

        <div v-if="cartStore.items.length > 0" class="border-t border-gray-200 px-4 py-4">
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm text-gray-600">Total</span>
            <span class="text-xl font-bold">${{ formatPrice(cartStore.total) }}</span>
          </div>
          <CheckoutButton :items="cartStore.items" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { cartStore } from '../lib/cartStore'
import CheckoutButton from './CheckoutButton.vue'

const open = ref(false)

function onToggle() {
  open.value = !open.value
}

onMounted(() => {
  window.addEventListener('toggle-cart', onToggle)
})

onUnmounted(() => {
  window.removeEventListener('toggle-cart', onToggle)
})

function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2)
}
</script>
