<template>
  <div>
    <div v-if="cartItems.length === 0" class="text-center py-16">
      <p class="text-text-muted mb-4">Tu carrito está vacío.</p>
      <a href="/" class="text-accent hover:text-accent/80 transition-colors text-sm">Ir a la tienda</a>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div class="lg:col-span-3 space-y-6">
        <div class="rounded-lg border border-border bg-surface-2 p-5">
          <h2 class="font-heading text-lg font-semibold mb-4">País de envío</h2>
          <div class="grid grid-cols-2 gap-3">
            <button
              @click="selectedCountry = 'US'"
              class="flex items-center gap-3 rounded-lg border p-4 text-left transition-all cursor-pointer"
              :class="selectedCountry === 'US' ? 'border-accent bg-accent/5 ring-1 ring-accent' : 'border-border hover:border-border-hover'"
            >
              <span class="text-2xl">🇺🇸</span>
              <div>
                <p class="text-sm font-medium text-text-primary">Estados Unidos</p>
                <p class="text-xs text-text-muted">Envío en 7-10 días hábiles</p>
              </div>
            </button>
            <button
              @click="selectedCountry = 'ES'"
              class="flex items-center gap-3 rounded-lg border p-4 text-left transition-all cursor-pointer"
              :class="selectedCountry === 'ES' ? 'border-accent bg-accent/5 ring-1 ring-accent' : 'border-border hover:border-border-hover'"
            >
              <span class="text-2xl">🇪🇸</span>
              <div>
                <p class="text-sm font-medium text-text-primary">España</p>
                <p class="text-xs text-text-muted">Envío en 7-10 días hábiles</p>
              </div>
            </button>
          </div>
        </div>

        <div class="rounded-lg border border-border bg-surface-2 p-5">
          <h2 class="font-heading text-lg font-semibold mb-4">Resumen del pedido</h2>
          <div class="space-y-3 divide-y divide-border/50">
            <div v-for="item in cartItems" :key="item.bookId" class="flex items-start gap-3 pt-3 first:pt-0">
              <img
                v-if="item.coverUrl"
                :src="item.coverUrl"
                :alt="item.title"
                class="w-12 h-16 object-cover rounded flex-shrink-0"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-text-primary truncate">{{ item.title }}</p>
                <p class="text-xs text-text-muted">{{ item.author }}</p>
                <p class="text-xs text-text-muted mt-1">Qty: {{ item.quantity }}</p>
              </div>
              <p class="text-sm font-medium text-text-primary">{{ formatPrice(item.price * item.quantity) }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-2">
        <div class="rounded-lg border border-border bg-surface-2 p-5 sticky top-24">
          <h2 class="font-heading text-lg font-semibold mb-4">Total del pedido</h2>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-text-muted">Subtotal</span>
              <span class="text-text-primary font-medium">{{ formatPrice(subtotal) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-text-muted">Envío</span>
              <span class="text-text-primary">Calculado en el pago</span>
            </div>
            <div class="border-t border-border pt-2 flex justify-between font-heading font-semibold text-base">
              <span>Total</span>
              <span>{{ formatPrice(subtotal) }}</span>
            </div>
          </div>

          <p v-if="error" class="mt-3 text-xs text-red-400">{{ error }}</p>

          <button
            @click="proceedToPayment"
            :disabled="!selectedCountry || loading"
            class="cursor-pointer w-full rounded-lg bg-accent px-4 py-3 mt-5 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ loading ? 'Redirigiendo a pago...' : 'Ir a pagar' }}
          </button>

          <p class="mt-3 text-xs text-text-dim text-center">
            Stripe recolectará tu dirección de envío y teléfono durante el pago.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { cartStore } from '../../lib/cartStore'

const selectedCountry = ref<string | null>(null)
const loading = ref(false)
const error = ref('')

const cartItems = computed(() => cartStore.items)

const subtotal = computed(() =>
  cartItems.value.reduce((sum, i) => sum + i.price * i.quantity, 0)
)

function formatPrice(cents: number): string {
  return '$' + (cents / 100).toFixed(2)
}

async function proceedToPayment() {
  if (!selectedCountry.value) return
  loading.value = true
  error.value = ''

  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cartItems.value.map(i => ({
          bookId: i.bookId,
          slug: i.slug,
          title: i.title,
          price: i.price,
          quantity: i.quantity,
        })),
        country: selectedCountry.value,
      }),
    })

    const data = await res.json()

    if (data.url) {
      window.location.href = data.url
    } else {
      error.value = data.error || 'Error al procesar el pago'
      loading.value = false
    }
  } catch (err) {
    error.value = 'Error de conexión'
    loading.value = false
  }
}
</script>
