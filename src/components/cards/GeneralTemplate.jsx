import { Phone, MessageCircle, Mail, MapPin, Globe } from 'lucide-react';
import { waLink, SocialRow, ContactForm } from '@/components/cards/shared';

export default function GeneralTemplate({ client, lang, theme, recordEvent }) {
  const en = lang === 'en';
  const t = (ar, e) => (en ? e : ar);
  const accent = client.primary_color || '#3D8F73';
  const dark = theme === 'dark';
  const bg = dark ? '#0a0a0a' : '#ECECE6';
  const card = dark ? '#161616' : '#ffffff';
  const text = dark ? '#ECECE6' : '#1a1a1a';
  const sub = dark ? '#9a9a9a' : '#666';
  const name = en ? (client.name_en || client.name) : client.name;
  const title = en ? (client.job_title_en || client.job_title) : client.job_title;
  const bio = en ? (client.bio_en || client.bio) : client.bio;
  const address = en ? (client.address_en || client.address) : client.address;
  const services = (client.template_data && client.template_data.services) || [];

  const Btn = ({ href, onClick, icon: Icon, label, color }) => (
    <a href={href} onClick={onClick} target="_blank" rel="noreferrer"
      className="flex items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold text-white text-sm" style={{ background: color }}>
      <Icon className="w-5 h-5" /> {label}
    </a>
  );

  return (
    <div className="min-h-screen px-5 py-6" style={{ background: bg, color: text }} dir={en ? 'ltr' : 'rtl'}>
      <div className="max-w-md mx-auto">
        <div className="flex flex-col items-center text-center rounded-3xl p-6" style={{ background: card }}>
          {client.profile_image && (
            <img src={client.profile_image} alt={name} className="w-28 h-28 rounded-full object-cover mb-4 border-4" style={{ borderColor: accent }} />
          )}
          {name && <h1 className="text-2xl font-bold">{name}</h1>}
          {title && <p className="text-sm mt-1 font-medium" style={{ color: accent }}>{title}</p>}
          {bio && <p className="text-sm mt-3 leading-relaxed" style={{ color: sub }}>{bio}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          {client.phone && <Btn href={`tel:${client.phone}`} onClick={() => recordEvent(client.id, 'call')} icon={Phone} label={t('اتصال', 'Call')} color={accent} />}
          {client.whatsapp && <Btn href={waLink(client.whatsapp)} onClick={() => recordEvent(client.id, 'whatsapp')} icon={MessageCircle} label="واتساب" color="#25D366" />}
          {client.email && <Btn href={`mailto:${client.email}`} onClick={() => recordEvent(client.id, 'email')} icon={Mail} label={t('إيميل', 'Email')} color="#555" />}
          {client.map_url && <Btn href={client.map_url} onClick={() => recordEvent(client.id, 'directions')} icon={MapPin} label={t('الموقع', 'Location')} color="#777" />}
        </div>

        {services.filter(Boolean).length > 0 && (
          <div className="rounded-3xl p-5 mt-4" style={{ background: card }}>
            <h3 className="font-bold mb-3">{t('الخدمات', 'Services')}</h3>
            <ul className="space-y-2">
              {services.filter(Boolean).map((s, i) => (
                <li key={i} className="text-sm flex items-center gap-2" style={{ color: sub }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />{s}
                </li>
              ))}
            </ul>
          </div>
        )}

        <ContactForm client={client} lang={lang} recordEvent={recordEvent} accent={accent} cardBg={card} sub={sub} />

        {address && <div className="flex items-center gap-2 text-sm mt-4 px-2" style={{ color: sub }}><MapPin className="w-4 h-4" /> {address}</div>}
        {client.website && (
          <a href={client.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm mt-2 px-2" style={{ color: accent }}>
            <Globe className="w-4 h-4" /> {client.website}
          </a>
        )}

        <SocialRow client={client} accent={accent} recordEvent={recordEvent} />
      </div>
    </div>
  );
}