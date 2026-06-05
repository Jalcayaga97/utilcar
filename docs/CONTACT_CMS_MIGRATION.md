# Migración CMS-first — Página Contacto

## Resumen

Contacto sigue el patrón de **Trabajos** (`mapContactPageRuntime` / `getContactPageDisplay`). Los datos corporativos viven en **`siteSettings.company`**, no en `contactPage`.

## Activación en runtime

```env
VITE_USE_SANITY=true
VITE_USE_PAGE_RESOLVER=true
VITE_USE_CONTACT_V2=true
```

Sin flags: contenido editorial local (`content/contact.js`) + `SITE` vía `useCompanyInfo()`.

## Plan de migración de datos (Sanity production)

### Fase 1 — Site Settings (`siteSettings`)

```bash
cd utilcar-web
npm run seed:site-settings
```

Puebla `company` desde `SITE` / `ENV` si no existe. Verificar en Studio → Configuración del sitio → Datos corporativos.

### Fase 2 — contactPage editorial

1. Abrir documento `contactPage` (singleton).
2. Eliminar bloques irrelevantes (portfolio, services, map, etc.) si quedaron de migraciones anteriores.
3. Crear bloques en orden sugerido:
   - `heroBlock` — portada
   - `richTextBlock` — intro (cuerpo = párrafos; `formHint` sigue en contenido local hasta sync)
   - `faqBlock` — preguntas (o mantener `faqItems` legacy en documento hasta migrar)
   - `ctaBlock` — CTA “Ir al formulario”
   - `seoBlock` — meta contacto
4. Completar `form` y `servicios[]` en el documento (no van en blocks).
5. Publicar.

### Fase 3 — Limpieza dataset (opcional)

Campos flat obsoletos en `contactPage` (hero, intro, details, map, faq, faqItems en raíz) pueden quedar en el dataset sin efecto en runtime CMS-first; conviene no editarlos para evitar confusión.

### Fase 4 — Activar flags en staging → production

Checklist: hero imagen, FAQ, formulario, mapa (query desde company), SEO, Footer, JSON-LD, CTA global.

## Compatibilidad

| Área | Comportamiento |
|------|----------------|
| Sanity OFF | Legacy `contact.js` + `SITE` |
| Sanity ON, sin blocks | Legacy completo (sin deepMerge híbrido) |
| Sanity ON + blocks + flags | CMS blocks + form/servicios documento |
| Footer / JSON-LD / WhatsApp CTA | `useCompanyInfo()` → CMS o `SITE` |
| `useContactContent` | Sigue válido (formulario / FAQ) |
| `getContactDisplay` | Alias de `getContactPageDisplay` |

## Archivos tocados (implementación)

Ver lista en commit / respuesta del agente.
