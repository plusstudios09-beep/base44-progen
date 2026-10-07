import { Navigate, Outlet } from 'react-router-dom';
import { useCustomAuth } from '@/lib/customAuth';

export default function CustomProtectedRoute() {
  const { session, loading } = useCustomAuth();
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#050505]">
        <div className="w-8 h-8 border-4 border-neutral-800 border-t-[#3D8F73] rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!session?.token) return <Navigate to="/login" replace />;
  return <Outlet />;
}