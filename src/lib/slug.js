export function slugify(text) {
  return (text || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

export function generateSlug(name, nameEn) {
  const fromEn = slugify(nameEn);
  if (fromEn) return fromEn;
  const fromName = slugify(name);
  if (fromName) return fromName;
  return 'card-' + Math.random().toString(36).slice(2, 7);
}