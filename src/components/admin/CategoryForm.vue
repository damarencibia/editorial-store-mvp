<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <FormField
      id="name"
      label="Nombre"
      v-model="name"
      placeholder="Ficción científica"
      @input="autoSlug"
      :error="errors.name"
    />
    <FormField
      id="slug"
      label="Slug"
      v-model="slug"
      placeholder="ficcion-cientifica"
      :error="errors.slug"
    />

    <p v-if="submitError" class="text-sm text-red-400">{{ submitError }}</p>

    <div class="flex items-center gap-3 pt-2">
      <button
        type="submit"
        :disabled="submitting"
        class="cursor-pointer rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50 transition-colors"
      >
        {{ submitting ? 'Guardando...' : (isEditing ? 'Actualizar categoría' : 'Crear categoría') }}
      </button>
      <a
        href="/admin/categories"
        class="text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        Cancelar
      </a>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import FormField from './FormField.vue'

const isEditing = ref(false)
const categoryId = ref<number | null>(null)
const name = ref('')
const slug = ref('')
const submitting = ref(false)
const submitError = ref('')
const errors = ref({ name: '', slug: '' })

function autoSlug() {
  if (!isEditing.value && !slug.value) {
    slug.value = name.value
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }
}

onMounted(() => {
  const el = document.getElementById('category-data')
  isEditing.value = !!el
  if (!el) return
  const data = JSON.parse(el.textContent || '{}')
  categoryId.value = data.id ?? null
  name.value = data.name ?? ''
  slug.value = data.slug ?? ''
})

function validate(): boolean {
  let valid = true
  errors.value = { name: '', slug: '' }

  if (!name.value.trim()) {
    errors.value.name = 'El nombre es obligatorio'
    valid = false
  }
  if (!slug.value.trim()) {
    errors.value.slug = 'El slug es obligatorio'
    valid = false
  }

  return valid
}

async function handleSubmit() {
  if (!validate()) return
  submitting.value = true
  submitError.value = ''

  try {
    const method = isEditing.value ? 'PUT' : 'POST'
    const url = isEditing.value
      ? `/api/admin/categories/${categoryId.value}`
      : '/api/admin/categories'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.value.trim(),
        slug: slug.value.trim(),
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Error al guardar')
    }

    window.location.href = '/admin/categories'
  } catch (err: any) {
    submitError.value = err.message
  } finally {
    submitting.value = false
  }
}
</script>
