import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { motion } from 'motion/react';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export const Cart = () => {
  const { formatPrice, t } = useLanguage();

  const { items, removeFromCart, total } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center bg-gray-50 py-20 px-4">
        <div className="w-24 h-24 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('cart_empty')}</h2>
        <Link to="/app" className="text-[#fd2d55] font-medium hover:underline mt-4 flex items-center gap-2">
          {t('explore_now')} <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-grow bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('cart')}</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <ul className="divide-y divide-gray-100">
            {items.map((item, i) => (
              <motion.li 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 flex items-center gap-6"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-[#fd2d55] font-bold">{formatPrice(item.price)}</p>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-2"
                  title={t('remove')}
                >
                  <Trash2 size={24} />
                </button>
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div>
            <p className="text-gray-500 font-medium mb-1">{t('total')}</p>
            <p className="text-4xl font-extrabold text-gray-900">{formatPrice(total)}</p>
          </div>
          <button 
            onClick={() => navigate('/checkout')}
            className="w-full sm:w-auto bg-[#fd2d55] text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl"
          >
            {t('checkout')}
          </button>
        </div>
      </div>
    </div>
  );
};
