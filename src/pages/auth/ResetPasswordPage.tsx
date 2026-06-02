import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-primary-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <a href="/" className="block text-center mb-8">
          <h1 className="font-logo text-4xl text-primary-dark">Black Crème</h1>
          <p className="text-[10px] uppercase tracking-[4px] text-gray-400 mt-1">Set new password</p>
        </a>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {done ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✓</span>
              </div>
              <h2 className="font-serif text-xl mb-2">Password updated</h2>
              <p className="text-sm text-gray-500 mb-6">Your password has been reset successfully.</p>
              <a
                href="/login"
                className="block w-full py-3 bg-primary-dark text-white text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-accent-caramel transition-all text-center"
              >
                Sign In
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min. 8 characters"
                  className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter new password"
                  className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel"
                />
              </div>

              {error && <p className="text-red-500 text-xs text-center">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary-dark text-white text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-accent-caramel transition-all disabled:opacity-50"
              >
                {loading ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
