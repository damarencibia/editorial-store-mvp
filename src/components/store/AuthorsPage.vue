<template>
  <div>
    <!-- Hero -->
    <section class="border-b border-border bg-surface-2 py-12 sm:py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-4">
          <h1 class="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-text-primary shrink-0">
            Autores
          </h1>
          <div class="relative flex-1 max-w-sm">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9.5 3A6.5 6.5 0 0116 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 019.5 16 6.5 6.5 0 013 9.5 6.5 6.5 0 019.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Busca por autor..."
              class="w-full rounded-lg border border-border bg-surface-1 py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>
      </div>
    </section>

    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

      <!-- Alphabet filter -->
      <div class="flex flex-wrap items-center gap-1 py-4 border-b border-border">
        <button
          v-for="letter in alphabet"
          :key="letter"
          @click="selectedLetter = letter"
          :class="[
            'cursor-pointer px-2.5 py-1 rounded text-xs font-medium transition-colors',
            selectedLetter === letter
              ? 'bg-accent text-white'
              : 'text-text-muted hover:text-text-primary hover:bg-surface-2',
          ]"
        >
          {{ letter }}
        </button>
        <button
          @click="selectedLetter = ''"
          :class="[
            'cursor-pointer px-2.5 py-1 rounded text-xs font-medium transition-colors ml-2',
            selectedLetter === ''
              ? 'bg-accent text-white'
              : 'text-text-muted hover:text-text-primary hover:bg-surface-2',
          ]"
        >
          Todas
        </button>
      </div>

      <!-- Main layout -->
      <div class="md:flex md:gap-6 py-6">
        <!-- Sidebar -->
        <aside class="hidden md:block w-72 shrink-0">
          <div class="sticky top-24 space-y-4">
            <div v-for="col in collections" :key="col.id">
              <h3 class="font-heading text-sm font-semibold text-text-primary mb-1">{{ col.name }}</h3>
              <div class="space-y-0.5 pl-2">
                <label
                  v-for="cat in col.categories"
                  :key="cat.id"
                  class="flex items-center gap-2 py-1 text-sm text-text-muted hover:text-text-primary cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    :checked="selectedCategories.includes(cat.id)"
                    @change="toggleCategory(cat.id)"
                    class="accent-accent rounded"
                  />
                  <span class="truncate">{{ cat.name }}</span>
                  <span class="ml-auto shrink-0 text-xs text-text-dim">({{ cat.count }})</span>
                </label>
              </div>
            </div>
          </div>
        </aside>

        <div class="hidden md:block w-px bg-border shrink-0"></div>

        <!-- Main content -->
        <div class="flex-1 min-w-0">
          <div v-if="filteredAuthors.length === 0" class="py-24 text-center">
            <p class="text-text-muted">No se encontraron autores.</p>
          </div>

          <div v-else class="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4 sm:gap-6">
            <AuthorCard v-for="author in filteredAuthors" :key="author.id" :author="author" />
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile bar -->
    <div class="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between border-t border-border bg-surface-2 px-4 py-3 md:hidden">
      <button
        @click="mobileDialogOpen = true"
        class="flex items-center gap-2 text-sm font-medium text-text-primary hover:text-accent transition-colors cursor-pointer"
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 3h18v2H3V3zm4 5h10v2H7V8zm4 5h4v2h-4v-2zm2 5h2v4h-2v-4z" />
        </svg>
        Filtrar por categoría
      </button>
      <p class="text-sm text-text-muted">
        {{ filteredAuthors.length }} {{ filteredAuthors.length === 1 ? 'autor' : 'autores' }}
      </p>
    </div>

    <!-- Mobile dialog -->
    <Teleport to="body">
      <Transition name="dialog">
        <div v-if="mobileDialogOpen" class="fixed inset-0 z-50 flex flex-col bg-surface-2">
          <div class="flex items-center justify-between border-b border-border px-4 py-3">
            <span class="font-heading text-sm font-semibold text-text-primary">Filtrar por categoría</span>
            <button
              @click="mobileDialogOpen = false"
              class="cursor-pointer rounded-lg p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            <div v-for="col in collections" :key="col.id">
              <h3 class="font-heading text-sm font-semibold text-text-primary mb-2">{{ col.name }}</h3>
              <div class="space-y-1 pl-2">
                <label
                  v-for="cat in col.categories"
                  :key="cat.id"
                  class="flex items-center gap-2 py-1.5 text-sm text-text-muted hover:text-text-primary cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    :checked="selectedCategories.includes(cat.id)"
                    @change="toggleCategory(cat.id)"
                    class="accent-accent rounded"
                  />
                  <span class="truncate">{{ cat.name }}</span>
                  <span class="ml-auto shrink-0 text-xs text-text-dim">({{ cat.count }})</span>
                </label>
              </div>
            </div>
          </div>

          <div class="border-t border-border px-4 py-3">
            <button
              @click="mobileDialogOpen = false"
              class="w-full rounded-lg bg-accent py-3 text-sm font-medium text-white hover:bg-accent/90 transition-colors cursor-pointer"
            >
              Ver resultados ({{ filteredAuthors.length }})
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AuthorCard from './AuthorCard.vue'

interface CategoryData {
  id: number
  name: string
  count: number
}

interface CollectionData {
  id: number
  name: string
  categories: CategoryData[]
}

interface AuthorData {
  id: number
  name: string
  slug: string
  photo_url: string | null
  book_count: number
  category_ids: number[]
}

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const collections = ref<CollectionData[]>([])
const authors = ref<AuthorData[]>([])
const searchQuery = ref('')
const selectedLetter = ref('')
const selectedCategories = ref<number[]>([])
const mobileDialogOpen = ref(false)

const filteredAuthors = computed(() => {
  let result = authors.value

  if (selectedLetter.value) {
    result = result.filter(a => a.name.charAt(0).toUpperCase() === selectedLetter.value)
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(a => a.name.toLowerCase().includes(q))
  }

  if (selectedCategories.value.length > 0) {
    result = result.filter(a => a.category_ids?.some((cid: number) => selectedCategories.value.includes(cid)))
  }

  return result
})

function toggleCategory(id: number) {
  const i = selectedCategories.value.indexOf(id)
  if (i === -1) {
    selectedCategories.value.push(id)
  } else {
    selectedCategories.value.splice(i, 1)
  }
}

onMounted(() => {
  const el = document.getElementById('authors-data')
  if (el) {
    try {
      const data = JSON.parse(el.textContent || '{}')
      collections.value = data.collections ?? []
      authors.value = data.authors ?? []
    } catch {}
  }
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