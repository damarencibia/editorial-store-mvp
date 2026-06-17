<template>
  <Teleport to="body">
    <Transition name="modal-backdrop">
      <div v-if="open" class="fixed inset-0 z-50 bg-black/50" @click="handleBackdropClick" />
    </Transition>

    <Transition name="modal-panel">
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div class="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl border border-border bg-surface-2 shadow-2xl pointer-events-auto">
          <template v-if="confirmingDelete">
            <div class="p-8 text-center">
              <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                <svg class="h-6 w-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" />
                </svg>
              </div>
              <h3 class="font-heading text-lg font-semibold mb-2">Eliminar pedido</h3>
              <p class="text-sm text-text-muted mb-6">
                ¿Estás seguro de eliminar el pedido <strong class="text-text-primary">#{{ order?.id }}</strong>?<br />
                Esta acción no se puede deshacer.
              </p>
              <div class="flex items-center justify-center gap-3">
                <button
                  @click="confirmingDelete = false"
                  class="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:text-text-primary hover:border-border-hover transition-colors"
                >
                  Cancelar
                </button>
                <button
                  @click="confirmDelete"
                  :disabled="deleting"
                  class="cursor-pointer rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {{ deleting ? 'Eliminando...' : 'Eliminar' }}
                </button>
              </div>
              <p v-if="deleteError" class="mt-3 text-xs text-red-400">{{ deleteError }}</p>
            </div>
          </template>

          <template v-else>
            <div class="flex items-center justify-between px-6 py-4 border-b border-border">
              <div class="flex items-center gap-3">
                <span class="font-heading font-semibold text-base">Pedido #{{ order?.id }}</span>
                <span v-html="statusBadge(order?.status)"></span>
              </div>
              <button
                @click="$emit('close')"
                class="cursor-pointer rounded-lg p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors"
              >
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="px-6 py-4 space-y-5">
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">Cliente</p>
                  <p class="text-text-primary">{{ order?.customer_email || '—' }}</p>
                </div>
                <div>
                  <p class="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">Fecha</p>
                  <p class="text-text-primary">{{ formatDate(order?.created_at) }}</p>
                </div>
                <div>
                  <p class="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">Moneda</p>
                  <p class="text-text-primary">USD</p>
                </div>
                <div>
                  <p class="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">Stripe Session</p>
                  <p class="text-text-primary font-mono text-xs truncate" :title="order?.stripe_session_id">{{ order?.stripe_session_id || '—' }}</p>
                </div>
              </div>

              <div>
                <p class="text-xs text-text-muted uppercase tracking-wider font-semibold mb-2">Artículos ({{ order?.items?.length || 0 }})</p>
                <div class="rounded-lg border border-border overflow-hidden">
                  <table class="w-full text-sm">
                    <thead>
                      <tr class="border-b border-border bg-surface-2/60">
                        <th class="px-3 py-2 w-12"></th>
                        <th class="px-3 py-2 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Título</th>
                        <th class="px-3 py-2 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Autor</th>
                        <th class="px-3 py-2 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">Precio</th>
                        <th class="px-3 py-2 text-center text-xs font-semibold text-text-muted uppercase tracking-wider">Cant.</th>
                        <th class="px-3 py-2 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-border/50">
                      <tr v-for="(item, i) in order?.items" :key="i" class="hover:bg-surface-2/40 transition-colors">
                        <td class="px-3 py-2">
                          <img
                            v-if="item.coverUrl"
                            :src="item.coverUrl"
                            :alt="item.title"
                            class="w-8 h-11 object-cover rounded"
                          />
                        </td>
                        <td class="px-3 py-2 text-text-primary font-medium">{{ item.title }}</td>
                        <td class="px-3 py-2 text-text-muted">{{ item.author }}</td>
                        <td class="px-3 py-2 text-text-primary text-right">{{ formatPrice(item.price) }}</td>
                        <td class="px-3 py-2 text-text-primary text-center">{{ item.quantity }}</td>
                        <td class="px-3 py-2 text-text-primary text-right font-medium">{{ formatPrice(item.price * item.quantity) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div v-if="order?.shipping_name || order?.shipping_address || order?.shipping_phone || order?.shipping_country">
                <p class="text-xs text-text-muted uppercase tracking-wider font-semibold mb-2">Envío</p>
                <div class="rounded-lg border border-border bg-surface-2/40 p-4 space-y-1.5 text-sm">
                  <p v-if="order?.shipping_name"><span class="text-text-muted">Nombre:</span> {{ order.shipping_name }}</p>
                  <p v-if="order?.shipping_address?.line1">
                    <span class="text-text-muted">Dirección:</span>
                    {{ order.shipping_address.line1 }}<template v-if="order.shipping_address.line2">, {{ order.shipping_address.line2 }}</template>
                  </p>
                  <p v-if="order?.shipping_address?.city">
                    <span class="text-text-muted">Ciudad:</span>
                    {{ order.shipping_address.city }}, {{ order.shipping_address.state }} {{ order.shipping_address.postal_code }}
                  </p>
                  <p v-if="order?.shipping_country"><span class="text-text-muted">País:</span> {{ order.shipping_country }}</p>
                  <p v-if="order?.shipping_phone"><span class="text-text-muted">Teléfono:</span> {{ order.shipping_phone }}</p>
                </div>
              </div>

              <div class="flex items-center justify-between border-t border-border pt-4">
                <div class="text-xs text-text-muted">
                  {{ order?.items?.length || 0 }} artículo{{ order?.items?.length !== 1 ? 's' : '' }}
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-text-muted">Total</span>
                  <span class="font-heading font-bold text-lg">{{ formatPrice(order?.total) }}</span>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between px-6 py-4 border-t border-border bg-surface-2/40">
              <button
                @click="confirmingDelete = true"
                class="cursor-pointer flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              >
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" />
                </svg>
                Eliminar pedido
              </button>
              <button
                @click="$emit('close')"
                class="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:text-text-primary hover:border-border-hover transition-colors"
              >
                Cerrar
              </button>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  open: boolean
  order: any
}>(), {
  open: false,
  order: null,
})

const emit = defineEmits<{
  close: []
  deleted: [id: number]
}>()

const confirmingDelete = ref(false)
const deleting = ref(false)
const deleteError = ref('')

function handleBackdropClick() {
  if (!confirmingDelete.value) {
    emit('close')
  }
}

function formatPrice(cents: number): string {
  if (cents == null) return '$0.00'
  return '$' + (cents / 100).toFixed(2)
}

function formatDate(date: string): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
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

async function confirmDelete() {
  if (!props.order?.id) return
  deleting.value = true
  deleteError.value = ''
  try {
    const res = await fetch(`/api/admin/orders/${props.order.id}`, {
      method: 'DELETE',
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Error al eliminar')
    }
    emit('deleted', props.order.id)
  } catch (err: any) {
    deleteError.value = err.message || 'Error de conexión'
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}
.modal-panel-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.modal-panel-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.modal-panel-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(8px);
}
.modal-panel-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(8px);
}
</style>
