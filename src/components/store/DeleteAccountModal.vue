<template>
  <!-- Trigger button -->
  <div class="flex flex-col items-center text-center">
    <div class="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
      <svg class="h-5 w-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    </div>
    <h2 class="font-heading text-base font-semibold mb-1">Zona de peligro</h2>
    <p class="text-sm text-text-muted mb-4 max-w-md">
      Una vez que elimines tu cuenta, no hay vuelta atrás. Todos tus datos, pedidos y reseñas serán eliminados permanentemente.
    </p>
    <button
      @click="open = true"
      class="cursor-pointer rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-colors"
    >
      Cerrar mi cuenta
    </button>
  </div>

  <!-- Modal -->
  <Teleport to="body">
    <Transition name="modal-backdrop">
      <div v-if="open" class="fixed inset-0 z-50 bg-black/50" @click="open = false" />
    </Transition>

    <Transition name="modal-panel">
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div class="relative z-10 w-full max-w-md rounded-xl border border-border bg-surface-2 shadow-2xl pointer-events-auto overflow-hidden">

          <!-- Step 1: Initial warning -->
          <template v-if="step === 'confirm'">
            <div class="p-6 text-center">
              <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                <svg class="h-6 w-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" />
                </svg>
              </div>
              <h3 class="font-heading text-lg font-semibold mb-2">Eliminar cuenta</h3>
              <p class="text-sm text-text-muted mb-1">
                ¿Estás seguro de que deseas eliminar tu cuenta?
              </p>
              <p class="text-sm text-text-dim">
                Todos tus datos, pedidos y reseñas serán eliminados permanentemente. Esta acción no se puede deshacer.
              </p>
              <div class="flex items-center justify-center gap-3 mt-6">
                <button
                  @click="open = false"
                  class="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:text-text-primary hover:border-border-hover transition-colors"
                >
                  Cancelar
                </button>
                <button
                  @click="step = 'type-name'"
                  class="cursor-pointer rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors"
                >
                  Sí, quiero eliminar mi cuenta
                </button>
              </div>
            </div>
          </template>

          <!-- Step 2: Type full name to confirm -->
          <template v-if="step === 'type-name'">
            <div class="p-6">
              <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                <svg class="h-6 w-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h3 class="font-heading text-lg font-semibold mb-2 text-center">¿Realmente quieres eliminar tu cuenta?</h3>
              <p class="text-sm text-text-muted text-center mb-5">
                Para confirmar, escribe <strong class="text-text-primary">{{ fullName }}</strong> debajo.
              </p>

              <div class="space-y-1.5">
                <label for="confirmName" class="text-sm text-text-muted">Confirma tu nombre completo</label>
                <input
                  id="confirmName"
                  v-model="typedName"
                  :placeholder="fullName"
                  @keyup.enter="executeDelete"
                  class="w-full rounded-lg border border-border bg-surface-3 px-4 py-2.5 text-sm text-text-primary placeholder-text-dim transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                />
              </div>

              <p v-if="error" class="text-xs text-red-400 mt-3">{{ error }}</p>
              <p v-if="success" class="text-xs text-green-400 mt-3 flex items-center gap-1">
                <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {{ success }}
              </p>

              <div class="flex items-center justify-center gap-3 mt-6">
                <button
                  @click="step = 'confirm'"
                  :disabled="deleting"
                  class="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:text-text-primary hover:border-border-hover transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  @click="executeDelete"
                  :disabled="typedName !== fullName || deleting"
                  class="cursor-pointer rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span v-if="deleting" class="flex items-center gap-2">
                    <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 12a9 9 0 11-6.219-8.56" />
                    </svg>
                    Eliminando...
                  </span>
                  <span v-else>Eliminar mi cuenta permanentemente</span>
                </button>
              </div>
            </div>
          </template>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  fullName: string
}>()

const open = ref(false)
const step = ref<'confirm' | 'type-name'>('confirm')
const typedName = ref('')
const deleting = ref(false)
const error = ref('')
const success = ref('')

watch(open, (val) => {
  if (val) {
    step.value = 'confirm'
    typedName.value = ''
    error.value = ''
    success.value = ''
    deleting.value = false
  }
})

async function executeDelete() {
  deleting.value = true
  error.value = ''
  success.value = ''

  const { supabase } = await import('../../lib/supabase')
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    error.value = 'No autorizado'
    deleting.value = false
    return
  }

  const res = await fetch('/api/user/delete-account', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName: typedName.value }),
  })

  const json = await res.json()

  if (!res.ok) {
    error.value = json.error || 'Error al eliminar la cuenta'
    deleting.value = false
    return
  }

  success.value = 'Cuenta eliminada. Redirigiendo...'
  await supabase.auth.signOut()
  window.location.href = '/'
}
</script>
