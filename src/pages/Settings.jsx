import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useCustomAuth } from '@/lib/customAuth';
import { Plus, Trash2, Pencil, ShieldCheck } from 'lucide-react';

const inputCls = 'w-full rounded-lg bg-[#050505] border border-neutral-800 px-3 py-2.5 text-sm text-white outline-none focus:border-[#3D8F73]';
const PERM_LABELS = {
  manage_clients: 'إدارة العملاء', manage_staff: 'إدارة الموظفين', manage_settings: 'الإعدادات', view_stats: 'الإحصائيات'
};

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-[#0c0c0c] p-5 space-y-3">
      <h3 className="text-sm font-bold text-[#5fbf9c]">{title}</h3>
      {children}
    </div>
  );
}

export default function Settings() {
  const { session, user, hasPerm } = useCustomAuth();
  const [tab, setTab] = useState('account');
  const [staff, setStaff] = useState([]);

  // account form
  const [newUsername, setNewUsername] = useState('');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [msg, setMsg] = useState('');

  // staff form
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [sf, setSf] = useState({ username: '', password: '', full_name: '', role: 'staff', permissions: {} });

  const call = async (op, data) => {
    try {
      const r = await base44.functions.invoke('staffAction', { token: session.token, op, data });
      if (r?.data?.error) { setMsg(r.data.error); return false; }
      return true;
    } catch (e) {
      setMsg(e?.response?.data?.error || e?.message || 'فشل');
      return false;
    }
  };

  const changeUsername = async () => {
    setMsg('');
    if (!newUsername.trim() || !currentPw) { setMsg('أكمل البيانات'); return; }
    if (await call('changeUsername', { newUsername, currentPassword: currentPw })) {
      setMsg('تم تغيير اسم المستخدم'); setNewUsername(''); setCurrentPw('');
    }
  };
  const changePassword = async () => {
    setMsg('');
    if (!currentPw || !newPw) { setMsg('أكمل البيانات'); return; }
    if (newPw.length < 4) { setMsg('كلمة المرور قصيرة'); return; }
    if (await call('changePassword', { currentPassword: currentPw, newPassword: newPw })) {
      setMsg('تم تغيير كلمة المرور'); setCurrentPw(''); setNewPw('');
    }
  };

  const loadStaff = async () => {
    const r = await base44.functions.invoke('staffAction', { token: session.token, op: 'listStaff' });
    if (r?.data?.staff) setStaff(r.data.staff);
  };
  useEffect(() => { if (hasPerm('manage_staff')) loadStaff(); /* eslint-disable-next-line */ }, []);

  const saveStaff = async () => {
    setMsg('');
    if (!sf.username || (!sf.password && !editId)) { setMsg('أكمل البيانات'); return; }
    const op = editId ? 'updateStaff' : 'createStaff';
    const data = editId ? { id: editId, ...sf } : sf;
    if (await call(op, data)) { setShowStaffForm(false); setEditId(null); setSf({ username: '', password: '', full_name: '', role: 'staff', permissions: {} }); loadStaff(); }
  };
  const deleteStaff = async (id) => {
    if (!confirm('حذف هذا الحساب؟')) return;
    if (await call('deleteStaff', { id })) loadStaff();
  };
  const editStaff = (s) => { setEditId(s.id); setSf({ username: s.username, password: '', full_name: s.full_name || '', role: s.role, permissions: s.permissions || {} }); setShowStaffForm(true); };

  const roleLabel = (r) => r === 'owner' ? 'المالك' : r === 'admin' ? 'مدير' : 'موظف';

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">الإعدادات</h1>

      <div className="flex gap-2 mb-5">
        <button onClick={() => setTab('account')} className={`px-4 py-2 rounded-xl text-sm ${tab === 'account' ? 'bg-[#3D8F73] text-white' : 'bg-[#0c0c0c] border border-neutral-800 text-neutral-400'}`}>حسابي</button>
        {hasPerm('manage_staff') && <button onClick={() => setTab('staff')} className={`px-4 py-2 rounded-xl text-sm ${tab === 'staff' ? 'bg-[#3D8F73] text-white' : 'bg-[#0c0c0c] border border-neutral-800 text-neutral-400'}`}>الموظفون</button>}
      </div>

      {msg && <div className="rounded-xl bg-[#3D8F73]/10 border border-[#3D8F73]/30 text-[#5fbf9c] text-sm px-4 py-3 mb-4">{msg}</div>}

      {tab === 'account' && (
        <div className="space-y-5">
          <Section title="تغيير اسم المستخدم">
            <div><label className="text-sm text-neutral-300">اسم المستخدم الجديد</label><input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className={inputCls} dir="ltr" /></div>
            <div><label className="text-sm text-neutral-300">كلمة المرور الحالية</label><input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className={inputCls} dir="ltr" /></div>
            <button onClick={changeUsername} disabled={!hasPerm('manage_settings') && user?.role !== 'owner'} className="rounded-xl bg-[#3D8F73] hover:bg-[#4ca088] disabled:opacity-50 text-white font-semibold px-4 py-2.5 text-sm">حفظ اسم المستخدم</button>
          </Section>
          <Section title="تغيير كلمة المرور">
            <div><label className="text-sm text-neutral-300">كلمة المرور الحالية</label><input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className={inputCls} dir="ltr" /></div>
            <div><label className="text-sm text-neutral-300">كلمة المرور الجديدة</label><input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className={inputCls} dir="ltr" /></div>
            <button onClick={changePassword} disabled={!hasPerm('manage_settings') && user?.role !== 'owner'} className="rounded-xl bg-[#3D8F73] hover:bg-[#4ca088] disabled:opacity-50 text-white font-semibold px-4 py-2.5 text-sm">حفظ كلمة المرور</button>
          </Section>
        </div>
      )}

      {tab === 'staff' && hasPerm('manage_staff') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-400">إدارة حسابات الموظفين والصلاحيات</p>
            <button onClick={() => { setEditId(null); setSf({ username: '', password: '', full_name: '', role: 'staff', permissions: {} }); setShowStaffForm(true); }} className="flex items-center gap-2 rounded-xl bg-[#3D8F73] hover:bg-[#4ca088] text-white font-semibold px-4 py-2 text-sm"><Plus className="w-4 h-4" /> موظف جديد</button>
          </div>

          {showStaffForm && (
            <div className="rounded-2xl border border-neutral-800 bg-[#0c0c0c] p-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="text-sm text-neutral-300">اسم المستخدم</label><input value={sf.username} onChange={(e) => setSf({ ...sf, username: e.target.value })} className={inputCls} dir="ltr" /></div>
                <div><label className="text-sm text-neutral-300">{editId ? 'كلمة مرور جديدة (اختياري)' : 'كلمة المرور'}</label><input type="password" value={sf.password} onChange={(e) => setSf({ ...sf, password: e.target.value })} className={inputCls} dir="ltr" /></div>
                <div><label className="text-sm text-neutral-300">الاسم الكامل</label><input value={sf.full_name} onChange={(e) => setSf({ ...sf, full_name: e.target.value })} className={inputCls} /></div>
                <div><label className="text-sm text-neutral-300">الدور</label><select value={sf.role} onChange={(e) => setSf({ ...sf, role: e.target.value })} className={inputCls}><option value="staff">موظف</option><option value="admin">مدير</option></select></div>
              </div>
              <div>
                <label className="text-sm text-neutral-300">الصلاحيات</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {Object.entries(PERM_LABELS).map(([k, v]) => (
                    <label key={k} className="flex items-center gap-2 text-sm text-neutral-200">
                      <input type="checkbox" checked={!!sf.permissions[k]} onChange={(e) => setSf({ ...sf, permissions: { ...sf.permissions, [k]: e.target.checked } })} className="w-4 h-4 accent-[#3D8F73]" /> {v}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={saveStaff} className="rounded-xl bg-[#3D8F73] hover:bg-[#4ca088] text-white font-semibold px-4 py-2.5 text-sm">{editId ? 'تحديث' : 'إضافة'}</button>
                <button onClick={() => setShowStaffForm(false)} className="px-4 rounded-xl bg-neutral-800 text-neutral-300">إلغاء</button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {staff.map((s) => (
              <div key={s.id} className="rounded-xl border border-neutral-800 bg-[#0c0c0c] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className={`w-5 h-5 ${s.role === 'owner' ? 'text-[#3D8F73]' : 'text-neutral-500'}`} />
                  <div>
                    <div className="font-medium text-white">{s.username} <span className="text-xs text-neutral-500">· {roleLabel(s.role)}</span></div>
                    <div className="text-xs text-neutral-500">{s.full_name || '—'}</div>
                  </div>
                </div>
                {s.role !== 'owner' && (
                  <div className="flex gap-1">
                    <button onClick={() => editStaff(s)} className="p-2 rounded-lg bg-neutral-800/60 text-neutral-300"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => deleteStaff(s.id)} className="p-2 rounded-lg bg-red-500/15 text-red-300"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-center text-xs text-neutral-600 mt-10">© Plus Studio — جميع الحقوق محفوظة</p>
    </div>
  );
}