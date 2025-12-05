<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import { useToast } from 'primevue/usetoast';
import { fetchClientOrders } from '@/services/client/ordersService';

const orders = ref([]);
const loading = ref(false);
const pagination = reactive({
    page: 1,
    perPage: 10,
    total: 0
});

const toast = useToast();
const router = useRouter();

onMounted(() => {
    loadOrders();
});

async function loadOrders(page = 1) {
    loading.value = true;
    try {
        const response = await fetchClientOrders({ page });
        orders.value = response.data ?? [];
        pagination.page = page;
        pagination.total = response.meta?.total ?? 0;
        pagination.perPage = response.meta?.per_page ?? 10;
    } catch (error) {
        console.error(error);
        toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de charger vos commandes.',
            life: 4000
        });
    } finally {
        loading.value = false;
    }
}

function onPageChange(event) {
    loadOrders((event.page ?? 0) + 1);
}

function goToOrder(order) {
    router.push({ name: 'client-order-detail', params: { id: order.id } });
}

</script>

<template>
    <div class="py-8 px-4 max-w-6xl mx-auto">
        <div class="flex flex-column md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
                <p class="text-sm uppercase tracking-widest text-primary font-semibold">Mon compte</p>
                <h1 class="text-3xl font-bold">Mes commandes</h1>
            </div>
        </div>

        <Card class="shadow-sm border border-surface-200">
            <DataTable
                :value="orders"
                :loading="loading"
                paginator
                :rows="pagination.perPage"
                :totalRecords="pagination.total"
                :first="(pagination.page - 1) * pagination.perPage"
                @page="onPageChange"
                responsiveLayout="scroll"
                emptyMessage="Aucune commande pour le moment."
            >
                <Column field="number" header="Commande">
                    <template #body="{ data }">
                        <div class="flex flex-column">
                            <span class="font-semibold">{{ data.number }}</span>
                            <span class="text-sm text-muted-color">
                                {{ new Date(data.created_at).toLocaleDateString('fr-FR') }}
                            </span>
                        </div>
                    </template>
                </Column>
                <Column field="status" header="Statut">
                    <template #body="{ data }">
                        <Tag :value="data.status" :severity="data.status === 'completed' ? 'success' : 'info'" />
                    </template>
                </Column>
                <Column field="payment_status" header="Paiement">
                    <template #body="{ data }">
                        <Tag :value="data.payment_status" :severity="data.payment_status === 'paid' ? 'success' : 'warning'" />
                    </template>
                </Column>
                <Column header="Total">
                    <template #body="{ data }">
                        {{ new Intl.NumberFormat('fr-FR', { style: 'currency', currency: data.currency || 'EUR' }).format(data.total) }}
                    </template>
                </Column>
                <Column header="Actions">
                    <template #body="{ data }">
                        <Button label="Voir" icon="pi pi-eye" text @click="goToOrder(data)" />
                    </template>
                </Column>
            </DataTable>
        </Card>
    </div>
</template>
