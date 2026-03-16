import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const Footer = () => {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#fd2d55] rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">P</span>
            </div>
            <span className="font-bold text-gray-900">{t('app_name')}</span>
          </div>
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} {t('app_name')}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
