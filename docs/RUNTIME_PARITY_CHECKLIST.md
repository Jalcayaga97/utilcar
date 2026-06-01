# Runtime Parity Checklist — Utilcar CMS Ola 2

Validación visual y técnica antes de activar flags en staging/producción.

## Flags de prueba

```env
VITE_USE_SANITY=true
VITE_USE_PAGE_RESOLVER=true
VITE_USE_WORK_V2=true
VITE_USE_SERVICES_V2=true
VITE_USE_CONTACT_V2=true
VITE_RUNTIME_DEBUG=true
```

Rollback: todas las flags V2 → `false`.

---

## Work — `/trabajos-realizados`

| Check | Legacy OFF | CMS ON |
|-------|------------|--------|
| Hero visible | ✓ local image | ✓ CMS o fallback local |
| Intro paragraphs | ✓ | ✓ sin cambio layout |
| Filtros categorías | ✓ | ✓ legacy filters |
| Grid portfolio | ✓ imageKey | ✓ CMS URL o legacy |
| Lightbox | ✓ | ✓ |
| CTA dark | ✓ | ✓ CMS ctaBlock opcional |
| Log `[utilcar runtime:work-page]` | source: legacy | source: cms |
| Sin hydration mismatch | ✓ | ✓ |

---

## Services — `/talleres-moviles` (referencia)

| Check | Legacy OFF | CMS ON |
|-------|------------|--------|
| Hero | ✓ IMAGES.talleres.hero | ✓ CMS heroBlock |
| Intro / scope | ✓ | ✓ featuresBlock opcional |
| Galería | ✓ local | ✓ portfolioBlock o local |
| Spacing / animaciones | ✓ idéntico | ✓ |
| Log `[utilcar runtime:service-page]` | legacy | cms |

Repetir patrón en: ventanas, equipamiento, banquetas, butacas, accesorios.

---

## Contact — `/contacto`

| Check | Legacy OFF | CMS ON |
|-------|------------|--------|
| Hero | ✓ local | ✓ CMS heroBlock |
| Formulario | ✓ | ✓ sin cambio |
| Mapa iframe | ✓ SITE.mapsQuery | ✓ mapBlock.embedQuery opcional |
| FAQ | ✓ flat faqItems | ✓ faqBlock |
| Cards tel/email | ✓ SITE.* | ✓ (contactBlock futuro) |
| Log `[utilcar runtime:contact-page]` | legacy | cms |

---

## Asset layer

| Check | Esperado |
|-------|----------|
| `[utilcar assets:work-hero]` | source: cms \| legacy |
| `[utilcar assets:work-portfolio]` | por ítem |
| `[utilcar assets:service-hero]` | por pageKey |
| missing-image warnings | solo DEV |
| Placeholder sin crash | ✓ |

---

## Global

- [ ] `npm run build` web OK
- [ ] `npm run build` studio OK
- [ ] Home sin cambios visuales
- [ ] CLS estable (lazy images)
- [ ] SEO PageMeta sin regresión
- [ ] Cards count ≥ 1 en portfolio
- [ ] CTA visible cuando hay label+path

---

## Staging rollout

1. Seed Sanity con `blocks[]` en workPage, servicesPage, contactPage
2. Flags ON en `.env.local` staging
3. Comparar side-by-side legacy vs CMS screenshots
4. Activar prod gradualmente por flag
