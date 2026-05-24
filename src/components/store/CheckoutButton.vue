<template>
  <button
    @click="handleCheckout"
    :disabled="loading"
    class="cursor-pointer w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
  >
    {{ loading ? 'Redirecting...' : 'Checkout' }}
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { CartItem } from '../../lib/types'

const props = defineProps<{
  items: CartItem[]
}>()

const loading = ref(false)

async function handleCheckout() {
  loading.value = true
  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: props.items }),
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      console.error('No checkout URL returned', data)
      loading.value = false
    }
  } catch (err) {
    console.error('Checkout error:', err)
    loading.value = false
  }
}
</script>
