<template>
  <div class="flex flex-col gap-1.5">
    <label class="text-sm text-text-muted">{{ label }}</label>

    <div
      class="relative cursor-pointer rounded-xl border-2 border-dashed border-border p-4 transition-colors hover:border-accent/50 hover:bg-surface-2/20"
      :class="{
        'opacity-60 pointer-events-none': uploading,
        'border-accent/50 bg-surface-2/30': dragging,
      }"
      @click="triggerFileInput"
      @dragover.prevent="dragging = true"
      @dragleave="dragging = false"
      @drop.prevent="onDrop"
    >
      <div v-if="currentPreview" class="flex items-center gap-4">
        <div class="relative h-28 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-surface-3 shadow-md">
          <img :src="currentPreview" alt="" class="h-full w-full object-cover" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm text-text-muted">{{ selectedFileName || 'Imagen actual' }}</p>
          <p class="mt-1 text-xs text-text-dim">Haz clic o arrastra para cambiar</p>
        </div>
        <button
          type="button"
          @click.stop="removeImage"
          class="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </button>
      </div>

      <div v-else class="flex flex-col items-center gap-2 py-4 text-text-muted">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p class="text-sm">Arrastra una imagen o haz clic para subir</p>
        <p class="text-xs text-text-dim">JPEG, PNG o WebP · Máx 2MB</p>
      </div>

      <input
        ref="inputRef"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="hidden"
        @change="onFileSelected"
      />
    </div>

    <div v-if="uploading" class="flex items-center gap-2 text-xs text-accent">
      <span class="h-3 w-3 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      Subiendo imagen...
    </div>

    <p v-if="errorText" class="text-xs text-red-400">{{ errorText }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  modelValue: string
  label?: string
  error?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const dragging = ref(false)
const errorText = ref('')
const selectedFile = ref<File | null>(null)
const selectedFileName = ref('')

const currentPreview = computed(() => {
  if (selectedFile.value) {
    return URL.createObjectURL(selectedFile.value)
  }
  return props.modelValue || null
})

function triggerFileInput() {
  inputRef.value?.click()
}

function validateFile(file: File): string | null {
  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowed.includes(file.type)) {
    return 'Formato no permitido. Usa JPEG, PNG o WebP.'
  }
  const maxSize = 2 * 1024 * 1024
  if (file.size > maxSize) {
    return 'La imagen supera los 2MB.'
  }
  return null
}

async function uploadFile(file: File) {
  uploading.value = true
  errorText.value = ''

  try {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Error al subir la imagen')
    }

    emit('update:modelValue', data.url)
    selectedFileName.value = file.name
  } catch (err: any) {
    errorText.value = err.message
    selectedFile.value = null
  } finally {
    uploading.value = false
  }
}

function onFileSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  processFile(file)
}

function onDrop(e: DragEvent) {
  dragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  processFile(file)
}

function processFile(file: File) {
  const validationError = validateFile(file)
  if (validationError) {
    errorText.value = validationError
    return
  }
  selectedFile.value = file
  uploadFile(file)
}

function removeImage() {
  selectedFile.value = null
  selectedFileName.value = ''
  errorText.value = ''
  emit('update:modelValue', '')
  if (inputRef.value) inputRef.value.value = ''
}
</script>
