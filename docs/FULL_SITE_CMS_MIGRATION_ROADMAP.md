# Full Site CMS Migration — Roadmap

Estado de fases del master prompt de migración CMS-first.

| Fase | Nombre | Estado | Notas |
|------|--------|--------|-------|
| 1 | Auditoría automática | **Done** | `FULL_SITE_CMS_AUDIT.md` |
| 2 | Modelo CMS global (blocks) | **In progress** | `faqBlock`, `featuresBlock`, `richTextBlock` |
| 3 | Page Builder global | **In progress** | `blocks[]` en services/work/contact |
| 4 | Services CMS-first | **Scaffold** | `servicesPageResolver` + flag |
| 5 | Works CMS-first | **Scaffold** | `workPageResolver` + flag |
| 6 | Contact CMS-first | **Scaffold** | `contactPageResolver` + flag |
| 7 | Specialties Full V2 | **Done** | Runtime V2 + Studio categories |
| 8 | Asset Management | **Partial** | Hero + specialty assets |
| 9 | Global Resolver Layer | **In progress** | `resolvers/global/` |
| 10 | Global Contracts | **In progress** | `pageContract`, block contracts |
| 11 | Editorial UX Pro | **Partial** | Home + specialties editorial |
| 12 | SEO CMS-first | **Pending** | |
| 13 | Routing futuro | **Pending** | |
| 14 | Cleanup final | **Pending** | Post-estabilización |
| 15 | Documentación | **In progress** | Este doc + audit |

## Resolver flow (target)

```
Sanity document (page)
  └── blocks[]
        ↓ GROQ PAGE_BLOCKS_PROJECTION
fetch.js
        ↓
pageResolver.resolvePageFromBlocks()
        ↓ per block type
blockRegistry → domain resolver → contract normalize/validate
        ↓
extensions.{domain}Section
        ↓ flag ON + valid data
React page (CMS-first) | else legacy adapter merge
```

## Flags activación recomendada (prod)

```env
VITE_USE_SANITY=true
VITE_USE_BLOCK_RESOLVER=true
VITE_USE_SPECIALTIES_V2=true
# Progresivo:
# VITE_USE_PAGE_RESOLVER=true
# VITE_USE_SERVICES_V2=true
# VITE_USE_WORK_V2=true
# VITE_USE_CONTACT_V2=true
```

## Deuda restante

- Imágenes servicios/trabajos en GROQ
- SEO document-level
- Page Builder UX en páginas no-Home
- Bloques tabs/stats/testimonials/map
- Cleanup mirrors + flags legacy
