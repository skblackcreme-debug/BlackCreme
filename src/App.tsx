import { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  Menu as MenuIcon,
  X,
  Plus,
  Minus,
  Trash2,
  ChevronRight,
  ChevronDown,
  MessageCircle,
  CreditCard,
  User,
  ClipboardList,
  LogOut,
} from 'lucide-react';
import { WHATSAPP_NUMBER } from './constants';
import { Product } from './types';
import { supabase } from './lib/supabase';
import { useAuth } from './hooks/useAuth';
import { useSettings } from './hooks/useSettings';
import { useCart } from './hooks/useCart';
import { useHeroSlides } from './hooks/useHeroSlides';
import { useDeliveryFee } from './features/order/hooks/useDeliveryFee';
import BannerCarousel from './components/BannerCarousel';
import { POSTCODE_LOOKUP, STATE_CITIES, SUPPORTED_STATES, isServiceablePostcode } from './data/deliveryZones';

const TIME_SLOTS = [
  { label: '10am – 12pm', startHour: 10 },
  { label: '12pm – 2pm',  startHour: 12 },
  { label: '2pm – 4pm',   startHour: 14 },
  { label: '4pm – 6pm',   startHour: 16 },
  { label: '6pm – 8pm',   startHour: 18 },
  { label: '8pm – 10pm',  startHour: 20 },
];

export default function App() {
  const { cart, addToCart, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const { settings } = useSettings();
  const heroSlides = useHeroSlides();
  const [stripeLoading, setStripeLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [orderForm, setOrderForm] = useState({
    name: '',
    phone: '',
    deliveryType: 'delivery' as 'delivery' | 'pickup',
    addressLine1: '',
    addressLine2: '',
    postcode: '',
    city: '',
    state: '',
    date: '',
    time: '',
    cakeMessage: '',
    email: '',
  });

  // Pre-fill name & phone from profile when order form opens
  useEffect(() => {
    if (showOrderForm && profile) {
      setOrderForm(f => ({
        ...f,
        name: f.name || profile.full_name || '',
        phone: f.phone || profile.phone || '',
        email: f.email || user?.email || '',
      }));
    }
  }, [showOrderForm, profile]);

  // Fetch saved addresses for logged-in users
  useEffect(() => {
    if (authLoading || !user) return;
    supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false })
      .then(({ data }) => setSavedAddresses(data ?? []));
  }, [user, authLoading]);

  const CATEGORY_ORDER = ['Basque Cake', 'Tiramisu Cake', 'Party Size', 'Add-ons'];

  useEffect(() => {
    supabase.from('products').select('*').order('display_order').then(({ data }) => {
      const fetched = data ?? [];
      setProducts(fetched);
      const unique = [...new Set(fetched.map((p: Product) => p.category))];
      const sorted = CATEGORY_ORDER.filter(c => unique.includes(c));
      const others = unique.filter((c: string) => !CATEGORY_ORDER.includes(c));
      const all = [...sorted, ...others];
      setCategories(all);
      if (all.length > 0) setActiveCategory(all[0]);
    });
  }, []);

  const filteredProducts = products.filter(p => p.category === activeCategory);

  const { fee: deliveryFee, zoneLabel, estimatedTime, isServiceable, isLoading: feeLoading } =
    useDeliveryFee(orderForm.postcode, orderForm.deliveryType);

  const handlePostcodeChange = (postcode: string) => {
    if (postcode && isServiceablePostcode(postcode)) {
      const entry = POSTCODE_LOOKUP[postcode];
      setOrderForm(f => ({ ...f, postcode, city: entry.city, state: entry.state }));
    } else {
      setOrderForm(f => ({ ...f, postcode }));
    }
  };

  const saveOrderToDB = async (form: typeof orderForm) => {
    if (!user) return;
    const fee = form.deliveryType === 'pickup' ? 0 : deliveryFee;
    const { data: order } = await supabase.from('orders').insert({
      user_id: user.id,
      delivery_type: form.deliveryType,
      subtotal: totalPrice,
      delivery_fee: fee,
      discount_amount: 0,
      total: totalPrice + fee,
      cake_message: form.cakeMessage || null,
      scheduled_date: form.date,
      scheduled_time: form.time,
      status: 'pending',
      customer_name: form.name,
      customer_phone: form.phone,
      customer_email: user.email ?? null,
      delivery_address_line_1: form.addressLine1 || null,
      delivery_address_line_2: form.addressLine2 || null,
      delivery_city: form.city || null,
      delivery_state: form.state || null,
      delivery_postcode: form.postcode || null,
    }).select().single();
    if (!order) return;
    await supabase.from('order_items').insert(
      cart.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
      }))
    );
  };

  const generateWhatsAppLink = (form: typeof orderForm) => {
    if (cart.length === 0) return '#';
    const fee = form.deliveryType === 'pickup' ? 0 : deliveryFee;
    const subtotal = totalPrice;
    const total = subtotal + fee;
    const dateFormatted = form.date
      ? new Date(form.date).toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })
      : '';
    const fullAddress = [form.addressLine1, form.addressLine2, `${form.postcode} ${form.city}`, form.state]
      .filter(Boolean).join(', ');
    const deliveryLine = form.deliveryType === 'pickup'
      ? '🏪 Self Pickup (Free)'
      : `🚗 ${zoneLabel} | ETA: ${estimatedTime}`;
    const itemsText = cart.map(i => `  • ${i.name} x${i.quantity} — RM${(i.price * i.quantity).toFixed(2)}`).join('\n');
    const message = [
      `🎂 NEW CAKE ORDER – Black Crème`,
      `─────────────────────`,
      `👤 ${form.name} | 📞 ${form.phone}`,
      `📍 ${fullAddress}`,
      deliveryLine,
      `─────────────────────`,
      `🛒 Order:`,
      itemsText,
      `📅 ${dateFormatted}${form.time ? ` | ⏰ ${form.time}` : ''}`,
      form.cakeMessage ? `✉️  Cake message: "${form.cakeMessage}"` : null,
      `─────────────────────`,
      `💰 Subtotal : RM ${subtotal.toFixed(2)}`,
      `🚗 Delivery : ${fee === 0 ? 'Free' : `RM ${fee.toFixed(2)}`}`,
      `💳 TOTAL    : RM ${total.toFixed(2)}`,
      `─────────────────────`,
    ].filter(line => line !== null).join('\n');
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  const generateQuickWhatsAppLink = () => {
    if (cart.length === 0) return '#';
    const subtotal = totalPrice;
    const itemsText = cart.map(i => `  • ${i.name} x${i.quantity} — RM${(i.price * i.quantity).toFixed(2)}`).join('\n');
    const message = [
      `🎂 NEW CAKE ORDER – Black Crème`,
      `─────────────────────`,
      `🛒 Order:`,
      itemsText,
      `─────────────────────`,
      `💰 TOTAL : RM ${subtotal.toFixed(2)}`,
      `─────────────────────`,
    ].join('\n');
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  const handleStripeCheckout = async (form: typeof orderForm) => {
    setStripeLoading(true);
    try {
      const fee = form.deliveryType === 'pickup' ? 0 : deliveryFee;
      const { data, error } = await supabase.functions.invoke('create-order', {
        body: {
          customer_name: form.name,
          customer_email: form.email || user?.email,
          customer_phone: form.phone,
          delivery_type: form.deliveryType,
          delivery_address_line_1: form.addressLine1 || null,
          delivery_address_line_2: form.addressLine2 || null,
          delivery_city: form.city || null,
          delivery_state: form.state || null,
          delivery_postcode: form.postcode || null,
          scheduled_date: form.date,
          scheduled_time: form.time,
          cake_message: form.cakeMessage || null,
          subtotal: totalPrice,
          delivery_fee: fee,
          total: totalPrice + fee,
          user_id: (user && profile) ? user.id : null,
          items: cart.map(item => ({
            product_id: item.id,
            product_name: item.name,
            product_price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity,
          })),
          origin: window.location.origin,
        },
      });
      if (error) throw error;
      if (data?.checkoutUrl) window.location.href = data.checkoutUrl;
    } catch {
      alert('Payment setup failed. Please try again or contact us via WhatsApp.');
    } finally {
      setStripeLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="glass-nav fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="#" className="font-logo text-2xl font-bold tracking-tight text-primary-dark">
            Black Crème
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#hero" className="text-sm font-medium hover:text-accent-caramel transition-colors">Home</a>
            <a href="#menu" className="text-sm font-medium hover:text-accent-caramel transition-colors">Menu</a>
            <a href="#order" className="text-sm font-medium hover:text-accent-caramel transition-colors">Order</a>
            <a href="#contact" className="text-sm font-medium hover:text-accent-caramel transition-colors">Contact</a>
          </div>

          <div className="flex items-center space-x-3">
            {/* Cart */}
            <a href="#order" className="relative p-2 text-primary-dark hover:text-accent-caramel transition-colors" id="cart-badge">
              <ShoppingBag className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-accent-caramel text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                  {totalItems}
                </span>
              )}
            </a>

            {/* Auth */}
            {!authLoading && (
              (user && profile) ? (
                <div className="hidden md:block relative">
                  <UserDropdown name={profile.full_name?.split(' ')[0] ?? 'Account'} onSignOut={signOut} />
                </div>
              ) : settings.login_enabled ? (
                <a
                  href="/login"
                  className="hidden md:block text-[10px] uppercase tracking-widest font-bold text-primary-dark hover:text-accent-caramel transition-colors"
                >
                  Sign In
                </a>
              ) : null
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-primary-cream pt-20 px-4 md:hidden"
          >
            <div className="flex flex-col space-y-6 text-center">
              <a href="#hero" onClick={() => setIsMenuOpen(false)} className="text-2xl font-serif">Home</a>
              <a href="#menu" onClick={() => setIsMenuOpen(false)} className="text-2xl font-serif">Menu</a>
              <a href="#order" onClick={() => setIsMenuOpen(false)} className="text-2xl font-serif">Order</a>
              <a href="#contact" onClick={() => setIsMenuOpen(false)} className="text-2xl font-serif">Contact</a>
              {!authLoading && ((user && profile) || settings.login_enabled) && (
                <div className="border-t border-primary-dark/10 pt-4">
                  {(user && profile) ? (
                    <>
                      <a href="/profile" onClick={() => setIsMenuOpen(false)} className="text-sm font-semibold text-primary-dark">My Account</a>
                      <button onClick={signOut} className="text-sm text-red-400 mt-2 block w-full">Sign Out</button>
                    </>
                  ) : (
                    <a href="/login" onClick={() => setIsMenuOpen(false)} className="text-sm font-semibold text-accent-caramel">Sign In / Register</a>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero + Banners — unified section */}
      <div id="hero" className="mt-16 bg-[#EDE0D0]">

        {/* Hero: product image + text */}
        <section className="relative overflow-hidden md:h-[70vh]">

          {/* Desktop: product slideshow */}
          <div className="hidden md:flex absolute right-0 top-0 bottom-0 items-center z-0">
            <div className="relative h-full">
              <img
                src={heroSlides.currentSrc}
                alt="Black Crème"
                className="h-full w-auto transition-opacity duration-300"
                style={{ opacity: heroSlides.visible ? 1 : 0 }}
              />
              {heroSlides.slides.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {heroSlides.slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => heroSlides.goTo(i)}
                      className={`rounded-full transition-all duration-300 ${
                        i === heroSlides.index
                          ? 'w-5 h-1.5 bg-primary-dark/60'
                          : 'w-1.5 h-1.5 bg-primary-dark/25 hover:bg-primary-dark/45'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-[#EDE0D0] to-transparent pointer-events-none" />
          </div>

          {/* Text content */}
          <div className="relative z-10 flex flex-col justify-center px-8 md:px-14 lg:px-20 pt-12 pb-8 md:py-0 md:h-full">
            <div className="max-w-[380px]">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="font-serif italic text-primary-dark/40 tracking-wider text-xl block mb-4"
              >
                Est. 2026
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-6xl md:text-7xl lg:text-8xl font-logo text-primary-dark mb-6 leading-[0.9] tracking-tighter"
              >
                <span className="text-black drop-shadow-sm">Black</span><br/>
                <span className="text-accent-caramel drop-shadow-sm">Crème</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-lg text-primary-dark/50 mb-10 font-light tracking-wide"
              >
                Handcrafted Basque & Tiramisu Cakes.<br/>Pure Indulgence.
              </motion.p>
              <motion.a
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                href="#menu"
                className="inline-flex items-center px-10 py-5 bg-accent-caramel hover:bg-accent-caramel-dark text-white rounded-full font-semibold tracking-widest uppercase text-xs transition-all transform hover:scale-105 shadow-xl"
              >
                Explore Menu
                <ChevronRight className="ml-2 w-4 h-4" />
              </motion.a>
            </div>
          </div>

          {/* Mobile: product slideshow stacked below text */}
          <div className="md:hidden h-72 w-full relative overflow-hidden">
            <img
              src={heroSlides.currentSrc}
              alt="Black Crème"
              className="w-full h-full object-cover object-top transition-opacity duration-300"
              style={{ opacity: heroSlides.visible ? 1 : 0 }}
            />
            {heroSlides.slides.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {heroSlides.slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => heroSlides.goTo(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === heroSlides.index
                        ? 'w-5 h-1.5 bg-white/80'
                        : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/65'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Banners — outside overflow-hidden, renders freely below hero */}
        <div className="bg-primary-cream">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
            <BannerCarousel />
          </div>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="app-container" id="menu">
        {/* Left Column: Menu */}
        <section className="left-column">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-serif mb-2">Our Menu</h2>
            <p className="text-gray-soft text-sm uppercase tracking-[4px] opacity-60">Handpicked Selection</p>
            
            {/* Category Tabs */}
            <div className="flex space-x-6 mt-10 border-b border-primary-dark/10 overflow-x-auto whitespace-nowrap scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`pb-4 text-[10px] font-semibold uppercase tracking-widest transition-all relative ${
                    activeCategory === cat
                      ? 'text-primary-dark'
                      : 'text-gray-soft hover:text-primary-dark opacity-40'
                  }`}
                >
                  {cat}
                  {activeCategory === cat && (
                    <motion.div layoutId="activeCat" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-caramel" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={addToCart} />
            ))}
          </div>
        </section>

        {/* Right Column: Order Summary */}
        <aside className="right-column" id="order">
          <div className="flex justify-between items-baseline border-b border-primary-dark/10 pb-4 mb-8">
            <h2 className="text-2xl font-serif">Your Selection</h2>
            <span className="text-xs text-gray-soft">{totalItems} items</span>
          </div>

          <div className="flex-grow overflow-y-auto pr-2 space-y-4 max-h-[60vh] lg:max-h-[500px] scrollbar-hide">
            {cart.length === 0 ? (
              <div className="text-center py-10 opacity-30 italic text-sm">
                Your selection is empty
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-sm group">
                  <div className="flex-1">
                    <span className="font-medium">{item.name}</span>
                    <div className="flex items-center gap-4 mt-2">
                       <div className="flex items-center space-x-2 bg-primary-cream rounded p-0.5">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-0.5 hover:text-accent-caramel"><Minus className="w-3 h-3" /></button>
                          <span className="w-4 text-center text-[10px] font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-0.5 hover:text-accent-caramel"><Plus className="w-3 h-3" /></button>
                       </div>
                       <button onClick={() => removeFromCart(item.id)} className="text-red-400 group-hover:opacity-100 lg:opacity-0 transition-opacity"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-serif">RM {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 border-t border-dotted border-primary-dark/30 pt-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-serif">Total</span>
              <span className="text-2xl font-serif text-accent-caramel">RM {totalPrice.toFixed(2)}</span>
            </div>

            <button
              onClick={() => {
                if (cart.length === 0) return;
                if (settings.payment_method === 'whatsapp' && settings.whatsapp_quick_order) {
                  window.open(generateQuickWhatsAppLink(), '_blank');
                } else {
                  setShowOrderForm(true);
                }
              }}
              className={`flex items-center justify-center gap-3 transition-transform active:scale-[0.98] ${
                settings.payment_method === 'stripe'
                  ? 'w-full py-4 bg-primary-dark hover:bg-accent-caramel text-white rounded-full font-semibold tracking-widest uppercase text-xs shadow-lg'
                  : 'whatsapp-btn'
              }`}
            >
              {settings.payment_method === 'stripe'
                ? <><CreditCard className="w-5 h-5" /> Place Order</>
                : <><MessageCircle className="w-5 h-5" /> Place Order</>
              }
            </button>
            <p className="mt-4 text-center text-[9px] opacity-40 uppercase tracking-[2px]">
              {settings.payment_method === 'stripe' ? 'Secured via Stripe Payment' : 'Secured via WhatsApp Chat'}
            </p>
          </div>
        </aside>
      </div>

      <div className="vertical-label">Artisanal Bakery Selection</div>

      {/* Order Form Modal */}
      <AnimatePresence>
        {showOrderForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowOrderForm(false); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-xl font-serif">Complete Your Order</h2>
                  <p className="text-[10px] uppercase tracking-widest opacity-40 mt-0.5">Fill in your details</p>
                </div>
                <button onClick={() => setShowOrderForm(false)} className="p-1 hover:text-accent-caramel transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Form */}
              <div className="overflow-y-auto flex-1 p-6 space-y-4">

                {/* Name */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Name *</label>
                  <input type="text" placeholder="e.g. Sarah Lim" value={orderForm.name}
                    onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })}
                    className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel" />
                </div>

                {/* Phone */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Phone *</label>
                  <input type="tel" placeholder="e.g. 012-3456789" value={orderForm.phone}
                    onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                    className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel" />
                </div>

                {/* Email — required for Stripe (guests + admin testing) */}
                {settings.payment_method === 'stripe' && !profile && (
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">
                      Email * <span className="normal-case font-normal opacity-60">(for order confirmation)</span>
                    </label>
                    <input type="email" placeholder="e.g. sarah@email.com" value={orderForm.email}
                      onChange={(e) => setOrderForm({ ...orderForm, email: e.target.value })}
                      className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel" />
                  </div>
                )}

                {/* Delivery type toggle */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-2">Delivery Method</label>
                  <div className="flex rounded-lg border border-primary-dark/15 overflow-hidden">
                    {(['delivery', 'pickup'] as const).map((type) => (
                      <button key={type} type="button"
                        onClick={() => setOrderForm({ ...orderForm, deliveryType: type })}
                        className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-widest transition-all ${
                          orderForm.deliveryType === type
                            ? 'bg-primary-dark text-white'
                            : 'bg-white text-gray-400 hover:bg-primary-cream'
                        }`}>
                        {type === 'delivery' ? '🚗 Delivery' : '🏪 Self Pickup'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Address fields — only for delivery */}
                {orderForm.deliveryType === 'delivery' && (
                  <>
                    {/* Saved address selector for logged-in users */}
                    {user && savedAddresses.length > 0 && (
                      <div>
                        <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Saved Addresses</label>
                        <select
                          onChange={(e) => {
                            const addr = savedAddresses.find(a => a.id === e.target.value);
                            if (!addr) return;
                            setOrderForm(f => ({
                              ...f,
                              addressLine1: addr.address_line_1,
                              addressLine2: addr.address_line_2 ?? '',
                              postcode: addr.postcode,
                              city: addr.city,
                              state: addr.state,
                            }));
                          }}
                          className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel bg-white"
                        >
                          <option value="">— Choose a saved address —</option>
                          {savedAddresses.map(a => (
                            <option key={a.id} value={a.id}>
                              {a.label ? `${a.label} — ` : ''}{a.address_line_1}, {a.city}
                              {a.is_default ? ' (Default)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Address Line 1 */}
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Address Line 1 *</label>
                      <input type="text" placeholder="e.g. No. 5, Jalan SS2/24" value={orderForm.addressLine1}
                        onChange={(e) => setOrderForm({ ...orderForm, addressLine1: e.target.value })}
                        className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel" />
                    </div>

                    {/* Address Line 2 */}
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Address Line 2 <span className="normal-case font-normal opacity-60">(optional)</span></label>
                      <input type="text" placeholder="e.g. Unit 3A, Residensi Vista" value={orderForm.addressLine2}
                        onChange={(e) => setOrderForm({ ...orderForm, addressLine2: e.target.value })}
                        className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel" />
                    </div>

                    {/* State dropdown */}
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">State *</label>
                      <select
                        value={orderForm.state}
                        onChange={(e) => setOrderForm(f => ({ ...f, state: e.target.value, city: '', postcode: '' }))}
                        className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel bg-white"
                      >
                        <option value="">— Select state —</option>
                        {SUPPORTED_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    {/* City dropdown — filtered by state */}
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">City *</label>
                      <select
                        value={orderForm.city}
                        onChange={(e) => setOrderForm(f => ({ ...f, city: e.target.value, postcode: '' }))}
                        disabled={!orderForm.state}
                        className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <option value="">— Select city —</option>
                        {(STATE_CITIES[orderForm.state as keyof typeof STATE_CITIES] ?? []).map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Postcode — searchable combobox */}
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Postcode *</label>
                      <PostcodeCombobox
                        value={orderForm.postcode}
                        filterState={orderForm.state}
                        filterCity={orderForm.city}
                        onChange={handlePostcodeChange}
                      />
                      {feeLoading && <p className="mt-1 text-[11px] text-gray-400">Looking up zone…</p>}
                      {!feeLoading && orderForm.postcode.length === 5 && isServiceable && (
                        <span className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-[11px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                          {zoneLabel} | ETA: {estimatedTime}
                        </span>
                      )}
                    </div>
                  </>
                )}

                {/* Self pickup notice */}
                {orderForm.deliveryType === 'pickup' && (
                  <div className="rounded-xl bg-primary-cream border border-accent-caramel/30 px-4 py-3 text-sm text-primary-dark/70">
                    🏪 <strong className="text-primary-dark">Self Pickup</strong> — No delivery fee. We'll contact you to arrange a time.
                  </div>
                )}

                {/* Date + Time */}
                {(() => {
                  const now = new Date();
                  const nowHours = now.getHours() + now.getMinutes() / 60;
                  const pad = (n: number) => String(n).padStart(2, '0');
                  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
                  const tomorrow = new Date(now);
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  const tomorrowStr = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;
                  const hasAvailableToday = TIME_SLOTS.some(s => s.startHour >= nowHours + 4);
                  const minDate = hasAvailableToday ? todayStr : tomorrowStr;
                  const availableSlots = orderForm.date === todayStr
                    ? TIME_SLOTS.filter(s => s.startHour >= nowHours + 4)
                    : TIME_SLOTS;
                  return (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Date *</label>
                        <input
                          type="date"
                          value={orderForm.date}
                          min={minDate}
                          onChange={(e) => setOrderForm(f => ({ ...f, date: e.target.value, time: '' }))}
                          className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Time Slot</label>
                        <select
                          value={orderForm.time}
                          onChange={(e) => setOrderForm(f => ({ ...f, time: e.target.value }))}
                          disabled={!orderForm.date}
                          className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <option value="">— Select —</option>
                          {availableSlots.map(s => (
                            <option key={s.label} value={s.label}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })()}

                {/* Cake Message */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Cake Message <span className="normal-case">(optional)</span></label>
                  <input type="text" placeholder="e.g. Happy Birthday Mama" value={orderForm.cakeMessage}
                    onChange={(e) => setOrderForm({ ...orderForm, cakeMessage: e.target.value })}
                    className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel" />
                </div>

                {/* Order Summary */}
                <div className="bg-primary-cream/60 rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-3">Order Summary</p>
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs mb-1.5">
                      <span className="text-primary-dark/70">{item.name} × {item.quantity}</span>
                      <span className="font-medium">RM {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t border-primary-dark/10 mt-3 pt-3 space-y-1.5">
                    <div className="flex justify-between text-xs text-primary-dark/50">
                      <span>Subtotal</span>
                      <span>RM {totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-primary-dark/50">
                      <span>Delivery{zoneLabel ? ` (${zoneLabel})` : ''}</span>
                      <span>{deliveryFee === 0 ? 'Free' : `RM ${deliveryFee.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold pt-1">
                      <span>Total</span>
                      <span className="text-accent-caramel">RM {(totalPrice + (orderForm.deliveryType === 'pickup' ? 0 : deliveryFee)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="p-6 border-t border-gray-100 flex gap-3 shrink-0">
                <button onClick={() => setShowOrderForm(false)}
                  className="flex-1 py-3 border border-primary-dark/20 text-primary-dark text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-primary-cream transition-all">
                  Back
                </button>
                {settings.payment_method === 'stripe' ? (
                  <button
                    onClick={() => handleStripeCheckout(orderForm)}
                    disabled={
                      stripeLoading ||
                      !orderForm.name || !orderForm.phone || !orderForm.date ||
                      (!profile && !orderForm.email) ||
                      (orderForm.deliveryType === 'delivery' &&
                        (!orderForm.addressLine1 || !orderForm.postcode || !isServiceable || feeLoading))
                    }
                    className="flex-[2] py-3 bg-primary-dark disabled:opacity-40 text-white text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-accent-caramel transition-all flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    {stripeLoading ? 'Redirecting…' : 'Pay with Stripe'}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const deliveryIncomplete = orderForm.deliveryType === 'delivery' &&
                        (!orderForm.addressLine1 || !orderForm.postcode || !isServiceable || feeLoading);
                      if (!orderForm.name || !orderForm.phone || !orderForm.date || deliveryIncomplete) return;
                      window.open(generateWhatsAppLink(orderForm), '_blank');
                      setShowOrderForm(false);
                    }}
                    disabled={
                      !orderForm.name || !orderForm.phone || !orderForm.date ||
                      (orderForm.deliveryType === 'delivery' &&
                        (!orderForm.addressLine1 || !orderForm.postcode || !isServiceable || feeLoading))
                    }
                    className="flex-[2] py-3 bg-[#25D366] disabled:opacity-40 text-white text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-[#1ebe5d] transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Confirm & Send
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi! I would like to have some enquiries on the cake. 🎂')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-full shadow-lg transition-all duration-300 hover:scale-105 group"
        aria-label="Chat on WhatsApp"
      >
        <span className="hidden group-hover:flex items-center pl-4 text-sm font-medium whitespace-nowrap">
          Chat with us
        </span>
        <div className="w-14 h-14 flex items-center justify-center rounded-full shrink-0">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </div>
      </a>

      {/* Footer */}
      <footer id="contact" className="py-20 bg-primary-dark text-white/30 text-center text-[10px] tracking-[4px] uppercase border-t border-white/5">
        <span className="font-logo text-lg mb-4 block tracking-normal normal-case text-accent-caramel opacity-80">Black Crème</span>
        <div className="flex items-center justify-center gap-5 mb-5">
          <a
            href="https://www.facebook.com/people/Black-Cr%C3%A8me/61583773742224/?rdid=bKDjt5QGPnWCCvhz&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F189KmRkJik%2F"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="text-white/30 hover:text-accent-caramel transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
            </svg>
          </a>
          <a
            href="https://www.instagram.com/black.creme"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-white/30 hover:text-accent-caramel transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
          </a>
        </div>
        © 2026 • Handcrafted with Indulgence
      </footer>
    </div>
  );
}

// ─── Postcode searchable combobox ────────────────────────────────────────────

interface PostcodeComboboxProps {
  value: string;
  onChange: (postcode: string) => void;
  filterState: string;
  filterCity: string;
}

// ─── User Dropdown ────────────────────────────────────────────────────────────

function UserDropdown({ name, onSignOut }: { name: string; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-xs font-medium text-primary-dark/70 hover:text-accent-caramel transition-colors"
      >
        Hi, {name}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-xl border border-primary-dark/5 overflow-hidden z-50">
          <a href="/profile" onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-primary-cream transition-colors">
            <User className="w-4 h-4 text-gray-400" />
            My Profile
          </a>
          <a href="/orders" onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-primary-cream transition-colors border-t border-primary-dark/5">
            <ClipboardList className="w-4 h-4 text-gray-400" />
            My Orders
          </a>
          <button
            onClick={() => { setOpen(false); onSignOut(); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-50 transition-colors border-t border-primary-dark/5"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

function PostcodeCombobox({ value, onChange, filterState, filterCity }: PostcodeComboboxProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const options = useMemo(() => {
    return Object.entries(POSTCODE_LOOKUP)
      .filter(([pc, entry]) => {
        if (filterState && entry.state !== filterState) return false;
        if (filterCity && entry.city !== filterCity) return false;
        if (query) return pc.startsWith(query);
        return true;
      })
      .slice(0, 60)
      .map(([pc, entry]) => ({ postcode: pc, label: `${pc} – ${entry.city}` }));
  }, [query, filterState, filterCity]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const displayValue = value ? `${value} – ${POSTCODE_LOOKUP[value]?.city ?? ''}` : '';

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        inputMode="numeric"
        placeholder="Search postcode e.g. 47180"
        value={open ? query : displayValue}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, '').slice(0, 5);
          setQuery(digits);
          setOpen(true);
          if (!digits) onChange('');
        }}
        onFocus={() => {
          setQuery('');
          setOpen(true);
        }}
        className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel"
      />
      {open && options.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 max-h-48 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg list-none p-0 m-0">
          {options.map(({ postcode, label }) => (
            <li key={postcode}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(postcode);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-primary-cream transition-colors border-b border-gray-50 last:border-0"
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && options.length === 0 && query.length >= 1 && (
        <div className="absolute z-50 w-full mt-1 rounded-lg border border-gray-200 bg-white shadow-lg px-3 py-2.5 text-xs text-gray-400">
          No matching postcode
        </div>
      )}
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product, quantity: number) => void;
}

function ProductCard({ product, onAdd }: ProductCardProps) {
  const [qty, setQty] = useState(1);
  const inStock = product.is_available && product.stock_qty > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="product-card flex flex-col h-full group"
    >
      <div className="relative aspect-square mb-6 overflow-hidden bg-primary-cream rounded-lg group">
        {product.image_url ? (
          <>
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden absolute inset-0 flex flex-col items-center justify-center p-6 text-center border-2 border-primary-dark/5 bg-primary-cream/50">
              <span className="font-logo text-accent-caramel text-2xl opacity-40 mb-2">BC</span>
              <span className="font-serif italic text-primary-dark/40 text-sm">{product.name}</span>
              <span className="text-[8px] uppercase tracking-[2px] text-gray-soft opacity-30 mt-4 italic">Artisanal Bake</span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center border-2 border-primary-dark/5 bg-primary-cream/50">
            <span className="font-logo text-accent-caramel text-2xl opacity-40 mb-2">BC</span>
            <span className="font-serif italic text-primary-dark/40 text-sm">{product.name}</span>
            <span className="text-[8px] uppercase tracking-[2px] text-gray-soft opacity-30 mt-4 italic">Artisanal Bake</span>
          </div>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-[10px] uppercase tracking-widest font-bold text-red-400 border border-red-300 px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
        {inStock && (
          <div className="absolute inset-0 bg-primary-dark/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="font-serif italic text-white text-lg">{product.name.split(' ')[0]}</span>
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1">
        <div className="code-badge">{product.category}</div>
        <h3 className="text-lg mb-2 font-semibold leading-tight group-hover:text-accent-caramel transition-colors">{product.name}</h3>
        <p className="text-[11px] text-gray-soft mb-6 leading-relaxed flex-1 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between mt-auto">
          <span className="font-serif text-lg">RM {product.price.toFixed(2)}</span>
          {inStock && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center gap-2 border border-primary-dark/10 rounded-full px-2 py-0.5">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-5 h-5 flex items-center justify-center hover:text-accent-caramel transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs font-bold w-4 text-center">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(product.stock_qty, qty + 1))}
                  className="w-5 h-5 flex items-center justify-center hover:text-accent-caramel transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          disabled={!inStock}
          onClick={() => { onAdd(product, qty); setQty(1); }}
          className="w-full mt-6 py-4 border border-primary-dark text-primary-dark text-[10px] uppercase tracking-widest font-bold rounded-lg hover:bg-primary-dark hover:text-white transition-all transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-primary-dark"
        >
          {inStock ? 'Add to Order' : 'Out of Stock'}
        </button>
      </div>
    </motion.div>
  );
}
