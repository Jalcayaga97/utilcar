# Auditoría de editabilidad CMS — Sitio completo Utilcar

**Fecha:** 2026-05-29  
**Alcance:** Frontend `utilcar-web` + Studio `utilcar-studio` / `utilcar-web/utilcar-studio`  
**Modo:** Solo lectura — sin cambios de código ni migraciones.

---

## Resumen ejecutivo

El sitio tiene **dos capas de contenido** que no deben confundirse:

1. **Capacidad Studio (schema)** — lo que un editor puede ver y modificar en Sanity.
2. **Capacidad runtime (flags + wiring)** — lo que el frontend realmente consume desde CMS cuando los flags están activos.

Hoy la **Home** y **Trabajos / Contacto** tienen el mejor soporte de Page Builder (`blocks[]`) y campos legacy documentados. Las **sub-páginas de servicio** consumen sobre todo contenido desde `src/content/services.js` (local); el GROQ de `servicesPage` referencia blobs (`talleresMoviles`, `ventanasBrands`, etc.) **sin campos equivalentes en el schema de Studio**, por lo que esos datos **no son editables en la UI del CMS** aunque existan en dataset.

Las **imágenes de hero y galerías** de casi todas las páginas de servicio siguen atadas a `IMAGES` en `src/assets/images` (archivos estáticos), salvo **Talleres móviles** cuando `VITE_USE_SERVICES_V2` + `VITE_USE_PAGE_RESOLVER` están activos.

**Cobertura editorial estimada (elementos visibles auditados):**

| Métrica | Valor |
|---------|------:|
| Total elementos auditados | **98** |
| Editables CMS (OK) | **32** |
| Parciales | **41** |
| Pendientes | **25** |
| **Cobertura CMS estricta (OK / total)** | **32,7 %** |
| **Cobertura ponderada (OK + 0,5×PARCIAL)** | **53,6 %** |

---

## Metodología

Por cada página se revisó:

- Componente de página (`src/pages/*.jsx`)
- Hooks `useCms` / adapters (`*.adapter.js`)
- Resolvers y flags (`src/lib/cms/config.js`)
- Contenido local (`src/content/*`)
- Schemas Studio (`utilcar-studio/schemas/**`)
- Queries GROQ (`src/lib/sanity/queries.js`)

**Leyenda de columnas**

| Columna | Significado |
|---------|-------------|
| **Editable CMS** | ¿Existe campo/bloque en Studio usable por editores? |
| **Schema** | Tipo Sanity o `N/A` |
| **Resolver** | Pipeline frontend o fuente |
| **Estado** | `OK` = editable end-to-end · `PARCIAL` = texto o bloque sí, media/flags/wiring no · `PENDIENTE` = solo código/assets |

**Flags relevantes** (sin activar, el sitio sirve contenido local validado):

- Home: `VITE_USE_BLOCK_RESOLVER`, `VITE_USE_SPECIALTIES_V2`
- Secundarias: `VITE_USE_PAGE_RESOLVER`, `VITE_USE_WORK_V2`, `VITE_USE_CONTACT_V2`, `VITE_USE_SERVICES_V2`

---

## Hallazgos transversales (críticos)

### 1. GROQ sin schema Studio (`servicesPage`)

`SERVICES_QUERY` proyecta `talleresMoviles`, `ventanasLunetas`, `equipamientoEscolar`, `banquetas`, `butacas`, `accesorios`, `ventanasBrands`, `banquetasCategories`, `accesoriosCategories`, pero **`servicesPage.js` en Studio solo define** `blocks[]`, `serviceLinks`, `mainNavLinks`, `services[]`, `highlights[]`.

→ El adapter puede fusionar datos si existen en el dataset, pero **no hay UI editorial** para el contenido de cada sub-página de servicio.

### 2. Imágenes estáticas en páginas de servicio

Patrón repetido: `image={IMAGES.<pagina>.hero}` y `ImageGallery images={IMAGES.<pagina>.gallery}` en JSX, ignorando assets CMS salvo en **Talleres móviles** (`useServicePageDisplay`).

### 3. Catálogo `brand` desconectado

Existe documento `brand` en Studio (sidebar Catálogos → Marcas), pero **Ventanas** usa `ventanasBrands` embebido en el bundle de servicios, no referencias `brand`. Las marcas de **Especialidades** usan `specialtyBrand` dentro de `specialtiesBlock`.

### 4. SEO

- Por defecto: `constants/seo.js` (código).
- Override CMS: bloque `seoBlock` en Page Builder (Trabajos wired; resto de páginas sin `cmsSeo` en `PageMeta`).
- Home: `seoBlock` no está en `homePageBlockTypes`.

### 5. Datos de contacto operativos

Teléfono, emails, dirección y párrafo intro con mails usan `SITE` (`constants/site.js`) hardcodeado en `Contacto.jsx`, aunque existan campos editables para títulos de tarjetas en `contactContent`.

### 6. Iconos de tarjetas (Home / Servicios)

Los iconos Lucide de la grilla de servicios y highlights **no son editables** en CMS; `mergeServicesWithIcons` / `mergeHighlightsWithIcons` preservan siempre el icono local.

---

## Matriz de editabilidad

### Global (layout, SEO técnico, marca)

| Página | Elemento | Editable CMS | Schema | Resolver | Estado |
|--------|----------|:------------:|--------|----------|--------|
| Global | Navegación principal (Inicio, Trabajos, Contacto) | SI | `servicesPage.mainNavLinks` | `services.adapter` | OK |
| Global | Menú desplegable Servicios (6 enlaces) | SI | `servicesPage.serviceLinks` | `services.adapter` | OK |
| Global | Logo / nombre sitio en header | NO | N/A | `SITE.name` + `Logo` | PENDIENTE |
| Global | Footer — descripción empresa | NO | N/A | `SITE.description` | PENDIENTE |
| Global | Footer — títulos columnas «Servicios» / «Empresa» | NO | N/A | Hardcoded JSX | PENDIENTE |
| Global | Footer — teléfono, email, dirección | NO | N/A | `SITE.*` | PENDIENTE |
| Global | Botones WhatsApp / tel (CTA globales) | PARCIAL | `serviceCtaDefaults` (texto) | `useServiceCtaDefaults` | PARCIAL |
| Global | Labels botones CTA (`ctaButtonLabels`) | SI | `servicesPage` (blob GROQ) | `services.adapter` | PARCIAL |
| Global | JSON-LD LocalBusiness | NO | N/A | `StructuredData` + `SITE` | PENDIENTE |
| Global | Meta tags por defecto (todas las rutas) | PARCIAL | `seoBlock` (solo si se agrega bloque) | `PageMeta` + `constants/seo.js` | PARCIAL |
| Global | OG image por defecto | NO | N/A | `SITE.ogImage` | PENDIENTE |
| Global | Documento catálogo `brand` (Marcas) | SI (Studio) | `brand` | **No consumido en frontend** | PENDIENTE |

---

### Home (`/`)

| Página | Elemento | Editable CMS | Schema | Resolver | Estado |
|--------|----------|:------------:|--------|----------|--------|
| Home | Hero — textos, CTAs, highlights | SI | `heroBlock` | `heroResolver` | OK |
| Home | Hero — imagen desktop/mobile | SI | `heroBlock.image` | `resolveHeroAssets` | PARCIAL |
| Home | Grilla servicios — títulos/descripciones/enlaces | SI | `servicesBlock` | `servicesResolver` | OK |
| Home | Grilla servicios — imágenes tarjetas | NO | N/A | `getServiceImage(id)` estático | PENDIENTE |
| Home | Grilla servicios — iconos tarjetas | NO | N/A | Lucide en `content/services.js` | PENDIENTE |
| Home | Especialidades — categorías/marcas/galerías | SI | `specialtiesBlock` | `specialtiesResolver` | OK |
| Home | Especialidades — imágenes sin `heroImage` CMS | PARCIAL | `specialtyCategory` / brand gallery | `resolveSpecialtyAssets` + legacy | PARCIAL |
| Home | Por qué Utilcar — ítems | SI | `whyUsBlock` | `whyUsResolver` | OK |
| Home | Por qué Utilcar — iconos ítems | SI | `whyUsBlockItem.icon` | merge preserva local si falta | PARCIAL |
| Home | Preview trabajos — textos y CTA sección | SI | `portfolioBlock` | `portfolioResolver` | OK |
| Home | Preview trabajos — cards (imagen) | PARCIAL | `portfolioBlockItem.image` | `imageKey` legacy + CMS URL | PARCIAL |
| Home | Banner CTA inferior | SI | `ctaBlock` | `ctaResolver` | OK |
| Home | SEO título/description | PARCIAL | Solo `constants/seo.js` | `PageMeta` | PARCIAL |
| Home | Orden / ocultar secciones | SI | `blockMeta.enabled` | `pageResolver` / `homeResolver` | OK |

*Requiere `VITE_USE_BLOCK_RESOLVER` (y `VITE_USE_SPECIALTIES_V2` para especialidades V2) para runtime CMS-first.*

---

### Servicios (hub — nav + Home + documento Studio)

| Página | Elemento | Editable CMS | Schema | Resolver | Estado |
|--------|----------|:------------:|--------|----------|--------|
| Servicios | Listado 6 servicios (Home + nav) | SI | `servicesPage.services[]` | `services.adapter` | OK |
| Servicios | Destacados «Por qué» en bundle | SI | `servicesPage.highlights[]` | `services.adapter` | PARCIAL |
| Servicios | Page Builder `blocks[]` en doc. servicios | SI | `pageBlocksField` | `pageResolver` (si flags V2) | PARCIAL |
| Servicios | Contenido por sub-página (hero, intro, etc.) | NO | **Sin schema** | GROQ blob + `content/services.js` | PENDIENTE |
| Servicios | Imágenes sub-páginas en bundle | NO | **Sin schema** | Solo local / assets | PENDIENTE |
| Servicios | Defaults CTA oscuro servicios | PARCIAL | GROQ sin campo Studio | `serviceCtaDefaults` local | PARCIAL |

*No existe ruta `/servicios`; el hub es navegación + sección Home.*

---

### Talleres móviles (`/talleres-moviles`)

| Página | Elemento | Editable CMS | Schema | Resolver | Estado |
|--------|----------|:------------:|--------|----------|--------|
| Talleres móviles | Hero — textos | PARCIAL | Sin schema página; `heroBlock` si blocks | `mapServicePageRuntime` | PARCIAL |
| Talleres móviles | Hero — imagen | PARCIAL | `heroBlock.image` | `resolveServicePageHero` | PARCIAL |
| Talleres móviles | Intro — párrafos | NO | Sin schema | `talleresMoviles.intro` local | PENDIENTE |
| Talleres móviles | Alcance — listas soluciones/características | PARCIAL | `featuresBlock` | `resolveServicePageFeatures` | PARCIAL |
| Talleres móviles | Galería — textos sección | PARCIAL | `portfolioBlock` | `mapServicePageRuntime` | PARCIAL |
| Talleres móviles | Galería — imágenes | PARCIAL | `portfolioBlock` items | `resolveServicePageGallery` | PARCIAL |
| Talleres móviles | CTA inferior | PARCIAL | `ctaBlock` / defaults | `ServiceCtaDark` | PARCIAL |
| Talleres móviles | SEO | PARCIAL | `seoBlock` en blocks (no wired UI) | `constants/seo.js` | PARCIAL |
| Talleres móviles | Runtime V2 (`useServicePageDisplay`) | — | — | Única sub-página con hook V2 | OK |

---

### Ventanas y Lunetas (`/ventanas-lunetas`)

| Página | Elemento | Editable CMS | Schema | Resolver | Estado |
|--------|----------|:------------:|--------|----------|--------|
| Ventanas y Lunetas | Hero — textos | NO | Sin schema | `ventanasLunetas` local/Sanity blob | PARCIAL |
| Ventanas y Lunetas | Hero — imagen | NO | N/A | `IMAGES.ventanas.hero` hardcoded | PENDIENTE |
| Ventanas y Lunetas | Intro + proceso templado + specs | NO | Sin schema | `useVentanasLunetasContent` | PARCIAL |
| Ventanas y Lunetas | Galería — textos | NO | Sin schema | content local | PARCIAL |
| Ventanas y Lunetas | Galería — imágenes | NO | N/A | `IMAGES.ventanas.gallery` | PENDIENTE |
| Ventanas y Lunetas | Tabs marcas (Peugeot, Toyota, etc.) — textos | NO | Sin schema | `ventanasBrands` local merge | PARCIAL |
| Ventanas y Lunetas | Tabs marcas — galerías por marca | NO | N/A | `getVentanasMarcaGallery(id)` estático | PENDIENTE |
| Ventanas y Lunetas | Labels UI «Registro visual» | NO | N/A | Hardcoded `BrandEquipmentPanel` | PENDIENTE |
| Ventanas y Lunetas | CTA inferior | PARCIAL | content `cta` | props | PARCIAL |
| Ventanas y Lunetas | SEO | PARCIAL | `seoBlock` posible en blocks | `PageMeta` solo constants | PARCIAL |
| Ventanas y Lunetas | `useServicePageDisplay` | NO | N/A | No conectado | PENDIENTE |

---

### Equipamiento Escolar (`/equipamiento-escolar`)

| Página | Elemento | Editable CMS | Schema | Resolver | Estado |
|--------|----------|:------------:|--------|----------|--------|
| Equipamiento Escolar | Hero textos / imagen | NO / NO | Sin schema | local + `IMAGES.escolar` | PENDIENTE |
| Equipamiento Escolar | Intro párrafos | NO | Sin schema | local | PARCIAL |
| Equipamiento Escolar | Bloques especificaciones (tabs contenido) | NO | Sin schema | `specs.sections` local | PARCIAL |
| Equipamiento Escolar | Galería textos / imágenes | NO / NO | Sin schema / N/A | local + `IMAGES.escolar.gallery` | PENDIENTE |
| Equipamiento Escolar | CTA | PARCIAL | local | props | PARCIAL |
| Equipamiento Escolar | SEO | PARCIAL | `constants/seo.js` | `PageMeta` | PARCIAL |

---

### Banquetas (`/banquetas`)

| Página | Elemento | Editable CMS | Schema | Resolver | Estado |
|--------|----------|:------------:|--------|----------|--------|
| Banquetas | Hero textos / imagen | NO / NO | Sin schema | local + `IMAGES.banquetas.hero` | PENDIENTE |
| Banquetas | Sección categorías — headers | NO | Sin schema | `banquetas.categories` local | PARCIAL |
| Banquetas | Tabs categorías — textos ítems | NO | Sin schema | `banquetasCategories` local | PARCIAL |
| Banquetas | Tabs categorías — galerías | NO | N/A | `getBanquetasCategoryGallery` estático | PENDIENTE |
| Banquetas | CTA | PARCIAL | local | props | PARCIAL |
| Banquetas | SEO | PARCIAL | constants | `PageMeta` | PARCIAL |

---

### Butacas (`/butacas`)

| Página | Elemento | Editable CMS | Schema | Resolver | Estado |
|--------|----------|:------------:|--------|----------|--------|
| Butacas | Hero textos / imagen | NO / NO | Sin schema | local + `IMAGES.butacas` | PENDIENTE |
| Butacas | Intro | NO | Sin schema | local | PARCIAL |
| Butacas | Specs (3 bloques listas) | NO | Sin schema | local | PARCIAL |
| Butacas | Galería textos / imágenes | NO / NO | Sin schema / N/A | local + `IMAGES.butacas.gallery` | PENDIENTE |
| Butacas | CTA | PARCIAL | local | props | PARCIAL |
| Butacas | SEO | PARCIAL | constants | `PageMeta` | PARCIAL |

---

### Accesorios (`/accesorios`)

| Página | Elemento | Editable CMS | Schema | Resolver | Estado |
|--------|----------|:------------:|--------|----------|--------|
| Accesorios | Hero textos / imagen | NO / NO | Sin schema | local + `IMAGES.accesorios` | PENDIENTE |
| Accesorios | Intro | NO | Sin schema | local | PARCIAL |
| Accesorios | Catálogo tabs — textos | NO | Sin schema | `accesoriosCategories` local | PARCIAL |
| Accesorios | Catálogo — imágenes | NO | N/A | assets estáticos por categoría | PENDIENTE |
| Accesorios | CTA | PARCIAL | local | props | PARCIAL |
| Accesorios | SEO | PARCIAL | constants | `PageMeta` | PARCIAL |

---

### Trabajos (`/trabajos-realizados`)

| Página | Elemento | Editable CMS | Schema | Resolver | Estado |
|--------|----------|:------------:|--------|----------|--------|
| Trabajos | Hero — textos | SI | `workPage.page.hero` + `heroBlock` | `workPageResolver` | OK |
| Trabajos | Hero — imagen | PARCIAL | `heroBlock.image` | `resolveWorkHero` | PARCIAL |
| Trabajos | Intro — eyebrow/título/párrafos | SI | `workPage.page.intro` | legacy merge | OK |
| Trabajos | Sección proyectos — headers | SI | `page.projects` + `portfolioBlock` | `workPageResolver` | OK |
| Trabajos | Cards portfolio — textos | SI | `portfolio[]` + `portfolioBlock` | `portfolioResolver` | OK |
| Trabajos | Cards portfolio — imagen | PARCIAL | `portfolioBlockItem.image` | `resolveWorkPortfolioItem` | PARCIAL |
| Trabajos | Filtros categoría (tabs) | SI | `workPage.filters` | `workContent.filters` | OK |
| Trabajos | UI («Cargar más», vacío, aria) | SI | `workPage.ui` | `workContent.ui` | OK |
| Trabajos | CTA inferior | SI | `page.cta` + `ctaBlock` | `buildWorkSection` | OK |
| Trabajos | SEO override | PARCIAL | `seoBlock` | `seoBlockResolver` + `PageMeta` | PARCIAL |
| Trabajos | Page Builder blocks | SI | `pageBlocksField` | `pageResolver` | OK |

*Runtime CMS-first con `VITE_USE_WORK_V2` + `VITE_USE_PAGE_RESOLVER`.*

---

### Contacto (`/contacto`)

| Página | Elemento | Editable CMS | Schema | Resolver | Estado |
|--------|----------|:------------:|--------|----------|--------|
| Contacto | Hero — textos | SI | `contactPage.hero` + `heroBlock` | `contactPageResolver` | OK |
| Contacto | Hero — imagen | PARCIAL | `heroBlock` | `resolveContactHero` + fallback `IMAGES` | PARCIAL |
| Contacto | Párrafo intro emails/teléfono | NO | N/A | `SITE.emails` / `SITE.phone` hardcoded JSX | PENDIENTE |
| Contacto | Hint formulario | SI | `contactPage.intro.formHint` | `contact.adapter` | OK |
| Contacto | Tarjetas — títulos (Teléfono, etc.) | SI | `contactPage.details` | **Schema incompleto** — GROQ sí, Studio no define `details` | PARCIAL |
| Contacto | Tarjetas — valores (números, dirección) | NO | N/A | `SITE.*` | PENDIENTE |
| Contacto | Formulario — labels/placeholders/submit | SI | `contactPage.form` | `ContactForm` | OK |
| Contacto | Opciones select servicio | SI | `contactPage.servicios[]` | `ContactForm` | OK |
| Contacto | FAQ — textos ítems | SI | `faqItems` + `faqBlock` | `faqBlockResolver` | OK |
| Contacto | Mapa — títulos / iframe title | PARCIAL | `map` en GROQ; `mapBlock` V2 | `resolveContactMap` | PARCIAL |
| Contacto | Mapa — query embed | PARCIAL | `mapBlock.embedQuery` | fallback `SITE.mapsQuery` | PARCIAL |
| Contacto | Pie mapa (razón social, dirección) | NO | N/A | `SITE` hardcoded | PENDIENTE |
| Contacto | CTA WhatsApp sección | PARCIAL | `cta` en GROQ sin schema Studio | props + defaults | PARCIAL |
| Contacto | SEO | PARCIAL | `seoBlock` | solo `constants/seo.js` en página | PARCIAL |
| Contacto | Page Builder blocks | SI | `pageBlocksField` | `contactPageResolver` | OK |

---

## Inventario Studio vs frontend

| Documento Studio | Sidebar | Campos editoriales reales | Consumo frontend |
|------------------|---------|---------------------------|------------------|
| `homePage` | Inicio | `blocks[]` (+ legacy mirror admin) | `homeResolver` + flags |
| `servicesPage` | Servicios (lista) | Solo links + services + highlights + blocks | Adapter; sub-páginas **sin UI** |
| `workPage` | Trabajos | blocks + page + portfolio + filters + ui | `workPageResolver` |
| `contactPage` | Contacto | blocks + hero + intro + faq + form + servicios | `contactPageResolver` |
| `brand` | Catálogos → Marcas | name, logo, description | **No usado** |

**Bloques Page Builder registrados en runtime:** `heroBlock`, `servicesBlock`, `whyUsBlock`, `portfolioBlock`, `galleryBlock`, `ctaBlock`, `faqBlock`, `featuresBlock`, `richTextBlock`, `mapBlock`, `seoBlock`, `specialtiesBlock` (solo Home).

---

## Gaps por tipo de contenido

| Tipo | Hallazgo principal | Páginas afectadas |
|------|-------------------|-------------------|
| Textos | Sub-páginas servicio sin schema Studio | Ventanas, Escolar, Banquetas, Butacas, Accesorios, Talleres (intro) |
| Imágenes | `IMAGES.*` hardcoded en JSX | Todas las sub-páginas servicio excepto Talleres (V2 parcial) |
| Tabs | Marcas/categorías sin media CMS | Ventanas, Banquetas, Accesorios |
| Cards | Iconos servicios no editables | Home, hub Servicios |
| FAQs | OK en Contacto; no en otras páginas | Contacto |
| CTAs | Globales en `SITE`; defaults parciales | Global, Contacto (valores) |
| Links | Nav OK; WhatsApp/tel en código | Global |
| Iconos | Lucide fijos en `content/services.js` | Home servicios/highlights |
| Labels UI | «Registro visual», footer headings | Ventanas, Banquetas, Global |
| SEO | `constants/seo.js`; `seoBlock` poco wired | Todas excepto Trabajos (parcial) |
| Secciones | `brand` catalog sin uso | Studio only |
| Schema/GROQ drift | `contactPage.details/cta/map`; blobs servicios | Contacto, Servicios |

---

## Métricas detalladas

### Por página (elementos OK / total en matriz)

| Página | OK | PARCIAL | PENDIENTE | Total | Cobertura estricta |
|--------|---:|--------:|----------:|------:|-------------------:|
| Global | 2 | 2 | 8 | 12 | 16,7 % |
| Home | 7 | 5 | 2 | 14 | 50,0 % |
| Servicios (hub) | 1 | 3 | 2 | 6 | 16,7 % |
| Talleres móviles | 1 | 7 | 1 | 9 | 11,1 % |
| Ventanas y Lunetas | 0 | 5 | 6 | 11 | 0 % |
| Equipamiento Escolar | 0 | 3 | 3 | 6 | 0 % |
| Banquetas | 0 | 3 | 3 | 6 | 0 % |
| Butacas | 0 | 3 | 3 | 6 | 0 % |
| Accesorios | 0 | 3 | 3 | 6 | 0 % |
| Trabajos | 7 | 3 | 0 | 10 | 70,0 % |
| Contacto | 5 | 6 | 4 | 15 | 33,3 % |
| **Total** | **32** | **41** | **25** | **98** | **32,7 %** |

### Interpretación

- **Trabajos** y **Home** (con flags) son las áreas más maduras para edición editorial.
- **Sub-páginas de servicio** (excepto Talleres en V2) están mayormente en **contenido local + assets**, no en Studio.
- **Global / SITE** concentra datos de negocio que deberían ser un singleton `siteSettings` para edición real.

---

## Roadmap final (solo planificación)

### Prioridad alta — visible y no editable

1. **Extender schema `servicesPage`** (o documentos por sub-página) con `talleresMoviles`, `ventanasLunetas`, `ventanasBrands`, `banquetasCategories`, etc., alineado al GROQ existente.
2. **Conectar todas las sub-páginas a `useServicePageDisplay`** y dejar de forzar `IMAGES.*` en JSX cuando hay `heroImage` / `galleryImages` CMS.
3. **Galerías por marca/categoría** — campos `image[]` en Studio + resolver; eliminar `getVentanasMarcaGallery` / `getBanquetasCategoryGallery` como única fuente.
4. **Completar schema `contactPage`** (`details`, `cta`, `map`) y sustituir `SITE` en valores visibles de Contacto por campos CMS o `siteSettings`.
5. **Wire `seoBlock` + `cmsSeo`** en todas las páginas con Page Builder.

### Prioridad media — UX Studio y paridad

6. Inputs editoriales para blobs JSON de servicios (o dividir en documentos hijo).
7. Imágenes de tarjetas servicios en Home (`servicesBlock` + `getServiceImage` → asset CMS).
8. Iconos: ampliar lista Lucide en Studio o quitar dependencia de icono local en merge.
9. Unificar marcas Ventanas con `specialtyBrand` o referencias `brand`.
10. Singleton `siteSettings` (teléfono, emails, dirección, JSON-LD, OG default).

### Prioridad baja — cleanup legacy

11. Deprecar campos planos `homePage` cuando blocks[] sea fuente única en prod.
12. Eliminar o conectar catálogo `brand` huérfano.
13. Migrar `src/content/*.js` a seed-only tras paridad CMS.
14. Documento `servicesPage` único vs lista en structure (hoy GROQ usa `[0]`).

---

## Acciones concretas recomendadas (orden sugerido)

| # | Acción | Esfuerzo | Impacto cobertura |
|---|--------|----------|------------------|
| 1 | Añadir campos sub-página al schema `servicesPage` (mirror Zod local) | M | Alto |
| 2 | Migrar Ventanas, Butacas, Escolar, Banquetas, Accesorios a `useServicePageDisplay` | M | Alto |
| 3 | Reemplazar `IMAGES.<page>.hero/gallery` por props CMS en páginas | S | Alto |
| 4 | Schema + UI galerías por marca en Ventanas/Banquetas/Accesorios | L | Alto |
| 5 | `contactPage` schema completo + quitar hardcode `SITE` en copy visible | M | Medio |
| 6 | `siteSettings` document + adapter global | M | Medio |
| 7 | `PageMeta` + `seoBlock` en todas las rutas | S | Medio |
| 8 | Imágenes tarjetas servicios Home | M | Medio |
| 9 | Conectar o eliminar tipo `brand` | S | Bajo |
| 10 | Activar flags en staging siguiendo `PRODUCTION_CMS_ROLLOUT.md` | S | Validación |

---

## Referencias de código

| Área | Ubicación |
|------|-----------|
| Páginas | `utilcar-web/src/pages/` |
| Contenido local | `utilcar-web/src/content/` |
| Flags | `utilcar-web/src/lib/cms/config.js` |
| Studio schemas | `utilcar-studio/schemas/` |
| Studio estructura | `utilcar-studio/structure.js` |
| GROQ | `utilcar-web/src/lib/sanity/queries.js` |
| Servicios V2 | `utilcar-web/src/lib/cms/resolvers/servicesPageResolver.js` |
| Assets estáticos | `utilcar-web/src/assets/images/` |

---

*Informe generado por auditoría estática. No se modificó código ni datos de producción.*
