import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useCustomAuth } from '@/lib/customAuth';
import { ArrowRight, Save, Trash2, Plus } from 'lucide-react';
import { TYPE_META, BUTTON_TYPES, SHAPES, SOCIAL_ICONS, isDark, shapeClass, PLACEHOLDER_CLIENT } from '@/components/cards/buttonTypes';

const DEFAULT_LAYOUT = {
  bg_color: '#0a0a0a', accent_color: '#3D8F73',
  show_profile: true, profile_shape: 'circle',
  show_name: true, show_job_title: true, show_bio: true,
  show_address: true, show_website: true, show_social: true, social_shape: 'circle'
};

const inputCls = 'w-full rounded-lg bg-[#050505] border border-neutral-800 px-3 py-2.5 text-sm text-white outline-none focus:border-[#3D8F73]';
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const newId = () => 'b' + Math.random().toString(36).slice(2, 8);

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-[#0c0c0c] p-5 space-y-3">
      <h3 className="text-sm font-bold text-[#5fbf9c]">{title}</h3>
      {children}
    </div>
  );
}

function ColorRow({ label, value, onChange }) {
  return (
    <div>
      <label className="text-sm text-neutral-300">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value || '#3D8F73'} onChange={(e) => onChange(e.target.value)} className="w-12 h-10 rounded bg-transparent border border-neutral-800" />
        <input value={value || ''} onChange={(e) => onChange(e.target.value)} className={inputCls} dir="ltr" />
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between text-sm text-neutral-200 cursor-pointer">
      <span>{label}</span>
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 accent-[#3D8F73]" />
    </label>
  );
}

function DraggableButton({ btn, canvasRef, selected, onSelect, onMove }) {
  const onDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(btn.id);
    const startX = e.clientX, startY = e.clientY;
    const ox = btn.x, oy = btn.y;
    const move = (ev) => {
      const c = canvasRef.current;
      if (!c) return;
      const r = c.getBoundingClientRect();
      const dx = ((ev.clientX - startX) / r.width) * 100;
      const dy = ((ev.clientY - startY) / r.height) * 100;
      onMove(btn.id, clamp(ox + dx, 4, 96), clamp(oy + dy, 6, 96));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  const Icon = TYPE_META[btn.type] && TYPE_META[btn.type].icon;
  const cls = shapeClass(btn.shape);
  return (
    <div
      onPointerDown={onDown}
      style={{ left: btn.x + '%', top: btn.y + '%', background: btn.color || '#3D8F73', color: '#fff', touchAction: 'none' }}
      className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing shadow-lg select-none ${cls} ${selected ? 'ring-2 ring-white ring-offset-2 ring-offset-[#3D8F73]' : 'ring-1 ring-white/10'}`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {btn.shape === 'pill' && btn.label && <span className="text-sm font-medium px-1">{btn.label}</span>}
    </div>
  );
}

function CanvasContent({ layout }) {
  const dark = isDark(layout.bg_color || '#0a0a0a');
  const text = dark ? '#fff' : '#1a1a1a';
  const sub = dark ? '#cfcfcf' : '#555';
  const accent = layout.accent_color || '#3D8F73';
  const p = PLACEHOLDER_CLIENT;
  const profileShape = layout.profile_shape === 'circle' ? 'w-24 h-24 rounded-full'
    : layout.profile_shape === 'square' ? 'w-24 h-24 rounded-xl' : 'w-24 h-24 rounded-2xl';
  const socialShape = layout.social_shape === 'circle' ? 'w-8 h-8 rounded-full'
    : layout.social_shape === 'square' ? 'w-8 h-8 rounded-xl' : 'w-8 h-8 rounded-2xl';
  return (
    <div className="text-center px-6 pt-10">
      {layout.show_profile && (
        <div className={`mx-auto bg-neutral-700/50 flex items-center justify-center text-white text-2xl font-bold ${profileShape}`}>ع</div>
      )}
      {layout.show_name && <h1 className="mt-4 text-xl font-bold" style={{ color: text }}>{p.name}</h1>}
      {layout.show_job_title && <p className="mt-1 text-sm" style={{ color: accent }}>{p.job_title}</p>}
      {layout.show_bio && <p className="mt-3 text-xs leading-relaxed" style={{ color: sub }}>{p.bio}</p>}
      {layout.show_address && <p className="mt-3 text-xs" style={{ color: sub }}>{p.address}</p>}
      {layout.show_website && <p className="mt-2 text-xs" style={{ color: accent }}>example.com</p>}
      {layout.show_social && (
        <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
          {['facebook', 'instagram', 'twitter', 'linkedin', 'youtube'].map((k) => {
            const I = SOCIAL_ICONS[k];
            return <span key={k} className={`flex items-center justify-center ${socialShape}`} style={{ background: accent + '22', color: accent }}><I className="w-4 h-4" /></span>;
          })}
        </div>
      )}
    </div>
  );
}

export default function TemplateBuilder() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { session } = useCustomAuth();
  const canvasRef = useRef(null);
  const [tpl, setTpl] = useState({ name: '', layout: DEFAULT_LAYOUT, buttons: [] });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const t = await base44.entities.Template.get(id);
        setTpl({ name: t.name || '', layout: { ...DEFAULT_LAYOUT, ...(t.layout || {}) }, buttons: t.buttons || [] });
      } catch { setError('تعذر تحميل القالب'); }
      setLoading(false);
    })();
  }, [id]);

  const setLayout = (k, v) => setTpl((t) => ({ ...t, layout: { ...t.layout, [k]: v } }));
  const addButton = (type) => {
    const b = { id: newId(), type, label: TYPE_META[type].label, shape: 'circle', color: '#3D8F73', x: 50, y: clamp(78 - tpl.buttons.length * 7, 30, 90) };
    setTpl((t) => ({ ...t, buttons: [...t.buttons, b] }));
    setSelected(b.id);
  };
  const moveButton = (bid, x, y) => setTpl((t) => ({ ...t, buttons: t.buttons.map((b) => (b.id === bid ? { ...b, x, y } : b)) }));
  const updateButton = (bid, patch) => setTpl((t) => ({ ...t, buttons: t.buttons.map((b) => (b.id === bid ? { ...b, ...patch } : b)) }));
  const removeButton = (bid) => { setTpl((t) => ({ ...t, buttons: t.buttons.filter((b) => b.id !== bid) })); setSelected(null); };

  const save = async () => {
    setError('');
    if (!tpl.name.trim()) { setError('اسم القالب مطلوب'); return; }
    setSaving(true);
    try {
      const payload = { name: tpl.name.trim(), layout: tpl.layout, buttons: tpl.buttons };
      const op = isEdit ? 'updateTemplate' : 'createTemplate';
      const data = isEdit ? { id, ...payload } : payload;
      const r = await base44.functions.invoke('staffAction', { token: session.token, op, data });
      if (r && r.data && r.data.error) throw new Error(r.data.error);
      navigate('/admin/templates');
    } catch (e) {
      setError((e && e.response && e.response.data && e.response.data.error) || (e && e.message) || 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-neutral-400">جارٍ التحميل...</div>;

  const sel = tpl.buttons.find((b) => b.id === selected);

  return (
    <div className="p-4 md:p-8">
      <button onClick={() => navigate('/admin/templates')} className="flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-200 mb-4">
        <ArrowRight className="w-4 h-4" /> رجوع للقوالب
      </button>
      <h1 className="text-2xl font-bold text-white mb-6">{isEdit ? 'تعديل قالب' : 'قالب جديد'}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:sticky lg:top-8 self-start">
          <div ref={canvasRef} className="relative mx-auto max-w-sm aspect-[9/16] rounded-2xl overflow-hidden border border-neutral-800" style={{ background: tpl.layout.bg_color }}>
            <CanvasContent layout={tpl.layout} />
            {tpl.buttons.map((b) => (
              <DraggableButton key={b.id} btn={b} canvasRef={canvasRef} selected={selected === b.id} onSelect={setSelected} onMove={moveButton} />
            ))}
          </div>
          <p className="text-xs text-neutral-500 mt-2 text-center">اسحب الأزرار لترتيبها • اضغط على زر لتحديده وتعديله من اليمين</p>
        </div>

        <div className="space-y-5">
          <Section title="اسم القالب">
            <input value={tpl.name} onChange={(e) => setTpl((t) => ({ ...t, name: e.target.value }))} className={inputCls} placeholder="مثال: قالب فعاليات" />
          </Section>

          <Section title="الخلفية والألوان">
            <ColorRow label="لون الخلفية" value={tpl.layout.bg_color} onChange={(v) => setLayout('bg_color', v)} />
            <ColorRow label="اللون المميز" value={tpl.layout.accent_color} onChange={(v) => setLayout('accent_color', v)} />
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-xs text-neutral-500">نماذج:</span>
              {['#0a0a0a', '#ffffff', '#0f1f1a', '#1a1023', '#f5f0e6', '#101820', '#2a1a1a'].map((c) => (
                <button key={c} type="button" onClick={() => setLayout('bg_color', c)} className="w-7 h-7 rounded-full border border-neutral-700" style={{ background: c }} />
              ))}
            </div>
          </Section>

          <Section title="الأقسام">
            <Toggle label="صورة البروفايل" checked={tpl.layout.show_profile} onChange={(v) => setLayout('show_profile', v)} />
            {tpl.layout.show_profile && (
              <div>
                <label className="text-sm text-neutral-300">شكل الصورة</label>
                <select value={tpl.layout.profile_shape} onChange={(e) => setLayout('profile_shape', e.target.value)} className={inputCls}>
                  <option value="circle">دائرة</option>
                  <option value="rounded">مدور</option>
                  <option value="square">مربع</option>
                </select>
              </div>
            )}
            <Toggle label="الاسم" checked={tpl.layout.show_name} onChange={(v) => setLayout('show_name', v)} />
            <Toggle label="المسمى الوظيفي" checked={tpl.layout.show_job_title} onChange={(v) => setLayout('show_job_title', v)} />
            <Toggle label="النبذة" checked={tpl.layout.show_bio} onChange={(v) => setLayout('show_bio', v)} />
            <Toggle label="العنوان" checked={tpl.layout.show_address} onChange={(v) => setLayout('show_address', v)} />
            <Toggle label="الموقع الإلكتروني" checked={tpl.layout.show_website} onChange={(v) => setLayout('show_website', v)} />
            <Toggle label="أيقونات التواصل الاجتماعي" checked={tpl.layout.show_social} onChange={(v) => setLayout('show_social', v)} />
            {tpl.layout.show_social && (
              <div>
                <label className="text-sm text-neutral-300">شكل أيقونات السوشيال</label>
                <select value={tpl.layout.social_shape} onChange={(e) => setLayout('social_shape', e.target.value)} className={inputCls}>
                  <option value="circle">دائرة</option>
                  <option value="rounded">مدور</option>
                  <option value="square">مربع</option>
                </select>
              </div>
            )}
          </Section>

          <Section title="إضافة أزرار">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {BUTTON_TYPES.map((t) => {
                const M = TYPE_META[t];
                const Icon = M.icon;
                return (
                  <button key={t} type="button" onClick={() => addButton(t)} className="rounded-xl border border-neutral-800 px-2 py-2.5 text-[11px] text-neutral-300 hover:border-[#3D8F73] flex flex-col items-center gap-1">
                    <Icon className="w-4 h-4" />
                    {M.label}
                  </button>
                );
              })}
            </div>
          </Section>

          {sel && (
            <Section title="تعديل الزر المحدد">
              <div>
                <label className="text-sm text-neutral-300">نوع الزر</label>
                <select value={sel.type} onChange={(e) => updateButton(sel.id, { type: e.target.value, label: TYPE_META[e.target.value].label })} className={inputCls}>
                  {BUTTON_TYPES.map((t) => <option key={t} value={t}>{TYPE_META[t].label}</option>)}
                </select>
              </div>
              {sel.shape === 'pill' && (
                <div>
                  <label className="text-sm text-neutral-300">نص الزر</label>
                  <input value={sel.label || ''} onChange={(e) => updateButton(sel.id, { label: e.target.value })} className={inputCls} />
                </div>
              )}
              <div>
                <label className="text-sm text-neutral-300">الشكل</label>
                <select value={sel.shape} onChange={(e) => updateButton(sel.id, { shape: e.target.value })} className={inputCls}>
                  {SHAPES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>
              <ColorRow label="لون الزر" value={sel.color} onChange={(v) => updateButton(sel.id, { color: v })} />
              <button type="button" onClick={() => removeButton(sel.id)} className="w-full rounded-xl bg-red-500/15 text-red-300 py-2.5 flex items-center justify-center gap-2 text-sm">
                <Trash2 className="w-4 h-4" /> حذف الزر
              </button>
            </Section>
          )}

          {error && <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3">{error}</div>}
          <button onClick={save} disabled={saving} className="w-full rounded-xl bg-[#3D8F73] hover:bg-[#4ca088] disabled:opacity-50 text-white font-semibold py-3 flex items-center justify-center gap-2">
            <Save className="w-5 h-5" /> {saving ? 'جارٍ الحفظ...' : 'حفظ القالب'}
          </button>
        </div>
      </div>
    </div>
  );
}