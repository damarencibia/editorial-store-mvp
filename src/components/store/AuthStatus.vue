<template>
  <div v-if="!auth.loading" class="flex items-center gap-3">
    <template v-if="auth.user">
      <a
        href="/profile"
        class="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        <div class="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-accent text-xs font-bold uppercase">
          {{ auth.user.email?.charAt(0) ?? '?' }}
        </div>
        <span class="hidden sm:inline text-sm">{{ auth.user.email?.split('@')[0] }}</span>
      </a>
    </template>
    <template v-else>
      <a
        href="/auth/login"
        class="text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        Iniciar sesión
      </a>
    </template>
  </div>
</template>

<script setup lang="ts">
import { auth, initAuth } from '../../stores/authStore'
initAuth()
</script>
