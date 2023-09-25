function generateSlug(email: string) {
  const username = email.split('@')[0]
  const slug = username
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-zA-Z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')

  return slug
}

export default generateSlug
