import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useCustomAuth } from '@/lib/customAuth';
import { ArrowRight, Save } from 'lucide-react';
import { TEMPLATES } from '@/lib/templates';
import { generateSlug } from '@/lib/slug';
import TemplateFields from '@/components/clients/TemplateFields';
import SocialFields from '@/components/clients/SocialFields';
import ImageUpload from '@/components/clients/ImageUpload';
import GeneralTemplate from '@/components/cards/GeneralTemplate';
import LawyerTemplate from '@/components/cards/LawyerTemplate';
import RealEstateTemplate from '@/components/cards/RealEstateTemplate';
import GroceryTemplate from '@/components/cards/GroceryTemplate';
import DMRTemplate from '@/components/cards/DMRTemplate';
import CustomTemplate from '@/components/cards/CustomTemplate';
import NfcWriter from '@/components/cards/NfcWriter';
import { Nfc as NfcIcon } from 'lucide-react';

const PREVIEW = { general: GeneralTemplate, lawyer: LawyerTemplate, real_estate: RealEstateTemplate, grocery: GroceryTemplate, dmr: DMRTemplate };
const inputCls = 'w-full rounded-lg bg-[#050505] border border-neutral-800 px-3 py-2.5 text-sm text-white outline-none focus:border-[#3D8F73]';

const EMPTY = {
  name: '', name_en: '', template: 'general', slug: '', status: 'active', custom_template_id: '',
  renewal_date: '', auto_suspend: false, profile_image: '',
  job_title: '', job_title_en: '', phone: '', whatsapp: '', email: '', website: '',
  address: '', address_en: '', map_url: '', social: {}, bio: '', bio_en: '',
  primary_color: '', template_data: {}, language_toggle: false, default_language: 'ar'
};

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-[#0c0c0c] p-5 space-y-3">
      <h3 className="text-sm font-bold text-[#5fbf9c]">{title}</h3>
      {children}
    </div>
  );
}

export default function ClientEditor() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { session } = useCustomAuth();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [customTemplates, setCustomTemplates] = useState([]);
  const [showNfc, setShowNfc] = useState(false);

  useEffect(() => {
    base44.entities.Template.filter({}, { sort: '-created_date', limit: 100, fields: ['name', 'layout', 'buttons'] })
      .then((r) => setCustomTemplates(r.items || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const c = await base44.entities.Client.get(id);
        setForm({ ...EMPTY, ...c });
      } catch { setError('تعذر تحميل بيانات العميل'); }
      setLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    if (isEdit) return;
    if (!form.name && !form.name_en) return;
    setForm((f) => ({ ...f, slug: generateSlug(f.name, f.name_en) }));
  }, [form.name, form.name_en, isEdit]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setError('');
    if (!form.name.trim()) { setError('اسم العميل مطلوب'); return; }
    if (!form.slug.trim()) { setError('الرابط مطلوب'); return; }
    setSaving(true);
    try {
      const payload = { ...form, slug: form.slug.trim().toLowerCase() };
      const op = isEdit ? 'updateClient' : 'createClient';
      const data = isEdit ? { id, ...payload } : payload;
      const r = await base44.functions.invoke('staffAction', { token: session.token, op, data });
      if (r?.data?.error) throw new Error(r.data.error);
      navigate('/admin/clients');
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-neutral-400">جارٍ التحميل...</div>;

  const isCustom = form.template === 'custom';
  const customTpl = customTemplates.find((t) => t.id === form.custom_template_id);
  const previewClient = { ...form, id: 'preview' };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <button onClick={() => navigate('/admin/clients')} className="flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-200 mb-4">
        <ArrowRight className="w-4 h-4" /> رجوع للعملاء
      </button>
      <h1 className="text-2xl font-bold text-white mb-6">{isEdit ? 'تعديل عميل' : 'إضافة عميل جديد'}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <Section title="القالب">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {TEMPLATES.map((t) => (
                <button key={t.key} type="button" onClick={() => set('template', t.key)}
                  className={`rounded-xl border px-2 py-3 text-xs text-center ${form.template === t.key ? 'border-[#3D8F73] bg-[#3D8F73]/10 text-white' : 'border-neutral-800 text-neutral-400'}`}>
                  <div className="text-lg">{t.icon}</div>{t.label}
                </button>
              ))}
            </div>
            {form.template === 'custom' && (
              <div>
                <label className="text-sm text-neutral-300">اختر القالب المخصص</label>
                {customTemplates.length === 0 ? (
                  <p className="text-xs text-neutral-500">لا توجد قوالب مخصصة بعد. أنشئ قالباً من قسم «القوالب» أولاً.</p>
                ) : (
                  <select value={form.custom_template_id || ''} onChange={(e) => set('custom_template_id', e.target.value)} className={inputCls}>
                    <option value="">— اختر —</option>
                    {customTemplates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                )}
              </div>
            )}
          </Section>

          <Section title="البيانات الأساسية">
            <div>
              <label className="text-sm text-neutral-300">الاسم (عربي)</label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} />
            </div>
            {form.language_toggle && (
              <div>
                <label className="text-sm text-neutral-300">الاسم (إنجليزي)</label>
                <input value={form.name_en} onChange={(e) => set('name_en', e.target.value)} className={inputCls} />
              </div>
            )}
            <div>
              <label className="text-sm text-neutral-300">الرابط (slug)</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500 shrink-0">{window.location.origin}/</span>
                <input value={form.slug} onChange={(e) => set('slug', e.target.value)} className={inputCls} dir="ltr" />
              </div>
            </div>
            <ImageUpload value={form.profile_image} onChange={(v) => set('profile_image', v)} circle={form.template !== 'real_estate'} />
            <div>
              <label className="text-sm text-neutral-300">المسمى الوظيفي / النشاط</label>
              <input value={form.job_title} onChange={(e) => set('job_title', e.target.value)} className={inputCls} />
            </div>
            {form.language_toggle && (
              <div>
                <label className="text-sm text-neutral-300">المسمى (إنجليزي)</label>
                <input value={form.job_title_en} onChange={(e) => set('job_title_en', e.target.value)} className={inputCls} dir="ltr" />
              </div>
            )}
            <div>
              <label className="text-sm text-neutral-300">نبذة</label>
              <textarea value={form.bio} onChange={(e) => set('bio', e.target.value)} rows={3} className={inputCls} />
            </div>
            {form.language_toggle && (
              <div>
                <label className="text-sm text-neutral-300">نبذة (إنجليزي)</label>
                <textarea value={form.bio_en} onChange={(e) => set('bio_en', e.target.value)} rows={3} className={inputCls} dir="ltr" />
              </div>
            )}
            <div>
              <label className="text-sm text-neutral-300">اللون الأساسي المخصص (اختياري)</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.primary_color || '#3D8F73'} onChange={(e) => set('primary_color', e.target.value)} className="w-12 h-10 rounded bg-transparent border border-neutral-800" />
                <input value={form.primary_color} onChange={(e) => set('primary_color', e.target.value)} className={inputCls} dir="ltr" placeholder="#3D8F73" />
              </div>
            </div>
          </Section>

          <Section title="التواصل">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="text-sm text-neutral-300">رقم الاتصال</label><input value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputCls} dir="ltr" /></div>
              <div><label className="text-sm text-neutral-300">رقم واتساب</label><input value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} className={inputCls} dir="ltr" /></div>
              <div><label className="text-sm text-neutral-300">الإيميل</label><input value={form.email} onChange={(e) => set('email', e.target.value)} className={inputCls} dir="ltr" /></div>
              <div><label className="text-sm text-neutral-300">الموقع الإلكتروني</label><input value={form.website} onChange={(e) => set('website', e.target.value)} className={inputCls} dir="ltr" /></div>
            </div>
            <div><label className="text-sm text-neutral-300">العنوان</label><input value={form.address} onChange={(e) => set('address', e.target.value)} className={inputCls} /></div>
            {form.language_toggle && <div><label className="text-sm text-neutral-300">العنوان (إنجليزي)</label><input value={form.address_en} onChange={(e) => set('address_en', e.target.value)} className={inputCls} dir="ltr" /></div>}
            <div><label className="text-sm text-neutral-300">رابط الموقع على الخريطة</label><input value={form.map_url} onChange={(e) => set('map_url', e.target.value)} className={inputCls} dir="ltr" /></div>
          </Section>

          <Section title="حسابات التواصل الاجتماعي">
            <SocialFields value={form.social} onChange={(v) => set('social', v)} />
          </Section>

          <Section title="حقول القالب">
            <TemplateFields template={form.template} data={form.template_data} onChange={(v) => set('template_data', v)} />
          </Section>

          <Section title="اللغة والإعدادات">
            <label className="flex items-center gap-3 text-sm text-neutral-200">
              <input type="checkbox" checked={form.language_toggle} onChange={(e) => set('language_toggle', e.target.checked)} className="w-4 h-4 accent-[#3D8F73]" />
              تفعيل زر تبديل اللغة (AR/EN)
            </label>
            <div>
              <label className="text-sm text-neutral-300">اللغة الافتراضية</label>
              <select value={form.default_language} onChange={(e) => set('default_language', e.target.value)} className={inputCls}>
                <option value="ar">عربي</option>
                <option value="en">إنجليزي</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-neutral-300">حالة الكارت</label>
              <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputCls}>
                <option value="active">نشط</option>
                <option value="suspended">موقوف</option>
                <option value="expired">منتهي</option>
              </select>
            </div>
            <div><label className="text-sm text-neutral-300">تاريخ التجديد</label><input type="date" value={form.renewal_date || ''} onChange={(e) => set('renewal_date', e.target.value)} className={inputCls} dir="ltr" /></div>
            <label className="flex items-center gap-3 text-sm text-neutral-200">
              <input type="checkbox" checked={form.auto_suspend} onChange={(e) => set('auto_suspend', e.target.checked)} className="w-4 h-4 accent-[#3D8F73]" />
              الإيقاف التلقائي عند انتهاء التجديد
            </label>
          </Section>

          {error && <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3">{error}</div>}
          <button onClick={save} disabled={saving} className="w-full rounded-xl bg-[#3D8F73] hover:bg-[#4ca088] disabled:opacity-50 text-white font-semibold py-3 flex items-center justify-center gap-2">
            <Save className="w-5 h-5" /> {saving ? 'جارٍ الحفظ...' : 'حفظ العميل'}
          </button>
          {isEdit && form.slug && (
            <button onClick={() => setShowNfc(true)} className="w-full rounded-xl bg-neutral-800/70 hover:bg-neutral-700 text-neutral-200 font-semibold py-3 flex items-center justify-center gap-2">
              <NfcIcon className="w-5 h-5 text-[#5fbf9c]" /> ربط كارت NFC
            </button>
          )}
          {showNfc && <NfcWriter slug={form.slug} clientName={form.name} onClose={() => setShowNfc(false)} />}
        </div>

        <div className="lg:sticky lg:top-8 self-start">
          <div className="rounded-2xl border border-neutral-800 overflow-hidden">
            <div className="bg-neutral-900 px-4 py-2 text-xs text-neutral-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#3D8F73]" /> معاينة مباشرة
            </div>
            <div className="max-h-[640px] overflow-y-auto">
              {isCustom && customTpl ? (
                <CustomTemplate client={previewClient} lang={form.default_language || 'ar'} tpl={customTpl} recordEvent={() => {}} />
              ) : isCustom ? (
                <div className="p-10 text-center text-neutral-500 text-sm">اختر قالباً مخصصاً لعرض المعاينة</div>
              ) : (
                (() => { const PreviewComp = PREVIEW[form.template] || GeneralTemplate; return <PreviewComp client={previewClient} lang={form.default_language || 'ar'} theme={form.template === 'dmr' ? 'dark' : 'light'} recordEvent={() => {}} />; })()
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}