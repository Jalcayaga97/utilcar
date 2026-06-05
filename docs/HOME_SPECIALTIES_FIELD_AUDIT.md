# Auditoría — Especialidades Home (`specialtyCategory`)

**Fecha:** 2026-05-28  
**Alcance:** `specialtyCategory` y tipos anidados usados en `specialtiesBlock.categories[]` del Home.  
**Estado:** Limpieza Studio aplicada (2026-05-28). `gallery`, `brands`, `layoutConfig` ocultos con `hidden: true`; datos en dataset intactos. Frontend/GROQ sin cambios.

## Resumen ejecutivo

- Las **3 categorías** del Home se renderizan vía `EspecialidadesUtilcar` + `mapSpecialtiesSectionToDisplayList` (CMS V2).
- Campos **heredados de páginas de servicio** (`brands`, `gallery`, `layoutConfig`) están en schema y GROQ/contrato, pero **no afectan el layout actual** si están vacíos (sin tabs ni mini-galería).
- En schema **no existen** a nivel raíz: `showBrandTabs`, `compactMode`, `layoutOptions`. Equivalentes: `layoutConfig.showBrandTabs`, `layoutConfig.dense` (“modo compacto”), y el objeto `layoutConfig`.
- El campo editorial **Visible** en Studio es `enabled` (no hay campo `visible`).
- **Brecha:** `featured` se proyecta en GROQ y está en Studio, pero `normalizeSpecialtyCategory` **no lo persiste** en el contrato; el Home **no lo usa** en el render.

## Tabla principal — `specialtyCategory`

| CAMPO | USADO EN FRONTEND (Home) | USADO EN CMS | PUEDE OCULTARSE / DEPRECAR |
|-------|--------------------------|--------------|----------------------------|
| `title` | Sí — `h3` | Sí — validación, preview, GROQ | **No** — mantener visible |
| `subtitle` | Sí — bajo título | Sí — GROQ, contrato | **No** |
| `slug` | Sí — `id` vía `slug.current` en contrato | Sí — GROQ | **No** — puede seguir oculto admin (`advancedSectionHidden`) |
| `description` | Sí — `item.intro` | Sí — GROQ, contrato | **No** |
| `heroImage` | Sí — imagen principal | Sí — warning Studio, GROQ | **No** |
| `heroImageAlt` | Sí — alt vía merge con hero | Sí — GROQ | **No** |
| `features[]` | Sí — `specGroups` | Sí — GROQ, validación | **No** |
| `cta` | Sí — botón si label+path | Sí — GROQ, validación | **No** |
| `enabled` (“Visible”) | Sí — filtra categorías | Sí — GROQ, resolver | **No** |
| `featured` | **No** — no en JSX; contrato lo pierde al normalizar | Sí — GROQ, preview Studio | **Mantener visible** (futuro editorial); corregir contrato al limpiar |
| `gallery` | Solo si `length >= 2` (`GalleryThumbnails`) | Sí — GROQ, contrato, hero fallback | **Sí** — ocultar + deprecated; conservar datos |
| `brands` | Solo si `length > 0` (`BrandTabs` + slice marca) | Sí — GROQ, contrato, validación marcas | **Sí** — ocultar + deprecated; conservar datos |
| `layoutConfig` | **No** — alternancia por índice `index % 2` | Sí — GROQ → `layout` en contrato | **Sí** — ocultar campo + deprecated; tipo ya admin-only |

## Subcampos — `specialtyCta` (campo `cta`)

| CAMPO | FRONTEND | CMS | OCULTAR |
|-------|----------|-----|---------|
| `label` | Sí | Sí | No |
| `to` | Sí (`path`) | Sí | No |
| `ariaLabel` | No (Button sin aria custom) | Sí — normalizado | Opcional ocultar |
| `styleVariant` | No (`Button` siempre `outline`) | Sí — normalizado | Opcional ocultar |

## Subcampos — `specialtyFeature` (campo `features[]`)

| CAMPO | FRONTEND | CMS | OCULTAR |
|-------|----------|-----|---------|
| `title` | Sí — título grupo | Sí | No |
| `items[]` | Sí — lista técnica | Sí | No |
| `kind` | No | Sí — ya `hidden: true` en schema | Ya oculto |

## Subcampos — `specialtyGalleryItem` (campo `gallery[]`)

| CAMPO | FRONTEND | CMS | OCULTAR |
|-------|----------|-----|---------|
| `image` | Sí si galería ≥2 | Sí | Ocultar con `gallery` |
| `alt` | Sí | Sí | Idem |
| `role`, `caption`, `featured` | Parcial / hero fallback | Sí | Idem |

## Subcampos — `layoutConfig` (`specialtyLayoutConfig`)

| CAMPO | FRONTEND | CMS | OCULTAR |
|-------|----------|-----|---------|
| `variant` | No | Sí — contrato `layout.variant` | Sí (todo el objeto) |
| `showBrandTabs` | No | Sí | Sí |
| `imagePosition` | No | Sí | Sí |
| `columns` | No | Sí | Sí |
| `dense` (≈ “compactMode”) | No | Sí | Sí |

## `specialtyBrand` (solo si `brands[]` tiene datos)

Usado en `EspecialidadesUtilcar` vía tabs. Campos Studio: `brandRef`, `title`, `subtitle`, `logo`, `heroImage`, `galleries`, `features`, `cta`, `featured`.  
**Home actual (3 categorías):** típicamente `brands` vacío → sin impacto visual.

## Consumo por archivo

| Archivo | Rol |
|---------|-----|
| `Home.jsx` | Pasa `activeSection={specialtiesSection}` a `EspecialidadesUtilcar` |
| `EspecialidadesUtilcar.jsx` | Render mini-landing; condicionales `BrandTabs`, `GalleryThumbnails` |
| `specialtiesResolver.js` | `mapCategoryToDisplayItem`, filtro `enabled` |
| `specialtiesContract.js` | Normalización, validación, `getValidSpecialtyCategories` |
| `specialtiesProjection.js` | GROQ completo (incluye campos a deprecar) |
| `specialtyCategory.js` | Schema Studio |
| `SpecialtyCategoryEditorialInput.jsx` | Warnings hero/CTA/marcas; wrappers gallery/features/cta |

## Resultado visual esperado tras limpieza (sin tocar datos)

Con `brands[]` y `gallery[]` vacíos y sin `layoutConfig` efectivo:

1. Eyebrow `itemEyebrowPrefix` + número  
2. Título, subtítulo, descripción  
3. Hero + alt  
4. Grupos de características  
5. CTA outline  
6. **Sin** tabs de marcas ni fila de miniaturas  

## Plan de schema (pendiente de aprobación)

1. `gallery`, `brands`, `layoutConfig`: `hidden: true`, descripción `[DEPRECATED]`, sin borrar datos.  
2. Mantener visibles: `title`, `subtitle`, `slug` (admin hidden OK), `description`, `heroImage`, `heroImageAlt`, `features`, `cta`, `enabled`, `featured`.  
3. Ajustar `SpecialtyCategoryEditorialInput` (quitar warning de marcas si el campo se oculta).  
4. Añadir `featured` a `normalizeSpecialtyCategory` / contrato.  
5. **No** eliminar campos de GROQ en esta fase (evitar regresiones en otras rutas).

## Validación automatizada

```bash
npm run audit:home-specialties
```

Ver `scripts/audit-home-specialties.mjs`.
