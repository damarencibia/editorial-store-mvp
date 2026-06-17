<template>
  <div>
    <div class="overflow-x-auto rounded-lg border border-border">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border bg-surface-2">
            <th class="px-2 py-3 w-8"></th>
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
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <template v-for="row in sortedRows" :key="row.id">
            <tr class="hover:bg-surface-2/50 transition-colors">
              <td class="px-2 py-3 w-8 text-center">
                <button
                  v-if="row.items.length > 0"
                  @click="toggleExpand(row.id)"
                  class="cursor-pointer text-text-muted hover:text-text-primary transition-colors text-xs"
                >
                  {{ expandedId === row.id ? '▲' : '▼' }}
                </button>
              </td>
              <td v-for="col in columns" :key="col.key" class="px-4 py-3 text-text-primary">
                <span v-if="col.key === 'items_summary'">{{ row[col.key] }}</span>
                <span v-else-if="col.key === 'status'" v-html="row[col.key]"></span>
                <span v-else>{{ row[col.key] }}</span>
              </td>
            </tr>
            <tr v-if="expandedId === row.id" class="bg-surface-2/20">
              <td :colspan="columns.length + 1" class="p-0">
                <table class="w-full text-xs">
                  <thead>
                    <tr class="border-y border-border bg-surface-2/40">
                      <th class="px-4 py-2 text-left font-semibold text-text-muted uppercase tracking-wider w-14"></th>
                      <th class="px-4 py-2 text-left font-semibold text-text-muted uppercase tracking-wider">Título</th>
                      <th class="px-4 py-2 text-left font-semibold text-text-muted uppercase tracking-wider">Autor</th>
                      <th class="px-4 py-2 text-right font-semibold text-text-muted uppercase tracking-wider">Precio</th>
                      <th class="px-4 py-2 text-center font-semibold text-text-muted uppercase tracking-wider">Cant.</th>
                      <th class="px-4 py-2 text-right font-semibold text-text-muted uppercase tracking-wider">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-border/50">
                    <tr v-for="(item, i) in row.items" :key="i" class="hover:bg-surface-2/40 transition-colors">
                      <td class="px-4 py-2">
                        <img
                          v-if="item.coverUrl"
                          :src="item.coverUrl"
                          :alt="item.title"
                          class="w-10 h-14 object-cover rounded"
                        />
                      </td>
                      <td class="px-4 py-2 text-text-primary font-medium">{{ item.title }}</td>
                      <td class="px-4 py-2 text-text-muted">{{ item.author }}</td>
                      <td class="px-4 py-2 text-text-primary text-right">{{ formatPrice(item.price) }}</td>
                      <td class="px-4 py-2 text-text-primary text-center">{{ item.quantity }}</td>
                      <td class="px-4 py-2 text-text-primary text-right font-medium">{{ formatPrice(item.price * item.quantity) }}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </template>
          <tr v-if="rows.length === 0">
            <td :colspan="columns.length + 1" class="px-4 py-12 text-center text-text-muted">
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{
  orders?: string
}>(), {
  orders: '[]',
})

const parsedOrders = computed(() => {
  try { return JSON.parse(props.orders) as any[] }
  catch { return [] }
})

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
const expandedId = ref<number | null>(null)

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

function toggleExpand(id: number) {
  expandedId.value = expandedId.value === id ? null : id
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
