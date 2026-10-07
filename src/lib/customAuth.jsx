import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext(null);
const KEY = 'plusstudio_session';

export function CustomAuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSession(JSON.parse(raw));
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!session?.token) return;
    let alive = true;
    base44.functions.invoke('staffAction', { token: session.token, op: 'me' })
      .then(r => {
        if (!alive) return;
        if (r?.data?.user) setSession(s => (s ? { ...s, user: r.data.user } : s));
        else { localStorage.removeItem(KEY); setSession(null); }
      })
      .catch(() => {
        if (!alive) return;
        localStorage.removeItem(KEY);
        setSession(null);
      });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (username, password) => {
    let r;
    try {
      r = await base44.functions.invoke('staffLogin', { username, password });
    } catch (e) {
      throw new Error(e?.response?.data?.error || e?.message || 'فشل الاتصال بالخادم');
    }
    if (!r?.data || r.data.error) throw new Error(r.data?.error || 'فشل تسجيل الدخول');
    const s = { token: r.data.token, user: r.data.user };
    localStorage.setItem(KEY, JSON.stringify(s));
    setSession(s);
    return s;
  }, []);

  const logout = useCallback(async () => {
    if (session?.token) {
      try { await base44.functions.invoke('staffAction', { token: session.token, op: 'logout' }); } catch {}
    }
    localStorage.removeItem(KEY);
    setSession(null);
  }, [session]);

  const hasPerm = useCallback((perm) => {
    if (!session?.user) return false;
    if (session.user.role === 'owner') return true;
    return !!session.user.permissions?.[perm];
  }, [session]);

  return (
    <AuthContext.Provider value={{ session, user: session?.user || null, login, logout, loading, hasPerm }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useCustomAuth = () => useContext(AuthContext);