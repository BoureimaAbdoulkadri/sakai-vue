import httpClient from '@/services/httpClient';

export interface ClientProfile {
    id: number | string;
    name: string;
    first_name?: string | null;
    last_name?: string | null;
    email: string;
    phone?: string | null;
    company_name?: string | null;
    status?: string | null;
    created_at?: string;
}

export interface ClientProfileStats {
    orders_count: number;
    total_spent: number;
}

export interface ClientProfileResponse {
    profile: ClientProfile;
    stats?: ClientProfileStats;
}

export interface UpdateClientProfilePayload {
    first_name?: string | null;
    last_name?: string | null;
    email?: string;
    phone?: string | null;
    company_name?: string | null;
}

export interface ClientOrderItem {
    id: number | string;
    product_id?: number | string | null;
    product_name: string;
    quantity: number;
    unit_price: number;
    total: number;
}

export interface ClientOrderSummary {
    id: number | string;
    reference: string;
    number?: string;
    status: string;
    payment_status?: string | null;
    total: number;
    currency: string;
    placed_at: string | null;
    items_count: number;
}

export interface ClientOrderDetail extends ClientOrderSummary {
    billing_address?: ClientOrderAddress | null;
    shipping_address?: ClientOrderAddress | null;
    notes?: string | null;
    items: ClientOrderItem[];
}

export interface ClientOrderAddress {
    line1?: string | null;
    line2?: string | null;
    postal_code?: string | null;
    city?: string | null;
    country?: string | null;
    [key: string]: unknown;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta?: {
        total?: number;
        per_page?: number;
        current_page?: number;
        [key: string]: unknown;
    };
    links?: Record<string, unknown>;
}

export interface ResourceResponse<T> {
    data: T;
}

export function getClientProfile() {
    return httpClient.get<ClientProfileResponse>('/client/profile').then((response) => response.data);
}

export function updateClientProfile(payload: UpdateClientProfilePayload) {
    return httpClient.put<ClientProfileResponse>('/client/profile', payload).then((response) => response.data);
}

export function getClientOrders(params: { page?: number; perPage?: number } = {}) {
    const query: Record<string, number> = {};

    if (typeof params.page === 'number') {
        query.page = params.page;
    }

    if (typeof params.perPage === 'number') {
        query.per_page = params.perPage;
    }

    return httpClient
        .get<PaginatedResponse<ClientOrderSummary>>('/client/orders', {
            params: query
        })
        .then((response) => response.data);
}

export function getClientOrder(id: number | string) {
    return httpClient.get<ResourceResponse<ClientOrderDetail>>(`/client/orders/${id}`).then((response) => response.data);
}
