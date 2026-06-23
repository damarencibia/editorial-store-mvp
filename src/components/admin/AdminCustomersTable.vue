<template>
  <div class="overflow-x-auto rounded-lg border border-border">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-border bg-surface-2">
          <th
            v-for="col in columns"
            :key="col.key"
            class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted select-none cursor-pointer hover:text-text-primary transition-colors"
            @click="toggleSort(col.key)"
          >
            <span class="inline-flex items-center gap-1">
              {{ col.label }}
              <span v-if="sortKey === col.key" class="text-accent text-[10px]">
                {{ sortDir === 'asc' ? '↑' : '↓' }}
              </span>
            </span>
          </th>
          <th class="px-4 py-3 w-10"></th>
        </tr>
      </thead>
      <tbody class="divide-y divide-border">
        <tr v-for="row in sortedRows" :key="row.id" class="hover:bg-surface-2/50 transition-colors">
          <td class="px-4 py-3 text-text-primary">{{ row.email }}</td>
          <td class="px-4 py-3 text-text-primary">{{ row.full_name || '-' }}</td>
          <td class="px-4 py-3">
            <span
              class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
              :class="row.role === 'admin' ? 'bg-accent/10 text-accent' : 'bg-surface-3 text-text-muted'"
            >
              {{ row.role === 'admin' ? 'Admin' : 'Cliente' }}
            </span>
          </td>
          <td class="px-4 py-3 text-text-muted text-xs">{{ row.created_at }}</td>
          <td class="px-4 py-3">
            <span
              class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
              :class="row.frozen ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="row.frozen ? 'bg-red-400' : 'bg-green-400'" />
              {{ row.frozen ? 'Congelado' : 'Activo' }}
            </span>
          </td>
          <td class="px-4 py-3 text-right relative">
            <div class="flex items-center justify-end gap-1.5">
              <button
                @click.stop="toggleDropdown(row.id)"
                class="cursor-pointer px-1.5 py-0.5 rounded text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors text-lg leading-none select-none"
              >
                ⋮
              </button>
            </div>
            <div
              v-if="openDropdownId === row.id"
              class="absolute right-0 top-full mt-1 z-30 min-w-[220px] bg-surface-2 border border-border rounded-lg shadow-xl py-1 origin-top-right"
              @click.stop
            >
              <button
                @click="toggleFreeze(row)"
                class="flex items-center gap-2 w-full px-4 py-2 text-xs text-text-primary hover:bg-surface-3 transition-colors"
              >
                <span>{{ row.frozen ? 'Descongelar' : 'Congelar' }}</span>
              </button>
              <button
                @click="openRoleModal(row)"
                class="flex items-center gap-2 w-full px-4 py-2 text-xs text-text-primary hover:bg-surface-3 transition-colors"
              >
                Cambiar rol
              </button>
              <button
                @click="openDeleteModal(row)"
                class="flex items-center gap-2 w-full px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="customers.length === 0">
          <td :colspan="columns.length + 1" class="px-4 py-12 text-center text-text-muted">
            No hay clientes registrados.
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div v-if="totalPages > 1" class="flex items-center justify-between mt-4">
    <p class="text-xs text-text-muted">
      {{ (page - 1) * perPage + 1 }}-{{ Math.min(page * perPage, customers.length) }} de {{ customers.length }}
    </p>
    <div class="flex items-center gap-2">
      <button
        @click="page = Math.max(1, page - 1)"
        :disabled="page === 1"
        class="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:text-text-primary hover:border-border-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        Anterior
      </button>
      <button
        v-for="p in visiblePages"
        :key="p"
        @click="page = p"
        :class="[
          'rounded-lg px-3 py-1.5 text-xs transition-colors cursor-pointer',
          p === page ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary hover:bg-surface-2',
        ]"
      >
        {{ p }}
      </button>
      <button
        @click="page = Math.min(totalPages, page + 1)"
        :disabled="page === totalPages"
        class="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:text-text-primary hover:border-border-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        Siguiente
      </button>
    </div>
  </div>

  <Teleport to="body">
    <div
      v-if="openDropdownId !== null"
      class="fixed inset-0 z-20"
      @click="openDropdownId = null"
    ></div>

    <div
      v-if="roleModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      @click="roleModal = null"
    >
      <div class="max-w-md w-full mx-4 rounded-xl bg-surface-2 border border-border p-6 shadow-2xl" @click.stop>
        <h3 class="font-heading text-lg font-semibold mb-2">Cambiar rol</h3>
        <p class="text-sm text-text-muted mb-4">
          Usuario: <strong class="text-text-primary">{{ roleModal.email }}</strong>
        </p>
        <select
          v-model="roleModalValue"
          class="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors mb-6"
        >
          <option value="customer">Cliente</option>
          <option value="admin">Admin</option>
        </select>
        <div class="flex items-center justify-end gap-3">
          <button
            @click="roleModal = null"
            class="cursor-pointer rounded-lg px-4 py-2 text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="executeChangeRole"
            :disabled="roleSaving"
            class="cursor-pointer rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {{ roleSaving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
        <p v-if="roleError" class="text-xs text-red-400 mt-3">{{ roleError }}</p>
      </div>
    </div>

    <div
      v-if="deleteModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      @click="deleteModal = null"
    >
      <div class="max-w-md w-full mx-4 rounded-xl bg-surface-2 border border-border p-6 shadow-2xl text-center" @click.stop>
        <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
          <svg class="h-6 w-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" />
          </svg>
        </div>
        <h3 class="font-heading text-lg font-semibold mb-2">Eliminar cuenta</h3>
        <p class="text-sm text-text-muted mb-2">
          ¿Eliminar la cuenta de <strong class="text-text-primary">{{ deleteModal.email }}</strong>?
        </p>
        <p class="text-xs text-red-400 mb-6">Esta acción no se puede deshacer.</p>
        <div class="flex items-center justify-center gap-3">
          <button
            @click="deleteModal = null"
            class="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="executeDelete"
            :disabled="deleting"
            class="cursor-pointer rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ deleting ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
        <p v-if="deleteError" class="text-xs text-red-400 mt-3">{{ deleteError }}</p>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Customer {
  id: string
  email: string | null
  full_name: string | null
  role: string
  frozen: boolean
  created_at: string
}

const props = defineProps<{
  customers: Customer[]
}>()

const columns = [
  { key: 'email', label: 'Email' },
  { key: 'full_name', label: 'Nombre' },
  { key: 'role', label: 'Rol' },
  { key: 'created_at', label: 'Registrado' },
  { key: 'frozen', label: 'Estado' },
]

const page = ref(1)
const perPage = 10
const sortKey = ref<string>('created_at')
const sortDir = ref<'asc' | 'desc'>('desc')
const openDropdownId = ref<string | null>(null)

const roleModal = ref<Customer | null>(null)
const roleModalValue = ref<string>('customer')
const roleSaving = ref(false)
const roleError = ref('')

const deleteModal = ref<Customer | null>(null)
const deleting = ref(false)
const deleteError = ref('')

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    openDropdownId.value = null
    roleModal.value = null
    deleteModal.value = null
  }
}

onMounted(() => document.addEventListener('keydown', onKeyDown))
onUnmounted(() => document.removeEventListener('keydown', onKeyDown))

function toggleSort(key: string) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

const sortedRows = computed(() => {
  const items = [...props.customers]
  if (sortKey.value) {
    items.sort((a, b) => {
      const aVal = (a as any)[sortKey.value]
      const bVal = (b as any)[sortKey.value]
      if (aVal == null) return 1
      if (bVal == null) return -1
      const cmp = String(aVal).localeCompare(String(bVal), 'es', { numeric: true })
      return sortDir.value === 'asc' ? cmp : -cmp
    })
  }
  const start = (page.value - 1) * perPage
  return items.slice(start, start + perPage)
})

const totalPages = computed(() => Math.ceil(props.customers.length / perPage))

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = page.value
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 3) return [1, 2, 3, 4, 5]
  if (current >= total - 2) return Array.from({ length: 5 }, (_, i) => total - 4 + i)
  return [current - 2, current - 1, current, current + 1, current + 2]
})

function toggleDropdown(id: string) {
  openDropdownId.value = openDropdownId.value === id ? null : id
}

async function toggleFreeze(row: Customer) {
  openDropdownId.value = null
  try {
    const res = await fetch(`/api/admin/customers/${row.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'freeze' }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Error al congelar/descongelar')
    }
    window.location.reload()
  } catch (err: any) {
    alert(err.message)
  }
}

function openRoleModal(row: Customer) {
  openDropdownId.value = null
  roleModal.value = row
  roleModalValue.value = row.role === 'admin' ? 'admin' : 'customer'
  roleError.value = ''
}

async function executeChangeRole() {
  if (!roleModal.value) return
  roleSaving.value = true
  roleError.value = ''
  try {
    const res = await fetch(`/api/admin/customers/${roleModal.value.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'role', value: roleModalValue.value }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Error al cambiar rol')
    }
    roleModal.value = null
    window.location.reload()
  } catch (err: any) {
    roleError.value = err.message
  } finally {
    roleSaving.value = false
  }
}

function openDeleteModal(row: Customer) {
  openDropdownId.value = null
  deleteModal.value = row
  deleteError.value = ''
}

async function executeDelete() {
  if (!deleteModal.value) return
  deleting.value = true
  deleteError.value = ''
  try {
    const res = await fetch(`/api/admin/customers/${deleteModal.value.id}`, {
      method: 'DELETE',
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Error al eliminar')
    }
    deleteModal.value = null
    window.location.reload()
  } catch (err: any) {
    deleteError.value = err.message
  } finally {
    deleting.value = false
  }
}
</script>
