import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setStatus('success');
        setTimeout(() => { window.location.href = '/'; }, 2500);
      } else {
        setStatus('error');
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-primary-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-logo text-4xl text-primary-dark mb-8">Black Crème</h1>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {status === 'loading' && (
            <>
              <div className="w-12 h-12 border-4 border-accent-caramel/30 border-t-accent-caramel rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-gray-500">Verifying your email…</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✓</span>
              </div>
              <h2 className="font-serif text-xl mb-2">Email verified!</h2>
              <p className="text-sm text-gray-500">Your account is now active. Redirecting you to the shop…</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✗</span>
              </div>
              <h2 className="font-serif text-xl mb-2">Verification failed</h2>
              <p className="text-sm text-gray-500 mb-6">The link may have expired. Please request a new one.</p>
              <a
                href="/login"
                className="block w-full py-3 bg-primary-dark text-white text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-accent-caramel transition-all"
              >
                Back to Sign In
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
