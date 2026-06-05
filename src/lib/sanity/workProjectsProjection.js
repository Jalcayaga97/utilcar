/** Proyección GROQ — documentos workProject. */
export const WORK_PROJECT_PROJECTION = `{
  _id,
  projectId,
  "id": coalesce(projectId.current, projectId),
  title,
  serviceCategory,
  description,
  client,
  vehicle,
  featured,
  homeVisible,
  visible,
  order,
  image{
    asset->{ _id, url },
    alt
  },
  gallery[]{
    _key,
    image{
      asset->{ _id, url },
      alt
    },
    alt,
    caption
  }
}`
