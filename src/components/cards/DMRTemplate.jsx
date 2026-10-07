import { Phone, MessageCircle, Mail, MapPin, Globe } from 'lucide-react';
import { waLink, SocialRow, ContactForm } from '@/components/cards/shared';

export default function DMRTemplate({ client, lang, theme, recordEvent }) {
  const en = lang === 'en';
  const t = (ar, e) => (en ? e : ar);
  const dark = theme !== 'light';
  const navy = '#0b1f3a';
  const gold = '#c9a24b';
  const bg = dark ? '#06121f' : '#0b1f3a';
  const card = dark ? '#0b1f3a' : '#0e2746';
  const text = '#ECECE6';
  const sub = '#9fb3c8';
  const name = en ? (client.name_en || client.name) : client.name;
  const title = en ? (client.job_title_en || client.job_title) : client.job_title;
  const bio = en ? (client.bio_en || client.bio) : client.bio;
  const address = en ? (client.address_en || client.address) : client.address;
  const td = client.template_data || {};
  const tagline = en ? (td.tagline_en || td.tagline) : td.tagline;

  const Btn = ({ href, onClick, icon: Icon, label }) => (
    <a href={href} onClick={onClick} target="_blank" rel="noreferrer"
      className="flex items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-sm border" style={{ borderColor: gold, color: gold, background: 'rgba(201,162,75,0.06)' }}>
      <Icon className="w-4 h-4" /> {label}
    </a>
  );

  return (
    <div className="min-h-screen px-5 py-6" style={{ background: bg, color: text }} dir={en ? 'ltr' : 'rtl'}>
      <div className="max-w-md mx-auto">
        <div className="rounded-3xl overflow-hidden border" style={{ borderColor: gold + '55', background: card }}>
          <div className="px-6 py-8 text-center" style={{ background: dark ? 'linear-gradient(160deg,#0b1f3a,#0e2746)' : 'linear-gradient(160deg,#0b1f3a,#123a66)' }}>
            {client.profile_image && (
              <img src={client.profile_image} alt={name} className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border-4" style={{ borderColor: gold }} />
            )}
            {name && <h1 className="text-2xl font-bold" style={{ color: gold }}>{name}</h1>}
            {title && <p className="text-sm mt-1" style={{ color: sub }}>{title}</p>}
            {tagline && <p className="text-xs mt-2 italic" style={{ color: gold + 'cc' }}>{tagline}</p>}
          </div>
          <div className="p-5">
            {bio && <p className="text-sm leading-relaxed text-center" style={{ color: sub }}>{bio}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          {client.phone && <Btn href={`tel:${client.phone}`} onClick={() => recordEvent(client.id, 'call')} icon={Phone} label={t('اتصال', 'Call')} />}
          {client.whatsapp && <Btn href={waLink(client.whatsapp)} onClick={() => recordEvent(client.id, 'whatsapp')} icon={MessageCircle} label="واتساب" />}
          {client.email && <Btn href={`mailto:${client.email}`} onClick={() => recordEvent(client.id, 'email')} icon={Mail} label={t('إيميل', 'Email')} />}
          {client.map_url && <Btn href={client.map_url} onClick={() => recordEvent(client.id, 'directions')} icon={MapPin} label={t('الموقع', 'Location')} />}
        </div>

        <ContactForm client={client} lang={lang} recordEvent={recordEvent} accent={gold} cardBg={card} sub={sub} />

        {address && <div className="flex items-center gap-2 text-sm mt-4 px-2" style={{ color: sub }}><MapPin className="w-4 h-4" /> {address}</div>}
        {client.website && (
          <a href={client.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm mt-2 px-2" style={{ color: gold }}>
            <Globe className="w-4 h-4" /> {client.website}
          </a>
        )}
        <SocialRow client={client} accent={gold} recordEvent={recordEvent} />
      </div>
    </div>
  );
}