import axios from 'axios';

const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost').replace(/\/$/, '');
const rawPrefix = import.meta.env.VITE_API_PREFIX ?? '/api';
const prefix = rawPrefix ? (rawPrefix.startsWith('/') ? rawPrefix : `/${rawPrefix}`) : '';

const httpClient = axios.create({
    baseURL: `${baseUrl}${prefix}`,
    withCredentials: false,
    headers: {
        Accept: 'application/json'
    }
});

httpClient.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('client_auth_token') : null;
    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default httpClient;
