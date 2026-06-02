import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { ChevronDown, ChevronUp, MessageCircle, RotateCcw } from 'lucide-react';
import { WHATSAPP_NUMBER } from '@/constants';

interface OrderItem {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
}

interface Order {
  id: string;
  delivery_type: 'delivery' | 'pickup';
  subtotal: number;
  delivery_fee: number;
  discount_amount: number;
  total: number;
  cake_message: string;
  scheduled_date: string;
  scheduled_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  order_items: OrderItem[];
}

const STATUS_STYLE: Record<string, string> = {
  pending:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-500 border-red-200',
};

const STATUS_DESC: Record<string, string> = {
  pending:   'Your order has been sent via WhatsApp. We will confirm it shortly.',
  confirmed: 'Your order is confirmed and being prepared.',
  completed: 'Your order has been delivered. Thank you!',
  cancelled: 'This order has been cancelled.',
};

export default function OrdersPage() {
  const { user, profile, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) window.location.href = '/login';
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders(data ?? []);
        setFetching(false);
      });
  }, [user]);

  if (loading || !user) return null;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-primary-cream">
      <header className="bg-white border-b border-primary-dark/10 px-6 py-4 flex items-center justify-between">
        <a href="/" className="font-logo text-2xl text-primary-dark">Black Crème</a>
        <a href="/" className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-primary-dark transition-colors">
          ← Back to Shop
        </a>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-primary-dark">My Orders</h1>
          <p className="text-xs text-gray-400 mt-1">{profile?.full_name}</p>
        </div>

        {fetching ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <p className="font-serif text-xl text-primary-dark/40 mb-2">No orders yet</p>
            <p className="text-sm text-gray-400 mb-6">Your order history will appear here after you place an order.</p>
            <a href="/#menu" className="inline-block px-6 py-3 bg-primary-dark text-white text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-accent-caramel transition-all">
              Browse Menu
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Order Header */}
                <button
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-primary-cream/30 transition-colors"
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm font-semibold">{formatDate(order.scheduled_date)}</p>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-0.5">
                        {order.scheduled_time} · {order.delivery_type === 'pickup' ? 'Self Pickup' : 'Delivery'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-serif text-lg text-accent-caramel">RM {Number(order.total).toFixed(2)}</p>
                      <span className={`inline-block text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full border mt-1 ${STATUS_STYLE[order.status]}`}>
                        {order.status}
                      </span>
                    </div>
                    {expanded === order.id
                      ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                      : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    }
                  </div>
                </button>

                {/* Order Details */}
                {expanded === order.id && (
                  <div className="border-t border-primary-dark/5 px-6 py-5 space-y-4">
                    {/* Status description */}
                    <div className={`rounded-xl px-4 py-3 text-xs border ${STATUS_STYLE[order.status]}`}>
                      {STATUS_DESC[order.status]}
                    </div>

                    {/* Items */}
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-3">Items Ordered</p>
                      <div className="space-y-2">
                        {order.order_items.map(item => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-primary-dark/70">{item.product_name} × {item.quantity}</span>
                            <span className="font-medium">RM {(item.product_price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="border-t border-dotted border-primary-dark/10 pt-4 space-y-1.5">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Subtotal</span>
                        <span>RM {Number(order.subtotal).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Delivery fee</span>
                        <span>{order.delivery_fee === 0 ? 'Free' : `RM ${Number(order.delivery_fee).toFixed(2)}`}</span>
                      </div>
                      {order.discount_amount > 0 && (
                        <div className="flex justify-between text-xs text-green-600">
                          <span>Discount</span>
                          <span>- RM {Number(order.discount_amount).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-bold pt-1">
                        <span>Total</span>
                        <span className="text-accent-caramel">RM {Number(order.total).toFixed(2)}</span>
                      </div>
                    </div>

                    {order.cake_message && (
                      <div className="bg-primary-cream/60 rounded-xl px-4 py-3 text-sm text-primary-dark/60 italic">
                        ✉️ "{order.cake_message}"
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-2">
                      {/* WhatsApp follow-up for pending/confirmed */}
                      {(order.status === 'pending' || order.status === 'confirmed') && (
                        <a
                          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi! I would like to follow up on my order placed on ${formatDate(order.scheduled_date)}. Total: RM${Number(order.total).toFixed(2)}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#25D366] text-white text-[10px] uppercase tracking-widest font-bold rounded-xl hover:bg-[#1ebe5d] transition-all"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Follow Up
                        </a>
                      )}

                      {/* Reorder for completed */}
                      {order.status === 'completed' && (
                        <a
                          href="/#menu"
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary-dark text-white text-[10px] uppercase tracking-widest font-bold rounded-xl hover:bg-accent-caramel transition-all"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Order Again
                        </a>
                      )}

                      {/* Contact for cancelled */}
                      {order.status === 'cancelled' && (
                        <a
                          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi! I have a question about my cancelled order.')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-primary-dark/20 text-primary-dark text-[10px] uppercase tracking-widest font-bold rounded-xl hover:bg-primary-cream transition-all"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Contact Us
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
