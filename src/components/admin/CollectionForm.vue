<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <FormField
      id="name"
      label="Nombre"
      v-model="name"
      placeholder="Clásicos universales"
      :error="errors.name"
    />
    <FormField
      id="slug"
      label="Slug"
      v-model="slug"
      placeholder="clasicos-universales"
      :error="errors.slug"
    />
    <FormField
      id="description"
      label="Descripción"
      type="textarea"
      v-model="description"
      placeholder="Breve descripción de la colección..."
      :error="errors.description"
    />
    <ImageUpload
      v-model="coverUrl"
      label="Portada"
      :error="errors.coverUrl"
    />

    <p v-if="submitError" class="text-sm text-red-400">{{ submitError }}</p>

    <div class="flex items-center gap-3 pt-2">
      <button
        type="submit"
        :disabled="submitting"
        class="cursor-pointer rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50 transition-colors"
      >
        {{ submitting ? 'Guardando...' : (isEditing ? 'Actualizar colección' : 'Crear colección') }}
      </button>
      <a
        href="/admin/collections"
        class="text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        Cancelar
      </a>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import FormField from './FormField.vue'
import ImageUpload from './ImageUpload.vue'

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60)
}

const isEditing = ref(false)
const collectionId = ref<number | null>(null)
const name = ref('')
const slug = ref('')
const slugTouched = ref(false)
const description = ref('')
const coverUrl = ref('')
const submitting = ref(false)
const submitError = ref('')
const errors = ref({ name: '', slug: '', description: '', coverUrl: '' })

let _settingSlug = false

watch(name, (val) => {
  if (isEditing.value || slugTouched.value) return
  _settingSlug = true
  slug.value = toSlug(val)
})

watch(slug, () => {
  if (!_settingSlug && slug.value) slugTouched.value = true
  _settingSlug = false
})

onMounted(() => {
  const el = document.getElementById('collection-data')
  isEditing.value = !!el
  if (!el) return
  const data = JSON.parse(el.textContent || '{}')
  collectionId.value = data.id ?? null
  name.value = data.name ?? ''
  slug.value = data.slug ?? ''
  description.value = data.description ?? ''
  coverUrl.value = data.cover_url ?? ''
})

function validate(): boolean {
  let valid = true
  errors.value = { name: '', slug: '', description: '', coverUrl: '' }

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
      ? `/api/admin/collections/${collectionId.value}`
      : '/api/admin/collections'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.value.trim(),
        slug: slug.value.trim(),
        description: description.value.trim() || null,
        cover_url: coverUrl.value.trim() || null,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Error al guardar')
    }

    window.location.href = '/admin/collections'
  } catch (err: any) {
    submitError.value = err.message
  } finally {
    submitting.value = false
  }
}
</script>
