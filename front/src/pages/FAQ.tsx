import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';
import { HelpCircle } from 'lucide-react';

export const FAQ = () => {
  const { t } = useLanguage();

  const faqs = [
    { q: t('faq_q1'), a: t('faq_a1') },
    { q: t('faq_q2'), a: t('faq_a2') },
    { q: t('faq_q3'), a: t('faq_a3') },
  ];

  return (
    <div className="flex-grow bg-gray-50 py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle size={32} />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{t('faq')}</h1>
          <div className="w-24 h-1 bg-[#fd2d55] mx-auto rounded-full" />
        </div>

        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-start gap-3">
                <span className="text-[#fd2d55]">Q:</span> {faq.q}
              </h3>
              <p className="text-gray-600 leading-relaxed pl-8">
                <span className="font-bold text-gray-400 mr-2">A:</span> {faq.a}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
