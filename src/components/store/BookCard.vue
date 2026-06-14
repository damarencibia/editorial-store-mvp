<template>
  <div class="group flex flex-col rounded-lg border border-border bg-surface-2 transition-all duration-200 hover:border-border-hover overflow-hidden">
    <div class="relative flex aspect-[3/4] sm:aspect-[4/5] items-center justify-center bg-surface-1 overflow-hidden">
      <span v-if="book.is_trending"
        class="absolute top-2 left-2 z-10 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm"
      >
        🔥 Tendencia
      </span>
      <a :href="`/book/${book.slug}`" class="flex h-full w-full items-center justify-center">
      <img
        v-if="book.cover_url"
        :src="book.cover_url"
        :alt="book.title"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div
        v-else
        class="flex h-full w-full items-center justify-center bg-surface-3"
      >
        <span class="font-heading text-xl font-bold text-text-dim select-none">{{ book.title.charAt(0).toUpperCase() }}</span>
      </div>
    </a>
    </div>
    <div class="flex flex-1 flex-col gap-1 p-2">
      <a :href="`/book/${book.slug}`" class="hover:text-accent transition-colors">
        <h3 class="font-heading font-semibold text-sm leading-tight line-clamp-2">{{ book.title }}</h3>
      </a>
      <p class="text-xs text-text-muted">{{ book.author }}</p>
      <span class="mt-auto text-xs font-bold text-accent">${{ formatPrice(book.price) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  book: {
    id: number
    slug: string
    title: string
    author: string
    price: number
    cover_url: string
    is_trending?: boolean
  }
}>()

function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2)
}
</script>
