# Integración Sanity — guía de validación

Esta guía cubre las fases 1–5 sin modificar UI, hooks ni arquitectura del frontend.

## Alineación de campos (importante)

El frontend **no** usa `heroTitle` / `heroSubtitle` planos. Usa la estructura anidada del contrato:

| Documento Sanity | Campos clave (ejemplo) |
|------------------|------------------------|
| `homePage` | `hero.title`, `hero.subtitle`, `services`, `especialidadesList[]` |
| `servicesPage` | `services[]`, `highlights[]`, `serviceLinks[]` |
| `workPage` | `portfolio[]`, `filters[]`, `page`, `ui` |
| `contactPage` | `hero`, `faqItems[]`, `servicios[]`, `form` |

Cada documento debe incluir **`schemaVersion: 1`** en Studio (Sanity no permite campos con `_`). Las queries GROQ lo exponen al frontend como `_schemaVersion` (coincide con `SCHEMA_VERSION` en `validate.js`).

Las imágenes de servicios/portfolio **siguen en el frontend** (`/content` + merge); Sanity puede editar textos y metadatos (`imageAlt`, títulos, etc.).

---

## Fase 1 — Sanity Studio

### 1. Instalar Studio

```bash
cd utilcar-web
npm run install:studio
# o: cd utilcar-web/utilcar-studio && npm install
```

### 2. Configurar proyecto

Crea un proyecto en [sanity.io/manage](https://www.sanity.io/manage) y define:

```bash
# utilcar-web/utilcar-studio/.env (local, no commitear)
SANITY_STUDIO_PROJECT_ID=tu_project_id
SANITY_STUDIO_DATASET=production
```

### 3. Desplegar schemas

```bash
npm run dev
```

Abre el Studio, verifica los 4 singletons: Inicio, Servicios, Trabajos, Contacto.

### 4. Seed de contenido mínimo

Token con escritura en [sanity.io/manage](https://www.sanity.io/manage) → API → Tokens:

```bash
SANITY_API_TOKEN=sk...
SANITY_PROJECT_ID=tu_project_id
npm run seed
```

O copia manualmente desde `seed/minimal-content.json` respetando `schemaVersion: 1` y **sin arrays críticos vacíos** (`services`, `faqItems`, `filters`, etc.).

### 5. Checklist Studio

- [ ] `_schemaVersion = 1` en los 4 documentos
- [ ] `homePage.hero.title` y `subtitle` rellenados
- [ ] `servicesPage.services` con al menos 1 ítem (mismos `id` que local: `talleres`, `ventanas`, …)
- [ ] `workPage.filters` con al menos `all` + una categoría
- [ ] `contactPage.faqItems` con al menos 1 FAQ

---

## Fase 2 — Activar Sanity en el frontend

En `utilcar-web/.env.local`:

```env
VITE_USE_SANITY=true
VITE_SANITY_PROJECT_ID=1k8yld2r
VITE_SANITY_DATASET=production
VITE_SANITY_API_VERSION=2024-05-28
VITE_SANITY_USE_CDN=true
```

Reinicia el dev server:

```bash
cd utilcar-web
npm run dev
```

---

## Fase 3 — Tests manuales (navegador)

| Test | Ruta | Qué validar |
|------|------|-------------|
| HOME | `/` | Título hero desde Sanity; imágenes locales; sin errores en consola |
| SERVICES | `/` + menú servicios | Lista de servicios; iconos locales; sin `undefined` en UI |
| WORK | `/trabajos-realizados` | Filtros y grid; lightbox; WebP en Network |
| CONTACT | `/contacto` | FAQs editables; formulario igual visualmente |

Cambia un texto en Studio (ej. `hero.title`), publica, espera hasta 5 min (TTL) o recarga forzada tras expirar cache.

---

## Fase 4 — Fallback local

```env
VITE_USE_SANITY=false
```

Reinicia `npm run dev`.

- [ ] Sitio idéntico al modo local
- [ ] Consola sin errores `[cms]`
- [ ] Contenido desde `/content`

---

## Fase 5 — Prueba de error

```env
VITE_USE_SANITY=true
VITE_SANITY_PROJECT_ID=proyecto-invalido-xyz
```

- [ ] **No** crash de la app
- [ ] Contenido local visible
- [ ] Adapters devuelven fallback (consola puede mostrar warn en DEV)

---

## Tests automáticos

```bash
cd utilcar-web
npm run cms:smoke
```

Con Sanity activo y credenciales en `.env.local`, el smoke test también intenta fetch GROQ real.

---

## Problemas frecuentes

| Síntoma | Causa | Acción |
|---------|--------|--------|
| Siempre contenido local | `VITE_USE_SANITY=false` o sin `VITE_SANITY_PROJECT_ID` | Revisar `.env.local` |
| Warn versión schema | `schemaVersion` ≠ 1 en Sanity | Actualizar documentos o subir versión en código |
| Texto Sanity no aparece | TTL cache 5 min | Esperar o `clearAdapterCache` en DEV |
| Campos `undefined` | Arrays vacíos o ids distintos al local | Completar seed; usar mismos `id` en `services[]` |
| Imágenes rotas desde Sanity | Se espera merge con local | No subir URLs rotas; editar solo textos en fase 1 |

---

## Producción

1. `npm run build` en `utilcar-web` con variables `VITE_*` en el host (Vercel/Netlify).
2. CORS del proyecto Sanity debe permitir el dominio del sitio.
3. Incrementar `SCHEMA_VERSION` solo con migración coordinada Studio + frontend.
