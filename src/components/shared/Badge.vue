<template>
  <span
    :class="[
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      variant === 'default' && 'bg-accent/10 text-accent',
      variant === 'success' && 'bg-green-500/10 text-green-400',
      variant === 'warning' && 'bg-yellow-500/10 text-yellow-400',
      variant === 'error' && 'bg-red-500/10 text-red-400',
      variant === 'info' && 'bg-accent-secondary/10 text-accent-secondary',
    ]"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
}>()
</script>
