import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../api';
import { PptCard } from '../components/PptCard';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';

export const Main = () => {
  const { t } = useLanguage();
  const [ppts, setPpts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPpts = async () => {
      try {
        const data = await api.ppt.getAll();
        setPpts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPpts();
  }, []);

  const filteredPpts = ppts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-grow bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('main_title')}</h1>
          
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-full shadow-sm focus:ring-2 focus:ring-[#fd2d55] outline-none transition-all"
              placeholder={t('search_placeholder')}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fd2d55]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredPpts.map((ppt, i) => (
              <motion.div
                key={ppt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <PptCard ppt={ppt} />
              </motion.div>
            ))}
            {filteredPpts.length === 0 && (
              <div className="col-span-full text-center py-20 text-gray-500">
                No presentations found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
