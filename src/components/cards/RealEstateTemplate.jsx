import { Phone, MessageCircle, MapPin, Globe, Building2 } from 'lucide-react';
import { waLink, SocialRow } from '@/components/cards/shared';

export default function RealEstateTemplate({ client, lang, theme, recordEvent }) {
  const en = lang === 'en';
  const t = (ar, e) => (en ? e : ar);
  const accent = client.primary_color || '#b8860b';
  const dark = theme === 'dark';
  const bg = dark ? '#0a0a0a' : '#f5f3ef';
  const card = dark ? '#161616' : '#ffffff';
  const text = dark ? '#ECECE6' : '#1a1a1a';
  const sub = dark ? '#9a9a9a' : '#666';
  const name = en ? (client.name_en || client.name) : client.name;
  const title = en ? (client.job_title_en || client.job_title) : client.job_title;
  const bio = en ? (client.bio_en || client.bio) : client.bio;
  const address = en ? (client.address_en || client.address) : client.address;
  const td = client.template_data || {};
  const properties = (td.properties || []).filter((p) => p && p.title);
  const services = (td.services || []).filter(Boolean);

  const Btn = ({ href, onClick, icon: Icon, label, color }) => (
    <a href={href} onClick={onClick} target="_blank" rel="noreferrer"
      className="flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm text-white" style={{ background: color }}>
      <Icon className="w-4 h-4" /> {label}
    </a>
  );

  return (
    <div className="min-h-screen px-5 py-6" style={{ background: bg, color: text }} dir={en ? 'ltr' : 'rtl'}>
      <div className="max-w-md mx-auto">
        <div className="rounded-3xl p-6 text-center" style={{ background: card }}>
          {client.profile_image && (
            <img src={client.profile_image} alt={name} className="w-24 h-24 rounded-2xl object-cover mx-auto mb-3" style={{ border: `3px solid ${accent}` }} />
          )}
          {name && <h1 className="text-2xl font-bold">{name}</h1>}
          {title && <p className="text-sm mt-1 font-medium" style={{ color: accent }}>{title}</p>}
          {bio && <p className="text-sm mt-3 leading-relaxed" style={{ color: sub }}>{bio}</p>}
        </div>

        {services.length > 0 && (
          <div className="rounded-3xl p-5 mt-4" style={{ background: card }}>
            <h3 className="font-bold mb-3 flex items-center gap-2"><Building2 className="w-4 h-4" style={{ color: accent }} /> {t('خدماتنا', 'Our Services')}</h3>
            <ul className="space-y-2">
              {services.map((s, i) => (
                <li key={i} className="text-sm flex items-center gap-2" style={{ color: sub }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />{s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {properties.length > 0 && (
          <div className="mt-4 space-y-3">
            <h3 className="font-bold px-1">{t('عقارات مميزة', 'Featured Properties')}</h3>
            {properties.map((p, i) => (
              <div key={i} className="rounded-2xl p-4" style={{ background: card }}>
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{p.title}</h4>
                  {p.price && <span className="text-sm font-bold" style={{ color: accent }}>{p.price}</span>}
                </div>
                {p.details && <p className="text-sm mt-1" style={{ color: sub }}>{p.details}</p>}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-4">
          {client.whatsapp && <Btn href={waLink(client.whatsapp)} onClick={() => recordEvent(client.id, 'whatsapp')} icon={MessageCircle} label="واتساب" color="#25D366" />}
          {client.phone && <Btn href={`tel:${client.phone}`} onClick={() => recordEvent(client.id, 'call')} icon={Phone} label={t('اتصال', 'Call')} color={accent} />}
          {client.website && <Btn href={client.website} onClick={() => recordEvent(client.id, 'share')} icon={Globe} label={t('الموقع', 'Website')} color="#555" />}
          {client.map_url && <Btn href={client.map_url} onClick={() => recordEvent(client.id, 'directions')} icon={MapPin} label={t('الموقع', 'Location')} color="#777" />}
        </div>

        {address && <div className="flex items-center gap-2 text-sm mt-4 px-2" style={{ color: sub }}><MapPin className="w-4 h-4" /> {address}</div>}
        <SocialRow client={client} accent={accent} recordEvent={recordEvent} />
      </div>
    </div>
  );
}