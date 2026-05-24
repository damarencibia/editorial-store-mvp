<template>
  <Teleport to="body">
    <Transition name="drawer-backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-50"
        @click.self="close"
      >
        <div class="fixed inset-0 bg-black/70 backdrop-blur-sm" @click="close" />

        <Transition name="drawer-panel">
          <div class="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-surface-1 border-l border-border shadow-2xl shadow-black/50">
            <div class="relative flex items-center justify-between border-b border-border/60 px-5 py-4">
              <div class="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                <h2 class="font-heading text-lg font-semibold tracking-tight text-text-primary">
                  Tu Carrito
                  <span class="ml-1.5 text-sm font-normal text-text-muted">({{ cartStore.count }})</span>
                </h2>
              </div>
              <button
                @click="close"
                class="cursor-pointer flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div v-if="cartStore.items.length === 0" class="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-text-dim">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <p class="text-sm">Tu carrito está vacío</p>
              <a href="/catalog"
                class="cursor-pointer mt-1 rounded-lg bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20 transition-colors"
              >
                Explorar catálogo
              </a>
            </div>

            <div v-else class="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
              <TransitionGroup name="item-list" tag="div" class="space-y-3">
                <div
                  v-for="item in cartStore.items"
                  :key="item.bookId"
                  class="group relative flex gap-4 rounded-xl border border-border/40 bg-surface-2/40 p-3 transition-all hover:border-border/80 hover:bg-surface-2/80"
                  :class="{ 'opacity-50 pointer-events-none': removingBookId === item.bookId }"
                >
                  <a :href="`/book/${item.slug}`" class="h-22 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-surface-3">
                    <img :src="item.coverUrl" :alt="item.title" class="h-full w-full object-cover" />
                  </a>

                  <div class="flex flex-1 flex-col justify-between min-w-0">
                    <div>
                      <a
                        :href="`/book/${item.slug}`"
                        class="line-clamp-1 text-sm font-medium text-text-primary hover:text-accent transition-colors"
                      >
                        {{ item.title }}
                      </a>
                      <p class="mt-0.5 truncate text-xs text-text-muted">{{ item.author }}</p>
                    </div>

                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-1.5 rounded-lg border border-border/60 bg-surface-1 p-0.5">
                        <button
                          @click="cartStore.updateQuantity(item.bookId, item.quantity - 1)"
                          class="cursor-pointer flex h-7 w-7 items-center justify-center rounded-md text-sm text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                        </button>
                        <span class="flex h-7 min-w-[1.75rem] items-center justify-center text-xs font-semibold text-text-primary tabular-nums">{{ item.quantity }}</span>
                        <button
                          @click="cartStore.updateQuantity(item.bookId, item.quantity + 1)"
                          class="cursor-pointer flex h-7 w-7 items-center justify-center rounded-md text-sm text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                        </button>
                      </div>
                      <span class="text-sm font-bold text-text-primary tabular-nums">${{ formatPrice(item.price * item.quantity) }}</span>
                    </div>
                  </div>

                  <button
                    v-if="confirmingRemove !== item.bookId"
                    @click="startConfirmRemove(item.bookId)"
                    class="cursor-pointer absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-md text-text-dim opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-400/10 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>

                  <div
                    v-else
                    class="absolute inset-0 flex items-center justify-center gap-2 rounded-xl bg-surface-1/95 backdrop-blur-sm"
                  >
                    <span class="text-xs text-text-muted">¿Eliminar?</span>
                    <button
                      @click="confirmRemove(item.bookId)"
                      class="cursor-pointer rounded-md bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400 hover:bg-red-500/30 transition-colors"
                    >
                      Sí
                    </button>
                    <button
                      @click="confirmingRemove = null"
                      class="cursor-pointer rounded-md bg-surface-3 px-3 py-1 text-xs font-medium text-text-muted hover:text-text-primary transition-colors"
                    >
                      No
                    </button>
                  </div>
                </div>
              </TransitionGroup>
            </div>

            <div v-if="cartStore.items.length > 0" class="border-t border-border/60 px-5 py-4 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-text-muted">Total</span>
                <div class="flex items-baseline gap-1.5">
                  <span class="text-xs text-text-dim">{{ cartStore.count }} {{ cartStore.count === 1 ? 'ítem' : 'ítems' }}</span>
                  <span class="text-xl font-bold font-heading tracking-tight text-text-primary">${{ formatPrice(cartStore.total) }}</span>
                </div>
              </div>
              <CheckoutButton :items="cartStore.items" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { cartStore } from '../../lib/cartStore'
import CheckoutButton from './CheckoutButton.vue'

const open = ref(false)
const confirmingRemove = ref<number | null>(null)
const removingBookId = ref<number | null>(null)

function close() {
  open.value = false
  confirmingRemove.value = null
  removingBookId.value = null
}

function onToggle() {
  open.value = !open.value
  if (!open.value) {
    confirmingRemove.value = null
    removingBookId.value = null
  }
}

onMounted(() => {
  window.addEventListener('toggle-cart', onToggle)
})

onUnmounted(() => {
  window.removeEventListener('toggle-cart', onToggle)
})

function startConfirmRemove(bookId: number) {
  confirmingRemove.value = bookId
}

function confirmRemove(bookId: number) {
  removingBookId.value = bookId
  confirmingRemove.value = null
  setTimeout(() => {
    cartStore.removeItem(bookId)
    removingBookId.value = null
  }, 200)
}

function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2)
}
</script>

<style scoped>
.drawer-backdrop-enter-active,
.drawer-backdrop-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-backdrop-enter-from,
.drawer-backdrop-leave-to {
  opacity: 0;
}

.drawer-panel-enter-active {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-panel-leave-active {
  transition: transform 0.25s ease;
}
.drawer-panel-enter-from,
.drawer-panel-leave-to {
  transform: translateX(100%);
}

.item-list-enter-active {
  transition: all 0.3s ease-out;
}
.item-list-leave-active {
  transition: all 0.25s ease-in;
  position: absolute;
}
.item-list-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.item-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.item-list-move {
  transition: transform 0.3s ease;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
}
.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.15);
}
</style>
