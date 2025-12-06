<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import Skeleton from 'primevue/skeleton';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { useToast } from 'primevue/usetoast';
import { useClientOrdersStore } from '@/stores/clientOrders';

const route = useRoute();
const toast = useToast();
const clientOrdersStore = useClientOrdersStore();
const { selectedOrder, loadingOrderDetail } = storeToRefs(clientOrdersStore);
const order = computed(() => selectedOrder.value);
const { t, locale } = useI18n();

const dateFormatter = computed(
    () =>
        new Intl.DateTimeFormat(locale.value === 'fr' ? 'fr-FR' : 'en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
        })
);

const moneyFormatter = computed(
    () =>
        new Intl.NumberFormat(locale.value === 'fr' ? 'fr-FR' : 'en-US', {
            style: 'currency',
            currency: 'EUR'
        })
);

async function loadOrder(id: string | string[]) {
    try {
        await clientOrdersStore.fetchOrderDetail(id);
    } catch (error) {
        console.error('Unable to load order detail', error);
        toast.add({
            severity: 'error',
            summary: t('client.common.error'),
            detail: t('client.account.orders.toast.detailError'),
            life: 4000
        });
    }
}

function formatDate(value?: string | null) {
    if (!value) return '—';
    return dateFormatter.value.format(new Date(value));
}

function formatMoney(value?: number | string | null) {
    if (value == null) return '—';
    return moneyFormatter.value.format(Number(value));
}

function statusSeverity(status?: string | null) {
    switch (status) {
        case 'pending':
            return 'warning';
        case 'paid':
        case 'completed':
            return 'success';
        case 'shipped':
            return 'info';
        case 'cancelled':
        case 'refunded':
            return 'danger';
        default:
            return 'secondary';
    }
}

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
</script>

<template>
    <div class="grid">
        <div class="col-12 mb-3">
            <RouterLink :to="{ name: 'client-orders' }" class="inline-flex align-items-center text-sm text-primary cursor-pointer hover:underline">
                <i class="pi pi-arrow-left mr-2" />
                {{ t('client.account.orderDetail.back') }}
            </RouterLink>
        </div>

        <div class="col-12">
            <Card class="surface-card shadow-1 border-round mb-4">
                <template #content>
                    <div v-if="loadingOrderDetail">
                        <Skeleton width="40%" height="1.5rem" class="mb-2" />
                        <Skeleton width="30%" height="1rem" class="mb-2" />
                        <Skeleton width="30%" height="1rem" class="mb-2" />
                    </div>
                    <div v-else-if="order">
                        <div class="flex flex-column md:flex-row md:justify-content-between gap-3">
                            <div>
                                <h2 class="text-xl font-semibold mb-1">{{ t('client.account.orderDetail.title', { reference: order.reference }) }}</h2>
                                <div class="text-sm text-muted-color mb-2">
                                    {{ t('client.account.orderDetail.placed', { date: formatDate(order.placed_at) }) }}
                                </div>
                                <Tag :value="t(`client.common.statuses.${order.status}`)" :severity="statusSeverity(order.status)" />
                            </div>
                            <div class="text-right">
                                <div class="text-sm text-muted-color">{{ t('client.account.orderDetail.total') }}</div>
                                <div class="text-2xl font-semibold">
                                    {{ formatMoney(order.total) }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="text-sm text-muted-color">{{ t('client.account.orderDetail.notFound') }}</div>
                </template>
            </Card>
        </div>

        <div class="col-12" v-if="order && !loadingOrderDetail">
            <Card class="surface-card shadow-1 border-round">
                <template #title>
                    <div class="flex align-items-center gap-2">
                        <i class="pi pi-box text-primary"></i>
                        <span>{{ t('client.account.orderDetail.items') }}</span>
                    </div>
                </template>
                <template #content>
                    <DataTable v-if="order.items?.length" :value="order.items" dataKey="id" responsive-layout="scroll" :rows="10">
                        <Column field="product_name" :header="t('client.account.orders.columns.reference')">
                            <template #body="{ data }">
                                <span class="font-semibold">{{ data.product_name }}</span>
                            </template>
                        </Column>
                        <Column field="quantity" :header="t('client.product.quantity')" class="text-center">
                            <template #body="{ data }">
                                <Tag :value="'x' + data.quantity" severity="info" />
                            </template>
                        </Column>
                        <Column field="unit_price" :header="t('client.account.orderDetail.unitPrice')">
                            <template #body="{ data }">
                                {{ formatMoney(data.unit_price) }}
                            </template>
                        </Column>
                        <Column field="total" :header="t('client.account.orderDetail.total')">
                            <template #body="{ data }">
                                <span class="font-semibold">{{ formatMoney(data.total) }}</span>
                            </template>
                        </Column>
                    </DataTable>
                    <div v-else class="text-center text-sm text-muted-color py-4">{{ t('client.account.orderDetail.empty') }}</div>
                </template>
            </Card>
        </div>
    </div>
</template>
