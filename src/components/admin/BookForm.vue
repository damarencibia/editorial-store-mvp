<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormField
        id="title"
        label="Título"
        v-model="form.title"
        placeholder="Cien años de soledad"
        :error="errors.title"
      />
      <FormField
        id="author"
        label="Autor"
        v-model="form.author"
        placeholder="Gabriel García Márquez"
        :error="errors.author"
      />
    </div>

    <FormField
      id="slug"
      label="Slug"
      v-model="form.slug"
      placeholder="cien-anos-de-soledad"
      :error="errors.slug"
    />

    <FormField
      id="description"
      label="Descripción"
      type="textarea"
      v-model="form.description"
      placeholder="Descripción del libro..."
      :error="errors.description"
    />

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormField
        id="price"
        label="Precio (centavos)"
        type="number"
        v-model="form.price"
        placeholder="1499"
        :error="errors.price"
      />
      <ImageUpload
        v-model="form.coverUrl"
        label="Portada"
        :error="errors.coverUrl"
      />
    </div>

    <p v-if="submitError" class="text-sm text-red-400">{{ submitError }}</p>

    <div class="flex items-center gap-3 pt-2">
      <button
        type="submit"
        :disabled="submitting"
        class="cursor-pointer rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50 transition-colors"
      >
        {{ submitting ? 'Guardando...' : (isEditing ? 'Actualizar libro' : 'Crear libro') }}
      </button>
      <a
        href="/admin/books"
        class="text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        Cancelar
      </a>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import FormField from './FormField.vue'
import ImageUpload from './ImageUpload.vue'

interface BookFormData {
  title: string
  author: string
  slug: string
  description: string
  price: string
  coverUrl: string
}

const props = withDefaults(defineProps<{
  isEditing?: boolean
}>(), {
  isEditing: false,
})

const emit = defineEmits<{
  saved: []
}>()

const form = reactive<BookFormData>({
  title: '',
  author: '',
  slug: '',
  description: '',
  price: '',
  coverUrl: '',
})

onMounted(() => {
  const el = document.getElementById('book-data')
  if (!el) return
  const data = JSON.parse(el.textContent || '{}')
  form.title = data.title ?? ''
  form.author = data.author ?? ''
  form.slug = data.slug ?? ''
  form.description = data.description ?? ''
  form.price = data.price ?? ''
  form.coverUrl = data.coverUrl ?? ''
})

const errors = reactive({
  title: '',
  author: '',
  slug: '',
  description: '',
  price: '',
  coverUrl: '',
})

const submitting = ref(false)
const submitError = ref('')

function validate(): boolean {
  let valid = true
  errors.title = form.title.trim() ? '' : 'El título es obligatorio'
  errors.author = form.author.trim() ? '' : 'El autor es obligatorio'
  errors.slug = form.slug.trim() ? '' : 'El slug es obligatorio'
  errors.price = form.price && parseInt(form.price) > 0 ? '' : 'El precio debe ser mayor a 0'
  if (errors.title || errors.author || errors.slug || errors.price) valid = false
  return valid
}

async function handleSubmit() {
  if (!validate()) return
  submitting.value = true
  submitError.value = ''

  try {
    const method = props.isEditing ? 'PUT' : 'POST'
    const url = props.isEditing ? window.location.pathname : '/api/admin/books'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title.trim(),
        author: form.author.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || null,
        price: parseInt(form.price),
        cover_url: form.coverUrl.trim() || null,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Error al guardar')
    }

    emit('saved')
    window.location.href = '/admin/books'
  } catch (err: any) {
    submitError.value = err.message
  } finally {
    submitting.value = false
  }
}
</script>
