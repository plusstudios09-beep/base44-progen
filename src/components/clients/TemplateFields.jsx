import { Plus, Trash2 } from 'lucide-react';

const CONFIGS = {
  general: [{ key: 'services', label: 'الخدمات (قائمة)', type: 'list' }],
  lawyer: [
    { key: 'license_number', label: 'رقم الترخيص', type: 'text' },
    { key: 'specialties', label: 'التخصصات (قائمة)', type: 'list' }
  ],
  real_estate: [
    { key: 'services', label: 'الخدمات (قائمة)', type: 'list' },
    { key: 'properties', label: 'العقارات المميزة', type: 'objectList', fields: [
      { key: 'title', label: 'العنوان' },
      { key: 'price', label: 'السعر' },
      { key: 'details', label: 'التفاصيل' }
    ] }
  ],
  grocery: [
    { key: 'delivery_number', label: 'رقم التوصيل', type: 'text' },
    { key: 'opening_hours', label: 'ساعات العمل', type: 'text' }
  ],
  dmr: [
    { key: 'tagline', label: 'الوصف (عربي)', type: 'text' },
    { key: 'tagline_en', label: 'Tagline (EN)', type: 'text' }
  ]
};

const inputCls = 'w-full rounded-lg bg-[#050505] border border-neutral-800 px-3 py-2 text-sm text-white outline-none focus:border-[#3D8F73]';

export default function TemplateFields({ template, data = {}, onChange }) {
  const cfg = CONFIGS[template] || [];
  const set = (k, v) => onChange({ ...data, [k]: v });

  return (
    <div className="space-y-4">
      {cfg.map((field) => {
        if (field.type === 'text') {
          return (
            <div key={field.key}>
              <label className="text-sm text-neutral-300">{field.label}</label>
              <input value={data[field.key] || ''} onChange={(e) => set(field.key, e.target.value)} className={inputCls} />
            </div>
          );
        }
        if (field.type === 'list') {
          const arr = data[field.key] || [];
          return (
            <div key={field.key}>
              <label className="text-sm text-neutral-300">{field.label}</label>
              <div className="space-y-2 mt-1">
                {arr.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={item} onChange={(e) => { const n = [...arr]; n[i] = e.target.value; set(field.key, n); }} className={inputCls} />
                    <button type="button" onClick={() => set(field.key, arr.filter((_, x) => x !== i))} className="text-red-400 px-2"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <button type="button" onClick={() => set(field.key, [...arr, ''])} className="text-sm text-[#5fbf9c] flex items-center gap-1"><Plus className="w-4 h-4" /> إضافة</button>
              </div>
            </div>
          );
        }
        if (field.type === 'objectList') {
          const arr = data[field.key] || [];
          return (
            <div key={field.key}>
              <label className="text-sm text-neutral-300">{field.label}</label>
              <div className="space-y-3 mt-1">
                {arr.map((item, i) => (
                  <div key={i} className="rounded-xl border border-neutral-800 p-3 space-y-2 relative">
                    <button type="button" onClick={() => set(field.key, arr.filter((_, x) => x !== i))} className="absolute top-2 left-2 text-red-400"><Trash2 className="w-4 h-4" /></button>
                    {field.fields.map((f) => (
                      <div key={f.key}>
                        <label className="text-xs text-neutral-400">{f.label}</label>
                        <input value={item[f.key] || ''} onChange={(e) => { const n = [...arr]; n[i] = { ...n[i], [f.key]: e.target.value }; set(field.key, n); }} className={inputCls} />
                      </div>
                    ))}
                  </div>
                ))}
                <button type="button" onClick={() => set(field.key, [...arr, {}])} className="text-sm text-[#5fbf9c] flex items-center gap-1"><Plus className="w-4 h-4" /> إضافة</button>
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}