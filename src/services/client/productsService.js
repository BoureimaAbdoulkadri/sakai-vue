import http from '@/api/http';

export async function fetchClientProducts(params = {}) {
    const response = await http.get('/client/products', {
        params: {
            page: params.page,
            per_page: params.perPage,
            search: params.search,
            category: params.category,
            min_price: params.minPrice,
            max_price: params.maxPrice,
            sort: params.sort
        }
    });

    return response.data;
}

export async function fetchClientProduct(slug) {
    const response = await http.get(`/client/products/${slug}`);
    return response.data;
}
