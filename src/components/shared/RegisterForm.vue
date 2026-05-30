<template>
  <form @submit.prevent="handleRegister" class="flex flex-col gap-4">
    <div class="flex flex-col gap-1.5">
      <label for="email" class="text-sm text-text-muted">Email</label>
      <div class="relative">
        <svg class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
        <input
          id="email"
          type="email"
          v-model="email"
          placeholder="tu@email.com"
          required
          class="w-full rounded-lg border border-border bg-surface-2 pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder-text-dim transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
        />
      </div>
    </div>

    <div class="flex flex-col gap-1.5">
      <label for="password" class="text-sm text-text-muted">Contraseña</label>
      <div class="relative">
        <svg class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
        <input
          id="password"
          type="password"
          v-model="password"
          placeholder="••••••••"
          required
          minlength="6"
          class="w-full rounded-lg border border-border bg-surface-2 pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder-text-dim transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
        />
      </div>
    </div>

    <p v-if="error" class="text-sm text-red-400" v-html="error"></p>
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
    if (authError.message?.toLowerCase().includes('already registered')) {
      error.value = 'Este email ya está registrado. ¿Quieres <a href="/auth/login" class="text-accent underline">iniciar sesión</a>?'
    } else {
      error.value = authError.message
    }
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
