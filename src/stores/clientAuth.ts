import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type {
    ClientAuthResponse,
    ClientLoginPayload,
    ClientRegisterPayload,
    ClientUser
} from '@/services/authClient';
import { fetchClientMe, loginClient, logoutClient, registerClient } from '@/services/authClient';

const STORAGE_KEY = 'client_auth_token';

function readToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
}

function persistToken(token: string | null) {
    if (typeof window === 'undefined') {
        return;
    }

    if (token) {
        localStorage.setItem(STORAGE_KEY, token);
    } else {
        localStorage.removeItem(STORAGE_KEY);
    }
}

function applyAuthResponse(response: ClientAuthResponse) {
    return {
        token: response.token,
        customer: response.customer
    };
}

export const useClientAuthStore = defineStore('clientAuth', () => {
    const token = ref<string | null>(readToken());
    const customer = ref<ClientUser | null>(null);
    const loading = ref(false);
    const initialized = ref(false);

    const isAuthenticated = computed(() => Boolean(token.value));

    function setToken(newToken: string | null) {
        token.value = newToken;
        persistToken(newToken);
    }

    function setCustomer(data: ClientUser | null) {
        customer.value = data;
    }

    async function login(payload: ClientLoginPayload) {
        loading.value = true;
        try {
            const { token: newToken, customer: authCustomer } = applyAuthResponse(await loginClient(payload));
            setToken(newToken);
            setCustomer(authCustomer);
            initialized.value = true;
        } finally {
            loading.value = false;
        }
    }

    async function register(payload: ClientRegisterPayload) {
        loading.value = true;
        try {
            const { token: newToken, customer: authCustomer } = applyAuthResponse(await registerClient(payload));
            setToken(newToken);
            setCustomer(authCustomer);
            initialized.value = true;
        } finally {
            loading.value = false;
        }
    }

    async function fetchMe() {
        if (!token.value) {
            initialized.value = true;
            setCustomer(null);
            return;
        }

        loading.value = true;
        try {
            const data = await fetchClientMe();
            setCustomer(data.customer);
        } catch (error) {
            setToken(null);
            setCustomer(null);
            throw error;
        } finally {
            loading.value = false;
            initialized.value = true;
        }
    }

    async function logout() {
        try {
            if (token.value) {
                await logoutClient();
            }
        } catch (error) {
            console.error('client logout failed', error);
        } finally {
            setToken(null);
            setCustomer(null);
            initialized.value = false;
        }
    }

    return {
        token,
        customer,
        loading,
        initialized,
        isAuthenticated,
        setCustomer,
        login,
        register,
        fetchMe,
        logout
    };
});
