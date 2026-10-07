import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useCustomAuth } from '@/lib/customAuth';
import { Eye, MessageCircle, Phone, Download } from 'lucide-react';

const RANGES = [
  { key: '7', label: 'آخر 7 أيام' },
  { key: '30', label: 'آخر 30 يوم' },
  { key: 'all', label: 'الكل' }
];

const TYPES = [
  { key: 'visit', label: 'الزيارات', icon: Eye, color: '#3D8F73' },
  { key: 'whatsapp', label: 'واتساب', icon: MessageCircle, color: '#25D366' },
  { key: 'call', label: 'الاتصال', icon: Phone, color: '#555' },
  { key: 'vcard', label: 'تحميل vCard', icon: Download, color: '#888' }
];

export default function Stats() {
  const { hasPerm } = useCustomAuth();
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState('');
  const [range, setRange] = useState('30');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await base44.entities.Client.filter({}, { sort: '-created_date', limit: 100, fields: ['name', 'slug'] });
      setClients(res.items || []);
      if (res.items?.[0]) setSelected(res.items[0].id);
    })();
  }, []);

  useEffect(() => {
    if (!selected) return;
    (async () => {
      setLoading(true);
      const query = { card_id: selected };
      if (range !== 'all') {
        const since = new Date(); since.setDate(since.getDate() - Number(range));
        query.created_date = { $gte: since.toISOString() };
      }
      try {
        const agg = await base44.entities.CardEvent.aggregate({ query, groupBy: 'event_type' });
        const map = {};
        (agg.rows || []).forEach((r) => { map[r.event_type] = r.count; });
        setData(map);
      } catch { setData({}); }
      setLoading(false);
    })();
  }, [selected, range]);

  if (!hasPerm('view_stats')) {
    return <div className="p-8 text-center text-neutral-500">لا تملك صلاحية عرض الإحصائيات</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold text-white mb-6">الإحصائيات</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select value={selected} onChange={(e) => setSelected(e.target.value)} className="rounded-xl bg-[#0c0c0c] border border-neutral-800 px-3 py-2.5 text-sm text-white outline-none focus:border-[#3D8F73] flex-1">
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={range} onChange={(e) => setRange(e.target.value)} className="rounded-xl bg-[#0c0c0c] border border-neutral-800 px-3 py-2.5 text-sm text-white outline-none focus:border-[#3D8F73]">
          {RANGES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center text-neutral-500 py-16">جارٍ التحميل...</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {TYPES.map(({ key, label, icon: Icon, color }) => (
            <div key={key} className="rounded-2xl border border-neutral-800 bg-[#0c0c0c] p-5">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: color + '22', color }}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-3xl font-bold text-white">{data[key] || 0}</div>
              <div className="text-sm text-neutral-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-neutral-600 mt-6">عدّادات فقط بدون جمع بيانات شخصية للزوار. © Plus Studio</p>
    </div>
  );
}