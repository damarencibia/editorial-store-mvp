<template>
  <div>
    <div class="overflow-x-auto rounded-lg border border-border">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border bg-surface-2">
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
            <td :colspan="columns.length + (actions && actions.length > 0 ? 1 : 0)" class="px-4 py-12 text-center text-text-muted">
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
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Column {
  key: string
  label: string
  type?: 'text' | 'image'
}

interface Action {
  label: string
  href: string
}

const props = withDefaults(defineProps<{
  perPage?: number
  emptyText?: string
}>(), {
  perPage: 10,
  emptyText: 'No hay datos disponibles.',
})

const previewImage = ref<string | null>(null)

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') previewImage.value = null
}

onMounted(() => document.addEventListener('keydown', onKeyDown))
onUnmounted(() => document.removeEventListener('keydown', onKeyDown))

const columns = ref<Column[]>([])
const rows = ref<Record<string, any>[]>([])
const actions = ref<Action[]>([])

onMounted(() => {
  const el = document.getElementById('books-data')
  if (!el) return
  const data = JSON.parse(el.textContent || '{}')
  columns.value = data.columns ?? []
  rows.value = data.rows ?? []
  actions.value = data.actions ?? []
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

function resolveHref(template: string, row: Record<string, any>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(row[key] ?? ''))
}

function formatCell(value: any): string {
  if (value == null) return '-'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
</script>
