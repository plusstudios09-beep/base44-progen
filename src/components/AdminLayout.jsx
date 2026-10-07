import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Users, BarChart3, Settings as SettingsIcon, LogOut, Plus, LayoutGrid } from 'lucide-react';
import { useCustomAuth } from '@/lib/customAuth';
import Logo from '@/components/Logo';

const navItems = [
  { to: '/admin/clients', label: 'العملاء', icon: Users, perm: null },
  { to: '/admin/templates', label: 'القوالب', icon: LayoutGrid, perm: 'manage_clients' },
  { to: '/admin/stats', label: 'الإحصائيات', icon: BarChart3, perm: 'view_stats' },
  { to: '/admin/settings', label: 'الإعدادات', icon: SettingsIcon, perm: null },
];

export default function AdminLayout() {
  const { user, logout, hasPerm } = useCustomAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const items = navItems.filter(i => !i.perm || hasPerm(i.perm));

  return (
    <div dir="rtl" className="min-h-screen bg-[#050505] text-neutral-100 flex flex-col md:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-l border-neutral-800/80 bg-[#0a0a0a]">
        <div className="px-6 py-6 border-b border-neutral-800/80">
          <Logo size="md" />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive ? 'bg-[#3D8F73]/15 text-[#5fbf9c]' : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
          <NavLink
            to="/admin/clients/new"
            className="flex items-center gap-3 rounded-xl px-4 py-3 mt-4 text-sm font-semibold bg-[#3D8F73] text-white hover:bg-[#4ca088] transition-colors"
          >
            <Plus className="w-5 h-5" />
            إضافة عميل جديد
          </NavLink>
        </nav>
        <div className="px-4 py-4 border-t border-neutral-800/80">
          <div className="px-2 mb-3 text-xs text-neutral-500">
            <div className="text-neutral-300 font-medium">{user?.full_name || user?.username}</div>
            <div>{user?.role === 'owner' ? 'المالك' : user?.role === 'admin' ? 'مدير' : 'موظف'}</div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full rounded-xl px-4 py-2.5 text-sm text-neutral-300 hover:bg-neutral-800/60 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Top bar (mobile) */}
      <header className="md:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-[#0a0a0a] border-b border-neutral-800/80">
        <Logo size="sm" />
        <button onClick={handleLogout} className="p-2 text-neutral-400">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 flex items-center justify-around bg-[#0a0a0a] border-t border-neutral-800/80 px-2 py-2">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[11px] ${
                isActive ? 'text-[#5fbf9c]' : 'text-neutral-500'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
        <NavLink
          to="/admin/clients/new"
          className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[11px] text-[#5fbf9c]"
        >
          <span className="w-8 h-8 rounded-full bg-[#3D8F73] flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </span>
        </NavLink>
      </nav>
    </div>
  );
}