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
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default http;
