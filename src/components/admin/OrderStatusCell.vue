<template>
  <div class="relative inline-block">
    <button
      @click="open = !open"
      class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium cursor-pointer transition-colors"
      :class="badgeClass"
    >
      {{ label }}
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
      </svg>
    </button>

    <div
      v-if="open"
      class="absolute right-0 z-20 mt-1 w-36 rounded-lg border border-border bg-surface-2 py-1 shadow-lg"
    >
      <button
        v-for="s in statuses"
        :key="s.value"
        @click="changeStatus(s.value)"
        class="block w-full px-3 py-1.5 text-left text-xs text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors cursor-pointer"
      >
        {{ s.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  orderId: number
  currentStatus: string
}>()

const emit = defineEmits<{
  changed: [status: string]
}>()

const open = ref(false)
const updating = ref(false)

const statuses = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'paid', label: 'Pagado' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'cancelled', label: 'Cancelado' },
]

const label = computed(() => {
  return statuses.find((s) => s.value === props.currentStatus)?.label ?? props.currentStatus
})

const badgeClass = computed(() => {
  return {
    'bg-green-500/10 text-green-400': props.currentStatus === 'paid',
    'bg-yellow-500/10 text-yellow-400': props.currentStatus === 'pending',
    'bg-accent-secondary/10 text-accent-secondary': props.currentStatus === 'shipped',
    'bg-red-500/10 text-red-400': props.currentStatus === 'cancelled',
  }
})

async function changeStatus(status: string) {
  if (status === props.currentStatus || updating.value) return
  updating.value = true
  open.value = false

  try {
    const res = await fetch('/api/admin/orders/' + props.orderId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      emit('changed', status)
    }
  } catch {
    // ignore
  } finally {
    updating.value = false
  }
}
</script>
