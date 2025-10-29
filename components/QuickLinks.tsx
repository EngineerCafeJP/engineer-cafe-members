import React from 'react';
import { useTranslation } from 'react-i18next';

const QuickLinks: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section aria-label={t('quickLinks.sectionAria') as string} className="grid gap-4 md:grid-cols-2">
      <a
        href="https://engineercafe.jp/ja/free-consultation"
        target="_blank"
        rel="noopener noreferrer"
        className="group block rounded-lg border border-gray-800 bg-gray-900/60 hover:bg-gray-900 transition-colors p-5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-white">{t('quickLinks.consultation')}</h2>
            <p className="mt-1 text-sm text-gray-400">{t('quickLinks.consultationDesc')}</p>
          </div>
          <span className="ml-4 inline-flex items-center justify-center rounded-md bg-emerald-600 text-white h-10 px-4 group-hover:bg-emerald-500">
            {t('quickLinks.openExternal')}
          </span>
        </div>
      </a>

      <a
        href="https://engineercafe.jp/ja/event"
        target="_blank"
        rel="noopener noreferrer"
        className="group block rounded-lg border border-gray-800 bg-gray-900/60 hover:bg-gray-900 transition-colors p-5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-white">{t('quickLinks.events')}</h2>
            <p className="mt-1 text-sm text-gray-400">{t('quickLinks.eventsDesc')}</p>
          </div>
          <span className="ml-4 inline-flex items-center justify-center rounded-md bg-emerald-600 text-white h-10 px-4 group-hover:bg-emerald-500">
            {t('quickLinks.openExternal')}
          </span>
        </div>
      </a>
    </section>
  );
};

export default QuickLinks;
