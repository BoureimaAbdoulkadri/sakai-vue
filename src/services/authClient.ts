import httpClient from '@/services/httpClient';

export interface ClientUser {
    id: number | string;
    name: string;
    email: string;
    first_name?: string | null;
    last_name?: string | null;
}

export interface ClientRegisterPayload {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string | null;
    company_name?: string | null;
    password: string;
    password_confirmation: string;
}

export interface ClientLoginPayload {
    email: string;
    password: string;
}

export interface ClientAuthResponse {
    token: string;
    customer: ClientUser;
}

export interface ClientMeResponse {
    customer: ClientUser;
}

export function registerClient(payload: ClientRegisterPayload) {
    return httpClient.post<ClientAuthResponse>('/client/register', payload).then((response) => response.data);
}

export function loginClient(payload: ClientLoginPayload) {
    return httpClient.post<ClientAuthResponse>('/client/login', payload).then((response) => response.data);
}

export function fetchClientMe() {
    return httpClient.get<ClientMeResponse>('/client/me').then((response) => response.data);
}

export function logoutClient() {
    return httpClient.post('/client/logout').then((response) => response.data);
}
