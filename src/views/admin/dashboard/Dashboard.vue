<template>
    <div class="grid">
        <!-- Header -->
        <div class="col-12">
            <div class="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4 gap-3">
                <div>
                    <h2 class="text-2xl font-semibold mb-1">Tableau de bord</h2>
                    <span class="text-sm text-muted-color">
                        Vue d'ensemble de l'activité de la boutique
                    </span>
                </div>
                <div class="flex gap-2">
                    <Button
                        icon="pi pi-refresh"
                        label="Rafraîchir"
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

        <!-- KPI cards -->
        <div class="col-12 md:col-6 xl:col-3" v-for="card in 4" :key="card">
            <Card class="surface-card shadow-1 border-round">
                <template #content>
                    <div v-if="loading" class="flex flex-column gap-2">
                        <Skeleton width="60%" height="1rem" />
                        <Skeleton width="40%" height="1.5rem" />
                        <Skeleton width="40%" height="0.75rem" />
                    </div>
                    <div v-else>
                        <template v-if="card === 1">
                            <div class="text-sm text-muted-color mb-1">CA 30 derniers jours</div>
                            <div class="text-2xl font-semibold mb-1">{{ revenueFormatted }}</div>
                            <div class="text-xs" :class="trendClass(metrics.revenue_30d_trend)">
                                {{ trendPrefix(metrics.revenue_30d_trend) }}{{ metrics.revenue_30d_trend }} %
                                vs période précédente
                            </div>
                        </template>

                        <template v-else-if="card === 2">
                            <div class="text-sm text-muted-color mb-1">Commandes (30j)</div>
                            <div class="text-2xl font-semibold mb-1">{{ metrics.orders_30d }}</div>
                            <div class="text-xs" :class="trendClass(metrics.orders_30d_trend)">
                                {{ trendPrefix(metrics.orders_30d_trend) }}{{ metrics.orders_30d_trend }} %
                                vs période précédente
                            </div>
                        </template>

                        <template v-else-if="card === 3">
                            <div class="text-sm text-muted-color mb-1">Panier moyen (30j)</div>
                            <div class="text-2xl font-semibold mb-1">{{ avgOrderFormatted }}</div>
                            <div class="text-xs text-muted-color">
                                Basé sur les commandes des 30 derniers jours
                            </div>
                        </template>

                        <template v-else>
                            <div class="text-sm text-muted-color mb-1">Nouveaux clients (30j)</div>
                            <div class="text-2xl font-semibold mb-1">{{ metrics.new_customers_30d }}</div>
                            <div class="text-xs" :class="trendClass(metrics.new_customers_30d_trend)">
                                {{ trendPrefix(metrics.new_customers_30d_trend) }}{{ metrics.new_customers_30d_trend }} %
                                vs période précédente
                            </div>
                        </template>
                    </div>
                </template>
            </Card>
        </div>

        <!-- Charts -->
        <div class="col-12 lg:col-8">
            <Card class="surface-card shadow-1 border-round mb-4">
                <template #title>Chiffre d'affaires (30 derniers jours)</template>
                <template #content>
                    <div v-if="loading" style="height: 260px" class="flex flex-column gap-2">
                        <Skeleton width="100%" height="2rem" />
                        <Skeleton width="100%" height="8rem" />
                    </div>
                    <div v-else-if="!hasData" class="flex align-items-center justify-content-center" style="height: 260px">
                        <span class="text-muted-color text-sm">Aucune donnée disponible pour le moment.</span>
                    </div>
                    <div v-else style="height: 260px">
                        <Chart type="line" :data="revenueChartData" :options="revenueChartOptions" />
                    </div>
                </template>
            </Card>
        </div>

        <div class="col-12 lg:col-4">
            <Card class="surface-card shadow-1 border-round mb-4">
                <template #title>Commandes par statut</template>
                <template #content>
                    <div v-if="loading" style="height: 260px" class="flex flex-column gap-2">
                        <Skeleton width="100%" height="2rem" />
                        <Skeleton width="100%" height="8rem" />
                    </div>
                    <div v-else-if="!hasData" class="flex align-items-center justify-content-center" style="height: 260px">
                        <span class="text-muted-color text-sm">Aucune donnée disponible pour le moment.</span>
                    </div>
                    <div v-else style="height: 260px">
                        <Chart type="bar" :data="ordersByStatusChartData" :options="ordersByStatusChartOptions" />
                    </div>
                </template>
            </Card>
        </div>

        <!-- Dernières commandes -->
        <div class="col-12">
            <Card class="surface-card shadow-1 border-round">
                <template #title>Dernières commandes</template>
                <template #subtitle>Les 10 dernières commandes créées</template>
                <template #content>
                    <div v-if="loading" class="flex flex-column gap-2">
                        <Skeleton width="100%" height="2.5rem" />
                        <Skeleton width="100%" height="2.5rem" />
                        <Skeleton width="100%" height="2.5rem" />
                    </div>
                    <div v-else>
                        <DataTable :value="recentOrders" dataKey="id" responsive-layout="scroll">
                            <Column field="number" header="Commande" />
                            <Column field="customer_name" header="Client" />
                            <Column field="total" header="Total">
                                <template #body="{ data }">
                                    {{ formatMoney(data.total) }}
                                </template>
                            </Column>
                            <Column field="status" header="Statut">
                                <template #body="{ data }">
                                    <Tag :value="data.status" :severity="statusSeverity(data.status)" />
                                </template>
                            </Column>
                            <Column field="created_at" header="Date">
                                <template #body="{ data }">
                                    {{ formatDate(data.created_at) }}
                                </template>
                            </Column>
                        </DataTable>
                        <div v-if="!recentOrders.length" class="text-center text-sm text-muted-color mt-3">
                            Aucune commande récente.
                        </div>
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAdminDashboard } from '@/composables/admin/useAdminDashboard';

import Card from 'primevue/card';
import Chart from 'primevue/chart';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Skeleton from 'primevue/skeleton';
import Button from 'primevue/button';

const {
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
</script>

<style scoped>
.surface-card {
    border-radius: 1rem;
}
</style>
