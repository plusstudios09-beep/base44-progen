import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useCustomAuth } from '@/lib/customAuth';
import { Plus, Pencil, Trash2, LayoutGrid } from 'lucide-react';

export default function Templates() {
  const navigate = useNavigate();
  const { session, hasPerm } = useCustomAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const canEdit = hasPerm('manage_clients');

  const load = async () => {
    const r = await base44.entities.Template.filter({}, { sort: '-created_date', limit: 100 });
    setItems(r.items || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const del = async (t) => {
    if (!confirm(`حذف قالب "${t.name}"؟`)) return;
    const r = await base44.functions.invoke('staffAction', { token: session.token, op: 'deleteTemplate', data: { id: t.id } });
    if (r && r.data && r.data.error) { alert(r.data.error); return; }
    load();
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <h1 className="text-2xl font-bold text-white">القوالب المخصصة</h1>
        {canEdit && (
          <button onClick={() => navigate('/admin/templates/new')} className="flex items-center justify-center gap-2 rounded-xl bg-[#3D8F73] hover:bg-[#4ca088] text-white font-semibold px-4 py-2.5 text-sm">
            <Plus className="w-4 h-4" /> قالب جديد
          </button>
        )}
      </div>
      <p className="text-xs text-neutral-500 mb-6">القوالب الخمسة الأساسية ثابتة. هنا تنشئ قوالب إضافية بمكان حر للأيقونات وأشكال مخصصة.</p>

      {loading ? (
        <div className="text-center text-neutral-500 py-16">جارٍ التحميل...</div>
      ) : items.length === 0 ? (
        <div className="text-center text-neutral-500 py-16">
          <LayoutGrid className="w-10 h-10 mx-auto mb-3 opacity-40" />
          لا توجد قوالب مخصصة بعد
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((t) => (
            <div key={t.id} className="rounded-2xl border border-neutral-800 bg-[#0c0c0c] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-neutral-500 mt-0.5">{(t.buttons || []).length} أزرار</div>
                </div>
                <div className="w-10 h-10 rounded-xl border border-neutral-700" style={{ background: (t.layout || {}).bg_color || '#0a0a0a' }} />
              </div>
              {canEdit && (
                <div className="flex gap-2 mt-4">
                  <button onClick={() => navigate(`/admin/templates/${t.id}/edit`)} className="flex-1 rounded-lg bg-neutral-800/60 text-neutral-300 hover:bg-neutral-700 py-2 flex items-center justify-center gap-2 text-sm">
                    <Pencil className="w-4 h-4" /> تعديل
                  </button>
                  <button onClick={() => del(t)} className="px-3 rounded-lg bg-red-500/15 text-red-300 hover:bg-red-500/25 py-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}