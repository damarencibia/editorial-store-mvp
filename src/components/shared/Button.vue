<template>
  <button
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer',
      variant === 'primary' && 'bg-accent text-white hover:bg-accent/90',
      variant === 'secondary' && 'border border-border bg-surface-2 text-text-primary hover:border-border-hover hover:bg-surface-3',
      variant === 'ghost' && 'text-text-muted hover:text-text-primary hover:bg-surface-2',
      size === 'sm' && 'px-3 py-1.5 text-xs',
      size === 'lg' && 'px-6 py-3 text-base',
      disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
    ]"
    :disabled="disabled"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}>()
</script>
