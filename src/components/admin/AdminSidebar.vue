<template>
  <Teleport to="body">
    <Transition name="sidebar-backdrop">
      <div
        v-if="!isDesktop && mobileOpen"
        class="fixed inset-0 z-30 bg-black/50 lg:hidden"
        @click="closeMobile"
      />
    </Transition>
  </Teleport>

  <aside
    :style="{ width: isDesktop ? desktopWidth + 'px' : '16rem' }"
    class="fixed lg:static inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-surface-2 transition-all duration-200 overflow-hidden flex-shrink-0"
    :class="[
      isDesktop
        ? 'lg:translate-x-0'
        : mobileOpen
          ? 'translate-x-0'
          : '-translate-x-full',
      !isDesktop ? 'shadow-2xl shadow-black/50' : '',
    ]"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <!-- Header -->
    <div
      class="flex items-center pt-4 pb-0"
      :class="isDesktop && !isEffectivelyExpanded ? 'justify-center px-3' : 'justify-between px-4'"
    >
      <a
        v-show="isEffectivelyExpanded || !isDesktop"
        href="/admin"
        class="font-heading text-lg font-bold text-text-primary hover:text-accent transition-colors whitespace-nowrap overflow-hidden"
      >
        Editorial
      </a>
      <button
        v-if="isDesktop"
        @click="togglePinned"
        class="cursor-pointer text-text-muted hover:text-text-primary p-1 flex-shrink-0 transition-all duration-200 rounded-lg hover:bg-surface-3"
        :title="pinned ? 'Desfijar menú' : 'Fijar menú abierto'"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          :fill="pinned ? 'currentColor' : 'none'"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="transition-transform duration-200"
          :class="{ 'rotate-45': pinned }"
        >
          <circle cx="12" cy="5" r="4"/>
          <line x1="12" y1="9" x2="12" y2="16"/>
          <path d="M9 16l3 5 3-5"/>
        </svg>
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex flex-col gap-1 flex-1 px-3 pt-6 overflow-y-auto">
      <a
        v-for="item in navItems"
        :key="item.href"
        :href="item.href"
        @click="closeMobile"
        class="flex items-center rounded-lg py-2.5 text-sm transition-colors whitespace-nowrap"
        :class="[
          item.match(currentPath)
            ? 'bg-accent/10 text-accent font-medium'
            : 'text-text-muted hover:text-text-primary hover:bg-surface-3',
          isDesktop && !isEffectivelyExpanded ? 'justify-center px-0 gap-0' : 'px-3 gap-3',
        ]"
      >
        <span class="flex-shrink-0 flex items-center justify-center w-5 h-5" v-html="icons[item.icon]"></span>
        <span
          v-show="isEffectivelyExpanded || !isDesktop"
          class="transition-opacity duration-200"
        >
          {{ item.label }}
        </span>
      </a>
    </nav>

    <!-- User section -->
    <div class="pt-4 border-t border-border">
      <div
        class="flex items-center py-2"
        :class="isDesktop && !isEffectivelyExpanded ? 'justify-center px-3' : 'px-3 gap-2'"
      >
        <div class="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-accent text-xs font-bold uppercase flex-shrink-0">
          {{ initial }}
        </div>
        <div v-show="isEffectivelyExpanded || !isDesktop" class="flex-1 min-w-0">
          <p class="text-xs font-medium truncate">{{ displayName }}</p>
          <span class="text-[10px] uppercase tracking-wider text-accent font-semibold">Admin</span>
        </div>
      </div>
      <a
        href="/"
        @click="closeMobile"
        class="flex items-center rounded-lg py-2 text-xs transition-colors"
        :class="isDesktop && !isEffectivelyExpanded ? 'justify-center px-3 gap-0' : 'px-3 gap-2'"
      >
        <span class="flex-shrink-0 flex items-center justify-center w-4 h-4" v-html="icons.store"></span>
        <span
          v-show="isEffectivelyExpanded || !isDesktop"
          class="text-text-muted hover:text-accent transition-colors"
        >
          Ir a la tienda
        </span>
      </a>
      <form method="POST" action="/api/auth/signout" class="mt-1 pb-4">
        <button
          type="submit"
          class="w-full rounded-lg py-1.5 text-xs text-text-muted hover:text-red-400 hover:bg-red-500/5 transition-colors cursor-pointer flex items-center"
          :class="isDesktop && !isEffectivelyExpanded ? 'justify-center px-3 gap-0' : 'px-3 gap-2'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span v-show="isEffectivelyExpanded || !isDesktop">Cerrar sesión</span>
        </button>
      </form>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const SIDEBAR_EVENT = 'toggle-admin-sidebar'
const DESKTOP_BREAKPOINT = 1024
const WIDTH_EXPANDED = 240
const WIDTH_COLLAPSED = 64

const props = defineProps<{
  currentPath: string
  displayName: string
  initial: string
}>()

const pinned = ref(true)
const hovered = ref(false)
const mobileOpen = ref(false)
const isDesktop = ref(true)

const isEffectivelyExpanded = computed(() => isDesktop.value && (pinned.value || hovered.value))

const desktopWidth = computed(() =>
  isEffectivelyExpanded.value ? WIDTH_EXPANDED : WIDTH_COLLAPSED
)

const icons: Record<string, string> = {
  dashboard: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  book: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>',
  folder: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>',
  clipboard: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 14l2 2 4-4"/></svg>',
  users: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><circle cx="16" cy="7" r="4"/></svg>',
  store: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>',
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard', match: (p: string) => p === '/admin' },
  { href: '/admin/books', label: 'Libros', icon: 'book', match: (p: string) => p.startsWith('/admin/books') },
  { href: '/admin/categories', label: 'Categorías', icon: 'folder', match: (p: string) => p.startsWith('/admin/categories') },
  { href: '/admin/orders', label: 'Órdenes', icon: 'clipboard', match: (p: string) => p === '/admin/orders' },
  { href: '/admin/customers', label: 'Clientes', icon: 'users', match: (p: string) => p === '/admin/customers' },
]

function togglePinned() {
  pinned.value = !pinned.value
}

function onToggleMobile() {
  mobileOpen.value = !mobileOpen.value
  if (mobileOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

function closeMobile() {
  if (mobileOpen.value) {
    mobileOpen.value = false
    document.body.style.overflow = ''
  }
}

function onMouseEnter() {
  if (isDesktop.value) {
    hovered.value = true
  }
}

function onMouseLeave() {
  if (isDesktop.value) {
    hovered.value = false
  }
}

function onResize() {
  isDesktop.value = window.innerWidth >= DESKTOP_BREAKPOINT
  if (isDesktop.value && mobileOpen.value) {
    document.body.style.overflow = ''
    mobileOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener(SIDEBAR_EVENT, onToggleMobile)
  window.addEventListener('resize', onResize)
  isDesktop.value = window.innerWidth >= DESKTOP_BREAKPOINT
})

onUnmounted(() => {
  window.removeEventListener(SIDEBAR_EVENT, onToggleMobile)
  window.removeEventListener('resize', onResize)
  document.body.style.overflow = ''
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
</style>
