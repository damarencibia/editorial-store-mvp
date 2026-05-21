# BUILD PLAN — Editorial Store

> Plan de construcción progresivo. Marca las tareas completadas con `[x]`.

---

## Fase 0 — Fundación (estructura + diseño base)

- [ ] Reorganizar estructura de carpetas según arquitectura planificada
- [ ] Agregar tipografías (Inter + Space Grotesk) en BaseLayout
- [ ] Configurar palette Monokai en Tailwind (`@theme`)
- [ ] Migrar `src/styles.css` → `src/styles/base.css` + `src/styles/theme.css`
- [ ] Crear `components/shared/Button.vue`
- [ ] Crear `components/shared/Input.vue`
- [ ] Crear `components/shared/Badge.vue`
- [ ] Crear `lib/types.ts` con interfaces compartidas (Book, Order, CartItem, User)
- [ ] Crear `lib/utils.ts` (formatPrice, cn())
- [ ] Crear `layouts/BaseLayout.astro`
- [ ] Crear `layouts/StoreLayout.astro` (Header + Footer rediseñados)
- [ ] Migrar componentes Vue existentes a `components/store/`
- [ ] Migrar layouts/pages a nueva estructura
- [ ] Verificar que `npm run dev` funciona sin errores

**Objetivo:** Proyecto reestructurado, diseño visual oscuro aplicado, tipografía funcionando, todo compila.

---

## Fase 1 — Tienda Pública Premium

- [ ] Rediseñar Home con Hero section (título, subtítulo, CTA)
- [ ] Catálogo con grid responsivo (1→2→4 cols)
- [ ] BookCard rediseñado con estética oscura
- [ ] Página de detalle de libro con layout premium
- [ ] Footer profesional (columnas: redes, contacto, legal, newsletter)
- [ ] Estado vacío para catálogo sin libros
- [ ] Estado de error para fallos de conexión a Supabase
- [ ] Animaciones suaves (fade-in en cards, hover en botones)
- [ ] SEO: title + description + Open Graph por página
- [ ] View Transitions para navegación fluida
- [ ] Página 404 personalizada

**Objetivo:** Tienda pública con look profesional, experiencia fluida, SEO optimizado.

---

## Fase 2 — Autenticación

- [ ] Crear `lib/auth.ts` con helpers (signUp, signIn, signOut, getSession)
- [ ] Crear `stores/authStore.ts` (Vue reactive, escucha `onAuthStateChange`)
- [ ] Crear `pages/auth/login.astro`
- [ ] Crear `pages/auth/register.astro`
- [ ] Formularios login/register con diseño oscuro + validación
- [ ] Redirección post-login a página anterior
- [ ] Mostrar avatar/nombre en header cuando hay sesión
- [ ] Proteger rutas admin via SSR (`Astro.locals`)
- [ ] Crear `pages/profile/index.astro` (datos básicos)
- [ ] Cerrar sesión desde header

**Objetivo:** Sistema de cuentas funcional, login/register fluido, rutas protegidas.

---

## Fase 3 — Admin / CRM

- [ ] Crear `layouts/AdminLayout.astro` (sidebar + topbar)
- [ ] Crear `components/admin/Sidebar.vue`
- [ ] Crear `components/admin/StatsCard.vue`
- [ ] Crear `components/admin/DataTable.vue` (ordenable, paginada)
- [ ] Crear `components/admin/FormField.vue`
- [ ] Dashboard (`/admin`) con stats: ventas totales, órdenes, clientes, libros
- [ ] CRUD libros: listar (`/admin/books`)
- [ ] CRUD libros: crear (`/admin/books/new`)
- [ ] CRUD libros: editar (`/admin/books/[id]`)
- [ ] CRUD libros: eliminar con confirmación
- [ ] Órdenes: listar con filtros por estado (`/admin/orders`)
- [ ] Órdenes: cambiar estado (pendiente → pagado → enviado)
- [ ] Clientes: listado básico (`/admin/customers`)
- [ ] Admin responsive: sidebar colapsable en mobile

**Objetivo:** Panel administrativo funcional con gestión completa de productos y órdenes.

---

## Fase 4 — Carrito y Checkout Mejorados

- [ ] CartDrawer rediseñado con estética oscura
- [ ] Animación de apertura/cierre del drawer
- [ ] Sumar/restar items desde el drawer
- [ ] Eliminar item con confirmación visual
- [ ] Resumen visual del pedido antes de checkout
- [ ] Sincronizar carrito con localStorage (ya funciona, verificar)
- [ ] CartIcon con badge animado
- [ ] Página de éxito con resumen de orden
- [ ] Página de cancelación con opción de reintentar
- [ ] Webhook robusto: manejar duplicados, actualizar stock

**Objetivo:** Experiencia de compra fluida, carrito visualmente pulido, checkout robusto.

---

## Fase 5 — Features Avanzadas (futuro)

- [ ] Categorías de libros (tabla `categories`, relación N:N)
- [ ] Página de categoría con filtros
- [ ] Búsqueda en catálogo (barra de búsqueda + resultados)
- [ ] Valoraciones y reviews de usuarios
- [ ] Cupones de descuento (Stripe coupons)
- [ ] Wishlist / lista de deseos
- [ ] Notificaciones por email (Stripe + Supabase Edge Functions)
- [ ] Sistema de inventario (stock tracking)
- [ ] i18n (ES/EN)
- [ ] Tests E2E con Playwright

**Objetivo:** Funcionalidades completas de una editorial online profesional.

---

## Progreso Global

<!-- progress_auto -->
**Fase 0:** 0/14 — 0%
**Fase 1:** 0/11 — 0%
**Fase 2:** 0/10 — 0%
**Fase 3:** 0/14 — 0%
**Fase 4:** 0/10 — 0%
**Fase 5:** 0/10 — 0%
<!-- progress_end -->

**Total:** 0/69 tareas completadas
