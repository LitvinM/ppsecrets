import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { api } from '../api';
import { motion } from 'motion/react';
import { CreditCard } from 'lucide-react';

export const Checkout = () => {
  const { t } = useLanguage();
  const { items, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const ids = items.map(item => item.id);

      // Вызываем новый эндпоинт для ЮKassa
      const response = await api.payment.create(ids);

      if (response && response.confirmationUrl) {
        clearCart();
        // Редирект на страницу оплаты ЮKassa
        window.location.href = response.confirmationUrl;
      }
    } catch (error) {
      console.error('Payment failed', error);
      alert('Payment initialization failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4">
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{t('checkout')}</h2>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-100 border-dashed">
            <p className="text-center text-gray-500 font-medium mb-2">Оплата через ЮKassa</p>
            <div className="text-center">
              <span className="text-sm text-gray-400 uppercase tracking-wider font-bold">Total to pay</span>
              <p className="text-4xl font-extrabold text-gray-900 mt-1">${total.toFixed(2)}</p>
            </div>
          </div>

          <button
              onClick={handlePay}
              disabled={loading || items.length === 0}
              className="w-full bg-[#fd2d55] text-white py-4 rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : (
                <>
                  <CreditCard size={20} />
                  {t('pay')} ${total.toFixed(2)}
                </>
            )}
          </button>
        </motion.div>
      </div>
  );
};