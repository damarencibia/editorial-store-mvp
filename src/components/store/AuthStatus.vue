<template>
  <div v-if="!auth.loading" class="flex items-center gap-2">
    <template v-if="auth.user">
      <a
        v-if="auth.profile?.role === 'admin'"
        href="/admin"
        class="text-[10px] text-accent hover:text-accent/80 transition-colors font-semibold uppercase tracking-wider"
      >
        Admin
      </a>
      <a
        href="/profile"
        class="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent text-sm font-bold uppercase ring-2 ring-border hover:ring-accent/30 transition-all"
      >
        {{ auth.user.email?.charAt(0) ?? '?' }}
      </a>
    </template>
    <template v-else>
      <a
        href="/auth/login"
        class="flex h-8 w-8 items-center justify-center rounded-full bg-surface-3 text-text-muted hover:text-text-primary hover:bg-surface-3/80 transition-all ring-2 ring-border hover:ring-accent/30"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      </a>
    </template>
  </div>
</template>

<script setup lang="ts">
import { auth, initAuth } from '../../stores/authStore'
initAuth()
</script>
