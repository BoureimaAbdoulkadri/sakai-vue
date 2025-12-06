<template>
    <div class="grid">
        <div class="col-12 mb-3">
            <RouterLink :to="{ name: 'client-orders' }" class="inline-flex align-items-center text-sm text-primary cursor-pointer hover:underline">
                <i class="pi pi-arrow-left mr-2" />
                Retour à mes commandes
            </RouterLink>
        </div>

        <div class="col-12">
            <Card class="surface-card shadow-1 border-round mb-4">
                <template #content>
                    <div v-if="loading">
                        <Skeleton width="40%" height="1.5rem" class="mb-2" />
                        <Skeleton width="30%" height="1rem" class="mb-2" />
                        <Skeleton width="30%" height="1rem" class="mb-2" />
                    </div>
                    <div v-else-if="order">
                        <div class="flex flex-column md:flex-row md:justify-content-between gap-3">
                            <div>
                                <h2 class="text-xl font-semibold mb-1">
                                    Commande {{ order.number }}
                                </h2>
                                <div class="text-sm text-muted-color mb-2">
                                    Passée le {{ formatDate(order.created_at) }}
                                </div>
                                <Tag :value="order.status" :severity="statusSeverity(order.status)" />
                            </div>
                            <div class="text-right">
                                <div class="text-sm text-muted-color">Total</div>
                                <div class="text-2xl font-semibold">
                                    {{ formatMoney(order.total) }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="text-sm text-muted-color">
                        Commande introuvable.
                    </div>
                </template>
            </Card>
        </div>

        <div class="col-12" v-if="order && !loading">
            <Card class="surface-card shadow-1 border-round">
                <template #title>
                    <div class="flex align-items-center gap-2">
                        <i class="pi pi-box text-primary"></i>
                        <span>Articles de la commande</span>
                    </div>
                </template>
                <template #content>
                    <DataTable
                        v-if="order.items && order.items.length"
                        :value="order.items"
                        dataKey="product_id"
                        responsive-layout="scroll"
                        :rows="10"
                    >
                        <Column field="product_name" header="Produit">
                            <template #body="{ data }">
                                <span class="font-semibold">{{ data.product_name }}</span>
                            </template>
                        </Column>
                        <Column field="quantity" header="Quantité" class="text-center">
                            <template #body="{ data }">
                                <Tag :value="'x' + data.quantity" severity="info" />
                            </template>
                        </Column>
                        <Column field="unit_price" header="Prix unitaire">
                            <template #body="{ data }">
                                {{ formatMoney(data.unit_price) }}
                            </template>
                        </Column>
                        <Column field="total" header="Total">
                            <template #body="{ data }">
                                <span class="font-semibold">{{ formatMoney(data.total) }}</span>
                            </template>
                        </Column>
                    </DataTable>
                    <div v-else class="text-center text-sm text-muted-color py-4">
                        Aucun article dans cette commande.
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { useClientOrderDetail } from '@/composables/client/useClientOrderDetail';

import Card from 'primevue/card';
import Tag from 'primevue/tag';
import Skeleton from 'primevue/skeleton';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const route = useRoute();
const { order, loading, loadOrder } = useClientOrderDetail();

onMounted(() => {
    if (route.params.id) {
        loadOrder(route.params.id);
    }
});

watch(
    () => route.params.id,
    (id) => {
        if (id) {
            loadOrder(id);
        }
    }
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
</script>
