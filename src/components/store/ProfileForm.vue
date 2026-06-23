<template>
  <form @submit.prevent class="rounded-xl border border-border bg-surface-2 p-6 sm:p-8 space-y-8">
    <!-- Name section -->
    <div>
      <div class="flex items-center gap-2 mb-4">
        <svg class="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <h2 class="font-heading text-base font-semibold">Información personal</h2>
      </div>
      <div class="space-y-1.5">
        <label for="fullName" class="text-sm text-text-muted">Nombre completo</label>
        <div class="flex items-center gap-2">
          <input
            id="fullName"
            type="text"
            v-model="fullName"
            placeholder="Tu nombre"
            class="flex-1 rounded-lg border border-border bg-surface-3 px-4 py-2.5 text-sm text-text-primary placeholder-text-dim transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
          />
          <button
            @click="updateName"
            :disabled="!nameChanged || savingName"
            class="cursor-pointer rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {{ savingName ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
        <p v-if="nameSuccess" class="text-xs text-green-400 mt-1 flex items-center gap-1">
          <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          {{ nameSuccess }}
        </p>
        <p v-if="nameError" class="text-xs text-red-400 mt-1">{{ nameError }}</p>
      </div>

      <div class="space-y-1.5 mt-4">
        <p class="text-sm text-text-muted">Email</p>
        <p class="text-sm text-text-primary flex items-center gap-2">
          <svg class="h-4 w-4 text-text-dim" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          {{ userEmail }}
        </p>
        <p class="text-xs text-text-dim">El email no se puede cambiar desde aquí.</p>
      </div>
    </div>

    <hr class="border-border" />

    <!-- Password section -->
    <div>
      <div class="flex items-center gap-2 mb-4">
        <svg class="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        <h2 class="font-heading text-base font-semibold">Cambiar contraseña</h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="space-y-1.5">
          <label for="currentPassword" class="text-sm text-text-muted">Contraseña actual</label>
          <div class="relative">
            <input
              id="currentPassword"
              :type="showCurrent ? 'text' : 'password'"
              v-model="currentPassword"
              placeholder="••••••••"
              class="w-full rounded-lg border border-border bg-surface-3 pl-4 pr-10 py-2.5 text-sm text-text-primary placeholder-text-dim transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
            />
            <button
              type="button"
              @click="showCurrent = !showCurrent"
              class="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-text-dim hover:text-text-primary transition-colors"
              :aria-label="showCurrent ? 'Ocultar' : 'Mostrar'"
            >
              <svg v-if="showCurrent" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
              <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        <div class="space-y-1.5">
          <label for="newPassword" class="text-sm text-text-muted">Nueva contraseña</label>
          <div class="relative">
            <input
              id="newPassword"
              :type="showNew ? 'text' : 'password'"
              v-model="newPassword"
              placeholder="••••••••"
              minlength="6"
              class="w-full rounded-lg border border-border bg-surface-3 pl-4 pr-10 py-2.5 text-sm text-text-primary placeholder-text-dim transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
            />
            <button
              type="button"
              @click="showNew = !showNew"
              class="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-text-dim hover:text-text-primary transition-colors"
              :aria-label="showNew ? 'Ocultar' : 'Mostrar'"
            >
              <svg v-if="showNew" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
              <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        <div class="space-y-1.5">
          <label for="confirmPassword" class="text-sm text-text-muted">Confirmar contraseña</label>
          <div class="relative">
            <input
              id="confirmPassword"
              :type="showConfirm ? 'text' : 'password'"
              v-model="confirmPassword"
              placeholder="••••••••"
              minlength="6"
              class="w-full rounded-lg border border-border bg-surface-3 pl-4 pr-10 py-2.5 text-sm text-text-primary placeholder-text-dim transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
            />
            <button
              type="button"
              @click="showConfirm = !showConfirm"
              class="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-text-dim hover:text-text-primary transition-colors"
              :aria-label="showConfirm ? 'Ocultar' : 'Mostrar'"
            >
              <svg v-if="showConfirm" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
              <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between mt-4">
        <div>
          <p v-if="passwordSuccess" class="text-xs text-green-400 flex items-center gap-1">
            <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            {{ passwordSuccess }}
          </p>
          <p v-if="passwordError" class="text-xs text-red-400">{{ passwordError }}</p>
        </div>
        <button
          @click="changePassword"
          :disabled="!passwordFilled || savingPassword"
          class="cursor-pointer rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ savingPassword ? 'Cambiando...' : 'Cambiar contraseña' }}
        </button>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'

const fullName = ref('')
const initialName = ref('')
const savingName = ref(false)
const nameSuccess = ref('')
const nameError = ref('')

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showCurrent = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)
const savingPassword = ref(false)
const passwordSuccess = ref('')
const passwordError = ref('')

const userEmail = ref('')

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email) userEmail.value = user.email

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user?.id)
    .single()

  if (profile?.full_name) {
    fullName.value = profile.full_name
    initialName.value = profile.full_name
  }
})

const nameChanged = computed(() => fullName.value !== initialName.value)

const passwordFilled = computed(() =>
  currentPassword.value.length >= 6 &&
  newPassword.value.length >= 6 &&
  newPassword.value === confirmPassword.value
)

async function updateName() {
  if (!nameChanged.value) return
  savingName.value = true
  nameSuccess.value = ''
  nameError.value = ''

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    nameError.value = 'No autorizado'
    savingName.value = false
    return
  }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName.value })
    .eq('id', user.id)

  if (error) {
    nameError.value = error.message
  } else {
    initialName.value = fullName.value
    nameSuccess.value = 'Nombre actualizado'
    setTimeout(() => { nameSuccess.value = '' }, 2500)
  }
  savingName.value = false
}

async function changePassword() {
  if (!passwordFilled.value) return
  savingPassword.value = true
  passwordSuccess.value = ''
  passwordError.value = ''

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: userEmail.value,
    password: currentPassword.value,
  })

  if (signInError) {
    passwordError.value = 'La contraseña actual no es correcta'
    savingPassword.value = false
    return
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword.value,
  })

  if (error) {
    passwordError.value = error.message
  } else {
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    passwordSuccess.value = 'Contraseña actualizada'
    setTimeout(() => { passwordSuccess.value = '' }, 2500)
  }
  savingPassword.value = false
}
</script>
