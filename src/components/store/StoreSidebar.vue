<template>
  <Teleport to="body">
    <Transition name="sidebar-backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-40 bg-black/50"
        @click="close"
      />
    </Transition>

    <Transition name="sidebar-panel">
      <aside
        v-if="open"
        class="fixed top-0 left-0 bottom-0 z-[45] w-72 flex flex-col bg-surface-2 border-r border-border shadow-2xl shadow-black/50"
      >
        <div class="flex items-center justify-between px-4 pt-4 pb-2">
          <span class="font-heading text-xs font-semibold uppercase tracking-widest text-text-muted">
            Navegación
          </span>
          <button
            @click="close"
            class="cursor-pointer flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <a
            v-if="!auth.loading && auth.profile?.role === 'admin'"
            href="/admin"
            @click="close"
            class="admin-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
            Administrar
          </a>

          <a
            href="/colecciones"
            @click="close"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
            </svg>
            Colecciones
          </a>

          <a
            href="/books"
            @click="close"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            Libros
          </a>

          <a
            href="/autores"
            @click="close"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            Autores
          </a>

          <a
            href="/orders"
            @click="close"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
              <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
            </svg>
            Mis pedidos
          </a>

          <a
            href="/tendencias"
            @click="close"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            Trending
          </a>
        </nav>

        <div class="border-t border-border px-3 py-4 space-y-2">
          <template v-if="!auth.loading && auth.user">
            <div class="flex items-center gap-3 px-3 py-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent text-sm font-bold uppercase flex-shrink-0">
                {{ auth.user.email?.charAt(0) ?? '?' }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-text-primary truncate">{{ auth.user.email?.split('@')[0] }}</p>
                <p class="text-xs text-text-dim truncate">{{ auth.user.email }}</p>
              </div>
            </div>
            <form method="POST" action="/api/auth/signout">
              <button
                type="submit"
                class="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-muted hover:text-red-400 hover:bg-red-500/5 transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Cerrar sesión
              </button>
            </form>
          </template>

          <template v-else-if="!auth.loading">
            <a
              href="/auth/login"
              @click="close"
              class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              Iniciar sesión
            </a>
            <a
              href="/auth/register"
              @click="close"
              class="flex items-center justify-center rounded-lg bg-accent px-3 py-2.5 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
            >
              Registrarse
            </a>
          </template>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { auth, initAuth } from '../../stores/authStore'

initAuth()

const TOGGLE_EVENT = 'toggle-store-sidebar'
const open = ref(false)

function close() {
  open.value = false
}

function onToggle() {
  open.value = !open.value
}

onMounted(() => {
  window.addEventListener(TOGGLE_EVENT, onToggle)
})

onUnmounted(() => {
  window.removeEventListener(TOGGLE_EVENT, onToggle)
})
</script>

<style scoped>
.sidebar-backdrop-enter-active,
.sidebar-backdrop-leave-active {
  transition: opacity 0.25s ease;
}
.sidebar-backdrop-enter-from,
.sidebar-backdrop-leave-to {
  opacity: 0;
}

.sidebar-panel-enter-active {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.sidebar-panel-leave-active {
  transition: transform 0.25s ease;
}
.sidebar-panel-enter-from,
.sidebar-panel-leave-to {
  transform: translateX(-100%);
}

.admin-link {
  position: relative;
}
</style>
