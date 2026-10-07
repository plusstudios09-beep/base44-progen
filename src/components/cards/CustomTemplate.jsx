import { Globe, MapPin } from 'lucide-react';
import { TYPE_META, SOCIAL_ICONS, isDark, shapeClass } from '@/components/cards/buttonTypes';
import { waLink, saveContact, shareCardUrl } from '@/components/cards/shared';

function resolveAction(type, client, lang, recordEvent) {
  const re = (e) => recordEvent(client.id, e);
  switch (type) {
    case 'whatsapp':
      return client.whatsapp ? { onClick: () => { window.open(waLink(client.whatsapp, lang === 'en' ? 'Hello' : 'مرحباً'), '_blank'); re('whatsapp'); } } : null;
    case 'call':
      return client.phone ? { href: `tel:${client.phone.replace(/\s/g, '')}`, onClick: () => re('call') } : null;
    case 'email':
      return client.email ? { href: `mailto:${client.email}`, onClick: () => re('email') } : null;
    case 'website':
      return client.website ? { href: client.website, onClick: () => re('share') } : null;
    case 'location': {
      const href = client.map_url || (client.address ? `https://maps.google.com/?q=${encodeURIComponent(client.address)}` : null);
      return href ? { href, onClick: () => re('directions') } : null;
    }
    case 'vcard':
      return { onClick: () => { saveContact(client, lang); re('vcard'); } };
    case 'share':
      return { onClick: () => { shareCardUrl(client.slug); re('share'); } };
    default:
      if (type && type.startsWith('social_')) {
        const key = type.replace('social_', '');
        const v = client.social && client.social[key];
        return v ? { href: v, onClick: () => re('share') } : null;
      }
      return null;
  }
}

export default function CustomTemplate({ client, lang, tpl, recordEvent }) {
  const layout = (tpl && tpl.layout) || {};
  const buttons = (tpl && tpl.buttons) || [];
  const bg = layout.bg_color || '#0a0a0a';
  const accent = layout.accent_color || '#3D8F73';
  const dark = isDark(bg);
  const text = dark ? '#ffffff' : '#1a1a1a';
  const sub = dark ? '#cfcfcf' : '#555';
  const en = lang === 'en';
  const name = en ? (client.name_en || client.name) : client.name;
  const title = en ? (client.job_title_en || client.job_title) : client.job_title;
  const bio = en ? (client.bio_en || client.bio) : client.bio;
  const address = en ? (client.address_en || client.address) : client.address;
  const socialEntries = layout.show_social ? Object.entries(client.social || {}).filter(([, v]) => v) : [];

  const profileShape = layout.profile_shape === 'circle' ? 'w-28 h-28 rounded-full'
    : layout.profile_shape === 'square' ? 'w-28 h-28 rounded-xl' : 'w-28 h-28 rounded-2xl';
  const socialShape = layout.social_shape === 'circle' ? 'w-10 h-10 rounded-full'
    : layout.social_shape === 'square' ? 'w-10 h-10 rounded-xl' : 'w-10 h-10 rounded-2xl';

  return (
    <div dir={en ? 'ltr' : 'rtl'} className="relative min-h-screen px-6 pt-10 pb-28" style={{ background: bg, color: text }}>
      <div className="mx-auto max-w-sm text-center">
        {layout.show_profile && client.profile_image ? (
          <img src={client.profile_image} alt="" className={`mx-auto object-cover ${profileShape}`} />
        ) : layout.show_profile ? (
          <div className={`mx-auto bg-neutral-700/50 flex items-center justify-center text-white text-3xl font-bold ${profileShape}`}>{(name || '?')[0]}</div>
        ) : null}
        {layout.show_name && name && <h1 className="mt-4 text-2xl font-bold" style={{ color: text }}>{name}</h1>}
        {layout.show_job_title && title && <p className="mt-1 text-sm font-medium" style={{ color: accent }}>{title}</p>}
        {layout.show_bio && bio && <p className="mt-3 text-sm leading-relaxed" style={{ color: sub }}>{bio}</p>}
        {layout.show_address && address && (
          <a href={client.map_url || `https://maps.google.com/?q=${encodeURIComponent(address)}`} target="_blank" rel="noreferrer" onClick={() => recordEvent(client.id, 'directions')} className="inline-flex items-center gap-1 mt-3 text-xs" style={{ color: sub }}>
            <MapPin className="w-3.5 h-3.5" /> {address}
          </a>
        )}
        {layout.show_website && client.website && (
          <a href={client.website} target="_blank" rel="noreferrer" onClick={() => recordEvent(client.id, 'share')} className="block mt-2 text-xs" style={{ color: accent }}>
            {client.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
          </a>
        )}
        {socialEntries.length > 0 && (
          <div className="flex items-center justify-center gap-3 mt-5 flex-wrap">
            {socialEntries.map(([k, v]) => {
              const Icon = SOCIAL_ICONS[k] || Globe;
              return (
                <a key={k} href={v} target="_blank" rel="noreferrer" onClick={() => recordEvent(client.id, 'share')} className={`flex items-center justify-center ${socialShape}`} style={{ background: accent + '22', color: accent }}>
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>
        )}
      </div>

      {buttons.map((b) => {
        const meta = TYPE_META[b.type];
        if (!meta) return null;
        const action = resolveAction(b.type, client, lang, recordEvent);
        if (!action) return null;
        const Icon = meta.icon;
        const cls = shapeClass(b.shape);
        const style = { left: b.x + '%', top: b.y + '%', background: b.color || accent, color: '#fff' };
        const inner = (
          <>
            <Icon className="w-5 h-5" />
            {b.shape === 'pill' && b.label && <span className="text-sm font-medium px-1">{b.label}</span>}
          </>
        );
        return action.href ? (
          <a key={b.id} href={action.href} target="_blank" rel="noreferrer" onClick={action.onClick} style={style} className={`absolute -translate-x-1/2 -translate-y-1/2 shadow-lg ${cls}`}>
            {inner}
          </a>
        ) : (
          <button key={b.id} type="button" onClick={action.onClick} style={style} className={`absolute -translate-x-1/2 -translate-y-1/2 shadow-lg cursor-pointer ${cls}`}>
            {inner}
          </button>
        );
      })}
    </div>
  );
}