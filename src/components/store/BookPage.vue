<template>
  <div>
    <div class="md:flex md:gap-8">
      <aside class="hidden md:block w-72 shrink-0">
        <div class="sticky top-24 space-y-1">
          <h2 class="font-heading text-sm font-semibold uppercase tracking-wider text-text-primary mb-3">
            Ordenar y Filtrar
          </h2>
          <div class="mb-4 border-b border-border/50" />

          <!-- Sort accordion -->
          <div class="border-b border-border/50 pb-3">
            <button
              @click="toggleAccordion('sort')"
              class="flex w-full items-center justify-between py-2 text-sm font-medium text-text-primary hover:text-accent transition-colors cursor-pointer"
            >
              Ordenar por
              <svg
                :class="['h-4 w-4 text-text-muted transition-transform', accordionOpen.sort ? 'rotate-180' : '']"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              >
                <path d="M7 10l5 5 5-5" />
              </svg>
            </button>
            <div v-if="accordionOpen.sort" class="pt-1">
              <select
                :value="sort"
                @change="changeSort(($event.target as HTMLSelectElement).value)"
                class="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors cursor-pointer"
              >
                <option
                  v-for="opt in sortOptions"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Authors accordion -->
          <div class="border-b border-border/50 pb-3">
            <button
              @click="toggleAccordion('authors')"
              class="flex w-full items-center justify-between py-2 text-sm font-medium text-text-primary hover:text-accent transition-colors cursor-pointer"
            >
              Autores
              <svg
                :class="['h-4 w-4 text-text-muted transition-transform', accordionOpen.authors ? 'rotate-180' : '']"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              >
                <path d="M7 10l5 5 5-5" />
              </svg>
            </button>
            <div v-if="accordionOpen.authors" class="space-y-2 pt-2">
              <div class="relative">
                <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9.5 3A6.5 6.5 0 0116 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 019.5 16 6.5 6.5 0 013 9.5 6.5 6.5 0 019.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z" />
                </svg>
                <input
                  v-model="authorSearch"
                  type="text"
                  placeholder="Buscar autor..."
                  class="w-full rounded-lg border border-border bg-surface-1 py-1.5 pl-8 pr-3 text-xs text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div class="max-h-48 overflow-y-auto space-y-0.5">
                <label
                  v-for="author in filteredAuthors"
                  :key="author.id"
                  class="flex items-center gap-2 py-1 text-sm text-text-muted hover:text-text-primary cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    :checked="selectedAuthors.includes(author.id)"
                    @change="toggleAuthor(author.id)"
                    class="accent-accent rounded"
                  />
                  <span class="truncate">{{ author.name }}</span>
                  <span class="ml-auto shrink-0 text-xs text-text-dim">({{ author.count }})</span>
                </label>
                <p v-if="filteredAuthors.length === 0" class="py-2 text-xs text-text-dim text-center">
                  Sin resultados
                </p>
              </div>
            </div>
          </div>

          <!-- Publishers accordion -->
          <div class="border-b border-border/50 pb-3">
            <button
              @click="toggleAccordion('publishers')"
              class="flex w-full items-center justify-between py-2 text-sm font-medium text-text-primary hover:text-accent transition-colors cursor-pointer"
            >
              Editoriales
              <svg
                :class="['h-4 w-4 text-text-muted transition-transform', accordionOpen.publishers ? 'rotate-180' : '']"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              >
                <path d="M7 10l5 5 5-5" />
              </svg>
            </button>
            <div v-if="accordionOpen.publishers" class="space-y-2 pt-2">
              <div class="relative">
                <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9.5 3A6.5 6.5 0 0116 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 019.5 16 6.5 6.5 0 013 9.5 6.5 6.5 0 019.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z" />
                </svg>
                <input
                  v-model="publisherSearch"
                  type="text"
                  placeholder="Buscar editorial..."
                  class="w-full rounded-lg border border-border bg-surface-1 py-1.5 pl-8 pr-3 text-xs text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div class="max-h-48 overflow-y-auto space-y-0.5">
                <label
                  v-for="pub in filteredPublishers"
                  :key="pub.name"
                  class="flex items-center gap-2 py-1 text-sm text-text-muted hover:text-text-primary cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    :checked="selectedPublishers.includes(pub.name)"
                    @change="togglePublisher(pub.name)"
                    class="accent-accent rounded"
                  />
                  <span class="truncate">{{ pub.name }}</span>
                  <span class="ml-auto shrink-0 text-xs text-text-dim">({{ pub.count }})</span>
                </label>
                <p v-if="filteredPublishers.length === 0" class="py-2 text-xs text-text-dim text-center">
                  Sin resultados
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div class="flex-1 min-w-0 pb-20 md:pb-0">
        <div class="mb-4 flex items-center justify-between">
          <p class="text-sm text-text-muted">
            {{ total.toLocaleString('es') }} {{ total === 1 ? 'producto' : 'productos' }}
          </p>
          <div class="flex items-center gap-1">
            <button
              @click="changeView('cards')"
              :class="['cursor-pointer rounded-lg p-2 transition-colors', viewMode === 'cards' ? 'bg-accent/10 text-accent' : 'text-text-muted hover:text-text-primary hover:bg-surface-2']"
              :title="'Vista cuadrícula'"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </button>
            <button
              @click="changeView('list')"
              :class="['cursor-pointer rounded-lg p-2 transition-colors', viewMode === 'list' ? 'bg-accent/10 text-accent' : 'text-text-muted hover:text-text-primary hover:bg-surface-2']"
              :title="'Vista lista'"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div v-if="loading" class="flex items-center justify-center py-24">
          <div class="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>

        <template v-else-if="books.length === 0">
          <div class="py-24 text-center">
            <p class="text-text-muted">No se encontraron libros con los filtros seleccionados.</p>
            <button
              @click="clearFilters"
              class="mt-2 text-sm text-accent hover:text-accent/80 transition-colors cursor-pointer"
            >
              Limpiar filtros
            </button>
          </div>
        </template>

        <template v-else>
          <div v-if="viewMode === 'cards'" class="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 sm:gap-6">
            <BookCard v-for="book in books" :key="book.id" :book="book" />
          </div>

          <div v-else class="space-y-5">
            <BookListItem v-for="book in books" :key="book.id" :book="book" />
          </div>

          <div v-if="totalPages > 1" class="mt-8 flex items-center justify-center gap-2">
            <button
              @click="changePage(page - 1)"
              :disabled="page <= 1"
              class="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:text-text-primary hover:border-border-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <button
              v-for="p in visiblePages"
              :key="p"
              @click="changePage(p)"
              :class="[
                'cursor-pointer rounded-lg px-3 py-1.5 text-xs transition-colors',
                p === page ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary hover:bg-surface-2',
              ]"
            >
              {{ p }}
            </button>
            <button
              @click="changePage(page + 1)"
              :disabled="page >= totalPages"
              class="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:text-text-primary hover:border-border-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </template>
      </div>
    </div>

    <div class="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between border-t border-border bg-surface-2 px-4 py-3 md:hidden">
      <button
        @click="mobileDialogOpen = true"
        class="flex items-center gap-2 text-sm font-medium text-text-primary hover:text-accent transition-colors cursor-pointer"
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 3h18v2H3V3zm4 5h10v2H7V8zm4 5h4v2h-4v-2zm2 5h2v4h-2v-4z" />
        </svg>
        Filtrar y ordenar
      </button>
      <div class="flex items-center gap-1">
        <button
          @click="changeView('cards')"
          :class="['cursor-pointer rounded-lg p-2 transition-colors', viewMode === 'cards' ? 'bg-accent/10 text-accent' : 'text-text-muted hover:text-text-primary']"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
        </button>
        <button
          @click="changeView('list')"
          :class="['cursor-pointer rounded-lg p-2 transition-colors', viewMode === 'list' ? 'bg-accent/10 text-accent' : 'text-text-muted hover:text-text-primary']"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="dialog">
        <div
          v-if="mobileDialogOpen"
          class="fixed inset-0 z-50 flex flex-col bg-surface-2"
        >
          <div class="flex items-center justify-between border-b border-border px-4 py-3">
            <div class="flex items-center gap-3">
              <button
                @click="mobileDialogOpen = false"
                class="cursor-pointer rounded-lg p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors"
              >
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 12H5m7-7l-7 7 7 7" />
                </svg>
              </button>
              <span class="font-heading text-sm font-semibold text-text-primary">Filtrar y ordenar</span>
            </div>
            <button
              @click="mobileDialogOpen = false"
              class="cursor-pointer rounded-lg p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            <div class="border-b border-border/50 pb-3">
              <button
                @click="toggleAccordion('sort')"
                class="flex w-full items-center justify-between py-2 text-sm font-medium text-text-primary hover:text-accent transition-colors cursor-pointer"
              >
                Ordenar por
                <svg
                  :class="['h-4 w-4 text-text-muted transition-transform', accordionOpen.sort ? 'rotate-180' : '']"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                >
                  <path d="M7 10l5 5 5-5" />
                </svg>
              </button>
              <div v-if="accordionOpen.sort" class="space-y-1 pt-1">
                <label
                  v-for="opt in sortOptions"
                  :key="opt.value"
                  class="flex items-center gap-2 py-1.5 text-sm text-text-muted hover:text-text-primary cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    :value="opt.value"
                    :checked="sort === opt.value"
                    @change="changeSort(opt.value)"
                    class="accent-accent"
                  />
                  {{ opt.label }}
                </label>
              </div>
            </div>

            <div class="border-b border-border/50 pb-3">
              <button
                @click="toggleAccordion('authors')"
                class="flex w-full items-center justify-between py-2 text-sm font-medium text-text-primary hover:text-accent transition-colors cursor-pointer"
              >
                Autores
                <svg
                  :class="['h-4 w-4 text-text-muted transition-transform', accordionOpen.authors ? 'rotate-180' : '']"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                >
                  <path d="M7 10l5 5 5-5" />
                </svg>
              </button>
              <div v-if="accordionOpen.authors" class="space-y-2 pt-2">
                <div class="relative">
                  <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9.5 3A6.5 6.5 0 0116 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 019.5 16 6.5 6.5 0 013 9.5 6.5 6.5 0 019.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z" />
                  </svg>
                  <input
                    v-model="authorSearch"
                    type="text"
                    placeholder="Buscar autor..."
                    class="w-full rounded-lg border border-border bg-surface-1 py-1.5 pl-8 pr-3 text-xs text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div class="max-h-48 overflow-y-auto space-y-0.5">
                  <label
                    v-for="author in filteredAuthors"
                    :key="author.id"
                    class="flex items-center gap-2 py-1 text-sm text-text-muted hover:text-text-primary cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      :checked="selectedAuthors.includes(author.id)"
                      @change="toggleAuthor(author.id)"
                      class="accent-accent rounded"
                    />
                    <span class="truncate">{{ author.name }}</span>
                    <span class="ml-auto shrink-0 text-xs text-text-dim">({{ author.count }})</span>
                  </label>
                  <p v-if="filteredAuthors.length === 0" class="py-2 text-xs text-text-dim text-center">Sin resultados</p>
                </div>
              </div>
            </div>

            <div class="border-b border-border/50 pb-3">
              <button
                @click="toggleAccordion('publishers')"
                class="flex w-full items-center justify-between py-2 text-sm font-medium text-text-primary hover:text-accent transition-colors cursor-pointer"
              >
                Editoriales
                <svg
                  :class="['h-4 w-4 text-text-muted transition-transform', accordionOpen.publishers ? 'rotate-180' : '']"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                >
                  <path d="M7 10l5 5 5-5" />
                </svg>
              </button>
              <div v-if="accordionOpen.publishers" class="space-y-2 pt-2">
                <div class="relative">
                  <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9.5 3A6.5 6.5 0 0116 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 019.5 16 6.5 6.5 0 013 9.5 6.5 6.5 0 019.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z" />
                  </svg>
                  <input
                    v-model="publisherSearch"
                    type="text"
                    placeholder="Buscar editorial..."
                    class="w-full rounded-lg border border-border bg-surface-1 py-1.5 pl-8 pr-3 text-xs text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div class="max-h-48 overflow-y-auto space-y-0.5">
                  <label
                    v-for="pub in filteredPublishers"
                    :key="pub.name"
                    class="flex items-center gap-2 py-1 text-sm text-text-muted hover:text-text-primary cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      :checked="selectedPublishers.includes(pub.name)"
                      @change="togglePublisher(pub.name)"
                      class="accent-accent rounded"
                    />
                    <span class="truncate">{{ pub.name }}</span>
                    <span class="ml-auto shrink-0 text-xs text-text-dim">({{ pub.count }})</span>
                  </label>
                  <p v-if="filteredPublishers.length === 0" class="py-2 text-xs text-text-dim text-center">Sin resultados</p>
                </div>
              </div>
            </div>
          </div>

          <div class="border-t border-border px-4 py-3">
            <button
              @click="applyMobileFilters"
              class="w-full rounded-lg bg-accent py-3 text-sm font-medium text-white hover:bg-accent/90 transition-colors cursor-pointer"
            >
              Ver resultados ({{ total.toLocaleString('es') }})
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import BookCard from './BookCard.vue'
import BookListItem from './BookListItem.vue'

interface BookData {
  id: number
  slug: string
  title: string
  author: string
  author_id: number | null
  price: number
  cover_url: string | null
  publisher: string | null
  is_trending: boolean
  sales_count: number
}

interface AuthorData {
  id: number
  name: string
  count: number
}

interface PublisherData {
  name: string
  count: number
}

interface PageData {
  books: BookData[]
  total: number
  authors: AuthorData[]
  publishers: PublisherData[]
}

const sortOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'trending', label: 'Tendencias' },
  { value: 'price_asc', label: 'Precio: de más bajo a más alto' },
  { value: 'price_desc', label: 'Precio: de más alto a más bajo' },
]

const initialData = ref<PageData>({
  books: [],
  total: 0,
  authors: [],
  publishers: [],
})

const books = ref<BookData[]>([])
const total = ref(0)
const authors = ref<AuthorData[]>([])
const publishers = ref<PublisherData[]>([])
const totalPages = ref(0)

const page = ref(1)
const sort = ref('all')
const selectedAuthors = ref<number[]>([])
const selectedPublishers = ref<string[]>([])
const viewMode = ref<'cards' | 'list'>('cards')
const loading = ref(false)

const accordionOpen = ref({ sort: true, authors: false, publishers: false })
const authorSearch = ref('')
const publisherSearch = ref('')
const mobileDialogOpen = ref(false)

const perPage = 24

const filteredAuthors = computed(() => {
  if (!authorSearch.value) return authors.value
  const q = authorSearch.value.toLowerCase()
  return authors.value.filter(a => a.name.toLowerCase().includes(q))
})

const filteredPublishers = computed(() => {
  if (!publisherSearch.value) return publishers.value
  const q = publisherSearch.value.toLowerCase()
  return publishers.value.filter(p => p.name.toLowerCase().includes(q))
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = page.value
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 3) return [1, 2, 3, 4, 5]
  if (current >= total - 2) return Array.from({ length: 5 }, (_, i) => total - 4 + i)
  return [current - 2, current - 1, current, current + 1, current + 2]
})

function toggleAccordion(name: 'sort' | 'authors' | 'publishers') {
  accordionOpen.value[name] = !accordionOpen.value[name]
}

function changeSort(value: string) {
  sort.value = value
  page.value = 1
  loadBooks()
}

function toggleAuthor(id: number) {
  const i = selectedAuthors.value.indexOf(id)
  if (i === -1) {
    selectedAuthors.value.push(id)
  } else {
    selectedAuthors.value.splice(i, 1)
  }
  page.value = 1
  loadBooks()
}

function togglePublisher(name: string) {
  const i = selectedPublishers.value.indexOf(name)
  if (i === -1) {
    selectedPublishers.value.push(name)
  } else {
    selectedPublishers.value.splice(i, 1)
  }
  page.value = 1
  loadBooks()
}

function changeView(mode: 'cards' | 'list') {
  viewMode.value = mode
  try {
    sessionStorage.setItem('books-view-mode', mode)
  } catch {}
}

function changePage(p: number) {
  page.value = p
  loadBooks()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function clearFilters() {
  sort.value = 'all'
  selectedAuthors.value = []
  selectedPublishers.value = []
  page.value = 1
  loadBooks()
}

async function loadBooks() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    params.set('page', String(page.value))
    params.set('sort', sort.value)
    if (selectedAuthors.value.length > 0) {
      params.set('authors', selectedAuthors.value.join(','))
    }
    if (selectedPublishers.value.length > 0) {
      params.set('publishers', selectedPublishers.value.join(','))
    }
    const res = await fetch(`/api/books?${params.toString()}`)
    const data = await res.json()
    books.value = data.books
    total.value = data.total
    totalPages.value = data.totalPages
  } catch {
    books.value = []
    total.value = 0
    totalPages.value = 0
  } finally {
    loading.value = false
  }
}

function applyMobileFilters() {
  mobileDialogOpen.value = false
}

onMounted(() => {
  const el = document.getElementById('books-data')
  if (el) {
    try {
      const data: PageData = JSON.parse(el.textContent || '{}')
      initialData.value = data
      books.value = data.books
      total.value = data.total
      authors.value = data.authors
      publishers.value = data.publishers
      totalPages.value = Math.ceil((data.total || 0) / perPage)
    } catch {}
  }

  try {
    const saved = sessionStorage.getItem('books-view-mode') as 'cards' | 'list' | null
    if (saved && ['cards', 'list'].includes(saved)) {
      viewMode.value = saved
    }
  } catch {}
})
</script>

<style scoped>
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.25s ease;
}
.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}
.dialog-enter-active > :deep(*) {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.dialog-leave-active > :deep(*) {
  transition: transform 0.2s ease;
}
.dialog-enter-from > :deep(*) {
  transform: translateY(20px);
}
.dialog-enter-to > :deep(*) {
  transform: translateY(0);
}
.dialog-leave-to > :deep(*) {
  transform: translateY(20px);
}
</style>
