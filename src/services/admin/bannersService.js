import http from '@/api/http';

export async function fetchBannersPaginated(params = {}) {
    const response = await http.get('/admin/banners', {
        params: {
            page: params.page,
            per_page: params.perPage,
            search: params.search,
            status: params.status,
            location: params.location
        }
    });

    return response.data;
}

export async function fetchBannerDetail(id) {
    const response = await http.get(`/admin/banners/${id}`);
    return response.data;
}

export async function createBanner(payload) {
    const response = await http.post('/admin/banners', payload);
    return response.data;
}

export async function updateBanner(id, payload) {
    const response = await http.put(`/admin/banners/${id}`, payload);
    return response.data;
}

export async function deleteBanner(id) {
    await http.delete(`/admin/banners/${id}`);
}
