import http from '@/api/http';

export async function fetchCategories() {
    const response = await http.get('/admin/categories');
    return response.data.data || [];
}
