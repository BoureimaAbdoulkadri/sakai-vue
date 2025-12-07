import {createI18n} from 'vue-i18n';
import menuFr from './locales/fr.json';
import menuEn from './locales/en.json';
import clientFr from './locales/fr/client.json';
import clientEn from './locales/en/client.json';
import adminFr from './locales/fr/admin.json';
import adminEn from './locales/en/admin.json';

const frMessages = {...menuFr, ...clientFr, admin: adminFr};
const enMessages = {...menuEn, ...clientEn, admin: adminEn};

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
