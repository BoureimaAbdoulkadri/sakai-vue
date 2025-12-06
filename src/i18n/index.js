import { createI18n } from 'vue-i18n';
import fr from './locales/fr.json';
import en from './locales/en.json';
import clientFr from '../locales/fr/client.json';
import clientEn from '../locales/en/client.json';

const frMessages = { ...fr, ...clientFr };
const enMessages = { ...en, ...clientEn };

const storedClientLocale = typeof window !== 'undefined' ? localStorage.getItem('client_locale') : null;
const storedLocale = typeof window !== 'undefined' ? localStorage.getItem('locale') : null;
const browserLocale =
    typeof navigator !== 'undefined' && navigator.language && navigator.language.startsWith('fr') ? 'fr' : 'en';

const defaultLocale = storedClientLocale || storedLocale || browserLocale || 'fr';

export const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: defaultLocale,
    fallbackLocale: 'en',
    messages: {
        fr: frMessages,
        en: enMessages
    }
});

export default i18n;
