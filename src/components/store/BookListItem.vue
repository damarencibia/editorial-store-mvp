<template>
  <a
    :href="`/book/${book.slug}`"
    class="flex items-start gap-3 sm:gap-6 rounded-lg border border-border bg-surface-2 p-3 sm:p-5 transition-all duration-200 hover:border-border-hover hover:bg-surface-2/80"
  >
    <div class="relative flex h-20 w-14 sm:h-24 sm:w-16 shrink-0 items-center justify-center overflow-hidden rounded bg-surface-1">
      <span v-if="book.is_trending"
        class="absolute top-0.5 left-0.5 z-10 rounded-full bg-orange-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm leading-none"
      >
        🔥
      </span>
      <img
        v-if="book.cover_url"
        :src="book.cover_url"
        :alt="book.title"
        class="h-full w-full object-cover"
        loading="lazy"
      />
      <span
        v-else
        class="font-heading text-lg font-bold text-text-dim select-none"
      >{{ book.title.charAt(0).toUpperCase() }}</span>
    </div>
    <div class="flex min-w-0 flex-1 flex-col gap-2">
      <div class="min-w-0">
        <h3 class="truncate font-heading text-base font-semibold text-text-primary">{{ book.title }}</h3>
        <p class="mt-1 text-sm text-text-muted">{{ book.author }}</p>
        <p v-if="book.publisher" class="mt-0.5 text-sm text-text-dim">{{ book.publisher }}</p>
      </div>
      <span class="mt-1 text-lg font-bold text-accent">${{ formatPrice(book.price) }}</span>
    </div>
  </a>
</template>

<script setup lang="ts">
defineProps<{
  book: {
    id: number
    slug: string
    title: string
    author: string
    price: number
    cover_url: string | null
    publisher?: string | null
    is_trending?: boolean
  }
}>()

function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2)
}
</script>
