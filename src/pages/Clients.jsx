import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useCustomAuth } from '@/lib/customAuth';
import { TEMPLATE_LABEL } from '@/lib/templates';
import NfcWriter from '@/components/cards/NfcWriter';
import { Search, Plus, ExternalLink, Copy, Pencil, Power, Trash2, AlertTriangle, Nfc } from 'lucide-react';

function fmt(d) {
  if (!d) return '';
  return new Date(d).toISOString().slice(0, 10);
}

function daysToRenewal(date) {
  if (!date) return null;
  const today = new Date(new Date().toDateString());
  const d = new Date(new Date(date).toDateString());
  return Math.round((d - today) / 86400000);
}

export default function Clients() {
  const navigate = useNavigate();
  const { session, hasPerm } = useCustomAuth();
  const [clients, setClients] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [templateFilter, setTemplateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteCode, setDeleteCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [nfcClient, setNfcClient] = useState(null);

  const canEdit = hasPerm('manage_clients');

  const load = async () => {
    setLoading(true);
    const q = {};
    if (search.trim()) q.name = { $regex: search.trim(), $options: 'i' };
    if (templateFilter !== 'all') q.template = templateFilter;
    const today = new Date(new Date().toDateString());
    if (statusFilter === 'active' || statusFilter === 'suspended') q.status = statusFilter;
    else if (statusFilter === 'expiring') {
      const f = new Date(today); f.setDate(f.getDate() + 14);
      q.renewal_date = { $gte: fmt(today), $lte: fmt(f) };
      q.status = 'active';
    } else if (statusFilter === 'expired') {
      q.renewal_date = { $lt: fmt(today) };
    }
    const res = await base44.entities.Client.filter(q, { sort: '-created_date', limit: 100 });
    setClients(res.items || []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [search, templateFilter, statusFilter]);

  useEffect(() => {
    (async () => {
      try {
        const agg = await base44.entities.CardEvent.aggregate({ query: { event_type: 'visit' }, groupBy: 'card_id' });
        const map = {};
        (agg.rows || []).forEach((r) => { map[r.card_id] = r.count; });
        setCounts(map);
      } catch {}
    })();
  }, []);

  const act = async (op, data) => {
    setBusy(true);
    try {
      const r = await base44.functions.invoke('staffAction', { token: session.token, op, data });
      if (r?.data?.error) { alert(r.data.error); return false; }
      return true;
    } catch (e) {
      alert(e?.response?.data?.error || e?.message || 'فشل العملية');
      return false;
    } finally { setBusy(false); }
  };

  const toggleStatus = async (c) => {
    const next = c.status === 'active' ? 'suspended' : 'active';
    if (await act('setClientStatus', { id: c.id, status: next })) load();
  };
  const duplicate = async (c) => {
    if (await act('duplicateClient', { id: c.id })) load();
  };
  const doDelete = async () => {
    if (deleteCode !== '0000') { alert('رمز التأكيد غير صحيح'); return; }
    if (await act('deleteClient', { id: confirmDelete.id })) {
      setConfirmDelete(null); setDeleteCode('');
      load();
    }
  };

  const copyLink = (c) => {
    const url = `${window.location.origin}/${c.slug}`;
    navigator.clipboard.writeText(url).then(() => alert('تم نسخ الرابط'));
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-white">العملاء</h1>
        {canEdit && (
          <button onClick={() => navigate('/admin/clients/new')} className="flex items-center justify-center gap-2 rounded-xl bg-[#3D8F73] hover:bg-[#4ca088] text-white font-semibold px-4 py-2.5 text-sm">
            <Plus className="w-4 h-4" /> إضافة عميل جديد
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالاسم..."
            className="w-full rounded-xl bg-[#0c0c0c] border border-neutral-800 pr-10 pl-4 py-2.5 text-sm text-white outline-none focus:border-[#3D8F73]" />
        </div>
        <select value={templateFilter} onChange={(e) => setTemplateFilter(e.target.value)} className="rounded-xl bg-[#0c0c0c] border border-neutral-800 px-3 py-2.5 text-sm text-white outline-none focus:border-[#3D8F73]">
          <option value="all">كل القوالب</option>
          {Object.entries(TEMPLATE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl bg-[#0c0c0c] border border-neutral-800 px-3 py-2.5 text-sm text-white outline-none focus:border-[#3D8F73]">
          <option value="all">كل الحالات</option>
          <option value="active">نشط</option>
          <option value="suspended">موقوف</option>
          <option value="expiring">قريب الانتهاء</option>
          <option value="expired">منتهي</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center text-neutral-500 py-16">جارٍ التحميل...</div>
      ) : clients.length === 0 ? (
        <div className="text-center text-neutral-500 py-16">لا يوجد عملاء مطابقون</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map((c) => {
            const days = daysToRenewal(c.renewal_date);
            const expiring = days !== null && days <= 14 && days >= 0 && c.status === 'active';
            const expired = days !== null && days < 0;
            const statusColor = c.status === 'suspended' ? 'bg-amber-500/15 text-amber-300' : expired ? 'bg-red-500/15 text-red-300' : expiring ? 'bg-orange-500/15 text-orange-300' : 'bg-emerald-500/15 text-emerald-300';
            const statusLabel = c.status === 'suspended' ? 'موقوف' : expired ? 'منتهي' : expiring ? `ينتهي خلال ${days} يوم` : 'نشط';
            return (
              <div key={c.id} className="rounded-2xl border border-neutral-800 bg-[#0c0c0c] p-4 flex flex-col">
                <div className="flex items-start gap-3">
                  {c.profile_image ? <img src={c.profile_image} alt="" className="w-12 h-12 rounded-full object-cover" /> : <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-500">{(c.name || '?')[0]}</div>}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white truncate">{c.name || '—'}</div>
                    <div className="text-xs text-neutral-500">{TEMPLATE_LABEL[c.template] || c.template}</div>
                  </div>
                  <span className={`text-[11px] px-2 py-1 rounded-full ${statusColor}`}>{statusLabel}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-neutral-400">
                  <div>التجديد: <span className="text-neutral-200">{c.renewal_date || '—'}</span></div>
                  <div>الزيارات: <span className="text-neutral-200">{counts[c.id] || 0}</span></div>
                </div>
                <div className="flex items-center gap-1 mt-3 text-xs text-neutral-500 truncate" dir="ltr">/{c.slug}</div>
                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  <a href={`/${c.slug}`} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-neutral-800/60 text-neutral-300 hover:bg-neutral-700" title="فتح الكارت"><ExternalLink className="w-4 h-4" /></a>
                  <button onClick={() => copyLink(c)} className="p-2 rounded-lg bg-neutral-800/60 text-neutral-300 hover:bg-neutral-700" title="نسخ الرابط"><Copy className="w-4 h-4" /></button>
                  {canEdit && <button onClick={() => navigate(`/admin/clients/${c.id}/edit`)} className="p-2 rounded-lg bg-neutral-800/60 text-neutral-300 hover:bg-neutral-700" title="تعديل"><Pencil className="w-4 h-4" /></button>}
                  {canEdit && <button onClick={() => duplicate(c)} disabled={busy} className="p-2 rounded-lg bg-neutral-800/60 text-neutral-300 hover:bg-neutral-700" title="نسخ الكارت"><Copy className="w-4 h-4" /></button>}
                  {canEdit && <button onClick={() => toggleStatus(c)} disabled={busy} className="p-2 rounded-lg bg-neutral-800/60 text-neutral-300 hover:bg-neutral-700" title="تفعيل/إيقاف"><Power className="w-4 h-4" /></button>}
                  <button onClick={() => setNfcClient(c)} className="p-2 rounded-lg bg-neutral-800/60 text-neutral-300 hover:bg-neutral-700" title="ربط NFC"><Nfc className="w-4 h-4" /></button>
                  {canEdit && <button onClick={() => setConfirmDelete(c)} className="p-2 rounded-lg bg-red-500/15 text-red-300 hover:bg-red-500/25" title="حذف"><Trash2 className="w-4 h-4" /></button>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-5" onClick={() => setConfirmDelete(null)}>
          <div className="bg-[#0c0c0c] border border-red-500/30 rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 text-red-300 mb-3"><AlertTriangle className="w-6 h-6" /><h3 className="font-bold text-lg">تأكيد الحذف</h3></div>
            <p className="text-sm text-neutral-300 mb-2">سيتم حذف عميل <b>{confirmDelete.name}</b> نهائياً.</p>
            <p className="text-sm text-neutral-400 mb-3">أدخل الرمز <span className="font-mono text-[#5fbf9c]">0000</span> للتأكيد:</p>
            <input value={deleteCode} onChange={(e) => setDeleteCode(e.target.value)} className="w-full rounded-xl bg-[#050505] border border-neutral-800 px-4 py-2.5 text-white text-center font-mono tracking-widest" placeholder="0000" />
            <div className="flex gap-2 mt-4">
              <button onClick={doDelete} disabled={busy} className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-semibold py-2.5">حذف</button>
              <button onClick={() => { setConfirmDelete(null); setDeleteCode(''); }} className="px-4 rounded-xl bg-neutral-800 text-neutral-300">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {nfcClient && <NfcWriter slug={nfcClient.slug} clientName={nfcClient.name} onClose={() => setNfcClient(null)} />}
    </div>
  );
}