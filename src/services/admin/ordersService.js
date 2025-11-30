import http from '@/api/http';

export async function fetchOrdersPaginated(params = {}) {
    const response = await http.get('/admin/orders', {
        params: {
            page: params.page,
            per_page: params.perPage,
            search: params.search,
            status: params.status,
            payment_status: params.paymentStatus,
            date_from: params.dateFrom,
            date_to: params.dateTo
        }
    });

    return response.data;
}

export async function fetchOrderDetail(id) {
    const response = await http.get(`/admin/orders/${id}`);
    return response.data;
}

export async function updateOrderStatus(id, payload) {
    const response = await http.put(`/admin/orders/${id}/status`, payload);
    return response.data;
}
