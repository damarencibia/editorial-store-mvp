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
          :type="showPassword ? 'text' : 'password'"
          v-model="password"
          placeholder="••••••••"
          required
          minlength="6"
          class="w-full rounded-lg border border-border bg-surface-2 pl-10 pr-10 py-2.5 text-sm text-text-primary placeholder-text-dim transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
        />
        <button
          type="button"
          @click="showPassword = !showPassword"
          class="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-text-dim hover:text-text-primary transition-colors"
          :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
        >
          <svg
            v-if="showPassword"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
            />
          </svg>
          <svg
            v-else
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
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
const showPassword = ref(false)
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
