import { useState } from 'react';
import { supabase } from '@/lib/supabase';

const TEST_PRODUCT = { name: 'Test Cake (Stripe Test)', price: 2.00 };

export default function StripeTestPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-order', {
        body: {
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          delivery_type: 'pickup',
          scheduled_date: new Date().toISOString().split('T')[0],
          scheduled_time: '10am – 12pm',
          subtotal: TEST_PRODUCT.price,
          delivery_fee: 0,
          total: TEST_PRODUCT.price,
          user_id: null,
          items: [{
            product_id: null,
            product_name: TEST_PRODUCT.name,
            product_price: TEST_PRODUCT.price,
            quantity: 1,
            subtotal: TEST_PRODUCT.price,
          }],
          origin: window.location.origin,
        },
      });

      if (fnError) throw fnError;
      if (data?.checkoutUrl) window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <a href="/" className="font-logo text-3xl text-primary-dark block mb-1">Black Crème</a>
          <span className="inline-block bg-yellow-100 text-yellow-700 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border border-yellow-300">
            Stripe Test Page
          </span>
          <p className="text-xs text-gray-400 mt-2">Use test card: 4242 4242 4242 4242 · 12/34 · 123</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">

          {/* Test product */}
          <div className="bg-primary-cream/60 rounded-xl p-4 mb-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-primary-dark">{TEST_PRODUCT.name}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Self Pickup · Test item</p>
            </div>
            <p className="font-serif text-accent-caramel font-bold">RM {TEST_PRODUCT.price.toFixed(2)}</p>
          </div>

          <form onSubmit={handlePay} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sarah Lim"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Email * <span className="normal-case font-normal opacity-60">(for confirmation)</span></label>
              <input
                type="email"
                required
                placeholder="e.g. sarah@email.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Phone *</label>
              <input
                type="tel"
                required
                placeholder="e.g. 012-3456789"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel"
              />
            </div>

            {error && (
              <p className="text-red-500 text-xs text-center bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-dark text-white text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-accent-caramel transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
            >
              {loading ? 'Redirecting to Stripe…' : 'Pay RM 2.00 with Stripe'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest mb-2">Test Cards</p>
            <div className="space-y-1.5 text-xs text-gray-500">
              <div className="flex justify-between"><span>Succeeds</span><code className="bg-gray-100 px-2 py-0.5 rounded">4242 4242 4242 4242</code></div>
              <div className="flex justify-between"><span>Declined</span><code className="bg-gray-100 px-2 py-0.5 rounded">4000 0000 0000 0002</code></div>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-2">Expiry: any future date · CVC: any 3 digits</p>
          </div>
        </div>

        <p className="text-center mt-4">
          <a href="/" className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-primary-dark transition-colors">
            ← Back to Shop
          </a>
        </p>

      </div>
    </div>
  );
}
