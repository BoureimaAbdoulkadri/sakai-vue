import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { clientFetchMe, clientLogin, clientLogout, clientRegister } from '@/services/client/authService';

const STORAGE_KEY = 'client_auth_token';

export const useClientAuthStore = defineStore('clientAuth', () => {
    const token = ref(typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null);
    const customer = ref(null);
    const loading = ref(false);

    const isAuthenticated = computed(() => Boolean(token.value) && Boolean(customer.value));

    function setToken(newToken) {
        token.value = newToken;
        if (typeof window === 'undefined') {
            return;
        }

        if (newToken) {
            localStorage.setItem(STORAGE_KEY, newToken);
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }

    async function login(credentials) {
        loading.value = true;
        try {
            const data = await clientLogin(credentials);
            setToken(data.token);
            customer.value = data.customer;
        } finally {
            loading.value = false;
        }
    }

    async function register(payload) {
        loading.value = true;
        try {
            const data = await clientRegister(payload);
            setToken(data.token);
            customer.value = data.customer;
        } finally {
            loading.value = false;
        }
    }

    async function fetchMe() {
        if (!token.value) {
            return;
        }

        loading.value = true;
        try {
            const data = await clientFetchMe(token.value);
            customer.value = data.customer;
        } finally {
            loading.value = false;
        }
    }

    async function logout() {
        try {
            await clientLogout();
        } catch (error) {
            console.error(error);
        } finally {
            setToken(null);
            customer.value = null;
        }
    }

    return {
        token,
        customer,
        loading,
        isAuthenticated,
        setToken,
        login,
        register,
        fetchMe,
        logout
    };
});
