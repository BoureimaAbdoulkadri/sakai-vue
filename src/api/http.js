import axios from 'axios';

const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost').replace(/\/$/, '');
const rawPrefix = import.meta.env.VITE_API_PREFIX ?? '/api';
const prefix = rawPrefix ? (rawPrefix.startsWith('/') ? rawPrefix : `/${rawPrefix}`) : '';
export const API_BASE_URL = `${baseUrl}${prefix}`;

const http = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        Accept: 'application/json'
    }
});

http.interceptors.request.use((config) => {
    const url = config.url ?? '';
    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const clientToken = typeof window !== 'undefined' ? localStorage.getItem('client_auth_token') : null;

    config.headers = config.headers || {};

    const normalizedUrl = url.startsWith('http') ? new URL(url).pathname : url;

    if (normalizedUrl.startsWith('/admin') || normalizedUrl.startsWith('admin')) {
        if (adminToken) {
            config.headers.Authorization = `Bearer ${adminToken}`;
        }
    } else if (normalizedUrl.startsWith('/client') || normalizedUrl.startsWith('client')) {
        if (clientToken) {
            config.headers.Authorization = `Bearer ${clientToken}`;
        }
    } else if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
    }

    return config;
});

export default http;
