import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomAuth } from '@/lib/customAuth';
import Logo from '@/components/Logo';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useCustomAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username.trim(), password);
      navigate('/admin/clients', { replace: true });
    } catch (err) {
      setError(err.message || 'تعذر تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#050505] flex items-center justify-center px-5">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-24 w-96 h-96 rounded-full bg-[#3D8F73]/10 blur-3xl"></div>
        <div className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-[#3D8F73]/5 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <form onSubmit={submit} className="bg-[#0c0c0c] border border-neutral-800/80 rounded-3xl p-7 space-y-5 shadow-2xl">
          <div>
            <h1 className="text-xl font-bold text-white text-center">لوحة التحكم</h1>
            <p className="text-sm text-neutral-500 text-center mt-1">سجّل الدخول لإدارة كروت العملاء</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-neutral-300">اسم المستخدم</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              className="w-full rounded-xl bg-[#050505] border border-neutral-800 px-4 py-3 text-white outline-none focus:border-[#3D8F73] transition-colors"
              placeholder="اسم المستخدم"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-neutral-300">كلمة المرور</label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-[#050505] border border-neutral-800 px-4 py-3 pl-11 text-white outline-none focus:border-[#3D8F73] transition-colors"
                placeholder="كلمة المرور"
              />
              <button type="button" onClick={() => setShow(s => !s)} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full rounded-xl bg-[#3D8F73] hover:bg-[#4ca088] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 transition-colors"
          >
            {loading ? 'جارٍ الدخول...' : 'دخول'}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-600 mt-6">© Plus Studio — جميع الحقوق محفوظة</p>
      </div>
    </div>
  );
}