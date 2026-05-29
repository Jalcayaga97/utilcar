# Utilcar — Schemas Sanity Studio

Documentación interna. **No modifica** `utilcar-web` hasta la fase frontend documentada en `docs/FRONTEND_MIGRATION.md`.

## Convergencia CMS (fase actual)

| Capa | Rol |
|------|-----|
| **`blocks[]`** | Fuente única de edición (Page Builder) |
| **Campos planos** | Espejo GROQ deprecated; solo lectura en Advanced Mode |

- Sync: `governance/homePageSync.js` (blocks escribe → planos sincronizan)
- Debug: consola `[utilcar homePage] source: blocks \| legacy sync` en dev
- Docs Studio: [`docs/CMS_CONVERGENCE.md`](../docs/CMS_CONVERGENCE.md)
- Docs migración frontend (canónico): [`utilcar-web/docs/HOME_PAGE_BUILDER_ALIGNMENT.md`](../../utilcar-web/docs/HOME_PAGE_BUILDER_ALIGNMENT.md)

## Estructura de carpetas

```
schemas/
  content/          → homePage, brand, blocks/, objects/
  presentation/     → UX Studio, Page Builder inputs
  governance/       → sync, validators, migration, logging
  legacy/           → tipos históricos GROQ
  index.js
```

## homePage

- **Editores**: Page Builder (`blocks[]`) + vista Especialidades (`specialtiesBlock.items`)
- **Admin**: Advanced (Legacy Mode) — espejos planos read-only si hay blocks
- **Sync**: `specialtiesNew` ← `specialtiesBlock.items` (automático)

## Menú Studio

1. Inicio — Page Builder  
2. Especialidades — `specialtiesBlock.items`  
3. Marcas  

Admin: + Páginas legacy + Legacy Mode en Inicio.

## Relación con utilcar-web (hoy)

| Studio (espejo) | GROQ / frontend |
|-----------------|-----------------|
| `specialtiesBlock.items` | `specialtiesNew[]` |
| `heroBlock` | `hero` |
| `servicesBlock` | `services` (+ items solo en bloque) |
| `whyUsBlock` | `highlights` (+ items solo en bloque) |
| `portfolioBlock` | `portfolioPreview` (+ items solo en bloque) |
| `ctaBlock` | `ctaBanner` |

No cambiar queries hasta migración frontend.
