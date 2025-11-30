import http from '@/api/http';

export async function fetchProducts(params = {}) {
    const response = await http.get('/admin/products', {
        params: {
            page: params.page,
            per_page: params.perPage,
            search: params.search,
            status: params.status,
            category_id: params.categoryId
        }
    });

    return response.data;
}

export async function createProduct(payload) {
    const response = await http.post('/admin/products', payload);
    return response.data;
}

export async function updateProduct(id, payload) {
    const response = await http.put(`/admin/products/${id}`, payload);
    return response.data;
}

export async function deleteProduct(id) {
    await http.delete(`/admin/products/${id}`);
}
