import http from '@/api/http';

export async function fetchClientOrders(params = {}) {
    const response = await http.get('/client/account/orders', {
        params: {
            page: params.page,
            per_page: params.perPage
        }
    });

    return response.data;
}

export async function fetchClientOrder(orderId) {
    const response = await http.get(`/client/account/orders/${orderId}`);
    return response.data;
}
