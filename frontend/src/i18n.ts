import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      'ClinicChat': 'ClinicChat',
      '[Chat messages will appear here]': '[Chat messages will appear here]',
      'Type your message...': 'Type your message...',
      'Send': 'Send',
      '...': '...'
    }
  },
  si: {
    translation: {
      'ClinicChat': 'ක්ලිනික්චැට්',
      '[Chat messages will appear here]': '[චැට් පණිවිඩ මෙහි පෙනේ]',
      'Type your message...': 'ඔබේ පණිවිඩය ටයිප් කරන්න...',
      'Send': 'යවන්න',
      '...': '...'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export default i18n; 