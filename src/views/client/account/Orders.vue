<template>
    <div class="grid">
        <div class="col-12">
            <div class="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4 gap-3">
                <div>
                    <h1 class="text-2xl font-semibold mb-1">Mes commandes</h1>
                    <span class="text-sm text-muted-color">
                        Consultez l'historique de vos commandes.
                    </span>
                </div>
            </div>
        </div>

        <div class="col-12">
            <Card class="surface-card shadow-1 border-round">
                <template #content>
                    <div v-if="loading" class="p-3">
                        <Skeleton height="3rem" class="mb-3" v-for="n in 5" :key="n" borderRadius="8px" />
                    </div>
                    <div v-else>
                        <DataTable
                            v-if="orders.length"
                            :value="orders"
                            dataKey="id"
                            responsive-layout="scroll"
                            :paginator="true"
                            :rows="pagination.perPage"
                            :totalRecords="pagination.total"
                            :first="(pagination.page - 1) * pagination.perPage"
                            @page="onPage"
                        >
                            <Column field="number" header="Commande" sortable />
                            <Column field="created_at" header="Date" sortable>
                                <template #body="{ data }">
                                    {{ formatDate(data.created_at) }}
                                </template>
                            </Column>
                            <Column field="total" header="Total" sortable>
                                <template #body="{ data }">
                                    {{ formatMoney(data.total) }}
                                </template>
                            </Column>
                            <Column field="status" header="Statut" sortable>
                                <template #body="{ data }">
                                    <Tag :value="data.status" :severity="statusSeverity(data.status)" />
                                </template>
                            </Column>
                            <Column header="Actions" body-class="text-right">
                                <template #body="{ data }">
                                    <Button icon="pi pi-search" label="Détails" size="small" text v-tooltip.top="'Voir les détails'" @click="goToOrder(data.id)" />
                                </template>
                            </Column>
                        </DataTable>

                        <div v-else class="text-center py-8">
                            <div class="flex flex-column align-items-center gap-3">
                                <i class="pi pi-shopping-bag text-6xl text-surface-300"></i>
                                <div>
                                    <p class="text-lg font-semibold mb-1 text-surface-900">Aucune commande</p>
                                    <p class="text-sm text-muted-color">
                                        Vous n'avez pas encore passé de commande.
                                    </p>
                                </div>
                                <Button
                                    label="Découvrir nos produits"
                                    icon="pi pi-arrow-right"
                                    iconPos="right"
                                    @click="$router.push({ name: 'client-catalog' })"
                                />
                            </div>
                        </div>
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useClientOrders } from '@/composables/client/useClientOrders';

import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import Skeleton from 'primevue/skeleton';

const router = useRouter();

const { orders, loading, pagination, onPage } = useClientOrders();

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

function goToOrder(id) {
    router.push({ name: 'client-order-detail', params: { id } });
}
</script>
