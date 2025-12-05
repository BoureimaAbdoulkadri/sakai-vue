import http from '@/api/http';

export async function postClientCheckout(payload) {
    const response = await http.post('/client/checkout', payload);
    return response.data;
}
