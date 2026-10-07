import { Phone, MessageCircle, MapPin } from 'lucide-react';
import { waLink } from '@/components/cards/shared';

export default function GroceryTemplate({ client, lang, theme, recordEvent }) {
  const en = lang === 'en';
  const t = (ar, e) => (en ? e : ar);
  const accent = client.primary_color || '#2e7d32';
  const dark = theme === 'dark';
  const bg = dark ? '#0a0f0a' : '#eef5ee';
  const card = dark ? '#111a13' : '#ffffff';
  const text = dark ? '#ECECE6' : '#1a1a1a';
  const sub = dark ? '#9a9a9a' : '#555';
  const name = en ? (client.name_en || client.name) : client.name;
  const address = en ? (client.address_en || client.address) : client.address;
  const td = client.template_data || {};
  const deliveryNumber = td.delivery_number || client.phone;
  const hours = td.opening_hours;

  return (
    <div className="min-h-screen flex flex-col px-5 py-6" style={{ background: bg, color: text }} dir={en ? 'ltr' : 'rtl'}>
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        <div className="rounded-3xl p-6 text-center" style={{ background: accent }}>
          {client.profile_image && (
            <img src={client.profile_image} alt={name} className="w-24 h-24 rounded-2xl object-cover mx-auto mb-3 border-4 border-white/30" />
          )}
          {name && <h1 className="text-2xl font-bold text-white">{name}</h1>}
          {hours && <p className="text-sm text-white/80 mt-1">{hours}</p>}
        </div>

        <div className="mt-6 space-y-3">
          {client.whatsapp && (
            <a href={waLink(client.whatsapp, t('أريد الطلب', 'I want to order'))} target="_blank" rel="noreferrer" onClick={() => recordEvent(client.id, 'whatsapp')}
              className="flex items-center justify-center gap-2 rounded-2xl py-5 text-white font-bold text-lg" style={{ background: '#25D366' }}>
              <MessageCircle className="w-6 h-6" /> {t('اطلب عبر واتساب', 'Order via WhatsApp')}
            </a>
          )}
          {deliveryNumber && (
            <a href={`tel:${deliveryNumber}`} onClick={() => recordEvent(client.id, 'call')}
              className="flex items-center justify-center gap-2 rounded-2xl py-5 text-white font-bold text-lg" style={{ background: accent }}>
              <Phone className="w-6 h-6" /> {t('اتصال للتوصيل', 'Call for Delivery')}
            </a>
          )}
          {client.map_url && (
            <a href={client.map_url} target="_blank" rel="noreferrer" onClick={() => recordEvent(client.id, 'directions')}
              className="flex items-center justify-center gap-2 rounded-2xl py-5 text-white font-bold text-lg" style={{ background: '#555' }}>
              <MapPin className="w-6 h-6" /> {t('موقع البقالة', 'Store Location')}
            </a>
          )}
        </div>

        {address && <div className="flex items-center gap-2 text-sm mt-5 px-2 justify-center" style={{ color: sub }}><MapPin className="w-4 h-4" /> {address}</div>}
      </div>
    </div>
  );
}