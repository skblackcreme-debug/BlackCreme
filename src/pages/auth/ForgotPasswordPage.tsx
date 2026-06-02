import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-primary-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <a href="/" className="block text-center mb-8">
          <h1 className="font-logo text-4xl text-primary-dark">Black Crème</h1>
          <p className="text-[10px] uppercase tracking-[4px] text-gray-400 mt-1">Reset your password</p>
        </a>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✉️</span>
              </div>
              <h2 className="font-serif text-xl mb-2">Reset link sent</h2>
              <p className="text-sm text-gray-500 mb-1">We sent a reset link to</p>
              <p className="text-sm font-semibold text-primary-dark mb-4">{email}</p>
              <p className="text-xs text-gray-400">The link expires in 1 hour. Check your spam folder if you don't see it.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-6 text-center">
                Enter your email and we'll send you a link to reset your password.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="sarah@email.com"
                    className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel"
                  />
                </div>

                {error && <p className="text-red-500 text-xs text-center">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary-dark text-white text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-accent-caramel transition-all disabled:opacity-50"
                >
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}

          <p className="text-center text-xs text-gray-400 mt-6">
            Remember your password?{' '}
            <a href="/login" className="text-accent-caramel font-semibold hover:underline">Sign In</a>
          </p>
        </div>

        <p className="text-center mt-6">
          <a href="/" className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-primary-dark transition-colors">
            ← Back to Shop
          </a>
        </p>
      </div>
    </div>
  );
}
