<template>
    <div class="grid">
        <!-- Header -->
        <div class="col-12">
            <div class="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4 gap-3">
                <div>
                    <h2 class="text-2xl font-semibold mb-1">{{ $t('admin.dashboard.title') }}</h2>
                    <span class="text-sm text-muted-color">
                        {{ $t('admin.dashboard.subtitle') }}
                    </span>
                </div>
                <div class="flex gap-2">
                    <Button
                        icon="pi pi-refresh"
                        :label="$t('admin.common.actions.refresh')"
                        outlined
                        @click="loadDashboard"
                        :loading="loading"
                        :disabled="loading"
                    />
                </div>
            </div>
        </div>

        <div class="col-12" v-if="error">
            <div class="surface-card shadow-1 border-round p-3 border-1 border-red-100 text-red-600 text-sm">
                {{ error }}
            </div>
        </div>

        <!-- KPI cards - Ligne 1 -->
        <div class="col-12 md:col-6 xl:col-3">
            <Card class="surface-card shadow-1 border-round">
                <template #content>
                    <div v-if="loading" class="flex flex-column gap-2">
                        <Skeleton width="60%" height="1rem" />
                        <Skeleton width="40%" height="1.5rem" />
                        <Skeleton width="40%" height="0.75rem" />
                    </div>
                    <div v-else class="flex align-items-start justify-content-between">
                        <div>
                            <div class="text-sm text-muted-color mb-1 flex align-items-center gap-2">
                                <i class="pi pi-euro text-primary"></i>
                                {{ $t('admin.dashboard.metrics.revenue.title') }}
                            </div>
                            <div class="text-2xl font-semibold mb-1">{{ revenueFormatted }}</div>
                            <div class="text-xs" :class="trendClass(metrics.revenue_30d_trend)">
                                <i :class="trendIcon(metrics.revenue_30d_trend)"></i>
                                {{ trendPrefix(metrics.revenue_30d_trend) }}{{ metrics.revenue_30d_trend }} %
                            </div>
                        </div>
                        <div class="bg-primary-100 border-round p-2">
                            <i class="pi pi-chart-line text-primary text-xl"></i>
                        </div>
                    </div>
                </template>
            </Card>
        </div>

        <div class="col-12 md:col-6 xl:col-3">
            <Card class="surface-card shadow-1 border-round">
                <template #content>
                    <div v-if="loading" class="flex flex-column gap-2">
                        <Skeleton height="1rem" width="60%"/>
                        <Skeleton height="1.5rem" width="40%"/>
                        <Skeleton height="0.75rem" width="40%"/>
                    </div>
                    <div v-else class="flex align-items-start justify-content-between">
                        <div>
                            <div class="text-sm text-muted-color mb-1 flex align-items-center gap-2">
                                <i class="pi pi-shopping-cart text-blue-500"></i>
                                {{ $t('admin.dashboard.metrics.orders.title') }}
                            </div>
                            <div class="text-2xl font-semibold mb-1">{{ metrics.orders_30d }}</div>
                            <div class="text-xs" :class="trendClass(metrics.orders_30d_trend)">
                                <i :class="trendIcon(metrics.orders_30d_trend)"></i>
                                {{ trendPrefix(metrics.orders_30d_trend) }}{{ metrics.orders_30d_trend }} %
                            </div>
                        </div>
                        <div class="bg-blue-100 border-round p-2">
                            <i class="pi pi-shopping-bag text-blue-500 text-xl"></i>
                        </div>
                    </div>
                </template>
            </Card>
        </div>

        <div class="col-12 md:col-6 xl:col-3">
            <Card class="surface-card shadow-1 border-round">
                <template #content>
                    <div v-if="loading" class="flex flex-column gap-2">
                        <Skeleton height="1rem" width="60%"/>
                        <Skeleton height="1.5rem" width="40%"/>
                        <Skeleton height="0.75rem" width="40%"/>
                    </div>
                    <div v-else class="flex align-items-start justify-content-between">
                        <div>
                            <div class="text-sm text-muted-color mb-1 flex align-items-center gap-2">
                                <i class="pi pi-money-bill text-green-500"></i>
                                {{ $t('admin.dashboard.metrics.avg_order.title') }}
                            </div>
                            <div class="text-2xl font-semibold mb-1">{{ avgOrderFormatted }}</div>
                            <div class="text-xs text-muted-color">
                                {{ metrics.orders_30d }} {{ $t('admin.dashboard.metrics.orders.title').toLowerCase() }}
                            </div>
                        </div>
                        <div class="bg-green-100 border-round p-2">
                            <i class="pi pi-wallet text-green-500 text-xl"></i>
                        </div>
                    </div>
                </template>
            </Card>
        </div>

        <div class="col-12 md:col-6 xl:col-3">
            <Card class="surface-card shadow-1 border-round">
                <template #content>
                    <div v-if="loading" class="flex flex-column gap-2">
                        <Skeleton height="1rem" width="60%"/>
                        <Skeleton height="1.5rem" width="40%"/>
                        <Skeleton height="0.75rem" width="40%"/>
                    </div>
                    <div v-else class="flex align-items-start justify-content-between">
                        <div>
                            <div class="text-sm text-muted-color mb-1 flex align-items-center gap-2">
                                <i class="pi pi-users text-orange-500"></i>
                                {{ $t('admin.dashboard.metrics.customers.title') }}
                            </div>
                            <div class="text-2xl font-semibold mb-1">{{ metrics.new_customers_30d }}</div>
                            <div class="text-xs" :class="trendClass(metrics.new_customers_30d_trend)">
                                <i :class="trendIcon(metrics.new_customers_30d_trend)"></i>
                                {{ trendPrefix(metrics.new_customers_30d_trend) }}{{ metrics.new_customers_30d_trend }} %
                            </div>
                        </div>
                        <div class="bg-orange-100 border-round p-2">
                            <i class="pi pi-user-plus text-orange-500 text-xl"></i>
                        </div>
                    </div>
                </template>
            </Card>
        </div>

        <!-- KPI cards - Ligne 2 : Nouveaux indicateurs -->
        <div class="col-12 md:col-6 xl:col-3">
            <Card class="surface-card shadow-1 border-round">
                <template #content>
                    <div v-if="loading" class="flex flex-column gap-2">
                        <Skeleton height="1rem" width="60%"/>
                        <Skeleton height="1.5rem" width="40%"/>
                        <Skeleton height="0.75rem" width="40%"/>
                    </div>
                    <div v-else class="flex align-items-start justify-content-between">
                        <div>
                            <div class="text-sm text-muted-color mb-1 flex align-items-center gap-2">
                                <i class="pi pi-percentage text-purple-500"></i>
                                {{ $t('admin.dashboard.metrics.conversion_rate.title') }}
                            </div>
                            <div class="text-2xl font-semibold mb-1">{{ metrics.conversion_rate || 'N/A' }}%</div>
                            <div class="text-xs text-muted-color">
                                Visiteurs → Clients
                            </div>
                        </div>
                        <div class="bg-purple-100 border-round p-2">
                            <i class="pi pi-chart-bar text-purple-500 text-xl"></i>
                        </div>
                    </div>
                </template>
            </Card>
        </div>

        <div class="col-12 md:col-6 xl:col-3">
            <Card class="surface-card shadow-1 border-round">
                <template #content>
                    <div v-if="loading" class="flex flex-column gap-2">
                        <Skeleton height="1rem" width="60%"/>
                        <Skeleton height="1.5rem" width="40%"/>
                        <Skeleton height="0.75rem" width="40%"/>
                    </div>
                    <div v-else class="flex align-items-start justify-content-between">
                        <div>
                            <div class="text-sm text-muted-color mb-1 flex align-items-center gap-2">
                                <i class="pi pi-exclamation-triangle text-yellow-600"></i>
                                {{ $t('admin.dashboard.metrics.pending_orders.title') }}
                            </div>
                            <div class="text-2xl font-semibold mb-1">{{ metrics.pending_orders || 0 }}</div>
                            <div class="text-xs text-muted-color">
                                À traiter
                            </div>
                        </div>
                        <div class="bg-yellow-100 border-round p-2">
                            <i class="pi pi-clock text-yellow-600 text-xl"></i>
                        </div>
                    </div>
                </template>
            </Card>
        </div>

        <div class="col-12 md:col-6 xl:col-3">
            <Card class="surface-card shadow-1 border-round">
                <template #content>
                    <div v-if="loading" class="flex flex-column gap-2">
                        <Skeleton height="1rem" width="60%"/>
                        <Skeleton height="1.5rem" width="40%"/>
                        <Skeleton height="0.75rem" width="40%"/>
                    </div>
                    <div v-else class="flex align-items-start justify-content-between">
                        <div>
                            <div class="text-sm text-muted-color mb-1 flex align-items-center gap-2">
                                <i class="pi pi-box text-red-500"></i>
                                {{ $t('admin.dashboard.metrics.low_stock.title') }}
                            </div>
                            <div class="text-2xl font-semibold mb-1">{{ metrics.low_stock_products || 0 }}</div>
                            <div class="text-xs text-muted-color">
                                Produits < 10 unités
                            </div>
                        </div>
                        <div class="bg-red-100 border-round p-2">
                            <i class="pi pi-exclamation-circle text-red-500 text-xl"></i>
                        </div>
                    </div>
                </template>
            </Card>
        </div>

        <div class="col-12 md:col-6 xl:col-3">
            <Card class="surface-card shadow-1 border-round">
                <template #content>
                    <div v-if="loading" class="flex flex-column gap-2">
                        <Skeleton height="1rem" width="60%"/>
                        <Skeleton height="1.5rem" width="40%"/>
                        <Skeleton height="0.75rem" width="40%"/>
                    </div>
                    <div v-else class="flex align-items-start justify-content-between">
                        <div>
                            <div class="text-sm text-muted-color mb-1 flex align-items-center gap-2">
                                <i class="pi pi-star text-cyan-500"></i>
                                {{ $t('admin.dashboard.metrics.retention_rate.title') }}
                            </div>
                            <div class="text-2xl font-semibold mb-1">{{ metrics.retention_rate || 'N/A' }}%</div>
                            <div class="text-xs text-muted-color">
                                Clients récurrents
                            </div>
                        </div>
                        <div class="bg-cyan-100 border-round p-2">
                            <i class="pi pi-heart text-cyan-500 text-xl"></i>
                        </div>
                    </div>
                </template>
            </Card>
        </div>

        <!-- Charts -->
        <div class="col-12 lg:col-8">
            <Card class="surface-card shadow-1 border-round mb-4">
                <template #title>{{ $t('admin.dashboard.charts.revenue_30d') }}</template>
                <template #content>
                    <div v-if="loading" style="height: 260px" class="flex flex-column gap-2">
                        <Skeleton width="100%" height="2rem" />
                        <Skeleton width="100%" height="8rem" />
                    </div>
                    <div v-else-if="!hasData" class="flex align-items-center justify-content-center" style="height: 260px">
                        <span class="text-muted-color text-sm">{{ $t('admin.common.messages.no_data') }}</span>
                    </div>
                    <div v-else style="height: 260px">
                        <Chart type="line" :data="revenueChartData" :options="revenueChartOptions" />
                    </div>
                </template>
            </Card>
        </div>

        <div class="col-12 lg:col-4">
            <Card class="surface-card shadow-1 border-round mb-4">
                <template #title>{{ $t('admin.dashboard.charts.orders_by_status') }}</template>
                <template #content>
                    <div v-if="loading" style="height: 260px" class="flex flex-column gap-2">
                        <Skeleton width="100%" height="2rem" />
                        <Skeleton width="100%" height="8rem" />
                    </div>
                    <div v-else-if="!hasData" class="flex align-items-center justify-content-center" style="height: 260px">
                        <span class="text-muted-color text-sm">{{ $t('admin.common.messages.no_data') }}</span>
                    </div>
                    <div v-else style="height: 260px">
                        <Chart type="bar" :data="ordersByStatusChartData" :options="ordersByStatusChartOptions" />
                    </div>
                </template>
            </Card>
        </div>

        <!-- Deuxième ligne de graphiques -->
        <div class="col-12 lg:col-4">
            <Card class="surface-card shadow-1 border-round mb-4">
                <template #title>{{ $t('admin.dashboard.charts.revenue_by_category') }}</template>
                <template #content>
                    <div v-if="loading" class="flex flex-column gap-2" style="height: 300px">
                        <Skeleton height="2rem" width="100%"/>
                        <Skeleton height="8rem" width="100%"/>
                    </div>
                    <div v-else-if="!hasData" class="flex align-items-center justify-content-center"
                         style="height: 300px">
                        <span class="text-muted-color text-sm">{{ $t('admin.common.messages.no_data') }}</span>
                    </div>
                    <div v-else style="height: 300px">
                        <Chart :data="revenueByCategoryChartData" :options="revenueByCategoryChartOptions"
                               type="doughnut"/>
                    </div>
                </template>
            </Card>
        </div>

        <div class="col-12 lg:col-4">
            <Card class="surface-card shadow-1 border-round mb-4">
                <template #title>{{ $t('admin.dashboard.charts.top_products') }}</template>
                <template #content>
                    <div v-if="loading" class="flex flex-column gap-2" style="height: 300px">
                        <Skeleton height="2rem" width="100%"/>
                        <Skeleton height="8rem" width="100%"/>
                    </div>
                    <div v-else-if="!hasData" class="flex align-items-center justify-content-center"
                         style="height: 300px">
                        <span class="text-muted-color text-sm">{{ $t('admin.common.messages.no_data') }}</span>
                    </div>
                    <div v-else style="height: 300px">
                        <Chart :data="topProductsChartData" :options="topProductsChartOptions" type="bar"/>
                    </div>
                </template>
            </Card>
        </div>

        <div class="col-12 lg:col-4">
            <Card class="surface-card shadow-1 border-round mb-4">
                <template #title>{{ $t('admin.dashboard.charts.customers_over_time') }}</template>
                <template #content>
                    <div v-if="loading" class="flex flex-column gap-2" style="height: 300px">
                        <Skeleton height="2rem" width="100%"/>
                        <Skeleton height="8rem" width="100%"/>
                    </div>
                    <div v-else-if="!hasData" class="flex align-items-center justify-content-center"
                         style="height: 300px">
                        <span class="text-muted-color text-sm">{{ $t('admin.common.messages.no_data') }}</span>
                    </div>
                    <div v-else style="height: 300px">
                        <Chart :data="customersOverTimeChartData" :options="customersOverTimeChartOptions" type="line"/>
                    </div>
                </template>
            </Card>
        </div>

        <!-- Dernières commandes -->
        <div class="col-12">
            <Card class="surface-card shadow-1 border-round">
                <template #title>{{ $t('admin.dashboard.recent_orders.title') }}</template>
                <template #content>
                    <div v-if="loading" class="flex flex-column gap-2">
                        <Skeleton width="100%" height="2.5rem" />
                        <Skeleton width="100%" height="2.5rem" />
                        <Skeleton width="100%" height="2.5rem" />
                    </div>
                    <div v-else>
                        <DataTable :value="recentOrders" dataKey="id" responsive-layout="scroll">
                            <Column :header="$t('admin.orders.columns.order_number')" field="number"/>
                            <Column :header="$t('admin.orders.columns.customer')" field="customer_name"/>
                            <Column :header="$t('admin.orders.fields.total')" field="total">
                                <template #body="{ data }">
                                    {{ formatMoney(data.total) }}
                                </template>
                            </Column>
                            <Column :header="$t('admin.orders.columns.status')" field="status">
                                <template #body="{ data }">
                                    <Tag :value="data.status" :severity="statusSeverity(data.status)" />
                                </template>
                            </Column>
                            <Column :header="$t('admin.orders.columns.date')" field="created_at">
                                <template #body="{ data }">
                                    {{ formatDate(data.created_at) }}
                                </template>
                            </Column>
                        </DataTable>
                        <div v-if="!recentOrders.length" class="text-center text-sm text-muted-color mt-3">
                            {{ $t('admin.common.messages.no_data') }}
                        </div>
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>

<script setup>
import {computed} from 'vue';
import {useI18n} from 'vue-i18n';
import {useAdminDashboard} from '@/composables/admin/useAdminDashboard';

import Card from 'primevue/card';
import Chart from 'primevue/chart';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Skeleton from 'primevue/skeleton';
import Button from 'primevue/button';

const {t} = useI18n();

const {
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
} = useAdminDashboard();

const revenueFormatted = computed(() =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(metrics.revenue_30d || 0)
);

const avgOrderFormatted = computed(() =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
        metrics.avg_order_value_30d || 0
    )
);

function formatDate(value) {
    if (!value) return '—';
    return new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'short',
        timeStyle: 'short'
    }).format(new Date(value));
}

function formatMoney(value) {
    if (value == null) return '—';
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(Number(value));
}

function statusSeverity(status) {
    switch (status) {
        case 'pending':
            return 'warning';
        case 'paid':
            return 'success';
        case 'shipped':
            return 'info';
        case 'cancelled':
        case 'refunded':
            return 'danger';
        default:
            return 'info';
    }
}

function trendClass(trend) {
    if (trend > 0) return 'text-green-500';
    if (trend < 0) return 'text-red-500';
    return 'text-muted-color';
}

function trendPrefix(trend) {
    if (trend > 0) return '+';
    return '';
}

function trendIcon(trend) {
    if (trend > 0) return 'pi pi-arrow-up';
    if (trend < 0) return 'pi pi-arrow-down';
    return 'pi pi-minus';
}
</script>

<style scoped>
.surface-card {
    border-radius: 1rem;
}
</style>
