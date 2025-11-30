import { ref, reactive, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { fetchDashboardOverview } from '@/services/admin/dashboardService';

function getCssVar(value, fallback) {
    if (typeof window === 'undefined') return fallback;
    const style = getComputedStyle(document.documentElement);
    const cssValue = style.getPropertyValue(value);
    return cssValue ? cssValue.trim() : fallback;
}

export function useAdminDashboard() {
    const toast = useToast();

    const loading = ref(false);
    const error = ref(null);

    const metrics = reactive({
        revenue_30d: 0,
        revenue_30d_trend: 0,
        orders_30d: 0,
        orders_30d_trend: 0,
        avg_order_value_30d: 0,
        new_customers_30d: 0,
        new_customers_30d_trend: 0
    });

    const revenueChart = reactive({
        labels: [],
        values: []
    });

    const ordersByStatus = reactive({
        labels: [],
        values: []
    });

    const recentOrders = ref([]);

    const hasData = computed(
        () =>
            revenueChart.labels.length > 0 ||
            ordersByStatus.labels.length > 0 ||
            recentOrders.value.length > 0
    );

    const revenueChartData = computed(() => {
        const primaryColor = getCssVar('--primary-500', '#6366F1');
        const primaryLight = getCssVar('--primary-100', 'rgba(99,102,241,0.2)');
        const textColor = getCssVar('--text-color', '#334155');

        return {
            labels: revenueChart.labels,
            datasets: [
                {
                    label: "Chiffre d'affaires (30j)",
                    data: revenueChart.values,
                    fill: true,
                    tension: 0.4,
                    borderColor: primaryColor,
                    backgroundColor: primaryLight,
                    pointBackgroundColor: primaryColor,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    borderWidth: 3,
                    color: textColor
                }
            ]
        };
    });

    const ordersByStatusChartData = computed(() => {
        const colorTokens = ['--primary-400', '--primary-500', '--primary-300', '--primary-600', '--primary-200', '--primary-700'];
        const fallbackPalette = ['#818cf8', '#6366f1', '#a5b4fc', '#4c1d95', '#c7d2fe', '#312e81'];

        const backgroundColors = ordersByStatus.labels.map((_, index) =>
            getCssVar(colorTokens[index % colorTokens.length], fallbackPalette[index % fallbackPalette.length])
        );

        return {
            labels: ordersByStatus.labels,
            datasets: [
                {
                    label: 'Commandes par statut',
                    data: ordersByStatus.values,
                    backgroundColor: backgroundColors,
                    borderRadius: 6,
                    barPercentage: 0.7
                }
            ]
        };
    });

    const revenueChartOptions = computed(() => {
        const textColor = getCssVar('--text-color', '#334155');
        const textColorSecondary = getCssVar('--text-color-secondary', '#94a3b8');
        const surfaceBorder = getCssVar('--surface-border', '#e2e8f0');

        return {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                },
                tooltip: {
                    callbacks: {
                        label(context) {
                            const value = context.parsed.y ?? 0;
                            return new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'EUR'
                            }).format(value);
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textColorSecondary,
                        callback: (value) =>
                            new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'EUR'
                            }).format(value)
                    },
                    grid: {
                        color: surfaceBorder
                    }
                }
            }
        };
    });

    const ordersByStatusChartOptions = computed(() => {
        const textColor = getCssVar('--text-color', '#334155');
        const textColorSecondary = getCssVar('--text-color-secondary', '#94a3b8');
        const surfaceBorder = getCssVar('--surface-border', '#e2e8f0');

        return {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textColorSecondary,
                        precision: 0
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };
    });

    async function loadDashboard() {
        loading.value = true;
        error.value = null;

        try {
            const data = await fetchDashboardOverview();

            if (data.metrics) {
                metrics.revenue_30d = data.metrics.revenue_30d ?? 0;
                metrics.revenue_30d_trend = data.metrics.revenue_30d_trend ?? 0;
                metrics.orders_30d = data.metrics.orders_30d ?? 0;
                metrics.orders_30d_trend = data.metrics.orders_30d_trend ?? 0;
                metrics.avg_order_value_30d = data.metrics.avg_order_value_30d ?? 0;
                metrics.new_customers_30d = data.metrics.new_customers_30d ?? 0;
                metrics.new_customers_30d_trend = data.metrics.new_customers_30d_trend ?? 0;
            }

            if (data.revenue_chart) {
                revenueChart.labels = Array.isArray(data.revenue_chart.labels) ? data.revenue_chart.labels : [];
                revenueChart.values = Array.isArray(data.revenue_chart.values) ? data.revenue_chart.values : [];
            } else {
                revenueChart.labels = [];
                revenueChart.values = [];
            }

            if (data.orders_by_status) {
                ordersByStatus.labels = Array.isArray(data.orders_by_status.labels)
                    ? data.orders_by_status.labels
                    : [];
                ordersByStatus.values = Array.isArray(data.orders_by_status.values)
                    ? data.orders_by_status.values
                    : [];
            } else {
                ordersByStatus.labels = [];
                ordersByStatus.values = [];
            }

            recentOrders.value = Array.isArray(data.recent_orders) ? data.recent_orders : [];
        } catch (e) {
            console.error(e);
            error.value = "Impossible de charger les données du dashboard.";
            toast.add({
                severity: 'error',
                summary: 'Erreur',
                detail: error.value,
                life: 3000
            });
        } finally {
            loading.value = false;
        }
    }

    onMounted(() => {
        loadDashboard();
    });

    return {
        loading,
        error,
        metrics,
        revenueChartData,
        revenueChartOptions,
        ordersByStatusChartData,
        ordersByStatusChartOptions,
        recentOrders,
        hasData,
        loadDashboard
    };
}
