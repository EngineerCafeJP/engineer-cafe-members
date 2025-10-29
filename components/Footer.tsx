
import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  return (
    <footer className="h-[40px] flex items-center justify-center border-t border-gray-800">
      <p className="text-sm text-gray-400">{t('footerText')}</p>
    </footer>
  );
};

export default Footer;
