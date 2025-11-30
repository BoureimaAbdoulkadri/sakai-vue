import http from '@/api/http';

export async function fetchCustomersPaginated(params = {}) {
    const response = await http.get('/admin/customers', {
        params: {
            page: params.page,
            per_page: params.perPage,
            search: params.search,
            type: params.type,
            status: params.status,
            country: params.country
        }
    });

    return response.data;
}

export async function fetchCustomerDetail(id) {
    const response = await http.get(`/admin/customers/${id}`);
    return response.data;
}

export async function createCustomer(payload) {
    const response = await http.post('/admin/customers', payload);
    return response.data;
}

export async function updateCustomer(id, payload) {
    const response = await http.put(`/admin/customers/${id}`, payload);
    return response.data;
}

export async function deleteCustomer(id) {
    await http.delete(`/admin/customers/${id}`);
}
