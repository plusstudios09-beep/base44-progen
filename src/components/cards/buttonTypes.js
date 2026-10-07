import { MessageCircle, Phone, Mail, Globe, MapPin, Download, Share2, Facebook, Instagram, Twitter, Linkedin, Youtube, Music, Ghost } from 'lucide-react';

export const TYPE_META = {
  whatsapp: { icon: MessageCircle, label: 'واتساب', event: 'whatsapp' },
  call: { icon: Phone, label: 'اتصال', event: 'call' },
  email: { icon: Mail, label: 'إيميل', event: 'email' },
  website: { icon: Globe, label: 'الموقع', event: 'share' },
  location: { icon: MapPin, label: 'الموقع على الخريطة', event: 'directions' },
  vcard: { icon: Download, label: 'حفظ جهة الاتصال', event: 'vcard' },
  share: { icon: Share2, label: 'مشاركة الكارت', event: 'share' },
  social_facebook: { icon: Facebook, label: 'فيسبوك', event: 'share' },
  social_instagram: { icon: Instagram, label: 'إنستغرام', event: 'share' },
  social_twitter: { icon: Twitter, label: 'تويتر / X', event: 'share' },
  social_linkedin: { icon: Linkedin, label: 'لينكدإن', event: 'share' },
  social_tiktok: { icon: Music, label: 'تيك توك', event: 'share' },
  social_snapchat: { icon: Ghost, label: 'سناب شات', event: 'share' },
  social_youtube: { icon: Youtube, label: 'يوتيوب', event: 'share' }
};

export const BUTTON_TYPES = Object.keys(TYPE_META);

export const SHAPES = [
  { key: 'circle', label: 'دائرة' },
  { key: 'rounded', label: 'مدور' },
  { key: 'square', label: 'مربع' },
  { key: 'pill', label: 'كبسولة' }
];

export const SOCIAL_ICONS = {
  facebook: Facebook, instagram: Instagram, twitter: Twitter, linkedin: Linkedin,
  youtube: Youtube, tiktok: Music, snapchat: Ghost
};

export function isDark(hex) {
  const c = (hex || '').replace('#', '');
  if (c.length < 6) return true;
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) < 140;
}

export function shapeClass(shape) {
  if (shape === 'pill') return 'h-12 px-5 rounded-full flex items-center justify-center gap-2';
  const radius = shape === 'circle' ? 'rounded-full' : shape === 'square' ? 'rounded-xl' : 'rounded-2xl';
  return `w-14 h-14 flex items-center justify-center ${radius}`;
}

export const PLACEHOLDER_CLIENT = {
  id: 'preview', slug: 'preview',
  name: 'اسم العميل', job_title: 'المسمى الوظيفي',
  bio: 'نبذة تعريفية قصيرة عن العميل ونشاطه。',
  phone: '+966500000000', whatsapp: '+966500000000',
  email: 'mail@example.com', website: 'https://example.com',
  address: 'المدينة، الدولة', map_url: 'https://maps.google.com',
  profile_image: '',
  social: {
    facebook: 'https://facebook.com', instagram: 'https://instagram.com',
    twitter: 'https://x.com', linkedin: 'https://linkedin.com',
    tiktok: 'https://tiktok.com', snapchat: 'https://snapchat.com', youtube: 'https://youtube.com'
  }
};