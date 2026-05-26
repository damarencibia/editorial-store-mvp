<template>
  <div v-if="!loaded" class="py-12 text-center text-text-muted text-sm">
    Cargando...
  </div>
  <template v-else>
    <div>
      <div v-if="resultMessage" :class="[
        'mb-4 px-4 py-3 rounded-lg text-sm border transition-all',
        resultType === 'success'
          ? 'bg-green-500/10 border-green-500/20 text-green-400'
          : 'bg-red-500/10 border-red-500/20 text-red-400',
      ]">
        {{ resultMessage }}
      </div>

      <div class="overflow-x-auto rounded-lg border border-border">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border bg-surface-2">
              <th v-if="selectable" class="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  :checked="allSelected"
                  :indeterminate="someSelected && !allSelected"
                  @change="toggleSelectAll"
                  class="cursor-pointer rounded border-border accent-accent"
                />
              </th>
              <th
                v-for="col in columns"
                :key="col.key"
                :class="[
                  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted select-none transition-colors',
                  col.type !== 'image' ? 'cursor-pointer hover:text-text-primary' : ''
                ]"
                @click="col.type !== 'image' && toggleSort(col.key)"
              >
                <span class="inline-flex items-center gap-1">
                  {{ col.label }}
                  <span v-if="sortKey === col.key" class="text-accent text-[10px]">
                    {{ sortDir === 'asc' ? '↑' : '↓' }}
                  </span>
                </span>
              </th>
              <th v-if="actions && actions.length > 0" class="px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="row in sortedRows" :key="row.id" class="hover:bg-surface-2/50 transition-colors">
              <td v-if="selectable" class="px-4 py-3">
                <input
                  type="checkbox"
                  :checked="selectedIds.has(row.id)"
                  @change="toggleSelect(row.id)"
                  class="cursor-pointer rounded border-border accent-accent"
                />
              </td>
              <td v-for="col in columns" :key="col.key" class="px-4 py-3 text-text-primary">
                <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                  <img
                    v-if="col.type === 'image' && row[col.key]"
                    :src="row[col.key]"
                    alt="Portada"
                    class="w-10 h-14 object-cover rounded cursor-pointer"
                    @click.stop="previewImage = row[col.key]"
                  />
                  <span v-else>{{ formatCell(row[col.key]) }}</span>
                </slot>
              </td>
              <td v-if="actions && actions.length > 0" class="px-4 py-3 text-right relative">
                <div class="flex items-center justify-end gap-1.5">
                  <span
                    v-if="row.is_visible !== undefined"
                    class="inline-flex items-center cursor-default select-none" :title="row.is_visible ? 'Visible' : 'Oculto'"
                  >
                    <svg v-if="row.is_visible" class="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z" />
                    </svg>
                    <svg v-else class="w-4 h-4 text-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  </span>
                  <span
                    v-if="row.is_best_seller !== undefined"
                    class="inline-flex items-center cursor-default select-none" :title="row.is_best_seller ? 'Más vendido' : ''"
                  >
                    <svg v-if="row.is_best_seller" class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <svg v-else class="w-4 h-4 text-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                    </svg>
                  </span>
                  <button
                    @click.stop="toggleDropdown(row.id)"
                    class="cursor-pointer px-1.5 py-0.5 rounded text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors text-lg leading-none select-none"
                  >
                    ⋮
                  </button>
                </div>
                <div
                  v-if="openDropdownId === row.id"
                  class="absolute right-0 top-full mt-1 z-30 min-w-[220px] bg-surface-2 border border-border rounded-lg shadow-xl py-1 origin-top-right"
                  @click.stop
                >
                  <template v-for="action in actions" :key="action.label">
                    <a
                      v-if="action.type === 'link'"
                      :href="resolveHref(action.href, row)"
                      class="flex items-center gap-2 px-4 py-2 text-xs text-text-primary hover:bg-surface-3 transition-colors"
                    >
                      {{ action.label }}
                    </a>
                    <button
                      v-else-if="action.type === 'toggle'"
                      @click="executeRowAction(action, row)"
                      :disabled="processing"
                      class="flex items-center justify-between w-full px-4 py-2 text-xs text-text-primary hover:bg-surface-3 transition-colors disabled:opacity-40"
                    >
                      <span>{{ row[action.key] ? action.labelAlt : action.label }}</span>
                      <div
                        class="w-8 h-4 rounded-full relative transition-colors shrink-0"
                        :class="row[action.key] ? 'bg-accent' : 'bg-surface-3'"
                      >
                        <div
                          class="absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all shadow-sm"
                          :class="row[action.key] ? 'left-[18px]' : 'left-0.5'"
                        ></div>
                      </div>
                    </button>
                  </template>
                </div>
              </td>
            </tr>
            <tr v-if="rows.length === 0">
              <td :colspan="columnCount" class="px-4 py-12 text-center text-text-muted">
                {{ emptyText }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="flex items-center justify-between mt-4">
        <p class="text-xs text-text-muted">
          {{ (page - 1) * perPage + 1 }}-{{ Math.min(page * perPage, rows.length) }} de {{ rows.length }}
        </p>
        <div class="flex items-center gap-2">
          <button
            @click="page = Math.max(1, page - 1)"
            :disabled="page === 1"
            class="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:text-text-primary hover:border-border-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>
          <button
            v-for="p in visiblePages"
            :key="p"
            @click="page = p"
            :class="[
              'rounded-lg px-3 py-1.5 text-xs transition-colors cursor-pointer',
              p === page ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary hover:bg-surface-2',
            ]"
          >
            {{ p }}
          </button>
          <button
            @click="page = Math.min(totalPages, page + 1)"
            :disabled="page === totalPages"
            class="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:text-text-primary hover:border-border-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
          </button>
        </div>
      </div>

      <Teleport to="body">
        <div
          v-if="previewImage"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 cursor-pointer"
          @click="previewImage = null"
        >
          <img
            :src="previewImage"
            alt="Portada"
            class="max-w-[85vw] max-h-[85vh] object-contain rounded-lg shadow-2xl cursor-default"
            @click.stop
          />
        </div>

        <div
          v-if="selectable && selectedIds.size > 0"
          class="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 bg-surface-2 border border-border rounded-lg px-5 py-3 shadow-xl"
        >
          <span class="text-sm text-text-muted whitespace-nowrap">{{ selectedIds.size }} libro(s) seleccionados</span>
          <div class="flex items-center gap-2">
            <button
              v-for="ba in bulkActions"
              :key="ba.action"
              @click="executeBulkAction(ba.action)"
              :disabled="processing"
              :class="[
                'cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40',
                ba.variant === 'danger'
                  ? 'text-red-400 hover:bg-red-500/10 border border-red-500/20'
                  : 'text-accent hover:bg-accent/10 border border-accent/20',
              ]"
            >
              {{ ba.label }}
            </button>
          </div>
          <button
            @click="selectedIds.clear()"
            class="cursor-pointer text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            Cancelar
          </button>
        </div>

        <div
          v-if="openDropdownId !== null"
          class="fixed inset-0 z-20"
          @click="openDropdownId = null"
        ></div>
      </Teleport>
    </div>
  </template>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Column {
  key: string
  label: string
  type?: 'text' | 'image'
}

interface Action {
  type: 'link' | 'toggle'
  label: string
  labelAlt?: string
  href?: string
  key?: string
  apiAction?: string
}

interface BulkAction {
  action: string
  label: string
  variant?: 'primary' | 'danger'
}

const props = withDefaults(defineProps<{
  perPage?: number
  emptyText?: string
}>(), {
  perPage: 10,
  emptyText: 'No hay datos disponibles.',
})

const loaded = ref(false)
const previewImage = ref<string | null>(null)
const processing = ref(false)
const resultMessage = ref('')
const resultType = ref<'success' | 'error'>('success')
const openDropdownId = ref<number | null>(null)

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    previewImage.value = null
    openDropdownId.value = null
  }
}

onMounted(() => document.addEventListener('keydown', onKeyDown))
onUnmounted(() => document.removeEventListener('keydown', onKeyDown))

const columns = ref<Column[]>([])
const rows = ref<Record<string, any>[]>([])
const actions = ref<Action[]>([])
const selectable = ref(false)
const bulkActions = ref<BulkAction[]>([])
const selectedIds = ref<Set<number>>(new Set())

onMounted(() => {
  const el = document.getElementById('books-data')
  if (!el) return
  const data = JSON.parse(el.textContent || '{}')
  columns.value = data.columns ?? []
  rows.value = data.rows ?? []
  actions.value = data.actions ?? []
  selectable.value = data.selectable ?? false
  bulkActions.value = data.bulkActions ?? []
  loaded.value = true
})

const page = ref(1)
const sortKey = ref<string>('')
const sortDir = ref<'asc' | 'desc'>('asc')

function toggleSort(key: string) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

const sortedRows = computed(() => {
  const items = [...rows.value]
  if (sortKey.value) {
    items.sort((a, b) => {
      const aVal = a[sortKey.value]
      const bVal = b[sortKey.value]
      if (aVal == null) return 1
      if (bVal == null) return -1
      const cmp = String(aVal).localeCompare(String(bVal), 'es', { numeric: true })
      return sortDir.value === 'asc' ? cmp : -cmp
    })
  }
  const start = (page.value - 1) * props.perPage
  return items.slice(start, start + props.perPage)
})

const totalPages = computed(() => Math.ceil(rows.value.length / props.perPage))

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = page.value
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 3) return [1, 2, 3, 4, 5]
  if (current >= total - 2) return Array.from({ length: 5 }, (_, i) => total - 4 + i)
  return [current - 2, current - 1, current, current + 1, current + 2]
})

const columnCount = computed(() => {
  let count = columns.value.length
  if (selectable.value) count++
  if (actions.value.length > 0) count++
  return count
})

const allSelected = computed(() => {
  const currentPageIds = sortedRows.value.map(r => r.id)
  return currentPageIds.length > 0 && currentPageIds.every(id => selectedIds.value.has(id))
})

const someSelected = computed(() => {
  const currentPageIds = sortedRows.value.map(r => r.id)
  return currentPageIds.some(id => selectedIds.value.has(id))
})

function toggleDropdown(id: number) {
  openDropdownId.value = openDropdownId.value === id ? null : id
}

function toggleSelectAll() {
  const currentPageIds = sortedRows.value.map(r => r.id)
  if (allSelected.value) {
    for (const id of currentPageIds) {
      selectedIds.value.delete(id)
    }
  } else {
    for (const id of currentPageIds) {
      selectedIds.value.add(id)
    }
  }
  selectedIds.value = new Set(selectedIds.value)
}

function toggleSelect(id: number) {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id)
  } else {
    selectedIds.value.add(id)
  }
  selectedIds.value = new Set(selectedIds.value)
}

async function executeRowAction(action: Action, row: Record<string, any>) {
  if (!action.apiAction) return
  processing.value = true
  openDropdownId.value = null
  try {
    const res = await fetch('/api/admin/books/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: action.apiAction, ids: [row.id] }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Error al ejecutar acción')
    }
    window.location.reload()
  } catch (err: any) {
    resultMessage.value = err.message
    resultType.value = 'error'
    setTimeout(() => { resultMessage.value = '' }, 4000)
  } finally {
    processing.value = false
  }
}

async function executeBulkAction(action: string) {
  if (action === 'delete') {
    const confirmed = confirm('¿Estás seguro de eliminar los libros seleccionados? Esta acción no se puede deshacer.')
    if (!confirmed) return
  }

  processing.value = true
  resultMessage.value = ''
  try {
    const res = await fetch('/api/admin/books/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ids: Array.from(selectedIds.value) }),
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Error al ejecutar acción')
    }
    resultMessage.value = 'Acción ejecutada correctamente.'
    resultType.value = 'success'
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  } catch (err: any) {
    resultMessage.value = err.message
    resultType.value = 'error'
    setTimeout(() => { resultMessage.value = '' }, 4000)
  } finally {
    processing.value = false
  }
}

function resolveHref(template: string, row: Record<string, any>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(row[key] ?? ''))
}

function formatCell(value: any): string {
  if (value == null) return '-'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
</script>
