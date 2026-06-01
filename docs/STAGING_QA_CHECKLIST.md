# Checklist QA — Staging CMS

Usar en entorno staging con flags progresivos ON. Marcar ✅ / ❌ / N/A.

**Entorno:** _______________  
**Fecha:** _______________  
**Flags activos:** _______________

---

## 1. Home

- [ ] Hero renderiza título, subtítulo, imagen
- [ ] Especialidades: tabs/categorías desde CMS (si `SPECIALTIES_V2`)
- [ ] Servicios grid coherente con Studio
- [ ] Portfolio preview con imágenes y alt
- [ ] CTA banner funcional (link correcto)
- [ ] Sin hydration mismatch (consola limpia)
- [ ] Toggle `USE_BLOCK_RESOLVER` OFF → legacy idéntico visualmente

## 2. Servicios (hub + sub-páginas)

- [ ] `/servicios` o landing principal OK
- [ ] Talleres móviles — hero + galería + scope/features
- [ ] Ventanas / Banquetas / Butacas / Accesorios / Escolar
- [ ] Galería lazy-load sin CLS severo
- [ ] Flag OFF → contenido local legacy intacto

## 3. Trabajos

- [ ] Hero CMS o legacy fallback
- [ ] Portfolio filtros + items con imágenes
- [ ] SEO block override (si configurado en Studio)
- [ ] CTA inferior funcional

## 4. Contacto

- [ ] Hero + mapa embed
- [ ] FAQ accordion (si bloque FAQ publicado)
- [ ] Datos tel/email visibles (legacy o CMS)

## 5. Responsive

| Viewport | Home | Servicios | Trabajos | Contacto |
|----------|------|-----------|----------|----------|
| Mobile 375px | | | | |
| Tablet 768px | | | | |
| Desktop 1280px | | | | |

## 6. SEO

- [ ] `<title>` correcto por página
- [ ] Meta description presente
- [ ] Canonical URL válida
- [ ] OG tags (Facebook debugger / metatags.io)
- [ ] Twitter card
- [ ] JSON-LD local business (si aplica en layout)
- [ ] Jerarquía H1 único por página
- [ ] Imágenes con alt no vacío

## 7. Assets

- [ ] Sin imágenes rotas (404)
- [ ] Placeholders solo donde CMS sin asset (esperado DEV warning)
- [ ] Galerías sin duplicados visuales
- [ ] Hero preload / LCP aceptable

## 8. CMS editing (Studio)

- [ ] Editor no ve campos legacy técnicos
- [ ] Admin ve debug badge
- [ ] Agregar / reordenar / ocultar / duplicar bloque
- [ ] Previews compactos en lista de bloques
- [ ] Validaciones governance (límites, CTA)

## 9. Publishing

- [ ] Publish documento → cambio visible en staging ≤2 min
- [ ] Draft no visible en prod/staging público
- [ ] Revertir cambio editorial → republish versión anterior

## 10. Rollback

- [ ] Apagar flag dominio → sitio legacy sin error
- [ ] Sin mezcla parcial (hero CMS + body legacy)
- [ ] Sin flicker post-hydration

---

## Registro de incidencias

| # | Página | Descripción | Severidad | Estado |
|---|--------|-------------|-----------|--------|
| 1 | | | | |

## Aprobación

- [ ] QA staging aprobado para activación producción
- Responsable: _______________
