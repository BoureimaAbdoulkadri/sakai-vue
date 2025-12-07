import http from '@/api/http';

/**
 * Récupère les données globales du dashboard admin.
 *
 * @returns {Promise<any>}
 */
export async function fetchDashboardOverview() {
    const response = await http.get('/admin/dashboard');

    // Le backend retourne { metrics, charts, recent_orders }
    // On transforme pour correspondre à ce que le frontend attend
    const {metrics, charts, recent_orders} = response.data;

    return {
        metrics: metrics || {},
        revenue_chart: charts?.revenue_30d || {labels: [], values: []},
        orders_by_status: charts?.orders_by_status || {labels: [], values: []},
        revenue_by_category: charts?.revenue_by_category || {labels: [], values: []},
        top_products: charts?.top_products || {labels: [], values: []},
        customers_over_time: charts?.customers_over_time || {labels: [], values: []},
        recent_orders: recent_orders || []
    };
}
