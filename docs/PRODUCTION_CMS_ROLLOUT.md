# Plan de rollout CMS — Producción

Guía para activar CMS-first en producción con rollback seguro.

## Pre-requisitos

- [ ] Staging QA completado (`STAGING_QA_CHECKLIST.md`)
- [ ] Sanity production dataset publicado y revisado
- [ ] Backup export Sanity (`sanity dataset export`)
- [ ] Backup `.env` producción actual
- [ ] Smoke tests automatizados o script manual documentado

## Orden de activación de flags

Activar **secuencialmente**. Validar 24–48 h entre fases antes de continuar.

### Fase 0 — Baseline (actual)

```env
VITE_USE_SANITY=true
VITE_USE_BLOCK_RESOLVER=false
VITE_USE_SPECIALTIES_V2=false
VITE_USE_PAGE_RESOLVER=false
VITE_USE_SERVICES_V2=false
VITE_USE_WORK_V2=false
VITE_USE_CONTACT_V2=false
```

Sitio 100% legacy runtime; Sanity solo para preparación editorial.

### Fase 1 — Home blocks

```env
VITE_USE_BLOCK_RESOLVER=true
```

Validar: Home completa, mirrors GROQ OK, warnings DEV revisados.

### Fase 2 — Especialidades V2

```env
VITE_USE_SPECIALTIES_V2=true
```

Validar: categorías, marcas, galerías, CTAs.

### Fase 3 — Page resolver base

```env
VITE_USE_PAGE_RESOLVER=true
```

Sin dominios V2 aún — prepara infraestructura secundaria.

### Fase 4 — Trabajos

```env
VITE_USE_WORK_V2=true
```

Validar: portfolio, hero, SEO block opcional.

### Fase 5 — Contacto

```env
VITE_USE_CONTACT_V2=true
```

Validar: mapa, FAQ, hero.

### Fase 6 — Servicios

```env
VITE_USE_SERVICES_V2=true
```

Validar todas las sub-páginas migradas a `useServicePageDisplay`.

## Rollback inmediato

| Síntoma | Acción |
|---------|--------|
| Layout roto / hydration error | Flag del dominio → `false`, redeploy |
| Contenido incorrecto CMS | Ocultar bloque en Studio + republish, o rollback flag |
| Sanity caído | Flags OFF — sitio sigue en legacy local |
| SEO degradado | Quitar `seoBlock` o corregir en Studio |

Tiempo objetivo rollback: **< 15 min** (redeploy frontend only).

## Backups

Antes de cada fase:

```bash
# Export Sanity (desde utilcar-studio/)
npx sanity dataset export production backup-$(date +%Y%m%d).tar.gz

# Snapshot env producción (manual en hosting)
```

Contenido local `/content` permanece en repo — no eliminar hasta cleanup final aprobado.

## Smoke tests post-deploy

Ejecutar tras cada fase:

1. GET `/` — 200, hero visible
2. GET `/trabajos-realizados` — portfolio > 0 items
3. GET `/contacto` — mapa iframe
4. GET `/talleres-moviles` — hero + galería
5. View-source: meta title + canonical presentes
6. Consola browser: sin errors React hydration

## Monitoring

| Señal | Herramienta | Umbral |
|-------|-------------|--------|
| Errores JS | Sentry / consola Real User Monitoring | 0 hydration errors |
| LCP | Lighthouse / CrUX | ≤ 2.5s mobile |
| CLS | Lighthouse | ≤ 0.1 |
| Sanity API | Sanity dashboard | Sin rate limit |
| CMS warnings | DEV `[utilcar runtime:*]` | Revisar pre-prod |

## Editor onboarding

1. Compartir `EDITORIAL_GUIDELINES.md`
2. Sesión 30 min: Page Builder Home + Trabajos
3. Roles: editores sin legacy admin
4. Canal soporte para warnings governance

## Post-rollout (no incluido en esta fase)

- Migrar sub-páginas servicio restantes
- Eliminar mirrors legacy (requiere aprobación explícita)
- Cleanup schemas deprecated

## Referencias

- `FALLBACK_MATRIX.md` — flags y resolvers
- `RUNTIME_PARITY_CHECKLIST.md` — paridad visual
- `FULL_SITE_CMS_MIGRATION_ROADMAP.md` — roadmap general
