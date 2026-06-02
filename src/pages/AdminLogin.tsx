import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError('Invalid email or password.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-primary-cream flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">
        <h1 className="font-logo text-3xl text-center text-primary-dark mb-1">Black Crème</h1>
        <p className="text-[10px] uppercase tracking-[4px] text-center text-gray-400 mb-8">Admin Panel</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel"
              placeholder="admin@blackcreme.com"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-dark text-white text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-accent-caramel transition-all disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
