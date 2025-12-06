import http from '@/api/http';

interface UpdateLocalePayload {
    locale: string;
}

export function updateClientLocale(payload: UpdateLocalePayload) {
    return http.post('/client/locale', payload);
}
