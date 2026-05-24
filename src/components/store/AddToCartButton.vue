<template>
  <button
    @click="add"
    class="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
    Add to Cart
  </button>
</template>

<script setup lang="ts">
import { cartStore } from '../../lib/cartStore'

const props = defineProps<{
  bookId: number
  slug: string
  title: string
  author: string
  price: number
  coverUrl: string
}>()

function add() {
  cartStore.addItem({
    bookId: props.bookId,
    slug: props.slug,
    title: props.title,
    author: props.author,
    price: props.price,
    coverUrl: props.coverUrl,
  })
}
</script>
