<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <FormField
      id="name"
      label="Nombre"
      v-model="form.name"
      placeholder="Nombre del autor"
      :error="errors.name"
    />

    <FormField
      id="slug"
      label="Slug"
      v-model="form.slug"
      placeholder="nombre-del-autor"
      :error="errors.slug"
    />

    <FormField
      id="bio"
      label="Biografía"
      type="textarea"
      v-model="form.bio"
      placeholder="Breve biografía del autor..."
    />

    <ImageUpload
      v-model="form.photoUrl"
      label="Foto del autor"
    />

    <p v-if="successMessage" class="text-sm text-green-400">{{ successMessage }}</p>
    <p v-if="submitError" class="text-sm text-red-400">{{ submitError }}</p>

    <div class="flex items-center gap-3 pt-2">
      <button
        type="submit"
        :disabled="submitting"
        class="cursor-pointer rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50 transition-colors"
      >
        {{ submitting ? 'Guardando...' : (isEditing ? 'Guardar cambios' : 'Crear autor') }}
      </button>
      <a
        href="/admin/authors"
        class="text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        Cancelar
      </a>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref, watch, onMounted } from 'vue'
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

interface AuthorFormData {
  name: string
  slug: string
  bio: string
  photoUrl: string
}

const isEditing = ref(false)

const form = reactive<AuthorFormData>({
  name: '',
  slug: '',
  bio: '',
  photoUrl: '',
})

const slugTouched = ref(false)
let _settingSlug = false

watch(() => form.name, (val) => {
  if (isEditing.value || slugTouched.value) return
  _settingSlug = true
  form.slug = toSlug(val)
})

watch(() => form.slug, () => {
  if (!_settingSlug && form.slug) slugTouched.value = true
  _settingSlug = false
})

onMounted(() => {
  const el = document.getElementById('author-data')
  isEditing.value = !!el
  if (el) {
    const data = JSON.parse(el.textContent || '{}')
    form.name = data.name ?? ''
    form.slug = data.slug ?? ''
    form.bio = data.bio ?? ''
    form.photoUrl = data.photoUrl ?? ''
  }
})

const errors = reactive({
  name: '',
  slug: '',
})

const submitting = ref(false)
const submitError = ref('')
const successMessage = ref('')

function validate(): boolean {
  let valid = true
  errors.name = form.name.trim() ? '' : 'El nombre es obligatorio'
  errors.slug = form.slug.trim() ? '' : 'El slug es obligatorio'
  valid = !(errors.name || errors.slug)
  return valid
}

async function handleSubmit() {
  if (!validate()) return
  submitting.value = true
  submitError.value = ''

  try {
    const method = isEditing.value ? 'PUT' : 'POST'
    const url = isEditing.value ? `/api${window.location.pathname}` : '/api/admin/authors'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name.trim(),
        slug: form.slug.trim(),
        bio: form.bio.trim() || undefined,
        photo_url: form.photoUrl.trim() || undefined,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Error al guardar')
    }

    if (isEditing.value) {
      successMessage.value = 'Autor actualizado correctamente.'
      setTimeout(() => { successMessage.value = '' }, 4000)
    } else {
      window.location.href = `/admin/authors/${data.id}`
    }
  } catch (err: any) {
    submitError.value = err.message
  } finally {
    submitting.value = false
  }
}
</script>
