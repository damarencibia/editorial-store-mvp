<template>
  <div class="border-t border-border pt-8 mt-12">
    <h2 class="font-heading text-xl font-bold tracking-tight mb-6">Reseñas</h2>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
    </div>

    <!-- Error -->
    <p v-else-if="error" class="text-sm text-red-400 py-4">{{ error }}</p>

    <template v-else>
      <!-- Summary -->
      <div v-if="reviews.length > 0" class="flex items-center gap-4 mb-8 p-4 rounded-lg bg-surface-2/50 border border-border">
        <div class="text-center">
          <p class="font-heading text-4xl font-bold text-text-primary">{{ avgRating.toFixed(1) }}</p>
          <div class="flex items-center gap-0.5 mt-1" v-html="starDisplay(avgRating, 20)"></div>
          <p class="text-xs text-text-muted mt-1">{{ total }} {{ total === 1 ? 'reseña' : 'reseñas' }}</p>
        </div>
        <div class="flex-1 space-y-1">
          <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="flex items-center gap-2 text-xs">
            <span class="w-3 text-text-muted shrink-0">{{ star }}</span>
            <div class="flex-1 h-2 rounded-full bg-surface-3 overflow-hidden">
              <div
                class="h-full rounded-full bg-amber-400 transition-all"
                :style="{ width: distribution[star] + '%' }"
              />
            </div>
            <span class="w-8 text-right text-text-dim shrink-0">{{ distribution[star] }}%</span>
          </div>
        </div>
      </div>

      <!-- Review form -->
      <div v-if="auth.user && !userReview && !editingReviewId" class="mb-8 p-4 rounded-lg border border-border bg-surface-2/30">
        <h3 class="font-heading text-sm font-semibold mb-3">Escribe tu reseña</h3>
        <div class="flex items-center gap-1 mb-3">
          <button
            v-for="s in 5"
            :key="s"
            @click="formRating = s"
            @mouseenter="hoverRating = s"
            @mouseleave="hoverRating = 0"
            class="cursor-pointer transition-transform hover:scale-110"
            v-html="starIcon(s <= (hoverRating || formRating), 24)"
          />
        </div>
        <textarea
          v-model="formComment"
          placeholder="Comparte tu opinión sobre este libro (mín. 10 caracteres)"
          class="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors resize-y min-h-[80px]"
          maxlength="2000"
        />
        <div class="flex items-center justify-between mt-2">
          <span class="text-xs text-text-dim">{{ formComment.length }}/2000</span>
          <button
            @click="submitReview"
            :disabled="submitting || formRating === 0 || formComment.trim().length < 10"
            class="cursor-pointer rounded-lg bg-accent px-4 py-2 text-xs font-medium text-white hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {{ submitting ? 'Enviando...' : 'Publicar reseña' }}
          </button>
        </div>
        <p v-if="submitError" class="text-xs text-red-400 mt-2">{{ submitError }}</p>
      </div>

      <!-- Already reviewed notice -->
      <div v-if="userReview && !editingReviewId" class="mb-6 text-xs text-text-muted bg-surface-2/30 border border-border rounded-lg p-3">
        Ya publicaste una reseña para este libro.
        <button @click="editingReviewId = userReview.id" class="text-accent hover:text-accent/80 underline ml-1 cursor-pointer">
          Editar
        </button>
        <button @click="confirmDeleteReview(userReview.id)" class="text-red-400 hover:text-red-300 underline ml-2 cursor-pointer">
          Eliminar
        </button>
      </div>

      <!-- Reviews list -->
      <div v-if="reviews.length > 0" class="space-y-4">
        <div
          v-for="review in reviews"
          :key="review.id"
          class="rounded-lg border border-border bg-surface-2/20 p-4 relative group"
          :class="{ 'ring-1 ring-accent/30': editingReviewId === review.id }"
        >
          <!-- Admin / owner edit/delete buttons -->
          <div
            v-if="(isAdmin || review.user_id === auth.user?.id) && editingReviewId !== review.id"
            class="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <button
              @click="startAdminEdit(review)"
              class="cursor-pointer rounded p-1.5 text-text-muted hover:text-accent hover:bg-surface-3 transition-colors"
              title="Editar reseña"
              v-html="pencilIcon"
            />
            <button
              @click="confirmDeleteReview(review.id)"
              class="cursor-pointer rounded p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Eliminar reseña"
              v-html="trashIcon"
            />
          </div>

          <!-- Admin inline edit mode -->
          <template v-if="editingReviewId === review.id">
            <div class="flex items-center gap-2 mb-2">
              <div class="flex items-center gap-1">
                <button
                  v-for="s in 5"
                  :key="s"
                  @click="editRating = s"
                  class="cursor-pointer"
                  v-html="starIcon(s <= editRating, 20)"
                />
              </div>
              <span class="text-xs text-text-dim">#{{ review.id }}</span>
            </div>
            <textarea
              v-model="editComment"
              class="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors resize-y min-h-[60px]"
              maxlength="2000"
            />
            <div class="flex items-center justify-between mt-2">
              <span class="text-xs text-text-dim">{{ editComment.length }}/2000</span>
              <div class="flex items-center gap-2">
                <button
                  @click="cancelAdminEdit"
                  class="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  @click="saveAdminEdit(review.id)"
                  :disabled="adminSaving"
                  class="cursor-pointer rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {{ adminSaving ? 'Guardando...' : 'Guardar' }}
                </button>
              </div>
            </div>
            <p v-if="adminEditError" class="text-xs text-red-400 mt-2">{{ adminEditError }}</p>
          </template>

          <!-- Normal display mode -->
          <template v-else>
            <div class="flex items-center gap-3 mb-2">
              <div class="h-8 w-8 rounded-full bg-surface-3 flex items-center justify-center text-xs font-bold text-text-muted shrink-0">
                {{ getInitial(review.profile?.full_name || review.profile?.email || 'A') }}
              </div>
              <div>
                <p class="text-sm font-medium text-text-primary">
                  {{ review.profile?.full_name || review.profile?.email?.split('@')[0] || 'Anónimo' }}
                </p>
                <div class="flex items-center gap-2">
                  <div class="flex items-center gap-0.5" v-html="starDisplay(review.rating, 14)"></div>
                  <span class="text-xs text-text-dim">{{ formatDate(review.created_at) }}</span>
                  <span v-if="review.is_edited" class="text-[10px] text-text-dim italic">(editada)</span>
                </div>
              </div>
            </div>
            <p class="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">{{ review.comment }}</p>
          </template>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="py-12 text-center">
        <p class="text-text-muted">No hay reseñas aún para este libro.</p>
        <p v-if="!auth.user" class="text-xs text-text-dim mt-1">
          <a href="/auth/login" class="text-accent hover:underline">Inicia sesión</a> para ser el primero en reseñar.
        </p>
      </div>
    </template>

    <!-- Delete confirmation modal -->
    <Teleport to="body">
      <Transition name="modal-backdrop">
        <div v-if="deletingId" class="fixed inset-0 z-50 bg-black/50" @click="deletingId = null" />
      </Transition>
      <Transition name="modal-panel">
        <div v-if="deletingId" class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div class="relative z-10 w-full max-w-md rounded-xl border border-border bg-surface-2 shadow-2xl pointer-events-auto p-6 text-center">
            <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
              <svg class="h-6 w-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" />
              </svg>
            </div>
            <h3 class="font-heading text-lg font-semibold mb-2">Eliminar reseña</h3>
            <p class="text-sm text-text-muted mb-6">¿Estás seguro? Esta acción no se puede deshacer.</p>
            <div class="flex items-center justify-center gap-3">
              <button
                @click="deletingId = null"
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
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { auth, initAuth } from '../../stores/authStore'

const props = defineProps<{
  bookSlug: string
  bookId: number
}>()

interface ReviewProfile {
  full_name: string | null
  email: string | null
}

interface ReviewData {
  id: number
  book_id: number
  user_id: string
  rating: number
  comment: string
  is_edited: boolean
  created_at: string
  updated_at: string
  profile: ReviewProfile | null
}

interface ReviewsResponse {
  reviews: ReviewData[]
  total: number
  avg_rating: number
}

const loading = ref(true)
const error = ref('')
const reviews = ref<ReviewData[]>([])
const total = ref(0)
const avgRating = ref(0)

const formRating = ref(0)
const hoverRating = ref(0)
const formComment = ref('')
const submitting = ref(false)
const submitError = ref('')

const editingReviewId = ref<number | null>(null)
const editRating = ref(0)
const editComment = ref('')
const adminSaving = ref(false)
const adminEditError = ref('')

const deletingId = ref<number | null>(null)
const deleting = ref(false)
const deleteError = ref('')

const isAdmin = computed(() => auth.profile?.role === 'admin')
const userReview = computed(() =>
  auth.user
    ? reviews.value.find(r => r.user_id === auth.user.id) || null
    : null
)

const distribution = computed(() => {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  reviews.value.forEach(r => { counts[r.rating]++ })
  const t = reviews.value.length || 1
  return {
    5: Math.round((counts[5] / t) * 100),
    4: Math.round((counts[4] / t) * 100),
    3: Math.round((counts[3] / t) * 100),
    2: Math.round((counts[2] / t) * 100),
    1: Math.round((counts[1] / t) * 100),
  }
})

function starIcon(filled: boolean, size: number): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${filled ? '#fbbf24' : 'none'}" stroke="${filled ? '#fbbf24' : '#4b5563'}" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
}

function starDisplay(rating: number, size: number): string {
  const full = Math.floor(rating)
  const fraction = rating - full
  let html = ''
  for (let i = 0; i < 5; i++) {
    if (i < full) {
      html += starIcon(true, size)
    } else if (i === full && fraction >= 0.25) {
      html += `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="1.5"><defs><linearGradient id="half"><stop offset="50%" stop-color="#fbbf24"/><stop offset="50%" stop-color="none"/></linearGradient></defs><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="url(#half)" stroke="#fbbf24"/></svg>`
    } else {
      html += starIcon(false, size)
    }
  }
  return html
}

const pencilIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>'
const trashIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>'

function getInitial(name: string): string {
  return name?.charAt(0).toUpperCase() || '?'
}

function formatDate(date: string): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

async function fetchReviews() {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch(`/api/books/${props.bookSlug}/reviews`)
    if (!res.ok) throw new Error('Error al cargar reseñas')
    const data: ReviewsResponse = await res.json()
    reviews.value = data.reviews
    total.value = data.total
    avgRating.value = data.avg_rating
  } catch (e: any) {
    error.value = e.message || 'Error de conexión'
  } finally {
    loading.value = false
  }
}

async function submitReview() {
  if (formRating.value === 0 || formComment.value.trim().length < 10) return
  submitting.value = true
  submitError.value = ''
  try {
    const res = await fetch(`/api/books/${props.bookSlug}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: formRating.value, comment: formComment.value.trim() }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Error al publicar')
    }
    formRating.value = 0
    formComment.value = ''
    await fetchReviews()
  } catch (e: any) {
    submitError.value = e.message || 'Error de conexión'
  } finally {
    submitting.value = false
  }
}

function startAdminEdit(review: ReviewData) {
  editingReviewId.value = review.id
  editRating.value = review.rating
  editComment.value = review.comment
  adminEditError.value = ''
}

function cancelAdminEdit() {
  editingReviewId.value = null
  editRating.value = 0
  editComment.value = ''
}

async function saveAdminEdit(reviewId: number) {
  if (editComment.value.trim().length < 1) return
  adminSaving.value = true
  adminEditError.value = ''
  try {
    const isOwn = reviews.value.find(r => r.id === reviewId)?.user_id === auth.user?.id
    const url = isOwn
      ? `/api/books/${props.bookSlug}/reviews/${reviewId}`
      : `/api/admin/reviews/${reviewId}`

    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: editRating.value, comment: editComment.value.trim() }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Error al guardar')
    }
    editingReviewId.value = null
    await fetchReviews()
  } catch (e: any) {
    adminEditError.value = e.message || 'Error de conexión'
  } finally {
    adminSaving.value = false
  }
}

function confirmDeleteReview(reviewId: number) {
  deletingId.value = reviewId
  deleteError.value = ''
}

async function executeDelete() {
  if (!deletingId.value) return
  deleting.value = true
  deleteError.value = ''
  try {
    const isOwn = reviews.value.find(r => r.id === deletingId.value)?.user_id === auth.user?.id
    const url = isOwn
      ? `/api/books/${props.bookSlug}/reviews/${deletingId.value}`
      : `/api/admin/reviews/${deletingId.value}`

    const res = await fetch(url, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Error al eliminar')
    }
    deletingId.value = null
    await fetchReviews()
  } catch (e: any) {
    deleteError.value = e.message || 'Error de conexión'
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  initAuth()
  fetchReviews()
})
</script>

<style scoped>
.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}
.modal-panel-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.modal-panel-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.modal-panel-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(8px);
}
.modal-panel-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(8px);
}
</style>
