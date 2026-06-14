<template>
  <a
    :href="`/autor/${author.slug}`"
    class="group flex flex-col rounded-lg border border-border bg-surface-2 transition-all duration-200 hover:border-border-hover overflow-hidden"
  >
    <div class="flex aspect-[1/1] sm:aspect-[3/4] items-center justify-center bg-surface-1 overflow-hidden">
      <img
        v-if="author.photo_url"
        :src="author.photo_url"
        :alt="author.name"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div
        v-else
        class="flex h-full w-full items-center justify-center bg-surface-3"
      >
        <span class="font-heading text-3xl font-bold text-text-dim select-none">{{ author.name.charAt(0).toUpperCase() }}</span>
      </div>
    </div>
    <div class="flex flex-col gap-0.5 p-3">
      <h3 class="font-heading font-semibold text-sm leading-tight line-clamp-2">{{ author.name }}</h3>
      <p class="text-xs text-text-muted">{{ author.book_count }} {{ author.book_count === 1 ? 'título' : 'títulos' }}</p>
    </div>
  </a>
</template>

<script setup lang="ts">
defineProps<{
  author: {
    id: number
    name: string
    slug: string
    photo_url: string | null
    book_count: number
  }
}>()
</script>