<template>
  <div class="relative">
    <!-- Desktop -->
    <div class="hidden sm:block relative">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        ref="inputRef"
        v-model="query"
        type="text"
        placeholder="Buscar libros, autores, colecciones..."
        @click="openDesktop"
        @keydown.escape="closeDesktop"
        class="w-full rounded-lg border border-border bg-surface-1 py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors cursor-pointer"
      />
    </div>

    <!-- Mobile button -->
    <button
      @click="mobileOpen = true"
      class="sm:hidden cursor-pointer rounded-lg p-2 text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors"
      aria-label="Buscar"
    >
      <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    </button>

    <!-- Mobile overlay -->
    <Teleport to="body">
      <Transition name="overlay">
        <div
          v-if="mobileOpen"
          class="fixed inset-0 z-50 flex flex-col bg-surface-2"
        >
          <div class="flex items-center gap-3 border-b border-border px-4 py-3">
            <button
              @click="mobileOpen = false"
              class="cursor-pointer rounded-lg p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 12H5m7-7l-7 7 7 7" />
              </svg>
            </button>
            <div class="relative flex-1">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                ref="mobileInputRef"
                v-model="query"
                type="text"
                placeholder="Buscar..."
                @keydown.escape="mobileOpen = false"
                class="w-full rounded-lg border border-border bg-surface-1 py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <button
              @click="mobileOpen = false"
              class="cursor-pointer rounded-lg p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto px-4 py-4">
            <div v-if="loading" class="flex items-center justify-center py-16">
              <div class="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            </div>

            <template v-else-if="hasResults && query.length >= 2">
              <!-- Books -->
              <div v-if="results.books.length > 0" class="mb-6">
                <p class="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Libros</p>
                <div class="space-y-1">
                  <a
                    v-for="book in results.books"
                    :key="'b' + book.id"
                    :href="`/book/${book.slug}`"
                    @click="mobileOpen = false"
                    class="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-3 transition-colors"
                  >
                    <div class="w-10 h-14 rounded flex-shrink-0 bg-surface-3 overflow-hidden">
                      <img v-if="book.cover_url" :src="book.cover_url" :alt="book.title" class="w-full h-full object-cover" />
                      <span v-else class="flex h-full w-full items-center justify-center text-xs font-bold text-text-dim">{{ book.title.charAt(0).toUpperCase() }}</span>
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="text-sm font-medium text-text-primary truncate">{{ book.title }}</p>
                      <p class="text-xs text-text-muted truncate">{{ book.author }}</p>
                    </div>
                    <span class="text-xs font-bold text-accent shrink-0">${{ formatPrice(book.price) }}</span>
                  </a>
                </div>
              </div>

              <!-- Authors -->
              <div v-if="results.authors.length > 0" class="mb-6">
                <p class="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Autores</p>
                <div class="space-y-1">
                  <a
                    v-for="author in results.authors"
                    :key="'a' + author.id"
                    :href="`/autor/${author.slug}`"
                    @click="mobileOpen = false"
                    class="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-3 transition-colors"
                  >
                    <div class="w-9 h-9 rounded-full flex-shrink-0 bg-surface-3 overflow-hidden">
                      <img v-if="author.photo_url" :src="author.photo_url" :alt="author.name" class="w-full h-full object-cover" />
                      <span v-else class="flex h-full w-full items-center justify-center text-xs font-bold text-text-dim">{{ author.name.charAt(0).toUpperCase() }}</span>
                    </div>
                    <p class="text-sm font-medium text-text-primary truncate">{{ author.name }}</p>
                  </a>
                </div>
              </div>

              <!-- Collections -->
              <div v-if="results.collections.length > 0" class="mb-6">
                <p class="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Colecciones</p>
                <div class="space-y-1">
                  <a
                    v-for="col in results.collections"
                    :key="'c' + col.id"
                    :href="`/colecciones/${col.slug}`"
                    @click="mobileOpen = false"
                    class="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-3 transition-colors"
                  >
                    <div class="w-10 h-10 rounded flex-shrink-0 bg-surface-3 overflow-hidden">
                      <img v-if="col.cover_url" :src="col.cover_url" :alt="col.name" class="w-full h-full object-cover" />
                      <span v-else class="flex h-full w-full items-center justify-center text-xs font-bold text-text-dim">{{ col.name.charAt(0).toUpperCase() }}</span>
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="text-sm font-medium text-text-primary truncate">{{ col.name }}</p>
                      <p v-if="col.description" class="text-xs text-text-muted line-clamp-1">{{ col.description }}</p>
                    </div>
                  </a>
                </div>
              </div>
            </template>

            <div v-else-if="query.length >= 2" class="py-16 text-center text-sm text-text-dim">
              Sin resultados para "{{ query }}"
            </div>

            <div v-else class="py-16 text-center text-sm text-text-dim">
              Escribe al menos 2 caracteres para buscar
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Desktop dialog -->
    <Teleport to="body">
      <Transition name="dialog">
        <div
          v-if="desktopOpen"
          class="fixed inset-0 z-50"
          @click="closeDesktop"
        >
          <div class="absolute inset-0 bg-black/40" />
          <div
            :style="dialogStyle"
            class="fixed rounded-xl border border-border bg-surface-2 shadow-2xl overflow-hidden"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center gap-3 border-b border-border px-4 py-3">
              <svg class="h-4 w-4 text-text-dim shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                ref="dialogInputRef"
                v-model="query"
                type="text"
                placeholder="Buscar libros, autores, colecciones..."
                @keydown.escape="closeDesktop"
                class="flex-1 rounded-lg border border-border bg-surface-1 py-2 pl-3 pr-3 text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors"
              />
              <button
                @click="closeDesktop"
                class="cursor-pointer rounded-lg p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors"
              >
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Results -->
            <div class="overflow-y-auto max-h-[60vh] p-4">
              <div v-if="loading" class="flex items-center justify-center py-16">
                <div class="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              </div>

              <template v-else-if="hasResults && query.length >= 2">
                <!-- Books -->
                <div v-if="results.books.length > 0" class="mb-6">
                  <p class="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Libros</p>
                  <div class="space-y-1">
                    <a
                      v-for="book in results.books"
                      :key="'b' + book.id"
                      :href="`/book/${book.slug}`"
                      @click="closeDesktop"
                      class="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-3 transition-colors"
                    >
                      <div class="w-10 h-14 rounded flex-shrink-0 bg-surface-3 overflow-hidden">
                        <img v-if="book.cover_url" :src="book.cover_url" :alt="book.title" class="w-full h-full object-cover" />
                        <span v-else class="flex h-full w-full items-center justify-center text-xs font-bold text-text-dim">{{ book.title.charAt(0).toUpperCase() }}</span>
                      </div>
                      <div class="min-w-0 flex-1">
                        <p class="text-sm font-medium text-text-primary truncate">{{ book.title }}</p>
                        <p class="text-xs text-text-muted truncate">{{ book.author }}</p>
                      </div>
                      <span class="text-xs font-bold text-accent shrink-0">${{ formatPrice(book.price) }}</span>
                    </a>
                  </div>
                </div>

                <!-- Authors -->
                <div v-if="results.authors.length > 0" class="mb-6">
                  <p class="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Autores</p>
                  <div class="space-y-1">
                    <a
                      v-for="author in results.authors"
                      :key="'a' + author.id"
                      :href="`/autor/${author.slug}`"
                      @click="closeDesktop"
                      class="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-3 transition-colors"
                    >
                      <div class="w-9 h-9 rounded-full flex-shrink-0 bg-surface-3 overflow-hidden">
                        <img v-if="author.photo_url" :src="author.photo_url" :alt="author.name" class="w-full h-full object-cover" />
                        <span v-else class="flex h-full w-full items-center justify-center text-xs font-bold text-text-dim">{{ author.name.charAt(0).toUpperCase() }}</span>
                      </div>
                      <p class="text-sm font-medium text-text-primary truncate">{{ author.name }}</p>
                    </a>
                  </div>
                </div>

                <!-- Collections -->
                <div v-if="results.collections.length > 0" class="mb-6">
                  <p class="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Colecciones</p>
                  <div class="space-y-1">
                    <a
                      v-for="col in results.collections"
                      :key="'c' + col.id"
                      :href="`/colecciones/${col.slug}`"
                      @click="closeDesktop"
                      class="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-3 transition-colors"
                    >
                      <div class="w-10 h-10 rounded flex-shrink-0 bg-surface-3 overflow-hidden">
                        <img v-if="col.cover_url" :src="col.cover_url" :alt="col.name" class="w-full h-full object-cover" />
                        <span v-else class="flex h-full w-full items-center justify-center text-xs font-bold text-text-dim">{{ col.name.charAt(0).toUpperCase() }}</span>
                      </div>
                      <div class="min-w-0 flex-1">
                        <p class="text-sm font-medium text-text-primary truncate">{{ col.name }}</p>
                        <p v-if="col.description" class="text-xs text-text-muted line-clamp-1">{{ col.description }}</p>
                      </div>
                    </a>
                  </div>
                </div>
              </template>

              <div v-else-if="query.length >= 2" class="py-16 text-center text-sm text-text-dim">
                Sin resultados para "{{ query }}"
              </div>

              <div v-else class="py-16 text-center text-sm text-text-dim">
                Escribe al menos 2 caracteres para buscar
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'

interface BookResult {
  id: number
  title: string
  slug: string
  price: number
  cover_url: string | null
  is_trending: boolean
  author: string | null
}

interface AuthorResult {
  id: number
  name: string
  slug: string
  photo_url: string | null
}

interface CollectionResult {
  id: number
  name: string
  slug: string
  cover_url: string | null
  description: string | null
}

interface SearchResults {
  books: BookResult[]
  authors: AuthorResult[]
  collections: CollectionResult[]
}

const inputRef = ref<HTMLInputElement | null>(null)
const dialogInputRef = ref<HTMLInputElement | null>(null)
const mobileInputRef = ref<HTMLInputElement | null>(null)

const query = ref('')
const results = ref<SearchResults>({ books: [], authors: [], collections: [] })
const loading = ref(false)
const mobileOpen = ref(false)
const desktopOpen = ref(false)
const dialogStyle = ref({})

let debounceTimer: ReturnType<typeof setTimeout> | null = null
let searchId = 0

const hasResults = computed(() =>
  results.value.books.length > 0 ||
  results.value.authors.length > 0 ||
  results.value.collections.length > 0
)

function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2)
}

function openDesktop() {
  if (!inputRef.value) return
  const rect = inputRef.value.getBoundingClientRect()
  const panelWidth = 560
  let left = rect.left + rect.width / 2 - panelWidth / 2
  left = Math.max(16, Math.min(left, window.innerWidth - panelWidth - 16))
  dialogStyle.value = {
    top: rect.bottom + 8 + 'px',
    left: left + 'px',
    width: panelWidth + 'px',
  }
  desktopOpen.value = true
}

function closeDesktop() {
  desktopOpen.value = false
  query.value = ''
  results.value = { books: [], authors: [], collections: [] }
}

async function doSearch() {
  const q = query.value.trim()
  if (q.length < 2) {
    results.value = { books: [], authors: [], collections: [] }
    loading.value = false
    return
  }

  const id = ++searchId
  loading.value = true

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
    if (id !== searchId) return
    const data = await res.json()
    if (id !== searchId) return
    results.value = data
  } catch {
    if (id === searchId) {
      results.value = { books: [], authors: [], collections: [] }
    }
  } finally {
    if (id === searchId) {
      loading.value = false
    }
  }
}

watch(query, () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (query.value.trim().length >= 2) {
    debounceTimer = setTimeout(doSearch, 300)
  } else {
    results.value = { books: [], authors: [], collections: [] }
  }
})

watch(mobileOpen, (open) => {
  if (open) {
    query.value = ''
    results.value = { books: [], authors: [], collections: [] }
    setTimeout(() => mobileInputRef.value?.focus(), 100)
  }
})

watch(desktopOpen, (open) => {
  if (open) {
    query.value = ''
    results.value = { books: [], authors: [], collections: [] }
    setTimeout(() => dialogInputRef.value?.focus(), 100)
  }
})

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>

<style scoped>
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.2s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(-4px);
}
</style>
