
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  useEffect(() => {
    setCurrentLang(i18n.language.startsWith('ja') ? 'ja' : 'en');
  }, [i18n.language]);

  const toggleLanguage = () => {
    const newLang = currentLang === 'ja' ? 'en' : 'ja';
    i18n.changeLanguage(newLang);
    setCurrentLang(newLang);
  };

  return (
    <header className="bg-black/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-800 h-[60px]">
      <div className="container mx-auto flex items-center justify-between h-full px-4 md:px-6">
        <h1 className="text-xl md:text-2xl font-bold text-grok-green tracking-wider">
          {t('headerTitle')}
        </h1>
        <button
          onClick={toggleLanguage}
          className="text-2xl p-2 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-grok-green transition-all duration-300"
          aria-label={`Switch to ${currentLang === 'ja' ? 'English' : 'Japanese'}`}
        >
          {currentLang === 'ja' ? '🇺🇸' : '🇯🇵'}
        </button>
      </div>
    </header>
  );
};

export default Header;
