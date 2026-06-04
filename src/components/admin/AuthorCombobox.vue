<template>
  <div class="relative" ref="containerRef">
    <label :for="id" class="block text-xs font-medium text-text-muted mb-1.5">Autor</label>
    <div
      class="flex items-center w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary cursor-pointer transition-colors focus-within:border-accent"
      :class="{ 'border-accent': open }"
      @click="open = true"
    >
      <input
        ref="inputRef"
        :id="id"
        type="text"
        :value="search"
        :placeholder="selectedName || 'Buscar o agregar autor...'"
        class="flex-1 bg-transparent outline-none text-sm text-text-primary placeholder-text-dim"
        @input="onSearch"
        @focus="open = true"
        @keydown.escape="open = false"
        @keydown.enter.prevent="handleEnter"
      />
      <button
        v-if="selectedId !== null"
        class="ml-1 cursor-pointer text-text-muted hover:text-red-400 flex-shrink-0"
        @click.stop="clear"
        title="Quitar autor"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <Transition name="dropdown">
      <div v-if="open" class="absolute z-50 mt-1 w-full rounded-lg border border-border bg-surface-2 shadow-xl overflow-hidden">
        <div v-if="filtered.length > 0" class="max-h-48 overflow-y-auto">
          <button
            v-for="a in filtered"
            :key="a.id"
            class="w-full text-left px-3.5 py-2.5 text-sm text-text-primary hover:bg-surface-3 transition-colors cursor-pointer flex items-center gap-3"
            @click="select(a)"
          >
            <img
              v-if="a.photo_url"
              :src="a.photo_url"
              alt=""
              class="w-7 h-7 rounded-full object-cover flex-shrink-0"
            />
            <span
              v-else
              class="w-7 h-7 rounded-full bg-surface-3 flex items-center justify-center text-xs text-text-muted flex-shrink-0"
            >{{ a.name.charAt(0).toUpperCase() }}</span>
            <span>{{ a.name }}</span>
          </button>
        </div>
        <div v-if="filtered.length === 0 && search.trim()" class="px-3.5 py-3">
          <button
            class="w-full rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50 transition-colors cursor-pointer"
            :disabled="creating"
            @click="addNew"
          >
            {{ creating ? 'Creando...' : 'Agregar +' + search.trim() }}
          </button>
        </div>
        <div v-if="errorMsg" class="px-3.5 py-2 text-xs text-red-400 border-t border-border/50 text-center">
          {{ errorMsg }}
        </div>
        <div v-if="authorList.length === 0 && !search.trim() && !errorMsg" class="px-3.5 py-4 text-sm text-text-muted text-center">
          No hay autores registrados
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  id?: string
  modelValue?: number | null
}>(), {
  id: 'author',
  modelValue: null,
})

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

interface AuthorItem {
  id: number
  name: string
  photo_url: string | null
}

const containerRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const open = ref(false)
const search = ref('')
const authorList = ref<AuthorItem[]>([])
const errorMsg = ref('')
const creating = ref(false)

const selectedId = computed(() => props.modelValue ?? null)
const selectedName = computed(() => {
  if (selectedId.value === null) return ''
  return authorList.value.find(a => a.id === selectedId.value)?.name ?? ''
})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return authorList.value
  return authorList.value.filter(a => a.name.toLowerCase().includes(q))
})

function onSearch(e: Event) {
  search.value = (e.target as HTMLInputElement).value
  errorMsg.value = ''
}

watch(open, (val) => {
  if (val) {
    search.value = ''
    errorMsg.value = ''
    fetchAuthors()
  }
})

function select(a: AuthorItem) {
  errorMsg.value = ''
  emit('update:modelValue', a.id)
  search.value = ''
  open.value = false
  inputRef.value?.blur()
}

async function addNew() {
  const name = search.value.trim()
  if (!name || creating.value) return
  creating.value = true
  errorMsg.value = ''
  try {
    const res = await fetch('/api/admin/authors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    if (!res.ok) {
      const data = await res.json()
      errorMsg.value = data.error || 'Error al crear el autor'
      if (res.status === 409) {
        await fetchAuthors()
      }
      return
    }
    const data = await res.json()
    authorList.value.push(data)
    select(data)
  } catch {
    errorMsg.value = 'Error de conexión'
  } finally {
    creating.value = false
  }
}

function clear() {
  emit('update:modelValue', null)
  search.value = ''
}

async function fetchAuthors() {
  try {
    const res = await fetch('/api/admin/authors')
    if (res.ok) {
      authorList.value = await res.json()
    }
  } catch {
    // silent
  }
}

function handleEnter() {
  if (filtered.value.length === 1) {
    select(filtered.value[0])
  } else if (filtered.value.length === 0 && search.value.trim()) {
    addNew()
  }
}

function onClickOutside(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => {
  fetchAuthors()
  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
