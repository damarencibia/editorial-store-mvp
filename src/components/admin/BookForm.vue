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
      <AuthorCombobox
        id="author"
        v-model="form.authorId"
      />
      <FormField
        id="publisher"
        label="Editorial"
        v-model="form.publisher"
        placeholder="Penguin Random House"
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
      id="subtitle"
      label="Subtítulo / Resumen"
      type="textarea"
      v-model="form.subtitle"
      placeholder="Cuando se ama de verdad, el tiempo no existe"
    />

    <FormField
      id="description"
      label="Descripción"
      type="textarea"
      v-model="form.description"
      placeholder="Descripción del libro..."
      :error="errors.description"
    />

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <FormField
        id="pages"
        label="Páginas"
        type="number"
        v-model="form.pages"
        placeholder="350"
      />
      <FormField
        id="translator"
        label="Traductor"
        v-model="form.translator"
        placeholder="Nombre del traductor"
      />
      <SeriesCombobox
        id="series"
        v-model="form.seriesId"
      />
      <div>
        <label for="age-target" class="block text-xs font-medium text-text-muted mb-1.5">Público objetivo</label>
        <select
          id="age-target"
          v-model="form.ageTarget"
          class="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors"
        >
          <option value="Todos">Todos</option>
          <option value="Infantil">Infantil</option>
          <option value="Juvenil">Juvenil</option>
          <option value="Adulto">Adulto</option>
        </select>
      </div>
      <FormField
        id="binding-type"
        label="Tipo de encuadernación"
        v-model="form.bindingType"
        placeholder="Tapa blanda"
      />
      <div>
        <label for="language" class="block text-xs font-medium text-text-muted mb-1.5">Idioma</label>
        <select
          id="language"
          v-model="form.language"
          class="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors"
        >
          <option value="ES">ES</option>
          <option value="EN">EN</option>
          <option value="FR">FR</option>
          <option value="PT">PT</option>
          <option value="DE">DE</option>
          <option value="IT">IT</option>
        </select>
      </div>
      <FormField
        id="published-at"
        label="Fecha de publicación"
        type="date"
        v-model="form.publishedAt"
      />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormField
        id="price"
        label="Precio (centavos)"
        type="number"
        v-model="form.price"
        placeholder="1499"
        :error="errors.price"
      />
      <div class="space-y-3">
        <div>
          <label for="collection" class="block text-xs font-medium text-text-muted mb-1.5">Colección</label>
          <select
            id="collection"
            v-model="selectedCollectionId"
            class="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors"
          >
            <option :value="null">Seleccionar colección</option>
            <option v-for="col in collections" :key="col.id" :value="col.id">
              {{ col.name }}
            </option>
          </select>
        </div>
        <div>
          <label for="category" class="block text-xs font-medium text-text-muted mb-1.5">Categoría</label>
          <select
            id="category"
            v-model="categoryId"
            class="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors"
          >
            <option :value="null">{{ selectedCollectionId ? 'Sin categoría' : 'Primero selecciona una colección' }}</option>
            <option v-for="cat in filteredCategories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>
      </div>
      <ImageUpload
        v-model="form.coverUrl"
        label="Portada"
        :error="errors.coverUrl"
      />
    </div>

    <div class="flex flex-wrap gap-6 pt-2">
      <label class="flex items-center gap-3 cursor-pointer select-none">
        <input type="checkbox" v-model="form.isVisible" class="sr-only peer" />
        <div class="w-10 h-5 bg-surface-3 rounded-full peer-checked:bg-accent relative transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
        <span class="text-sm text-text-primary">Visible en tienda</span>
      </label>

      <label v-if="isEditing" class="flex items-center gap-3 cursor-pointer select-none">
        <input type="checkbox" v-model="form.manualBestSeller" class="sr-only peer" />
        <div class="w-10 h-5 bg-surface-3 rounded-full peer-checked:bg-accent relative transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
        <span class="text-sm text-text-primary">Marcar como más vendido</span>
      </label>
    </div>

    <p v-if="successMessage" class="text-sm text-green-400">{{ successMessage }}</p>
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
import { reactive, ref, computed, watch, onMounted } from 'vue'
import FormField from './FormField.vue'
import ImageUpload from './ImageUpload.vue'
import SeriesCombobox from './SeriesCombobox.vue'
import AuthorCombobox from './AuthorCombobox.vue'

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60)
}

interface BookFormData {
  title: string
  authorId: number | null
  publisher: string
  slug: string
  subtitle: string
  description: string
  pages: string
  translator: string
  seriesId: number | null
  ageTarget: string
  bindingType: string
  language: string
  publishedAt: string
  price: string
  coverUrl: string
  isVisible: boolean
  manualBestSeller: boolean
}

const emit = defineEmits<{
  saved: []
}>()

const isEditing = ref(false)
const collections = ref<{ id: number; name: string }[]>([])
const categories = ref<{ id: number; name: string; collection_id: number }[]>([])
const selectedCollectionId = ref<number | null>(null)
const categoryId = ref<number | null>(null)

const filteredCategories = computed(() =>
  categories.value.filter((c) => c.collection_id === selectedCollectionId.value)
)

const form = reactive<BookFormData>({
  title: '',
  authorId: null,
  publisher: '',
  slug: '',
  subtitle: '',
  description: '',
  pages: '0',
  translator: '',
  seriesId: null,
  ageTarget: 'Todos',
  bindingType: '',
  language: 'ES',
  publishedAt: '',
  price: '',
  coverUrl: '',
  isVisible: true,
  manualBestSeller: false,
})

const slugTouched = ref(false)
let _settingSlug = false

watch(() => form.title, (val) => {
  if (isEditing.value || slugTouched.value) return
  _settingSlug = true
  form.slug = toSlug(val)
})

watch(() => form.slug, () => {
  if (!_settingSlug && form.slug) slugTouched.value = true
  _settingSlug = false
})

onMounted(() => {
  const el = document.getElementById('book-data')
  isEditing.value = !!el
  if (el) {
    const data = JSON.parse(el.textContent || '{}')
    form.title = data.title ?? ''
    form.authorId = data.authorId ?? null
    form.publisher = data.publisher ?? ''
    form.slug = data.slug ?? ''
    form.subtitle = data.subtitle ?? ''
    form.description = data.description ?? ''
    form.pages = data.pages ?? '0'
    form.translator = data.translator ?? ''
    form.seriesId = data.seriesId ?? null
    form.ageTarget = data.ageTarget ?? 'Todos'
    form.bindingType = data.bindingType ?? ''
    form.language = data.language ?? 'ES'
    form.publishedAt = data.publishedAt ?? ''
    form.price = data.price ?? ''
    form.coverUrl = data.coverUrl ?? ''
    form.isVisible = data.isVisible ?? true
    form.manualBestSeller = data.isBestSeller ?? false
    categoryId.value = data.category_id ?? null
  }

  const colEl = document.getElementById('collections-data')
  if (colEl) {
    collections.value = JSON.parse(colEl.textContent || '[]')
  }

  const catEl = document.getElementById('categories-data')
  if (catEl) {
    categories.value = JSON.parse(catEl.textContent || '[]')
  }

  // Set selected collection from the book's category
  if (categoryId.value !== null) {
    const cat = categories.value.find((c) => c.id === categoryId.value)
    if (cat) {
      selectedCollectionId.value = cat.collection_id
    }
  }
})

const errors = reactive({
  title: '',
  slug: '',
  description: '',
  price: '',
  coverUrl: '',
})

const submitting = ref(false)
const submitError = ref('')
const successMessage = ref('')

function validate(): boolean {
  let valid = true
  errors.title = form.title.trim() ? '' : 'El título es obligatorio'
  errors.slug = form.slug.trim() ? '' : 'El slug es obligatorio'
  errors.price = form.price && parseInt(form.price) > 0 ? '' : 'El precio debe ser mayor a 0'
  valid = !(errors.title || errors.slug || errors.price)
  return valid
}

async function handleSubmit() {
  if (!validate()) return
  submitting.value = true
  submitError.value = ''

  try {
    const method = isEditing.value ? 'PUT' : 'POST'
    const url = isEditing.value ? `/api${window.location.pathname}` : '/api/admin/books'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title.trim(),
        author_id: form.authorId,
        publisher: form.publisher.trim() || null,
        slug: form.slug.trim(),
        subtitle: form.subtitle.trim() || null,
        description: form.description.trim() || null,
        pages: parseInt(form.pages) || 0,
        translator: form.translator.trim() || null,
        series_id: form.seriesId,
        age_target: form.ageTarget,
        binding_type: form.bindingType.trim() || null,
        language: form.language,
        published_at: form.publishedAt || null,
        price: parseInt(form.price),
        cover_url: form.coverUrl.trim() || null,
        category_id: categoryId.value,
        is_visible: form.isVisible,
        ...(isEditing.value ? { manual_best_seller: form.manualBestSeller } : {}),
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Error al guardar')
    }

    if (isEditing.value) {
      successMessage.value = 'Libro actualizado correctamente.'
      setTimeout(() => { successMessage.value = '' }, 4000)
    } else {
      window.location.href = `/admin/books/${data.id}`
    }
  } catch (err: any) {
    submitError.value = err.message
  } finally {
    submitting.value = false
  }
}
</script>
