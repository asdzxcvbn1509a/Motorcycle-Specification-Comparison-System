import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import th from '@/locales/th.json';
import en from '@/locales/en.json';

const stored = typeof window !== 'undefined' ? localStorage.getItem('lang') : null;
const lng = stored === 'en' || stored === 'th' ? stored : 'th';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      th: { translation: th },
      en: { translation: en },
    },
    lng,
    fallbackLng: 'th',
    interpolation: { escapeValue: false },
  });

i18n.on('languageChanged', (l) => {
  try {
    localStorage.setItem('lang', l);
    document.documentElement.lang = l;
  } catch {
    // ignore
  }
});

if (typeof document !== 'undefined') {
  document.documentElement.lang = lng;
}

export default i18n;
