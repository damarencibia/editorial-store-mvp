<template>
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
            <th v-if="actions && actions.length > 0" class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">
              Acciones
            </th>
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
                <button
                  v-else-if="col.type === 'toggle'"
                  @click.stop="toggleSingleVisibility(row.id)"
                  class="cursor-pointer text-lg transition-colors hover:opacity-70"
                  :title="row[col.key] ? 'Visible' : 'Oculto'"
                >
                  {{ row[col.key] ? '👁' : '👁‍🗨' }}
                </button>
                <span v-else-if="col.type === 'badge'" class="text-lg" :title="row[col.key] ? 'Más vendido' : ''">
                  {{ row[col.key] ? '⭐' : '☆' }}
                </span>
                <span v-else>{{ formatCell(row[col.key]) }}</span>
              </slot>
            </td>
            <td v-if="actions && actions.length > 0" class="px-4 py-3 text-right space-x-3">
              <a
                v-for="action in actions"
                :key="action.label"
                :href="resolveHref(action.href, row)"
                class="text-xs text-text-muted hover:text-accent transition-colors"
              >
                {{ action.label }}
              </a>
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
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Column {
  key: string
  label: string
  type?: 'text' | 'image' | 'toggle' | 'badge'
}

interface Action {
  label: string
  href: string
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

const previewImage = ref<string | null>(null)
const processing = ref(false)
const resultMessage = ref('')
const resultType = ref<'success' | 'error'>('success')

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    previewImage.value = null
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

async function toggleSingleVisibility(id: number) {
  processing.value = true
  try {
    const res = await fetch('/api/admin/books/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_visibility', ids: [id] }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Error al cambiar visibilidad')
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
