import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { BASE_URL } from '../api';

interface PptCardProps {
  ppt: any;
}

export const PptCard = ({ ppt }: PptCardProps) => {
  const { formatPrice, lang, t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const title = ppt.name;
  const price = ppt.price;
  const desc = lang === 'ru' ? ppt.shortDescriptionRu : ppt.shortDescriptionEn;
  const image = ppt.images && ppt.images.length > 0 
    ? `${BASE_URL.replace('/api', '')}/${ppt.images[0].replace('./', '')}` 
    : 'https://picsum.photos/seed/ppt/400/300';

  const handleClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate('/login');
    }
  };

  return (
    <Link 
      to={`/ppt/${ppt.id}`} 
      onClick={handleClick}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full"
    >
      <div className="aspect-video w-full overflow-hidden bg-gray-100 relative">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#fd2d55] shadow-sm">
          {formatPrice(ppt.price)}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-[#fd2d55] transition-colors">{title}</h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow">{desc}</p>
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-50">
          <span className="text-[#fd2d55] font-semibold text-sm group-hover:underline">{t('explore_now')} &rarr;</span>
        </div>
      </div>
    </Link>
  );
};
