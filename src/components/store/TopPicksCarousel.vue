<template>
  <div v-if="hasMultiplePages" ref="containerRef" class="relative group">
    <button
      @click="prev"
      :disabled="animating"
      class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-10 h-10 rounded-full bg-surface-2/90 backdrop-blur-sm border border-border flex items-center justify-center text-text-primary hover:text-accent hover:border-accent/40 transition-all shadow-sm opacity-60 sm:opacity-0 sm:group-hover:opacity-100 disabled:opacity-30 cursor-pointer"
      aria-label="Anterior"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
    </button>

    <div ref="viewportRef" class="overflow-hidden">
      <div
        ref="trackRef"
        class="flex gap-4"
        :style="trackStyle"
      >
        <div
          v-for="(book, i) in displayBooks"
          :key="`${book.id}-${i}`"
          class="flex-shrink-0"
          :style="{ width: cardWidthPx + 'px' }"
        >
          <BookCard :book="book" />
        </div>
      </div>
    </div>

    <button
      @click="next"
      :disabled="animating"
      class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-10 h-10 rounded-full bg-surface-2/90 backdrop-blur-sm border border-border flex items-center justify-center text-text-primary hover:text-accent hover:border-accent/40 transition-all shadow-sm opacity-60 sm:opacity-0 sm:group-hover:opacity-100 disabled:opacity-30 cursor-pointer"
      aria-label="Siguiente"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
    </button>
  </div>

  <div v-else-if="books.length" class="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 sm:gap-6">
    <BookCard v-for="book in books" :key="book.id" :book="book" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import BookCard from './BookCard.vue'

const props = defineProps<{
  books: any[]
}>()

const GAP = 16
const TRANSITION_MS = 350

const viewportRef = ref<HTMLElement | null>(null)
const visibleCount = ref(4)
const viewportWidth = ref(0)
const visualIndex = ref(0)
const transitionEnabled = ref(true)
const animating = ref(false)

const L = computed(() => props.books.length)
const hasMultiplePages = computed(() => L.value > visibleCount.value)

const displayBooks = computed(() => {
  if (!props.books.length) return []
  return [...props.books, ...props.books, ...props.books]
})

const cardWidthPx = computed(() => {
  if (!viewportWidth.value || !visibleCount.value) return 0
  const gaps = GAP * (visibleCount.value - 1)
  return Math.floor((viewportWidth.value - gaps) / visibleCount.value)
})

const step = computed(() => cardWidthPx.value + GAP)

const trackStyle = computed(() => ({
  transform: `translateX(${-visualIndex.value * step.value}px)`,
  transition: transitionEnabled.value ? `transform ${TRANSITION_MS}ms ease` : 'none'
}))

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function next() {
  if (animating.value || !L.value) return
  animating.value = true

  visualIndex.value++

  if (visualIndex.value >= 2 * L.value) {
    await delay(TRANSITION_MS)
    transitionEnabled.value = false
    visualIndex.value -= L.value
    await nextTick()
    transitionEnabled.value = true
  } else {
    await delay(TRANSITION_MS)
  }

  animating.value = false
}

async function prev() {
  if (animating.value || !L.value) return
  animating.value = true

  visualIndex.value--

  if (visualIndex.value < L.value) {
    await delay(TRANSITION_MS)
    transitionEnabled.value = false
    visualIndex.value += L.value
    await nextTick()
    transitionEnabled.value = true
  } else {
    await delay(TRANSITION_MS)
  }

  animating.value = false
}

let mqListener: (() => void) | null = null
let resizeObserver: ResizeObserver | null = null

function updateViewportWidth() {
  if (viewportRef.value) {
    viewportWidth.value = viewportRef.value.offsetWidth
  }
}

function updateVisibleCount() {
  const w = window.innerWidth
  if (w < 640) visibleCount.value = 2
  else if (w < 1024) visibleCount.value = 3
  else visibleCount.value = 4
}

onMounted(() => {
  updateVisibleCount()
  updateViewportWidth()

  visualIndex.value = L.value

  mqListener = () => {
    updateVisibleCount()
    updateViewportWidth()
  }
  window.addEventListener('resize', mqListener)

  if (viewportRef.value) {
    resizeObserver = new ResizeObserver(() => {
      updateViewportWidth()
    })
    resizeObserver.observe(viewportRef.value)
  }
})

onUnmounted(() => {
  if (mqListener) window.removeEventListener('resize', mqListener)
  resizeObserver?.disconnect()
})
</script>
