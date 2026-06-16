<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <label class="flex items-center gap-4 cursor-pointer select-none">
      <input type="checkbox" v-model="form.showTopPicks" class="sr-only peer" />
      <div class="w-10 h-5 bg-surface-3 rounded-full peer-checked:bg-accent relative transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
      <div>
        <span class="text-sm text-text-primary font-medium">Top 10 del mes</span>
        <p class="text-xs text-text-muted mt-0.5">Muestra la sección "Top 10 del mes" en la página principal</p>
      </div>
    </label>

    <label class="flex items-center gap-4 cursor-pointer select-none">
      <input type="checkbox" v-model="form.showTrending" class="sr-only peer" />
      <div class="w-10 h-5 bg-surface-3 rounded-full peer-checked:bg-accent relative transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
      <div>
        <span class="text-sm text-text-primary font-medium">Trending</span>
        <p class="text-xs text-text-muted mt-0.5">Muestra la sección "Trending" en la página principal</p>
      </div>
    </label>

    <p v-if="successMessage" class="text-sm text-green-400">{{ successMessage }}</p>
    <p v-if="submitError" class="text-sm text-red-400">{{ submitError }}</p>

    <div class="flex items-center gap-3 pt-2">
      <button
        type="submit"
        :disabled="submitting"
        class="cursor-pointer rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50 transition-colors"
      >
        {{ submitting ? 'Guardando...' : 'Guardar cambios' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'

interface SettingsFormData {
  showTopPicks: boolean
  showTrending: boolean
}

const form = reactive<SettingsFormData>({
  showTopPicks: true,
  showTrending: true,
})

const submitting = ref(false)
const submitError = ref('')
const successMessage = ref('')

onMounted(() => {
  const el = document.getElementById('settings-data')
  if (el) {
    const data = JSON.parse(el.textContent || '{}')
    form.showTopPicks = data.show_top_picks ?? true
    form.showTrending = data.show_trending ?? true
  }
})

async function handleSubmit() {
  submitting.value = true
  submitError.value = ''
  successMessage.value = ''

  try {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        show_top_picks: form.showTopPicks,
        show_trending: form.showTrending,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Error al guardar')
    }

    successMessage.value = 'Ajustes guardados correctamente.'
    setTimeout(() => { successMessage.value = '' }, 4000)
  } catch (err: any) {
    submitError.value = err.message
  } finally {
    submitting.value = false
  }
}
</script>
