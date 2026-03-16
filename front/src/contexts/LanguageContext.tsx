// front/src/contexts/LanguageContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { translations, Language } from '../translations';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof typeof translations.en, params?: Record<string, string | number>) => string;
  formatPrice: (priceUsd: number) => string; // Новая функция для форматирования
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>('ru');
  const [exchangeRate, setExchangeRate] = useState<number>(90); // Дефолтный курс, если API недоступен

  // Загрузка актуального курса при инициализации
  useEffect(() => {
    const fetchRate = async () => {
      try {
        // Используем публичный API для получения курса USD/RUB
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        if (data && data.rates && data.rates.RUB) {
          setExchangeRate(data.rates.RUB);
        }
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
      }
    };
    fetchRate();
  }, []);

  const t = (key: keyof typeof translations.en, params?: Record<string, string | number>) => {
    let text = translations[lang][key] || translations['en'][key] || key;
    if (params) {
      Object.keys(params).forEach(k => {
        text = text.replace(`{${k}}`, String(params[k]));
      });
    }
    return text;
  };

  // Логика конвертации и форматирования
  const formatPrice = (priceUsd: number) => {
    if (lang === 'ru') {
      const priceRub = Math.round(priceUsd * exchangeRate);
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
      }).format(priceRub);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(priceUsd);
  };

  return (
      <LanguageContext.Provider value={{ lang, setLang, t, formatPrice }}>
        {children}
      </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};