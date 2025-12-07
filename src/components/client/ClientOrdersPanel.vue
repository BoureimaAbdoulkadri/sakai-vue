<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import {storeToRefs} from 'pinia';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Skeleton from 'primevue/skeleton';
import Card from 'primevue/card';
import {useToast} from 'primevue/usetoast';
import {useI18n} from 'vue-i18n';
import {useClientOrdersStore} from '@/stores/clientOrders';
import {useCartStore} from '@/stores/cart';
import {useRouter} from 'vue-router';

const toast = useToast();
const router = useRouter();
const cartStore = useCartStore();
const { t, locale } = useI18n();
const ordersStore = useClientOrdersStore();
const { orders, pagination, loadingOrders, loadingOrderDetail, selectedOrder } = storeToRefs(ordersStore);
const detailVisible = ref(false);

const orderList = computed(() => orders.value ?? []);

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

onMounted(() => {
    if (!orderList.value.length && !loadingOrders.value) {
        loadOrders();
    }
});

async function loadOrders(page?: number, perPage?: number) {
    try {
        await ordersStore.fetchOrders({ page, perPage });
    } catch (error) {
        console.error('Unable to load orders', error);
        toast.add({
            severity: 'error',
            summary: t('client.common.error'),
            detail: t('client.account.orders.toast.loadError'),
            life: 4000
        });
    }
}

function onPage(event: { page: number; rows: number }) {
    loadOrders(event.page + 1, event.rows);
}

async function openOrder(id: number | string) {
    try {
        await ordersStore.fetchOrderDetail(id);
        detailVisible.value = true;
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

function closeDialog() {
    detailVisible.value = false;
    ordersStore.clearSelectedOrder();
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

function statusLabel(status?: string | null) {
    if (!status) {
        return '';
    }
    const key = `client.common.statuses.${status}`;
    const translated = t(key);
    return translated === key ? status : translated;
}

function reorder(order: any) {
  if (!order || !order.items || !order.items.length) {
    toast.add({
      severity: 'warn',
      summary: t('client.common.warn'),
      detail: t('client.account.orders.toast.reorderEmpty', 'Cette commande ne contient pas d\'articles'),
      life: 3000
    });
    return;
  }

  // Vider le panier actuel et ajouter les articles de la commande
  cartStore.clear();

  order.items.forEach((item: any) => {
    cartStore.addItem(
        {
          id: item.product_id,
          name: item.product_name || 'Produit',
          slug: item.product_slug || String(item.product_id),
          price: Number(item.unit_price || 0),
          image_url: item.product_image_url
        },
        Number(item.quantity || 1)
    );
  });

  toast.add({
    severity: 'success',
    summary: t('client.common.success'),
    detail: t('client.account.orders.toast.reorderSuccess', 'Les articles ont été ajoutés au panier'),
    life: 3000
  });

  // Fermer le dialogue et rediriger vers le panier
  closeDialog();
  router.push({name: 'client-cart'});
}
</script>

<template>
    <section class="client-orders-panel">
        <div v-if="loadingOrders" class="p-3">
            <Skeleton height="3rem" class="mb-2" v-for="index in 4" :key="index" borderRadius="8px" />
        </div>
        <template v-else>
            <Card v-if="orderList.length" class="mb-3">
                <template #content>
                    <DataTable
                        :value="orderList"
                        dataKey="id"
                        :rows="pagination.perPage"
                        :paginator="true"
                        :totalRecords="pagination.total"
                        :first="(pagination.page - 1) * pagination.perPage"
                        responsive-layout="scroll"
                        @page="onPage"
                    >
                        <Column field="reference" :header="t('client.account.orders.columns.reference')" sortable>
                            <template #body="{ data }">
                                <span class="font-semibold">{{ data.reference }}</span>
                            </template>
                        </Column>
                        <Column field="placed_at" :header="t('client.account.orders.columns.date')" sortable>
                            <template #body="{ data }">
                                {{ formatDate(data.placed_at) }}
                            </template>
                        </Column>
                        <Column field="status" :header="t('client.account.orders.columns.status')" sortable>
                            <template #body="{ data }">
                                <Tag :value="statusLabel(data.status)" :severity="statusSeverity(data.status)" />
                            </template>
                        </Column>
                        <Column field="total" :header="t('client.account.orders.columns.total')" sortable>
                            <template #body="{ data }">
                                {{ formatMoney(data.total) }}
                            </template>
                        </Column>
                        <Column :header="t('client.account.orders.columns.items')">
                            <template #body="{ data }">
                                <Tag :value="t('client.account.orders.itemsCount', { count: data.items_count })" severity="secondary" />
                            </template>
                        </Column>
                        <Column :header="t('client.account.orders.columns.actions')" bodyClass="text-right">
                            <template #body="{ data }">
                                <Button :label="t('client.account.orders.view')" icon="pi pi-search" text size="small" @click="openOrder(data.id)" />
                            </template>
                        </Column>
                    </DataTable>
                </template>
            </Card>

            <div v-else class="empty-state">
                <i class="pi pi-shopping-bag"></i>
                <p class="empty-title">{{ t('client.account.orders.emptyTitle') }}</p>
                <p class="empty-text">{{ t('client.account.orders.emptySubtitle') }}</p>
                <Button :label="t('client.account.orders.emptyCta')" icon="pi pi-arrow-right" iconPos="right" @click="router.push({ name: 'client-catalog' })" />
            </div>
        </template>

        <Dialog
            v-model:visible="detailVisible"
            modal
            :style="{ width: 'min(700px, 95vw)' }"
            :breakpoints="{ '960px': '95vw' }"
            :header="t('client.account.orders.dialog.title')"
            @hide="closeDialog"
        >
            <div v-if="loadingOrderDetail" class="p-3">
                <Skeleton height="1.5rem" class="mb-2" />
                <Skeleton height="1rem" class="mb-2" v-for="index in 3" :key="index" />
            </div>
            <template v-else-if="selectedOrder">
                <div class="dialog-header">
                    <div>
                        <p class="dialog-ref">{{ t('client.account.orders.dialog.reference', { reference: selectedOrder.reference }) }}</p>
                        <p class="dialog-date">{{ t('client.account.orders.dialog.date', { date: formatDate(selectedOrder.placed_at) }) }}</p>
                    </div>
                    <div class="text-right">
                        <p class="dialog-total-label">{{ t('client.account.orders.dialog.total') }}</p>
                        <p class="dialog-total">{{ formatMoney(selectedOrder.total) }}</p>
                    </div>
                </div>

                <div class="dialog-items">
                    <p class="dialog-items-title">{{ t('client.account.orders.dialog.articles') }}</p>
                    <div v-for="item in selectedOrder.items" :key="item.id" class="dialog-item">
                        <div>
                            <p class="item-name">{{ item.product_name }}</p>
                            <p class="item-meta">{{ item.quantity }} × {{ formatMoney(item.unit_price) }}</p>
                        </div>
                        <p class="item-total">{{ formatMoney(item.total) }}</p>
                    </div>
                </div>

              <div class="dialog-actions">
                <Button
                    :label="t('client.account.orders.dialog.reorder', 'Commander à nouveau')"
                    icon="pi pi-refresh"
                    severity="success"
                    @click="reorder(selectedOrder)"
                />
              </div>
            </template>
            <p v-else class="text-sm text-muted-color">{{ t('client.account.orderDetail.notFound') }}</p>
        </Dialog>
    </section>
</template>

<style scoped>
.client-orders-panel {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.5rem;
    padding: 2rem;
}

.empty-state i {
    font-size: 3rem;
    color: var(--surface-400);
}

.empty-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
}

.empty-text {
    margin: 0;
    color: var(--text-color-secondary);
}

.dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
    gap: 1rem;
}

.dialog-ref {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
}

.dialog-date,
.dialog-total-label,
.item-meta {
    color: var(--text-color-secondary);
    font-size: 0.9rem;
    margin: 0;
}

.dialog-total {
    font-weight: 600;
    margin: 0;
}

.dialog-items {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.dialog-items-title {
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.dialog-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.item-name {
    font-weight: 600;
    margin: 0;
}

.item-total {
    font-weight: 600;
    margin: 0;
}

.dialog-actions {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--surface-border);
  display: flex;
  justify-content: flex-end;
}
</style>
