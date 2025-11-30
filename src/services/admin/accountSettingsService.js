import http from '@/api/http';

export async function fetchAccountSettings() {
    const response = await http.get('/admin/settings/account');
    return response.data;
}

export async function updateAccountSettings(payload) {
    const response = await http.put('/admin/settings/account', payload);
    return response.data;
}
