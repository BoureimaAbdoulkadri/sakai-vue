import http from '@/api/http';

export async function fetchCouponsPaginated(params = {}) {
    const response = await http.get('/admin/coupons', {
        params: {
            page: params.page,
            per_page: params.perPage,
            search: params.search,
            type: params.type,
            status: params.status
        }
    });

    return response.data;
}

export async function fetchCouponDetail(id) {
    const response = await http.get(`/admin/coupons/${id}`);
    return response.data;
}

export async function createCoupon(payload) {
    const response = await http.post('/admin/coupons', payload);
    return response.data;
}

export async function updateCoupon(id, payload) {
    const response = await http.put(`/admin/coupons/${id}`, payload);
    return response.data;
}

export async function deleteCoupon(id) {
    await http.delete(`/admin/coupons/${id}`);
}
