<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="id" class="text-sm text-text-muted">{{ label }}</label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      class="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm text-text-primary placeholder-text-dim transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 disabled:opacity-50"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="error" class="text-xs text-red-400">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  id?: string
  label?: string
  type?: string
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  error?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
