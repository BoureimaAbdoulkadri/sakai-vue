import http from '@/api/http';

export async function clientRegister(payload) {
    const response = await http.post('/client/auth/register', payload);
    return response.data;
}

export async function clientLogin(payload) {
    const response = await http.post('/client/auth/login', payload);
    return response.data;
}

export async function clientFetchMe(token) {
    const headers = token
        ? {
              Authorization: `Bearer ${token}`
          }
        : undefined;

    const response = await http.get('/client/auth/me', { headers });
    return response.data;
}

export async function clientLogout() {
    const response = await http.post('/client/auth/logout');
    return response.data;
}
