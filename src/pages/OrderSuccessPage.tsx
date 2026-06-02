import { useEffect, useState } from 'react';
import { CheckCircle, ShoppingBag, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface OrderItem {
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  scheduled_date: string;
  scheduled_time: string;
  delivery_type: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  cake_message: string;
  status: string;
  order_items: OrderItem[];
}

export default function OrderSuccessPage() {
  const orderId = new URLSearchParams(window.location.search).get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!orderId) { setNotFound(true); setLoading(false); return; }
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true);
        else setOrder(data as Order);
        setLoading(false);
      });
  }, [orderId]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-cream flex items-center justify-center">
        <p className="text-sm text-gray-400 animate-pulse">Loading your order…</p>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-primary-cream flex flex-col items-center justify-center px-4 text-center">
        <h1 className="font-logo text-3xl text-primary-dark mb-4">Order Not Found</h1>
        <p className="text-sm text-gray-400 mb-6">We couldn't find your order details.</p>
        <a href="/" className="px-6 py-3 bg-primary-dark text-white text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-accent-caramel transition-all">
          Back to Shop
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-cream px-4 py-12">
      <div className="max-w-lg mx-auto">

        {/* Logo */}
        <a href="/" className="block text-center mb-8">
          <h1 className="font-logo text-4xl text-primary-dark">Black Crème</h1>
        </a>

        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          {/* Header */}
          <div className="bg-primary-dark px-8 py-8 text-center">
            <div className="flex justify-center mb-3">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <h2 className="font-serif text-2xl text-white mb-1">Payment Confirmed!</h2>
            <p className="text-[10px] uppercase tracking-[4px] text-white/40">
              Order {order.order_number}
            </p>
          </div>

          {/* Body */}
          <div className="p-8 space-y-6">

            <p className="text-sm text-primary-dark/70 text-center leading-relaxed">
              Thank you, <strong className="text-primary-dark">{order.customer_name}</strong>!
              Your order is confirmed. A confirmation email has been sent to{' '}
              <span className="text-accent-caramel">{order.customer_email}</span>.
            </p>

            {/* Order Info */}
            <div className="bg-primary-cream/60 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-primary-dark/50">Scheduled</span>
                <span className="font-medium text-primary-dark">
                  {formatDate(order.scheduled_date)}{order.scheduled_time ? ` · ${order.scheduled_time}` : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-dark/50">Delivery</span>
                <span className="font-medium text-primary-dark capitalize">{order.delivery_type}</span>
              </div>
              {order.cake_message && (
                <div className="flex justify-between">
                  <span className="text-primary-dark/50">Cake Message</span>
                  <span className="font-medium text-accent-caramel italic">"{order.cake_message}"</span>
                </div>
              )}
            </div>

            {/* Items */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-primary-dark/40 mb-3">Items</p>
              <div className="space-y-2">
                {order.order_items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-primary-dark/70">{item.product_name} ×{item.quantity}</span>
                    <span className="font-medium text-primary-dark">RM {Number(item.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-primary-dark/10 mt-4 pt-4 space-y-1.5">
                <div className="flex justify-between text-xs text-primary-dark/50">
                  <span>Subtotal</span>
                  <span>RM {Number(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-primary-dark/50">
                  <span>Delivery Fee</span>
                  <span>{Number(order.delivery_fee) === 0 ? 'Free' : `RM ${Number(order.delivery_fee).toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-1">
                  <span>Total Paid</span>
                  <span className="text-accent-caramel">RM {Number(order.total).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-8 pb-8 flex flex-col gap-3">
            <a
              href="/"
              className="flex items-center justify-center gap-2 w-full py-3 bg-primary-dark text-white text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-accent-caramel transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              Continue Shopping
            </a>
            <a
              href="https://wa.me/60123456789"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 border border-primary-dark/20 text-primary-dark text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-primary-cream transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              Chat with Us
            </a>
          </div>
        </div>

        <p className="text-center mt-6 text-[10px] uppercase tracking-[3px] text-gray-400">
          © 2026 Black Crème · Handcrafted with Indulgence
        </p>
      </div>
    </div>
  );
}
