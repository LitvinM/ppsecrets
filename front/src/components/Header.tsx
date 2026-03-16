import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, LogOut, User, Globe, Shield } from 'lucide-react';

export const Header = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const { items } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to={isAuthenticated ? "/app" : "/"} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#fd2d55] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="font-bold text-xl text-gray-900">{t('app_name')}</span>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setLang(lang === 'en' ? 'ru' : 'en')}
              className="flex items-center gap-1 text-gray-600 hover:text-[#fd2d55] transition-colors"
            >
              <Globe size={18} />
              <span className="uppercase text-sm font-medium">{lang}</span>
            </button>

            <Link to="/faq" className="text-gray-600 hover:text-[#fd2d55] transition-colors font-medium">
              {t('faq')}
            </Link>

            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-1 text-gray-600 hover:text-[#fd2d55] transition-colors">
                    <Shield size={18} />
                    <span className="hidden sm:inline font-medium">Admin</span>
                  </Link>
                )}
                <Link to="/cart" className="relative text-gray-600 hover:text-[#fd2d55] transition-colors">
                  <ShoppingCart size={24} />
                  {items.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#fd2d55] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {items.length}
                    </span>
                  )}
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1 text-gray-600 hover:text-[#fd2d55] transition-colors">
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-[#fd2d55] text-white px-5 py-2 rounded-full font-medium hover:bg-opacity-90 transition-all shadow-sm hover:shadow-md"
              >
                {t('login')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
