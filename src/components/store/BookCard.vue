<template>
  <div class="group flex flex-col rounded-lg border border-border bg-surface-2 transition-all duration-200 hover:border-border-hover overflow-hidden">
    <a :href="`/book/${book.slug}`" class="flex aspect-[2/3] items-center justify-center bg-surface-1 overflow-hidden">
      <img
        :src="book.cover_url"
        :alt="book.title"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
    </a>
    <div class="flex flex-1 flex-col gap-2 p-4">
      <a :href="`/book/${book.slug}`" class="hover:text-accent transition-colors">
        <h3 class="font-heading font-semibold text-sm leading-tight line-clamp-2">{{ book.title }}</h3>
      </a>
      <p class="text-xs text-text-muted">{{ book.author }}</p>
      <div class="mt-auto flex items-center justify-between pt-2">
        <span class="text-lg font-bold text-accent">${{ formatPrice(book.price) }}</span>
        <button
          @click="addToCart"
          class="cursor-pointer rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent/90 transition-colors"
        >
          + Add
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { cartStore } from '../../lib/cartStore'

const props = defineProps<{
  book: {
    id: number
    slug: string
    title: string
    author: string
    price: number
    cover_url: string
  }
}>()

function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2)
}

function addToCart() {
  cartStore.addItem({
    bookId: props.book.id,
    slug: props.book.slug,
    title: props.book.title,
    author: props.book.author,
    price: props.book.price,
    coverUrl: props.book.cover_url,
  })
}
</script>
