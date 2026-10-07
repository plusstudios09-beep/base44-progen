import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { recordEvent, cardUrl, saveContact, shareCardUrl, CardToolbar, QrModal } from '@/components/cards/shared';
import GeneralTemplate from '@/components/cards/GeneralTemplate';
import LawyerTemplate from '@/components/cards/LawyerTemplate';
import RealEstateTemplate from '@/components/cards/RealEstateTemplate';
import GroceryTemplate from '@/components/cards/GroceryTemplate';
import DMRTemplate from '@/components/cards/DMRTemplate';
import CustomTemplate from '@/components/cards/CustomTemplate';
import Logo from '@/components/Logo';

const TEMPLATES = {
  general: GeneralTemplate, lawyer: LawyerTemplate, real_estate: RealEstateTemplate,
  grocery: GroceryTemplate, dmr: DMRTemplate
};

function Unavailable() {
  return (
    <div dir="rtl" className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-center px-6">
      <Logo size="md" />
      <p className="mt-8 text-neutral-300 text-lg">هذا الكارت غير متاح حالياً</p>
      <p className="mt-2 text-neutral-600 text-sm">© Plus Studio</p>
    </div>
  );
}

function NotFound() {
  return (
    <div dir="rtl" className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-center px-6">
      <Logo size="md" />
      <p className="mt-8 text-neutral-300 text-lg">الكارت غير موجود</p>
    </div>
  );
}

export default function CardView() {
  const { slug } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('ar');
  const [theme, setTheme] = useState('light');
  const [showQr, setShowQr] = useState(false);
  const [tpl, setTpl] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await base44.entities.Client.filter({ slug }, { limit: 1 });
        const c = (res.items || [])[0];
        if (!alive) return;
        setClient(c || null);
        if (c) {
          const useLang = c.language_toggle ? (c.default_language || 'ar') : (c.default_language || 'ar');
          setLang(useLang);
          setTheme(c.template === 'dmr' ? 'dark' : 'light');
          recordEvent(c.id, 'visit');
          if (c.template === 'custom' && c.custom_template_id) {
            try { const t = await base44.entities.Template.get(c.custom_template_id); if (alive) setTpl(t); } catch {}
          }
        }
      } catch {}
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-neutral-200 border-t-[#3D8F73] rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!client) return <NotFound />;

  const expired = client.auto_suspend && client.renewal_date && new Date(client.renewal_date) < new Date(new Date().toDateString());
  if (client.status !== 'active' || expired) return <Unavailable />;

  const Template = TEMPLATES[client.template] || GeneralTemplate;
  const languageToggle = !!client.language_toggle;
  const effectiveLang = languageToggle ? lang : (client.default_language || 'ar');
  const dir = effectiveLang === 'en' ? 'ltr' : 'rtl';

  return (
    <div dir={dir} className="min-h-screen" style={{ background: theme === 'dark' ? '#050505' : '#ECECE6' }}>
      <CardToolbar
        lang={effectiveLang}
        setLang={setLang}
        languageToggle={languageToggle}
        theme={theme}
        setTheme={setTheme}
        onShare={() => { shareCardUrl(slug); recordEvent(client.id, 'share'); }}
        onQr={() => setShowQr(true)}
        onSave={() => { saveContact(client, effectiveLang); recordEvent(client.id, 'vcard'); }}
      />
      {client.template === 'custom' && tpl ? (
        <CustomTemplate client={client} lang={effectiveLang} tpl={tpl} recordEvent={recordEvent} />
      ) : (() => {
        const Template = TEMPLATES[client.template] || GeneralTemplate;
        return <Template client={client} lang={effectiveLang} theme={theme} recordEvent={recordEvent} />;
      })()}
      {showQr && <QrModal url={cardUrl(slug)} onClose={() => setShowQr(false)} />}
      <footer className="py-6 text-center">
        <div className="inline-flex flex-col items-center opacity-70">
          <Logo size="sm" onDark={theme === 'dark'} />
        </div>
        <p className="mt-2 text-[10px] tracking-widest" style={{ color: theme === 'dark' ? '#555' : '#999' }}>© PLUS STUDIO — NFC CONNECT</p>
      </footer>
    </div>
  );
}