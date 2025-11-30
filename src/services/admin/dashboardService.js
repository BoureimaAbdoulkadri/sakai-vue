import http from '@/api/http';

/**
 * Récupère les données globales du dashboard admin.
 *
 * @returns {Promise<any>}
 */
export async function fetchDashboardOverview() {
    const response = await http.get('/admin/dashboard/overview');
    return response.data;
}
