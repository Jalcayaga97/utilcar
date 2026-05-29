import { isStudioAdmin } from './schemas/governance/studioAdmin.js'
import {
  HOME_DOCUMENT_ID,
  HOME_DOCUMENT_PANE_ID,
  HOME_BUILDER_VIEW_ID,
} from './schemas/presentation/studioNavigation.js'

const HOME_ID = HOME_DOCUMENT_ID

/** Documentos deprecated o espejos técnicos — solo administrator. */
const LEGACY_ADMIN_PAGES = []

function homeViews(S) {
  return [S.view.form().id(HOME_BUILDER_VIEW_ID).title('Inicio')]
}

function singleton(S, { listId, title, schemaType, documentId, documentTitle, paneId, views }) {
  const document = S.document()
    .id(paneId ?? documentId)
    .title(documentTitle ?? title)
    .schemaType(schemaType)
    .documentId(documentId)

  if (views?.length) {
    document.views(views)
  }

  return S.listItem().title(title).id(listId).child(document)
}

function pageSingleton(S, { listId, title, schemaType, documentId }) {
  return singleton(S, {
    listId,
    title,
    schemaType,
    documentId,
    documentTitle: title,
  })
}

function catalogsSection(S) {
  return S.listItem()
    .title('Catálogos')
    .id('catalogs')
    .child(
      S.list()
        .title('Catálogos')
        .items([
          S.listItem()
            .title('Marcas')
            .id('brands')
            .child(S.documentTypeList('brand').title('Marcas')),
        ]),
    )
}

export const structure = (S, context) => {
  const admin = isStudioAdmin(context?.currentUser)

  const mainItems = [
    singleton(S, {
      listId: 'home',
      title: 'Inicio',
      schemaType: 'homePage',
      documentId: HOME_ID,
      paneId: HOME_DOCUMENT_PANE_ID,
      views: homeViews(S),
    }),
    S.listItem()
      .title('Servicios')
      .id('services')
      .child(S.documentTypeList('servicesPage').title('Páginas de servicio')),
    pageSingleton(S, {
      listId: 'work',
      title: 'Trabajos',
      schemaType: 'workPage',
      documentId: 'workPage',
    }),
    pageSingleton(S, {
      listId: 'contact',
      title: 'Contacto',
      schemaType: 'contactPage',
      documentId: 'contactPage',
    }),
    catalogsSection(S),
  ]

  const legacyItems = LEGACY_ADMIN_PAGES.map((page) =>
    pageSingleton(S, {
      listId: page.id,
      title: page.title,
      schemaType: page.schemaType,
      documentId: page.id,
    }),
  )

  if (!admin) {
    return S.list().title('Utilcar').items(mainItems)
  }

  const items = [
    ...mainItems,
    S.divider(),
    S.listItem()
      .title('Páginas legacy (admin)')
      .id('legacy-pages')
      .child(S.list().title('Legacy').items(legacyItems)),
  ]

  return S.list().title('Utilcar').items(items)
}
