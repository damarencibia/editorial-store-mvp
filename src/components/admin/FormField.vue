<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="id" class="text-sm text-text-muted">{{ label }}</label>

    <input
      v-if="type === 'text' || type === 'email' || type === 'number' || type === 'url'"
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      class="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm text-text-primary placeholder-text-dim transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />

    <input
      v-else-if="type === 'date'"
      :id="id"
      type="date"
      :value="modelValue"
      class="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm text-text-primary transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />

    <textarea
      v-else-if="type === 'textarea'"
      :id="id"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      class="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm text-text-primary placeholder-text-dim transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 resize-y"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />

    <select
      v-else-if="type === 'select'"
      :id="id"
      :value="modelValue"
      class="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm text-text-primary transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>

    <p v-if="error" class="text-xs text-red-400">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
interface SelectOption {
  value: string
  label: string
}

withDefaults(defineProps<{
  id?: string
  label?: string
  type?: 'text' | 'email' | 'number' | 'url' | 'textarea' | 'select' | 'date'
  modelValue?: string | number
  placeholder?: string
  error?: string
  rows?: number
  options?: SelectOption[]
}>(), {
  type: 'text',
  rows: 4,
  options: () => [],
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
