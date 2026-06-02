import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? 'Incorrect email or password.'
        : error.message);
      setLoading(false);
      return;
    }

    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-primary-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <a href="/" className="block text-center mb-8">
          <h1 className="font-logo text-4xl text-primary-dark">Black Crème</h1>
          <p className="text-[10px] uppercase tracking-[4px] text-gray-400 mt-1">Welcome back</p>
        </a>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-4">
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

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Password</label>
                <a href="/forgot" className="text-[10px] text-accent-caramel hover:underline">Forgot Password?</a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel"
              />
            </div>

            {error && <p className="text-red-500 text-xs text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-dark text-white text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-accent-caramel transition-all disabled:opacity-50 mt-2"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Don't have an account?{' '}
            <a href="/register" className="text-accent-caramel font-semibold hover:underline">Create Account</a>
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
