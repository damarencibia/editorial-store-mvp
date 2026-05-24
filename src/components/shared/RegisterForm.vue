<template>
  <form @submit.prevent="handleRegister" class="flex flex-col gap-4">
    <div class="flex flex-col gap-1.5">
      <label for="email" class="text-sm text-text-muted">Email</label>
      <input
        id="email"
        type="email"
        v-model="email"
        placeholder="tu@email.com"
        required
        class="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm text-text-primary placeholder-text-dim transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
      />
    </div>

    <div class="flex flex-col gap-1.5">
      <label for="password" class="text-sm text-text-muted">Contraseña</label>
      <input
        id="password"
        type="password"
        v-model="password"
        placeholder="••••••••"
        required
        minlength="6"
        class="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm text-text-primary placeholder-text-dim transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
      />
    </div>

    <p v-if="error" class="text-sm text-red-400">{{ error }}</p>
    <p v-if="success" class="text-sm text-green-400">{{ success }}</p>

    <button
      type="submit"
      :disabled="loading"
      class="cursor-pointer w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {{ loading ? 'Creando cuenta...' : 'Crear cuenta' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { signUp } from '../../lib/auth'

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

async function handleRegister() {
  error.value = ''
  success.value = ''
  loading.value = true

  const { data, error: authError } = await signUp(email.value, password.value)

  loading.value = false

  if (authError) {
    error.value = authError.message
    return
  }

  if (data.session) {
    success.value = 'Cuenta creada. Redirigiendo...'
    setTimeout(() => { window.location.href = '/' }, 500)
  } else {
    success.value = 'Cuenta creada. Revisa tu email para confirmar.'
  }
}
</script>
