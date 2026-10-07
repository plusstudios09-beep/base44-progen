import { Phone, MessageCircle, Mail, MapPin, BadgeCheck } from 'lucide-react';
import { waLink, SocialRow } from '@/components/cards/shared';

export default function LawyerTemplate({ client, lang, theme, recordEvent }) {
  const en = lang === 'en';
  const t = (ar, e) => (en ? e : ar);
  const accent = client.primary_color || '#1f3a5f';
  const dark = theme === 'dark';
  const bg = dark ? '#0b0f14' : '#f4f1ea';
  const card = dark ? '#11161d' : '#ffffff';
  const text = dark ? '#ECECE6' : '#1a1a1a';
  const sub = dark ? '#9aa3ad' : '#5a5a5a';
  const name = en ? (client.name_en || client.name) : client.name;
  const title = en ? (client.job_title_en || client.job_title) : client.job_title;
  const bio = en ? (client.bio_en || client.bio) : client.bio;
  const address = en ? (client.address_en || client.address) : client.address;
  const td = client.template_data || {};
  const specialties = td.specialties || [];
  const license = td.license_number;

  const Btn = ({ href, onClick, icon: Icon, label, color }) => (
    <a href={href} onClick={onClick} target="_blank" rel="noreferrer"
      className="flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm text-white" style={{ background: color }}>
      <Icon className="w-4 h-4" /> {label}
    </a>
  );

  return (
    <div className="min-h-screen px-5 py-6" style={{ background: bg, color: text }} dir={en ? 'ltr' : 'rtl'}>
      <div className="max-w-md mx-auto">
        <div className="rounded-3xl overflow-hidden" style={{ background: card }}>
          <div className="px-6 py-8 text-center" style={{ background: accent }}>
            {client.profile_image && (
              <img src={client.profile_image} alt={name} className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border-4 border-white/30" />
            )}
            {name && <h1 className="text-2xl font-bold text-white">{name}</h1>}
            {title && <p className="text-sm text-white/80 mt-1">{title}</p>}
            {license && <p className="text-xs text-white/70 mt-2">{t('ترخيص', 'License')}: {license}</p>}
          </div>
          <div className="p-5">
            {bio && <p className="text-sm leading-relaxed text-center" style={{ color: sub }}>{bio}</p>}
            {specialties.filter(Boolean).length > 0 && (
              <div className="mt-4">
                <h3 className="font-bold text-sm mb-2" style={{ color: accent }}>{t('التخصصات', 'Practice Areas')}</h3>
                <div className="flex flex-wrap gap-2">
                  {specialties.filter(Boolean).map((s, i) => (
                    <span key={i} className="text-xs px-3 py-1.5 rounded-full flex items-center gap-1" style={{ background: accent + '15', color: accent }}>
                      <BadgeCheck className="w-3 h-3" /> {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          {client.phone && <Btn href={`tel:${client.phone}`} onClick={() => recordEvent(client.id, 'call')} icon={Phone} label={t('اتصال', 'Call')} color={accent} />}
          {client.whatsapp && <Btn href={waLink(client.whatsapp)} onClick={() => recordEvent(client.id, 'whatsapp')} icon={MessageCircle} label="واتساب" color="#25D366" />}
          {client.email && <Btn href={`mailto:${client.email}`} onClick={() => recordEvent(client.id, 'email')} icon={Mail} label={t('إيميل', 'Email')} color="#555" />}
          {client.map_url && <Btn href={client.map_url} onClick={() => recordEvent(client.id, 'directions')} icon={MapPin} label={t('المكتب', 'Office')} color="#777" />}
        </div>

        {address && <div className="flex items-center gap-2 text-sm mt-4 px-2" style={{ color: sub }}><MapPin className="w-4 h-4" /> {address}</div>}
        <SocialRow client={client} accent={accent} recordEvent={recordEvent} />
      </div>
    </div>
  );
}