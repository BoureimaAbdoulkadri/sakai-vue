import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { useClientAuthStore } from '@/stores/clientAuth';

import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import i18n from './i18n';

import '@/assets/tailwind.css';
import '@/assets/styles.scss';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
});
app.use(ToastService);
app.use(ConfirmationService);
app.use(i18n);

const authStore = useAuthStore(pinia);
if (authStore.token) {
    authStore.fetchMe().catch(() => {
        // Ignore errors at bootstrap; guard/flows will redirect if needed.
    });
}

const clientAuthStore = useClientAuthStore(pinia);
if (clientAuthStore.token) {
    clientAuthStore.fetchMe().catch(() => {
        // Ignore errors during bootstrap; router guard will redirect if necessary.
    });
}

app.mount('#app');
