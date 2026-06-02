import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.fullName, phone: form.phone },
        emailRedirectTo: `${window.location.origin}/verify`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-primary-cream flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="font-logo text-4xl text-primary-dark mb-8">Black Crème</h1>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✉️</span>
            </div>
            <h2 className="font-serif text-xl mb-2">Check your email</h2>
            <p className="text-sm text-gray-500 mb-1">We sent a verification link to</p>
            <p className="text-sm font-semibold text-primary-dark mb-4">{form.email}</p>
            <p className="text-xs text-gray-400">Click the link in the email to activate your account. Check your spam folder if you don't see it.</p>
          </div>
          <a href="/login" className="block mt-6 text-[10px] uppercase tracking-widest text-gray-400 hover:text-primary-dark transition-colors">
            Back to Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <a href="/" className="block text-center mb-8">
          <h1 className="font-logo text-4xl text-primary-dark">Black Crème</h1>
          <p className="text-[10px] uppercase tracking-[4px] text-gray-400 mt-1">Create your account</p>
        </a>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Full Name *</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
                placeholder="e.g. Sarah Lim"
                className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Email Address *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="sarah@email.com"
                className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Phone Number *</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
                placeholder="012-3456789"
                className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Password *</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                placeholder="Min. 8 characters"
                className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Confirm Password *</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
                placeholder="Re-enter password"
                className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel"
              />
            </div>

            {error && <p className="text-red-500 text-xs text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-dark text-white text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-accent-caramel transition-all disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Already have an account?{' '}
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
