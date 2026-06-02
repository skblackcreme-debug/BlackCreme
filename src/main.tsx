import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import AdminLogin from './pages/AdminLogin.tsx';
import AdminPanel from './pages/AdminPanel.tsx';
import LoginPage from './pages/auth/LoginPage.tsx';
import RegisterPage from './pages/auth/RegisterPage.tsx';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.tsx';
import ResetPasswordPage from './pages/auth/ResetPasswordPage.tsx';
import VerifyEmailPage from './pages/auth/VerifyEmailPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import OrdersPage from './pages/OrdersPage.tsx';
import OrderSuccessPage from './pages/OrderSuccessPage.tsx';
import { supabase } from './lib/supabase.ts';
import type { Session } from '@supabase/supabase-js';
import './index.css';

function Root() {
  const path = window.location.pathname;
  const isAdmin = path.startsWith('/admin');
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, [isAdmin]);

  // Auth routes
  if (path === '/login')    return <LoginPage />;
  if (path === '/register') return <RegisterPage />;
  if (path === '/forgot')   return <ForgotPasswordPage />;
  if (path === '/reset')    return <ResetPasswordPage />;
  if (path === '/verify')   return <VerifyEmailPage />;
  if (path === '/profile')        return <ProfilePage />;
  if (path === '/orders')         return <OrdersPage />;
  if (path === '/order-success')  return <OrderSuccessPage />;

  // Admin routes
  if (isAdmin) {
    if (loading) return null;
    return session ? <AdminPanel /> : <AdminLogin />;
  }

  // Public site
  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
