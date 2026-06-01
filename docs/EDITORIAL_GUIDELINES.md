# Guía editorial — Sanity Studio Utilcar

Orientada a editores de contenido. Admins ven herramientas de debug adicionales.

## Principios

1. **Editar siempre en Page Builder (`blocks[]`)** — los campos planos legacy son espejo de solo lectura (excepto bootstrap inicial sin bloques).
2. **Un bloque = una sección visible** en el sitio (cuando el flag frontend correspondiente está activo).
3. **Ocultar ≠ eliminar** — use el toggle «Visible» para despublicar una sección sin perder contenido.
4. **SEO** — agregue un bloque «SEO y metadatos» por página secundaria; si falta, el sitio usa defaults de `constants/seo.js`.

## Page Builder — Inicio

| Acción | Cómo |
|--------|------|
| Agregar sección | Botón «Add item» en la lista de bloques |
| Reordenar | Arrastrar bloques (sortable) |
| Ocultar sección | Switch «Visible» en la tarjeta del bloque |
| Duplicar | Botón «Duplicar sección» en la tarjeta |
| Especialidades | Solo vía bloque `Especialidades` — no menú duplicado |

### Bloques disponibles (Home)

Portada, Especialidades, Servicios, Por qué Utilcar, Portfolio, Banner CTA.

## Páginas secundarias (Servicios, Trabajos, Contacto)

Bloques: Hero, Servicios, Portfolio, CTA, FAQ, Características, Texto, Mapa, **SEO**.

Límite: **12 bloques máximo** por página (warning desde 10).

## CTAs

Todo CTA requiere:

- Texto del botón (label)
- Ruta válida (`/ruta` o URL `https://`)

CTA incompleto → warning editorial; el sitio puede omitir el botón.

## Imágenes

- Suba imagen con **alt descriptivo** (accesibilidad + SEO).
- Hero sin imagen → el sitio usa imagen legacy o placeholder gris.
- Galerías: evite entradas duplicadas; cada imagen debe tener alt.

## SEO por bloque

Campos recomendados:

| Campo | Recomendación |
|-------|---------------|
| Título SEO | ≤60 caracteres |
| Meta description | ≤160 caracteres |
| Canonical | Ruta con `/` inicial, ej. `/trabajos-realizados` |
| OG Image | 1200×630 aprox., con alt |

## Roles

| Rol | Ve |
|-----|-----|
| Editor | Page Builder, catálogos, previews |
| Admin | + banners convergencia, SyncDebugBadge, campos legacy mirror |

## Warnings comunes

| Mensaje Studio | Acción |
|----------------|--------|
| «CTA incompleto» | Completar label + ruta |
| «Máximo N bloques» | Consolidar o ocultar secciones |
| «Sin imagen principal» | Subir heroImage en especialidad |
| «Descripción larga» | Acortar para mejor lectura |

## Publicación

1. Editar en Studio → Publish documento.
2. CDN Sanity puede tardar ~1 min (`VITE_SANITY_USE_CDN=true`).
3. Verificar en staging con flags ON antes de producción.

## No hacer

- No editar campos legacy mirror si Page Builder tiene bloques.
- No duplicar slugs de marcas o categorías.
- No eliminar `_key` manualmente en arrays.
