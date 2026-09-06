import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';

export const CartDrawer = () => {
  const { isCartOpen, setIsCartOpen, cart, removeFromCart, updateQuantity, cartTotal } = useShop();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-canvas z-[70] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-white/50">
              <h2 className="text-2xl font-serif text-ink">Your Cart ({cart.length})</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                  <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag size={32} />
                  </div>
                  <p className="text-lg font-serif">Your cart is empty</p>
                  <button onClick={() => setIsCartOpen(false)} className="mt-4 text-brand-blue hover:underline">
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div 
                    key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                    layout
                    className="flex gap-4 bg-white p-4 rounded-lg shadow-sm border border-stone-100"
                  >
                    <div className="w-20 h-24 bg-stone-100 rounded-md overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-serif text-lg leading-tight">{item.name}</h3>
                        <button onClick={() => removeFromCart(item.id)} className="text-stone-400 hover:text-brand-orange">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-sm text-stone-500 mb-2">
                        {item.selectedSize && `Size: ${item.selectedSize}`} 
                        {item.selectedColor && ` • Color: ${item.selectedColor}`}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center border border-stone-200 rounded-md">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-stone-100"><Minus size={14} /></button>
                          <span className="px-3 text-sm font-medium">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-stone-100"><Plus size={14} /></button>
                        </div>
                        <p className="font-medium text-brand-blue">${item.price * item.quantity}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 bg-white border-t border-stone-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-stone-500">Subtotal</span>
                  <span className="text-2xl font-serif font-medium">${cartTotal}</span>
                </div>
                <p className="text-xs text-stone-400 mb-6 text-center">Shipping & taxes calculated at checkout</p>
                <button 
                  onClick={handleCheckout}
                  className="w-full py-4 bg-ink text-white font-medium rounded-sm hover:bg-brand-blue transition-colors flex items-center justify-center gap-2 group"
                >
                  Proceed to Checkout <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
