import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { api, BASE_URL } from '../api';
import { motion } from 'motion/react';
import { ShoppingCart, ArrowLeft, Download } from 'lucide-react';

export const PptDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { lang, t } = useLanguage();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  const [ppt, setPpt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  const { formatPrice } = useLanguage();

  useEffect(() => {
    const fetchPpt = async () => {
      try {
        if (id) {
          const data = await api.ppt.getById(id);
          setPpt(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPpt();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-grow flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fd2d55]"></div>
      </div>
    );
  }

  if (!ppt) {
    return <div className="flex-grow flex justify-center items-center">Presentation not found.</div>;
  }

  const desc = lang === 'ru' ? ppt.descriptionRu : ppt.descriptionEn;
  const images = ppt.images && ppt.images.length > 0 
    ? ppt.images.map((img: string) => `${BASE_URL.replace('/api', '')}/${img.replace('./', '')}`) 
    : ['https://picsum.photos/seed/ppt/800/600'];

  const handleAddToCart = () => {
    addToCart({
      id: ppt.id,
      name: ppt.name,
      price: ppt.price, // Mock price
      image: images[0]
    });
    navigate('/cart');
  };

  return (
    <div className="flex-grow bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-[#fd2d55] transition-colors mb-8 font-medium"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images Section */}
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-video bg-gray-100 rounded-2xl overflow-hidden shadow-md border border-gray-100"
            >
              <img 
                src={images[activeImage]} 
                alt={ppt.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {images.map((img: string, idx: number) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`flex-shrink-0 w-24 aspect-video rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-[#fd2d55] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{ppt.name}</h1>
            
            <div className="flex items-center gap-4 mb-8">
              <span className="text-3xl font-bold text-[#fd2d55]">{formatPrice(ppt.price)}</span>

            </div>

            <div className="prose prose-gray max-w-none mb-10 text-gray-600 leading-relaxed">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t('description')}</h3>
              <p className="whitespace-pre-wrap">{desc}</p>
            </div>

            <div className="mt-auto pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-[#fd2d55] text-white py-4 rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <ShoppingCart size={24} />
                {t('add_to_cart')}
              </button>

            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
