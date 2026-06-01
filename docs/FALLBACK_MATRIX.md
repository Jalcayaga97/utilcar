# Matriz de fallback CMS ↔ Legacy

Documento operacional para rollback y activación progresiva de flags.  
Regla global: **CMS-first completo** o **legacy completo** — nunca mezcla parcial en una misma página.

## Flags de entorno (`utilcar-web/.env`)

| Variable | Alcance | Default | Dependencias |
|----------|---------|---------|--------------|
| `VITE_USE_SANITY` | Master switch Sanity | `false` | `VITE_SANITY_PROJECT_ID` |
| `VITE_USE_BLOCK_RESOLVER` | Home `blocks[]` | `false` | `VITE_USE_SANITY` |
| `VITE_USE_SPECIALTIES_V2` | Especialidades V2 | `false` | `USE_BLOCK_RESOLVER` |
| `VITE_USE_PAGE_RESOLVER` | Páginas secundarias `blocks[]` | `false` | `VITE_USE_SANITY` |
| `VITE_USE_SERVICES_V2` | Servicios | `false` | `USE_PAGE_RESOLVER` |
| `VITE_USE_WORK_V2` | Trabajos | `false` | `USE_PAGE_RESOLVER` |
| `VITE_USE_CONTACT_V2` | Contacto | `false` | `USE_PAGE_RESOLVER` |
| `VITE_HOME_RESOLVER_DEBUG` | Logs Home DEV | — | DEV only |
| `VITE_RUNTIME_DEBUG` | Timings resolver DEV | — | DEV only |

## Matriz por resolver

| Resolver | Entrada CMS | Fallback legacy | Prioridad fuente | Flag rollback |
|----------|-------------|-----------------|------------------|---------------|
| `homeResolver` | `homePage.blocks[]` | Campos planos + `/content` local | blocks → flat → local | `VITE_USE_BLOCK_RESOLVER=false` |
| `specialtiesResolver` | `specialtiesBlock.categories[]` | `especialidades.items` / legacy mirror | CMS categories → items | `VITE_USE_SPECIALTIES_V2=false` |
| `pageResolver` (global) | `*.blocks[]` genérico | `{}` extensions → adapter legacy | blocks-full → legacy-fallback | `VITE_USE_PAGE_RESOLVER=false` |
| `servicesPageResolver` | `servicesPage.blocks[]` | `services.adapter` + `/content` | CMS hero/features/gallery → local | `VITE_USE_SERVICES_V2=false` |
| `workPageResolver` | `workPage.blocks[]` | `work.adapter` + imports estáticos | CMS portfolio/hero → local | `VITE_USE_WORK_V2=false` |
| `contactPageResolver` | `contactPage.blocks[]` | `contact.adapter` + `SITE` | CMS hero/faq/map → local | `VITE_USE_CONTACT_V2=false` |
| Asset layer (`resolveImage`) | Sanity image URL | Legacy import / static | CMS → legacy → placeholder SVG | N/A (siempre activo en V2) |
| SEO (`seoBlock`) | `seoBlock` en blocks | `constants/seo.js` | CMS override → constants | Sin flag (opt-in por bloque) |

## Comportamiento esperado

### Flags OFF (producción conservadora)

- Sanity puede estar ON para preview editorial, pero runtime usa contenido local validado.
- Primer render SSR/hydration = local (`useCms` hydration-safe).
- Sin flicker: no hay fetch CMS post-mount que cambie layout crítico si flags OFF.

### Flags ON (CMS-first)

- Requiere documento Sanity con `blocks[]` no vacío y resolución `blocks-full`.
- Si blocks vacío o inválido → fallback legacy **completo** (warning DEV en consola `[utilcar runtime:*]`).
- Assets faltantes → placeholder determinístico (`normalizeImageAsset`).

## Rollback inmediato

1. Setear flag del dominio a `false` en `.env` / hosting.
2. Redeploy frontend (sin tocar Sanity).
3. Verificar smoke: Home, Trabajos, Contacto, una sub-página servicio.
4. Legacy intacto — no requiere migración reversa de datos.

## Señales de alerta (DEV)

| Código warning | Significado |
|----------------|-------------|
| `empty-blocks` | Documento sin blocks — fallback legacy esperado |
| `invalid-cta` | CTA con label o path inválido |
| `duplicated-id` | IDs/_key duplicados en array |
| `missing-image` | Asset sin URL — placeholder aplicado |
| `empty-alt` | Alt vacío — fallback editorial aplicado |
| `gallery-corrupt` | Entrada de galería sin URL válida |

## Referencias de código

- Config: `src/lib/cms/config.js`
- Guards: `src/lib/cms/resolvers/global/resolverGuards.js`
- Page resolver: `src/lib/cms/resolvers/global/pageResolver.js`
- Home: `src/lib/cms/homeResolver.js`
