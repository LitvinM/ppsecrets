import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../api';
import { PptCard } from '../components/PptCard';
import { motion } from 'motion/react';

export const Landing = () => {
  const { t } = useLanguage();
  const [ppts, setPpts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPpts = async () => {
      try {
        const data = await api.ppt.getAll();
        setPpts(data.slice(0, 3)); // Show only top 3 on landing
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPpts();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-grow flex flex-col"
    >
      {/* Hero Section */}
      <section className="relative bg-gray-50 overflow-hidden">
        <div className="absolute inset-0 bg-[#fd2d55]/5 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6"
            >
              {t('landing_title')}
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 mb-10 leading-relaxed"
            >
              {t('landing_subtitle')}
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Link 
                to="/login" 
                className="inline-block bg-[#fd2d55] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                {t('explore_now')}
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('featured_presentations')}</h2>
            <div className="w-24 h-1 bg-[#fd2d55] mx-auto rounded-full" />
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fd2d55]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ppts.map((ppt, i) => (
                <motion.div
                  key={ppt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                >
                  <PptCard ppt={ppt} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
};
