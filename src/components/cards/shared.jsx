import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, X, Moon, Sun, Share2, QrCode, Languages, Facebook, Instagram, Twitter, Linkedin, Youtube, Globe } from 'lucide-react';

const SOCIAL_ICONS = {
  facebook: Facebook, instagram: Instagram, twitter: Twitter, linkedin: Linkedin,
  youtube: Youtube, tiktok: Globe, snapchat: Globe
};

export async function recordEvent(cardId, type) {
  if (!cardId) return;
  try { await base44.entities.CardEvent.create({ card_id: cardId, event_type: type }); } catch {}
}

export function cardUrl(slug) {
  return `${window.location.origin}/${slug}`;
}

export function waLink(number, text) {
  const n = (number || '').replace(/[^0-9]/g, '');
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

export function buildVCard(client, lang) {
  const en = lang === 'en';
  const name = en ? (client.name_en || client.name) : client.name;
  const title = en ? (client.job_title_en || client.job_title) : client.job_title;
  const address = en ? (client.address_en || client.address) : client.address;
  const bio = en ? (client.bio_en || client.bio) : client.bio;
  const lines = [
    'BEGIN:VCARD', 'VERSION:3.0',
    `FN:${name || ''}`,
    title ? `TITLE:${title}` : '',
    client.phone ? `TEL;TYPE=CELL:${client.phone}` : '',
    client.whatsapp ? `TEL;TYPE=WHATSAPP:${client.whatsapp}` : '',
    client.email ? `EMAIL:${client.email}` : '',
    client.website ? `URL:${client.website}` : '',
    address ? `ADR;TYPE=WORK:;;${address};;;;` : '',
    bio ? `NOTE:${bio}` : '',
    'END:VCARD'
  ].filter(Boolean);
  return lines.join('\n');
}

function vCardFile(client, lang) {
  const content = buildVCard(client, lang);
  const fname = (client.name_en || client.name || 'contact').replace(/\s+/g, '_');
  return new File([content], `${fname}.vcf`, { type: 'text/vcard' });
}

export async function saveContact(client, lang) {
  const file = vCardFile(client, lang);
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: client.name || 'Contact' }); return; } catch {}
  }
  const blob = new Blob([buildVCard(client, lang)], { type: 'text/vcard' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(url);
}

export async function shareCardUrl(slug) {
  const url = cardUrl(slug);
  if (navigator.share) {
    try { await navigator.share({ title: 'بطاقتي', url }); return; } catch {}
  }
  try { await navigator.clipboard.writeText(url); } catch {}
}

export function QrModal({ url, onClose }) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=0&data=${encodeURIComponent(url)}`;
  const download = async () => {
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'qr-code.png';
      a.click();
    } catch {}
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 max-w-xs w-full text-center" onClick={(e) => e.stopPropagation()}>
        <img src={src} alt="QR Code" className="w-full rounded-2xl" />
        <div className="mt-4 flex gap-2">
          <button onClick={download} className="flex-1 bg-neutral-900 text-white rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> تحميل
          </button>
          <button onClick={onClose} className="px-4 rounded-xl bg-neutral-100 text-neutral-700">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function CardToolbar({ lang, setLang, languageToggle, theme, setTheme, onShare, onQr, onSave }) {
  const btn = 'w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/15 text-white/90 hover:bg-white/10 transition-colors text-xs font-bold';
  const bg = { background: 'rgba(0,0,0,0.32)' };
  return (
    <div className="flex items-center justify-center gap-2.5 py-4">
      {languageToggle && (
        <button className={btn} style={bg} onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} title="تبديل اللغة">
          <Languages className="w-5 h-5" />
          <span className="mr-1">{lang === 'ar' ? 'EN' : 'ع'}</span>
        </button>
      )}
      <button className={btn} style={bg} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title="الوضع">
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
      <button className={btn} style={bg} onClick={onShare} title="مشاركة"><Share2 className="w-5 h-5" /></button>
      <button className={btn} style={bg} onClick={onQr} title="QR"><QrCode className="w-5 h-5" /></button>
      <button className={btn} style={bg} onClick={onSave} title="حفظ جهة الاتصال"><Download className="w-5 h-5" /></button>
    </div>
  );
}

export function SocialRow({ client, accent, recordEvent }) {
  const s = client.social || {};
  const entries = Object.entries(s).filter(([, v]) => v);
  if (!entries.length) return null;
  return (
    <div className="flex items-center justify-center gap-3 mt-5 flex-wrap">
      {entries.map(([k, v]) => {
        const Icon = SOCIAL_ICONS[k] || Globe;
        return (
          <a key={k} href={v} target="_blank" rel="noreferrer" onClick={() => recordEvent(client.id, 'share')}
            className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: accent + '22', color: accent }}>
            <Icon className="w-5 h-5" />
          </a>
        );
      })}
    </div>
  );
}

export function ContactForm({ client, lang, recordEvent, accent, cardBg, sub }) {
  const en = lang === 'en';
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  if (!client.whatsapp) return null;
  const send = () => {
    const text = `${en ? 'Message from' : 'رسالة من'} ${name || '-'}: ${msg || ''}`;
    window.open(waLink(client.whatsapp, text), '_blank');
    recordEvent(client.id, 'whatsapp');
  };
  const inputCls = 'w-full rounded-xl border px-3 py-2.5 text-sm outline-none';
  return (
    <div className="rounded-3xl p-5 mt-4" style={{ background: cardBg }}>
      <h3 className="font-bold mb-3">{en ? 'Send a message' : 'أرسل رسالة'}</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={en ? 'Your name' : 'اسمك'}
        className={inputCls} style={{ borderColor: accent + '44', color: sub }} />
      <textarea value={msg} onChange={(e) => setMsg(e.target.value)} placeholder={en ? 'Message' : 'الرسالة'} rows={2}
        className={inputCls + ' mt-2'} style={{ borderColor: accent + '44', color: sub }} />
      <button onClick={send} className="w-full rounded-xl py-3 text-white font-semibold text-sm mt-3" style={{ background: '#25D366' }}>
        {en ? 'Send via WhatsApp' : 'إرسال عبر واتساب'}
      </button>
    </div>
  );
}