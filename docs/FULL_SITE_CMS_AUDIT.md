# Full Site CMS Audit — Utilcar

> Generado como baseline de migración CMS-first. Arquitectura existente: Block Resolver Layer, contracts, Sanity Studio monorepo.

## Resumen ejecutivo

| Métrica | Valor |
|---------|-------|
| Páginas públicas | 10 (`src/pages/`) |
| Migración **full** | 0 |
| Migración **partial** | 9 |
| Migración **none** | 1 (404) |
| Block Resolver activo (Home) | Solo con `VITE_USE_BLOCK_RESOLVER=true` |
| Specialties V2 activo | Solo con `VITE_USE_BLOCK_RESOLVER` + `VITE_USE_SPECIALTIES_V2` |
| Imágenes CMS en servicios | No (100% assets locales Vite) |
| SEO CMS | No (`constants/seo.js`) |
| Contacto global | Parcial (`constants/site.js` + CMS) |

**Conclusión:** Home tiene la arquitectura más avanzada. El resto del sitio consume `servicesPage` / `workPage` / `contactPage` con merge local-first. Page Builder universal aún no existe fuera de `homePage`.

---

## Arquitectura de datos actual

```
src/content/          → baseline local validado
src/lib/cms/          → adapters, merge, resolvers, contracts
src/lib/sanity/       → GROQ + fetch
hooks/useCms.js       → SSR local → post-mount Sanity
```

### Feature flags

| Flag | Default | Alcance |
|------|---------|---------|
| `VITE_USE_SANITY` | `false` | Activa fetch Sanity |
| `VITE_USE_BLOCK_RESOLVER` | `false` | Home `blocks[]` + resolvers |
| `VITE_USE_SPECIALTIES_V2` | `false` | `extensions.specialtiesSection` |
| `VITE_USE_NEW_SPECIALTIES` | `false` | `specialtiesNew` vs legacy items |
| `VITE_USE_PAGE_RESOLVER` | `false` | Páginas con `blocks[]` (nuevo) |
| `VITE_USE_SERVICES_V2` | `false` | `servicesPage.blocks[]` CMS-first |
| `VITE_USE_WORK_V2` | `false` | `workPage.blocks[]` CMS-first |
| `VITE_USE_CONTACT_V2` | `false` | `contactPage.blocks[]` CMS-first |

---

## Auditoría por página

### P0 — Home (`/`)

| Aspecto | Estado |
|---------|--------|
| **Hooks** | `useHomeContent`, `useHighlights`, `useTrabajosPreview` |
| **CMS** | `homePage` + `home.adapter` |
| **Resolver** | hero, services, whyUs, portfolio, specialties (condicional) |
| **Imágenes** | Hero CMS+fallback; servicios local; portfolio `imageKey`; especialidades V2 |
| **Legacy** | Campos planos GROQ, `content/home.js`, `merge.js` |
| **Prioridad** | P0 |
| **Complejidad** | Alta |
| **Estrategia** | Mantener flags; activar en prod cuando Studio seed OK; Fase 14 cleanup mirrors |

### P1 — Servicios (páginas hijas)

| Página | Ruta | Hook | Imágenes | Status |
|--------|------|------|----------|--------|
| Talleres móviles | `/talleres-moviles` | `useTalleresMovilesContent` | `IMAGES.talleres.*` local | partial |
| Ventanas y lunetas | `/ventanas-lunetas` | `useVentanasLunetasContent`, `useVentanasBrands` | Hero + galerías por `id` local | partial |
| Trabajos | `/trabajos-realizados` | `useWorkContent` | Hero local fijo; portfolio `imageKey` | partial |
| Contacto | `/contacto` | `useContactContent` | Hero local; FAQ CMS | partial |

**Blockers transversales P1:**
- `SERVICES_QUERY` / `WORK_QUERY` sin assets URL
- Adapters preservan imágenes locales vía merge
- `work.adapter` no mergea hero remoto (`trabajosPageHero: local`)
- Contacto mezcla `SITE.*` hardcoded con CMS

**Estrategia:** `servicesPageResolver` / `workPageResolver` / `contactPageResolver` + `blocks[]` en Studio + Asset Resolution Layer extendido.

### P2 — Servicios (resto)

| Página | Ruta | Patrón |
|--------|------|--------|
| Equipamiento escolar | `/equipamiento-escolar` | Texto CMS + imágenes local |
| Banquetas | `/banquetas` | Categorías CMS + galerías local |
| Butacas | `/butacas` | Texto CMS + imágenes local |
| Accesorios | `/accesorios` | Categorías CMS + galerías local |

**Estrategia:** Unificar bajo `servicesPage` sections o bloques por servicio; tabs/marcas vía `featuresBlock` + galerías CMS.

### P3 — Not Found (`*`)

Sin CMS. Baja prioridad.

---

## Layout global

| Componente | Fuente | Migración |
|------------|--------|-----------|
| `Navbar` | `useMainNavLinks`, `useServiceLinks` | partial |
| `Footer` | nav + `SITE.*` | partial |
| `PageMeta` | `constants/seo.js` | none |
| `StructuredData` | `constants/site.js` | none |

---

## Studio — inventario CMS

### Documentos

| Tipo | Menú Studio | Page Builder |
|------|-------------|--------------|
| `homePage` | Inicio | Sí (`blocks[]`) |
| `servicesPage` | Servicios | En progreso (`blocks[]` opcional) |
| `workPage` | Trabajos | En progreso |
| `contactPage` | Contacto | En progreso |
| `brand` | Catálogos → Marcas | N/A |

### Bloques Home implementados

`heroBlock`, `specialtiesBlock`, `servicesBlock`, `whyUsBlock`, `portfolioBlock`, `ctaBlock` (+ alias `galleryBlock`)

### Bloques globales (roadmap)

| Bloque | Studio | Frontend resolver | Prioridad |
|--------|--------|-------------------|-----------|
| `faqBlock` | Implementado | `faqBlockContract` | Alta |
| `featuresBlock` | Implementado | `featuresBlockContract` | Alta |
| `richTextBlock` | Implementado | `richTextBlockContract` | Media |
| `tabsBlock` | Pendiente | Especialidades brands | Media |
| `brandsBlock` | Pendiente | Ventanas marcas | Media |
| `testimonialsBlock` | Pendiente | — | Baja |
| `statsBlock` | Pendiente | — | Baja |
| `mapBlock` | Pendiente | Contacto | Media |
| `contactBlock` | Pendiente | Contacto | Alta |

---

## Dependencias legacy críticas

1. **`src/content/`** — baseline obligatorio para fallback
2. **`src/assets/images`** — imágenes servicios, galerías, marcas
3. **`constants/site.js`** — teléfono, email, WhatsApp, mapa
4. **`constants/seo.js`** — meta por ruta
5. **`merge.js`** — preserva iconos/imágenes locales
6. **Campos planos `homePage`** — mirrors GROQ (Studio sync)
7. **`servicesPage` flat fields** — nav + páginas servicio embebidas

---

## Blockers estructurales

| # | Blocker | Impacto | Mitigación |
|---|---------|---------|------------|
| 1 | Sin Page Builder fuera de Home | Páginas no composables | `blocks[]` en page docs + `pageResolver` |
| 2 | Imágenes fuera de GROQ | Editor no sube fotos servicios | Asset projection + `resolveServiceAssets` |
| 3 | SEO hardcoded | No editable | `seoBlock` / campo `seo` por página |
| 4 | Dual path flat + blocks | Deuda sync | Flags + fallback completo; cleanup Fase 14 |
| 5 | Ventanas marcas vs catálogo `brand` | Duplicidad conceptual | Marcas embebidas en categoría (Specialties V2 pattern) |
| 6 | ~~Dos copias studio~~ | Resuelto | Única copia: `utilcar-web/utilcar-studio/` |

---

## Priorización de migración

### Ola 1 (actual → 2 semanas)
- [x] Home Block Resolver + Specialties V2
- [ ] Page resolver global + flags
- [ ] `blocks[]` en services/work/contact (Studio)
- [ ] FAQ / features / richText blocks

### Ola 2
- [ ] Services CMS-first runtime (hero, cards, galerías)
- [ ] Work CMS-first (portfolio assets, categorías)
- [ ] Contact CMS-first (hero, FAQ block, form labels)

### Ola 3
- [ ] Páginas servicio individuales vía blocks
- [ ] SEO CMS por página
- [ ] Asset Resolution completo

### Ola 4 (cleanup)
- [ ] Eliminar mirrors, flags, hooks legacy
- [ ] Rutas dinámicas `/especialidades/[slug]`, etc.

---

## Checklist producción (pre-activación flags)

- [ ] `npm run build` web + studio OK
- [ ] Seed Sanity production verificado
- [ ] Smoke test `npm run cms:smoke`
- [ ] Home con flags ON — visual parity
- [ ] Fallback flags OFF — idéntico a pre-migración
- [ ] Sin hydration errors / undefined crashes
- [ ] Logs DEV revisados

---

## Referencias

- `docs/HOME_PAGE_BUILDER_ALIGNMENT.md`
- `docs/SANITY_INTEGRACION.md`
- `utilcar-studio/docs/CMS_CONVERGENCE.md`
- `utilcar-studio/docs/SPECIALTIES_DOMAIN_MODEL.md`
- `docs/FULL_SITE_CMS_MIGRATION_ROADMAP.md`
