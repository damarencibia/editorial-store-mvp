<template>
  <button
    @click="toggleDrawer"
    class="cursor-pointer relative flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-muted hover:text-text-primary hover:border-border-hover transition-colors"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
    <span v-if="cartStore.count > 0" class="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
      {{ cartStore.count }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { cartStore } from '../../lib/cartStore'

function toggleDrawer() {
  const event = new CustomEvent('toggle-cart')
  window.dispatchEvent(event)
}
</script>
