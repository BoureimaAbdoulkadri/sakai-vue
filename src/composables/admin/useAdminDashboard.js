import {computed, onMounted, reactive, ref} from 'vue';
import {useToast} from 'primevue/usetoast';
import {fetchDashboardOverview} from '@/services/admin/dashboardService';

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
        new_customers_30d_trend: 0,
        conversion_rate: null,
        pending_orders: 0,
        low_stock_products: 0,
        retention_rate: 0
    });

    const revenueChart = reactive({
        labels: [],
        values: []
    });

    const ordersByStatus = reactive({
        labels: [],
        values: []
    });

    const revenueByCategory = reactive({
        labels: [],
        values: []
    });

    const customersOverTime = reactive({
        labels: [],
        values: []
    });

    const topProducts = reactive({
        labels: [],
        values: []
    });

    const recentOrders = ref([]);

    const hasData = computed(
        () =>
            revenueChart.labels.length > 0 ||
            ordersByStatus.labels.length > 0 ||
            recentOrders.value.length > 0 ||
            revenueByCategory.labels.length > 0 ||
            customersOverTime.labels.length > 0 ||
            topProducts.labels.length > 0
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

    const revenueByCategoryChartData = computed(() => {
        const colorPalette = [
            getCssVar('--primary-500', '#6366F1'),
            getCssVar('--blue-500', '#3B82F6'),
            getCssVar('--green-500', '#10B981'),
            getCssVar('--orange-500', '#F59E0B'),
            getCssVar('--purple-500', '#8B5CF6'),
            getCssVar('--pink-500', '#EC4899')
        ];

        return {
            labels: revenueByCategory.labels,
            datasets: [
                {
                    data: revenueByCategory.values,
                    backgroundColor: colorPalette.slice(0, revenueByCategory.labels.length),
                    hoverBackgroundColor: colorPalette.slice(0, revenueByCategory.labels.length)
                }
            ]
        };
    });

    const revenueByCategoryChartOptions = computed(() => {
        const textColor = getCssVar('--text-color', '#334155');

        return {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                        usePointStyle: true,
                        padding: 15
                    },
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label(context) {
                            const label = context.label || '';
                            const value = context.parsed ?? 0;
                            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            const formatted = new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'EUR'
                            }).format(value);
                            return `${label}: ${formatted} (${percentage}%)`;
                        }
                    }
                }
            }
        };
    });

    const customersOverTimeChartData = computed(() => {
        const blueColor = getCssVar('--blue-500', '#3B82F6');
        const blueLight = getCssVar('--blue-100', 'rgba(59,130,246,0.2)');
        const textColor = getCssVar('--text-color', '#334155');

        return {
            labels: customersOverTime.labels,
            datasets: [
                {
                    label: 'Nouveaux clients',
                    data: customersOverTime.values,
                    fill: true,
                    tension: 0.4,
                    borderColor: blueColor,
                    backgroundColor: blueLight,
                    pointBackgroundColor: blueColor,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    borderWidth: 3,
                    color: textColor
                }
            ]
        };
    });

    const customersOverTimeChartOptions = computed(() => {
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
                        precision: 0
                    },
                    grid: {
                        color: surfaceBorder
                    }
                }
            }
        };
    });

    const topProductsChartData = computed(() => {
        const greenColor = getCssVar('--green-500', '#10B981');

        return {
            labels: topProducts.labels,
            datasets: [
                {
                    label: 'Ventes',
                    data: topProducts.values,
                    backgroundColor: greenColor,
                    borderRadius: 6,
                    barPercentage: 0.8
                }
            ]
        };
    });

    const topProductsChartOptions = computed(() => {
        const textColor = getCssVar('--text-color', '#334155');
        const textColorSecondary = getCssVar('--text-color-secondary', '#94a3b8');
        const surfaceBorder = getCssVar('--surface-border', '#e2e8f0');

        return {
            indexAxis: 'y',
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        color: textColorSecondary,
                        precision: 0
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        display: false,
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
                metrics.conversion_rate = data.metrics.conversion_rate ?? null;
                metrics.pending_orders = data.metrics.pending_orders ?? 0;
                metrics.low_stock_products = data.metrics.low_stock_products ?? 0;
                metrics.retention_rate = data.metrics.retention_rate ?? 0;
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

            if (data.revenue_by_category) {
                revenueByCategory.labels = Array.isArray(data.revenue_by_category.labels)
                    ? data.revenue_by_category.labels
                    : [];
                revenueByCategory.values = Array.isArray(data.revenue_by_category.values)
                    ? data.revenue_by_category.values
                    : [];
            } else {
                revenueByCategory.labels = [];
                revenueByCategory.values = [];
            }

            if (data.customers_over_time) {
                customersOverTime.labels = Array.isArray(data.customers_over_time.labels)
                    ? data.customers_over_time.labels
                    : [];
                customersOverTime.values = Array.isArray(data.customers_over_time.values)
                    ? data.customers_over_time.values
                    : [];
            } else {
                customersOverTime.labels = [];
                customersOverTime.values = [];
            }

            if (data.top_products) {
                topProducts.labels = Array.isArray(data.top_products.labels)
                    ? data.top_products.labels
                    : [];
                topProducts.values = Array.isArray(data.top_products.values)
                    ? data.top_products.values
                    : [];
            } else {
                topProducts.labels = [];
                topProducts.values = [];
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
        revenueByCategoryChartData,
        revenueByCategoryChartOptions,
        customersOverTimeChartData,
        customersOverTimeChartOptions,
        topProductsChartData,
        topProductsChartOptions,
        recentOrders,
        hasData,
        loadDashboard
    };
}
