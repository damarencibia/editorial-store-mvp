<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-3">
        <label class="flex items-center gap-2 text-xs text-text-muted cursor-pointer select-none">
          <input
            type="checkbox"
            :checked="isAllSelected"
            :indeterminate="isIndeterminate"
            @change="toggleSelectAll"
            class="rounded border-border bg-surface-3 text-accent focus:ring-accent/30"
          />
          Seleccionar todo
        </label>
        <span v-if="selectedIds.length > 0" class="text-xs text-text-muted">
          {{ selectedIds.length }} de {{ rows.length }} seleccionados
        </span>
      </div>
      <div v-if="!showBulkConfirm && selectedIds.length > 0">
        <button
          @click="showBulkConfirm = true"
          class="cursor-pointer flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" />
          </svg>
          Eliminar seleccionados ({{ selectedIds.length }})
        </button>
      </div>
    </div>

    <div v-if="showBulkConfirm" class="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 mb-3 flex items-center justify-between">
      <p class="text-sm text-red-300">
        ¿Eliminar <strong>{{ selectedIds.length }} pedido{{ selectedIds.length !== 1 ? 's' : '' }}</strong>? Esta acción no se puede deshacer.
      </p>
      <div class="flex items-center gap-2">
        <button
          @click="showBulkConfirm = false"
          class="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
        >
          Cancelar
        </button>
        <button
          @click="bulkDelete"
          :disabled="deletingBulk"
          class="cursor-pointer rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ deletingBulk ? 'Eliminando...' : 'Eliminar' }}
        </button>
      </div>
    </div>

    <p v-if="bulkError" class="mb-3 text-xs text-red-400">{{ bulkError }}</p>

    <div class="overflow-x-auto rounded-lg border border-border">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border bg-surface-2">
            <th class="px-3 py-3 w-10">
              <input
                type="checkbox"
                :checked="isAllSelected"
                :indeterminate="isIndeterminate"
                @change="toggleSelectAll"
                class="rounded border-border bg-surface-3 text-accent focus:ring-accent/30"
              />
            </th>
            <th v-for="col in columns" :key="col.key"
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted select-none cursor-pointer hover:text-text-primary transition-colors"
              @click="toggleSort(col.key)"
            >
              <span class="inline-flex items-center gap-1">
                {{ col.label }}
                <span v-if="sortKey === col.key" class="text-accent text-[10px]">
                  {{ sortDir === 'asc' ? '↑' : '↓' }}
                </span>
              </span>
            </th>
            <th class="px-4 py-3 w-28"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr v-for="row in sortedRows" :key="row.id" class="hover:bg-surface-2/50 transition-colors"
            :class="{ 'bg-accent/5': isSelected(row.id) }"
          >
            <td class="px-3 py-3">
              <input
                type="checkbox"
                :checked="isSelected(row.id)"
                @change="toggleSelect(row.id)"
                class="rounded border-border bg-surface-3 text-accent focus:ring-accent/30"
              />
            </td>
            <td v-for="col in columns" :key="col.key" class="px-4 py-3 text-text-primary">
              <span v-if="col.key === 'items_summary'">{{ row[col.key] }}</span>
              <span v-else-if="col.key === 'status'" v-html="row[col.key]"></span>
              <span v-else>{{ row[col.key] }}</span>
            </td>
            <td class="px-4 py-3">
              <button
                @click="openDetail(row.id)"
                class="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:text-text-primary hover:border-border-hover transition-colors"
              >
                Ver detalle
              </button>
            </td>
          </tr>
          <tr v-if="rows.length === 0">
            <td :colspan="columns.length + 2" class="px-4 py-12 text-center text-text-muted">
              No hay órdenes registradas.
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

    <OrderDetailModal
      :open="detailOrderId !== null"
      :order="detailOrder"
      @close="detailOrderId = null"
      @deleted="onDeleted"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import OrderDetailModal from './OrderDetailModal.vue'

const props = withDefaults(defineProps<{
  orders?: string
}>(), {
  orders: '[]',
})

const parsedOrders = computed(() => {
  try { return JSON.parse(props.orders) as any[] }
  catch { return [] }
})

const rawOrders = computed(() => parsedOrders.value)

const columns = [
  { key: 'customer_email', label: 'Cliente' },
  { key: 'shipping', label: 'Envío' },
  { key: 'items_summary', label: 'Artículos' },
  { key: 'total', label: 'Total' },
  { key: 'status', label: 'Estado' },
  { key: 'created_at', label: 'Fecha' },
]

const perPage = 10
const page = ref(1)
const sortKey = ref<string>('created_at')
const sortDir = ref<'asc' | 'desc'>('desc')
const detailOrderId = ref<number | null>(null)
const selectedIds = ref<number[]>([])
const showBulkConfirm = ref(false)
const deletingBulk = ref(false)
const bulkError = ref('')

const detailOrder = computed(() => {
  if (detailOrderId.value == null) return null
  return rawOrders.value.find((o: any) => o.id === detailOrderId.value) ?? null
})

const allIds = computed(() => rows.value.map((r) => r.id))

const isAllSelected = computed(() =>
  allIds.value.length > 0 && allIds.value.every((id) => selectedIds.value.includes(id))
)

const isIndeterminate = computed(() =>
  !isAllSelected.value && allIds.value.some((id) => selectedIds.value.includes(id))
)

function isSelected(id: number): boolean {
  return selectedIds.value.includes(id)
}

function toggleSelect(id: number) {
  const idx = selectedIds.value.indexOf(id)
  if (idx === -1) {
    selectedIds.value.push(id)
  } else {
    selectedIds.value.splice(idx, 1)
  }
  showBulkConfirm.value = false
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = [...allIds.value]
  }
  showBulkConfirm.value = false
}

function formatPrice(cents: number): string {
  return '$' + (cents / 100).toFixed(2)
}

function formatItemsSummary(items: any[]): string {
  if (!items || items.length === 0) return '-'
  if (items.length === 1) return `1 artículo: ${items[0].title}`
  return `${items.length} artículos`
}

function formatShipping(row: any): string {
  const parts: string[] = []
  if (row.shipping_name) parts.push(row.shipping_name)
  if (row.shipping_address?.line1) parts.push(row.shipping_address.line1)
  if (row.shipping_country) parts.push(row.shipping_country)
  return parts.length > 0 ? parts.join(', ') : '—'
}

function statusBadge(status: string): string {
  const colors: Record<string, string> = {
    pending: 'text-yellow-400 bg-yellow-400/10',
    paid: 'text-green-400 bg-green-400/10',
    shipped: 'text-blue-400 bg-blue-400/10',
    cancelled: 'text-red-400 bg-red-400/10',
  }
  const cls = colors[status] || 'text-text-muted bg-surface-2'
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    paid: 'Pagado',
    shipped: 'Enviado',
    cancelled: 'Cancelado',
  }
  return `<span class="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}">${labels[status] || status}</span>`
}

const rows = computed(() => {
  const mapped = (parsedOrders.value ?? []).map((o) => ({
    id: o.id,
    customer_email: o.customer_email || '—',
    shipping: formatShipping(o),
    _shipping: o.shipping_name || '',
    total: formatPrice(o.total),
    _total: o.total,
    status: statusBadge(o.status || 'pending'),
    _status: o.status || 'pending',
    created_at: new Date(o.created_at).toLocaleDateString('es-ES'),
    _created_at: o.created_at,
    items: o.items ?? [],
    items_summary: formatItemsSummary(o.items ?? []),
    shipping_name: o.shipping_name,
    shipping_address: o.shipping_address,
    shipping_country: o.shipping_country,
  }))
  return mapped
})

function openDetail(id: number) {
  detailOrderId.value = id
}

function onDeleted(id: number) {
  detailOrderId.value = null
  window.location.reload()
}

async function bulkDelete() {
  if (selectedIds.value.length === 0) return
  deletingBulk.value = true
  bulkError.value = ''
  try {
    const res = await fetch('/api/admin/orders/bulk-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedIds.value }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Error al eliminar')
    }
    window.location.reload()
  } catch (err: any) {
    bulkError.value = err.message || 'Error de conexión'
    deletingBulk.value = false
  }
}

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
    const field = sortKey.value === 'total' ? '_total'
      : sortKey.value === 'created_at' ? '_created_at'
      : sortKey.value === 'status' ? '_status'
      : sortKey.value === 'shipping' ? '_shipping'
      : sortKey.value
    items.sort((a, b) => {
      const aVal = a[field]
      const bVal = b[field]
      if (aVal == null) return 1
      if (bVal == null) return -1
      const cmp = String(aVal).localeCompare(String(bVal), 'es', { numeric: true })
      return sortDir.value === 'asc' ? cmp : -cmp
    })
  }
  const start = (page.value - 1) * perPage
  return items.slice(start, start + perPage)
})

const totalPages = computed(() => Math.ceil(rows.value.length / perPage))

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = page.value
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 3) return [1, 2, 3, 4, 5]
  if (current >= total - 2) return Array.from({ length: 5 }, (_, i) => total - 4 + i)
  return [current - 2, current - 1, current, current + 1, current + 2]
})
</script>
