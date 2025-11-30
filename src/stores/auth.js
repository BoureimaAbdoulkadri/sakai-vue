import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import http from '@/api/http';

const parseJSON = (value) => {
    if (!value) {
        return null;
    }

    try {
        return JSON.parse(value);
    } catch (error) {
        console.warn('Unable to parse persisted auth data', error);
        return null;
    }
};

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('auth_token'));
    const user = ref(parseJSON(localStorage.getItem('auth_user')));
    const customer = ref(parseJSON(localStorage.getItem('auth_customer')));
    const loading = ref(false);
    const error = ref(null);

    const isAuthenticated = computed(() => Boolean(token.value));
    const isAdmin = computed(() => {
        if (!user.value?.role) return false;
        return ['admin', 'manager'].includes(user.value.role);
    });

    function setAuth(data) {
        token.value = data.token;
        user.value = data.user;
        customer.value = data.customer;

        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        localStorage.setItem('auth_customer', JSON.stringify(data.customer));
    }

    function clearAuth() {
        token.value = null;
        user.value = null;
        customer.value = null;
        error.value = null;

        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_customer');
    }

    async function login(email, password) {
        loading.value = true;
        error.value = null;

        try {
            const response = await http.post('/auth/login', {
                email,
                password
            });

            setAuth(response.data);
        } catch (err) {
            const message = err?.response?.data?.message ?? 'Login failed';
            error.value = message;
            clearAuth();
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function fetchMe() {
        if (!token.value) {
            return;
        }

        try {
            const response = await http.get('/auth/me');
            const data = response.data;
            user.value = data.user;
            customer.value = data.customer;
            localStorage.setItem('auth_user', JSON.stringify(data.user));
            localStorage.setItem('auth_customer', JSON.stringify(data.customer));
        } catch (err) {
            clearAuth();
            throw err;
        }
    }

    async function logout() {
        try {
            await http.post('/auth/logout');
        } catch (err) {
            // API errors on logout are ignored – we clear the session locally anyway.
        } finally {
            clearAuth();
        }
    }

    async function register(payload) {
        console.warn('TODO: connect register API when available', payload);
        // Example implementation once the backend endpoint exists:
        // const response = await http.post('/auth/register', payload);
        // setAuth(response.data);
    }

    return {
        token,
        user,
        customer,
        loading,
        error,
        isAuthenticated,
        isAdmin,
        login,
        fetchMe,
        logout,
        register,
        clearAuth,
        setAuth
    };
});
