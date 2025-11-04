// src/i18n.js

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enTranslation from './locales/en/translation.json';
import deTranslation from './locales/de/translation.json';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      de: {
        translation: deTranslation,
      },
    },
    lng: 'en', // initial language
    fallbackLng: 'en', // fallback language if the selected language doesn't have a translation
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
