import http from '@/api/http';

export async function fetchCategories() {
    const response = await http.get('/admin/categories');
    return response.data.data || [];
}

export async function fetchCategoriesPaginated(params = {}) {
    const response = await http.get('/admin/categories', {
        params: {
            page: params.page,
            per_page: params.perPage,
            search: params.search,
            is_active: params.isActive,
            parent_id: params.parentId
        }
    });

    return response.data;
}

export async function createCategory(payload) {
    const response = await http.post('/admin/categories', payload);
    return response.data;
}

export async function updateCategory(id, payload) {
    const response = await http.put(`/admin/categories/${id}`, payload);
    return response.data;
}

export async function deleteCategory(id) {
    await http.delete(`/admin/categories/${id}`);
}
