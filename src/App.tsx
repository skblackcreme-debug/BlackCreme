/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
  MessageCircle,
} from 'lucide-react';
import { PRODUCTS, WHATSAPP_NUMBER, BANK_INFO } from './constants';
import { Category, Product } from './types';
import { useCart } from './hooks/useCart';
import { useDeliveryFee } from './features/order/hooks/useDeliveryFee';
import { POSTCODE_LOOKUP, STATE_CITIES, SUPPORTED_STATES, isServiceablePostcode } from './data/deliveryZones';

const PAYMENT_OPTIONS = ['Online Transfer', 'Cash on Delivery'];

export default function App() {
  const { cart, addToCart, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();
  const [activeCategory, setActiveCategory] = useState<Category>(Category.BASQUE);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
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
    paymentMethod: 'Online Transfer',
  });

  const filteredProducts = PRODUCTS.filter(p => p.category === activeCategory);

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
      `💵 Payment  : ${form.paymentMethod}`,
      `─────────────────────`,
      `Bank: ${BANK_INFO.name}  |  Acc: ${BANK_INFO.accNo}`,
    ].filter(line => line !== null).join('\n');
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
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

          <div className="flex items-center space-x-4">
            <a href="#order" className="relative p-2 text-primary-dark hover:text-accent-caramel transition-colors" id="cart-badge">
              <ShoppingBag className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-accent-caramel text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                  {totalItems}
                </span>
              )}
            </a>
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section id="hero" className="relative h-[90vh] flex items-center justify-center pt-16">
        <div className="absolute inset-0 z-0">
          <img
            src="input_file_0.png"
            alt="Hero Background"
            className="w-full h-full object-cover brightness-[0.4]"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
             <span className="font-serif italic text-white/60 tracking-wider text-sm">Est. 2025</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl font-logo text-white mb-6 leading-[0.9] tracking-tighter text-balance"
          >
            <span className="text-black drop-shadow-md">Black</span><br/><span className="text-accent-caramel drop-shadow-md">Crème</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-primary-cream/80 mb-10 max-w-md mx-auto font-light tracking-wide"
          >
            Handcrafted Basque & Tiramisu Cakes. Pure Indulgence.
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
      </section>

      {/* Main Content Area */}
      <div className="app-container" id="menu">
        {/* Left Column: Menu */}
        <section className="left-column">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-serif mb-2">Our Menu</h2>
            <p className="text-gray-soft text-sm uppercase tracking-[4px] opacity-60">Handpicked Selection</p>
            
            {/* Category Tabs */}
            <div className="flex space-x-6 mt-10 border-b border-primary-dark/10 overflow-x-auto whitespace-nowrap scrollbar-hide">
              {[Category.BASQUE, Category.TIRAMISU, Category.ADDONS].map((cat) => (
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

            <div className="payment-box mb-6">
              <div className="text-[10px] uppercase font-bold opacity-40 mb-2 tracking-widest text-primary-dark">Bank Transfer Details</div>
              <div className="font-bold text-lg leading-tight uppercase tracking-tight">{BANK_INFO.name}</div>
              <div className="font-mono text-xl tracking-wider text-accent-caramel mt-1">{BANK_INFO.accNo}</div>
              <p className="text-[10px] mt-3 opacity-60 italic leading-relaxed text-balance">
                Please send proof of payment via WhatsApp for order confirmation.
              </p>
            </div>

            <button
              onClick={() => { if (cart.length > 0) setShowOrderForm(true); }}
              className="whatsapp-btn flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
            >
              <MessageCircle className="w-5 h-5" />
              Place Order
            </button>
            <p className="mt-4 text-center text-[9px] opacity-40 uppercase tracking-[2px]">Secured via WhatsApp Chat</p>
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Date *</label>
                    <input type="date" value={orderForm.date}
                      onChange={(e) => setOrderForm({ ...orderForm, date: e.target.value })}
                      className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Time Slot</label>
                    <input type="text" placeholder="e.g. 2pm – 4pm" value={orderForm.time}
                      onChange={(e) => setOrderForm({ ...orderForm, time: e.target.value })}
                      className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel" />
                  </div>
                </div>

                {/* Cake Message */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-1">Cake Message <span className="normal-case">(optional)</span></label>
                  <input type="text" placeholder="e.g. Happy Birthday Mama" value={orderForm.cakeMessage}
                    onChange={(e) => setOrderForm({ ...orderForm, cakeMessage: e.target.value })}
                    className="w-full border border-primary-dark/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-caramel" />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-50 block mb-2">Payment Method</label>
                  <div className="flex gap-3">
                    {PAYMENT_OPTIONS.map((opt) => (
                      <button key={opt} type="button"
                        onClick={() => setOrderForm({ ...orderForm, paymentMethod: opt })}
                        className={`flex-1 py-2.5 text-xs font-semibold rounded-lg border transition-all ${
                          orderForm.paymentMethod === opt
                            ? 'bg-primary-dark text-white border-primary-dark'
                            : 'border-primary-dark/15 text-primary-dark hover:border-accent-caramel'
                        }`}>
                        {opt}
                      </button>
                    ))}
                  </div>
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
                  className="flex-[2] py-3 bg-[#25D366] disabled:opacity-40 text-white text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-[#1ebe5d] transition-all flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Confirm & Send
                </button>
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
        <span className="font-logo text-lg mb-4 block tracking-normal text-accent-caramel opacity-80">Black Crème</span>
        © 2025 • Handcrafted with Indulgence
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="product-card flex flex-col h-full group"
    >
      <div className="relative aspect-square mb-6 overflow-hidden bg-primary-cream rounded-lg group">
        {product.image ? (
          <>
            <img
              src={product.image}
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
            <span className="text-[8px] uppercase tracking-[2px] text-gray-soft opacity-30 mt-4 italic">Add-on</span>
          </div>
        )}
        <div className="absolute inset-0 bg-primary-dark/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="font-serif italic text-white text-lg">{product.name.split(' ')[0]}</span>
        </div>
      </div>
      <div className="flex flex-col flex-1">
        <div className="code-badge">{product.category}</div>
        <h3 className="text-lg mb-2 font-semibold leading-tight group-hover:text-accent-caramel transition-colors">{product.name}</h3>
        <p className="text-[11px] text-gray-soft mb-6 leading-relaxed flex-1 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between mt-auto">
          <span className="font-serif text-lg">RM {product.price.toFixed(2)}</span>
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
                  onClick={() => setQty(qty + 1)}
                  className="w-5 h-5 flex items-center justify-center hover:text-accent-caramel transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
             </div>
          </div>
        </div>
        
        <button
          onClick={() => {
            onAdd(product, qty);
            setQty(1);
          }}
          className="w-full mt-6 py-4 border border-primary-dark text-primary-dark text-[10px] uppercase tracking-widest font-bold rounded-lg hover:bg-primary-dark hover:text-white transition-all transform active:scale-95"
        >
          Add to Order
        </button>
      </div>
    </motion.div>
  );
}
