import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import { CustomAuthProvider } from '@/lib/customAuth';
import CustomProtectedRoute from '@/components/CustomProtectedRoute';
import AdminLayout from '@/components/AdminLayout';
import Login from '@/pages/Login';
import Clients from '@/pages/Clients';
import ClientEditor from '@/pages/ClientEditor';
import Settings from '@/pages/Settings';
import Stats from '@/pages/Stats';
import Templates from '@/pages/Templates';
import TemplateBuilder from '@/pages/TemplateBuilder';
import CardView from '@/pages/CardView';

const AuthenticatedApp = () => {
  const { isLoadingPublicSettings } = useAuth();
  if (isLoadingPublicSettings) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#050505]">
        <div className="w-8 h-8 border-4 border-neutral-800 border-t-[#3D8F73] rounded-full animate-spin"></div>
      </div>
    );
  }
  return (
    <CustomAuthProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<CustomProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="clients" element={<Clients />} />
            <Route path="clients/new" element={<ClientEditor />} />
            <Route path="clients/:id/edit" element={<ClientEditor />} />
            <Route path="stats" element={<Stats />} />
            <Route path="templates" element={<Templates />} />
            <Route path="templates/new" element={<TemplateBuilder />} />
            <Route path="templates/:id/edit" element={<TemplateBuilder />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
        <Route path="/" element={<Navigate to="/admin/clients" replace />} />
        <Route path="/:slug" element={<CardView />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </CustomAuthProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;