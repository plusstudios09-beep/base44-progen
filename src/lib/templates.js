export const TEMPLATES = [
  { key: 'general', label: 'عام / فعاليات', icon: '✨' },
  { key: 'lawyer', label: 'محامي', icon: '⚖️' },
  { key: 'real_estate', label: 'عقاري', icon: '🏠' },
  { key: 'grocery', label: 'بقالة / توصيل', icon: '🛒' },
  { key: 'dmr', label: 'DMR Arabia', icon: '🏢' },
  { key: 'custom', label: 'قالب مخصص', icon: '🎨' }
];

export const BUILTIN_TEMPLATES = ['general', 'lawyer', 'real_estate', 'grocery', 'dmr'];

export const TEMPLATE_LABEL = Object.fromEntries(TEMPLATES.map(t => [t.key, t.label]));