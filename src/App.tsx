/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
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
  CreditCard
} from 'lucide-react';
import { PRODUCTS, WHATSAPP_NUMBER, BANK_INFO } from './constants';
import { Category, Product, CartItem } from './types';
import { useCart } from './hooks/useCart';

export default function App() {
  const { cart, addToCart, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();
  const [activeCategory, setActiveCategory] = useState<Category>(Category.BASQUE);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const filteredProducts = PRODUCTS.filter(p => p.category === activeCategory);

  const generateWhatsAppLink = () => {
    if (cart.length === 0) return '#';
    const itemsText = cart.map(i => `${i.code} x ${i.quantity}`).join(', ');
    const message = `Hello, I would like to place an order:\n\nCustomer Info\nName :\nTel No:\nCake: ${itemsText}\n\nPlease bank in with the following info:\nBank : ${BANK_INFO.name}\nAcc No : ${BANK_INFO.accNo}`;
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
            Black<br/><span className="text-accent-caramel drop-shadow-md">Crème</span>
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
              {[Category.BASQUE, Category.TIRAMISU].map((cat) => (
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
                    <p className="font-bold text-[10px] font-mono text-accent-caramel opacity-60 inline mr-2 tracking-tighter">{item.code}</p>
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
              onClick={() => {
                if (cart.length > 0) {
                  window.open(generateWhatsAppLink(), '_blank');
                }
              }}
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

      {/* Footer */}
      <footer id="contact" className="py-20 bg-primary-dark text-white/30 text-center text-[10px] tracking-[4px] uppercase border-t border-white/5">
        <span className="font-logo text-lg mb-4 block tracking-normal text-accent-caramel opacity-80">Black Crème</span>
        © 2025 • Handcrafted with Indulgence
      </footer>
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
        <div className="absolute inset-0 bg-primary-dark/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="font-serif italic text-white text-lg">{product.name.split(' ')[0]}</span>
        </div>
      </div>
      <div className="flex flex-col flex-1">
        <div className="code-badge">{product.code} • {product.category.split(' ')[0]}</div>
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
