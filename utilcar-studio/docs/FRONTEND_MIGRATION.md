# Migración frontend — homePage blocks

> **Documento canónico de alineación:**  
> [`utilcar-web/docs/HOME_PAGE_BUILDER_ALIGNMENT.md`](../../utilcar-web/docs/HOME_PAGE_BUILDER_ALIGNMENT.md)

Incluye mapping visual bloques → componentes React, dependencias legacy, contrato v2, plan en 3 fases y validación.

## Resumen técnico (Studio — 2026-05)

| Área | Archivo |
|------|---------|
| Mapping código | `schemas/governance/homePageMigration.js` |
| Sync mirror | `schemas/governance/homePageSync.js` |
| Specialties coalesce | `readSpecialtiesFromBlock()` en homePageSync |
| Contrato draft web | `utilcar-web/src/lib/cms/contracts/specialtiesContract.js` |
| Draft resolver | `utilcar-web/src/lib/cms/resolvers/specialtiesResolverDraft.js` |
| Convergencia CMS | [`CMS_CONVERGENCE.md`](CMS_CONVERGENCE.md) |
| Dominio specialties | [`SPECIALTIES_DOMAIN_MODEL.md`](SPECIALTIES_DOMAIN_MODEL.md) |

## Mapping rápido bloque → flat (espejo GROQ actual)

| Bloque | Campo plano | Notas |
|--------|-------------|-------|
| `heroBlock` | `hero` | + `mobileImage`, CTAs editoriales |
| `specialtiesBlock` | `specialtiesNew` | `coalesce(categories[], items[])` → legacy specialty |
| `servicesBlock` | `services` | items con icon, image, tags, featured |
| `whyUsBlock` | `highlights` | items con icon, featured |
| `portfolioBlock` | `portfolioPreview` | items + gallery, status, client, vehicle |
| `ctaBlock` | `ctaBanner` | sin cambios |

## Ownership frontend (sin cambios runtime)

```text
Studio blocks[]  →  homePageSync mirror  →  GROQ flat fields  →  utilcar-web legacy hooks
                                                              ↘ Block Resolver (feature flag, por sección)
```

**No implementar cambios en componentes React hasta fase dedicada con feature flag.**  
El contrato draft specialties está listo para validación offline (fixtures + resolver draft).

## Próxima fase frontend (specialties)

1. GROQ: `categories[]` con proyección contractual
2. `getActiveSpecialtiesSection()` en homeResolver
3. `EspecialidadesUtilcar` consume contrato (tabs marcas, galerías)
4. Eliminar dependencia de `specialtiesNew` mirror
