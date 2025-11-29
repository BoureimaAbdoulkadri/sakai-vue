import { createI18n } from 'vue-i18n';
import fr from './locales/fr.json';
import en from './locales/en.json';

const defaultLocale =
    localStorage.getItem('locale') || (navigator.language && navigator.language.startsWith('fr') ? 'fr' : 'en');

export const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: defaultLocale,
    fallbackLocale: 'en',
    messages: {
        fr,
        en
    }
});

export default i18n;
