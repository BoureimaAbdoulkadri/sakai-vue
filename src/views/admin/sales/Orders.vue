<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-4 mb-4">
                    <div>
                        <h2 class="text-2xl font-semibold mb-1">Commandes</h2>
                        <span class="text-sm text-muted-color">Suivi des commandes clients</span>
                    </div>
                    <div class="flex flex-column md:flex-row gap-3 w-full md:w-auto">
                        <span class="p-input-icon-left flex-1">
                            <i class="pi pi-search" />
                            <InputText v-model="search" placeholder="N° commande ou email client" class="w-full" @keyup.enter="onSearch" />
                        </span>
                        <Select
                            v-model="statusFilter"
                            :options="statusOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Statut commande"
                            class="w-full md:w-14rem"
                            showClear
                            @change="onFilterChange"
                        />
                        <Select
                            v-model="paymentStatusFilter"
                            :options="paymentStatusOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Statut paiement"
                            class="w-full md:w-14rem"
                            showClear
                            @change="onFilterChange"
                        />
                        <Calendar v-model="dateFrom" dateFormat="dd/mm/yy" placeholder="Du" showIcon class="w-full md:w-10rem" />
                        <Calendar v-model="dateTo" dateFormat="dd/mm/yy" placeholder="Au" showIcon class="w-full md:w-10rem" />
                        <Button icon="pi pi-filter" label="Appliquer" severity="secondary" @click="onFilterChange" />
                    </div>
                </div>

                <DataTable
                    :value="orders"
                    :loading="loading"
                    lazy
                    paginator
                    :rows="pagination.perPage"
                    :totalRecords="pagination.total"
                    :first="(pagination.page - 1) * pagination.perPage"
                    @page="onPage"
                    dataKey="id"
                    responsive-layout="scroll"
                    class="mt-3"
                >
                    <Column field="order_number" header="Commande" sortable>
                        <template #body="{ data }">
                            <span class="font-semibold">{{ data.order_number }}</span>
                        </template>
                    </Column>
                    <Column header="Client">
                        <template #body="{ data }">
                            <div class="flex flex-column">
                                <span>{{ data.customer?.name ?? '—' }}</span>
                                <small class="text-muted-color">{{ data.customer?.email ?? '' }}</small>
                            </div>
                        </template>
                    </Column>
                    <Column field="total_amount" header="Montant">
                        <template #body="{ data }">
                            {{ formatPrice(data.total_amount, data.currency || 'EUR') }}
                        </template>
                    </Column>
                    <Column field="status" header="Statut commande">
                        <template #body="{ data }">
                            <Tag :value="data.status" :severity="statusSeverity(data.status)" />
                        </template>
                    </Column>
                    <Column field="payment_status" header="Paiement">
                        <template #body="{ data }">
                            <Tag :value="data.payment_status" :severity="statusSeverity(data.payment_status)" />
                        </template>
                    </Column>
                    <Column field="created_at" header="Créée le">
                        <template #body="{ data }">
                            {{ formatDate(data.created_at) }}
                        </template>
                    </Column>
                    <Column header="Actions" body-class="text-center">
                        <template #body="{ data }">
                            <Button icon="pi pi-eye" rounded text severity="secondary" @click="openOrder(data)" />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>

    <Dialog v-model:visible="orderDialog" :header="dialogTitle" modal class="w-11 md:w-7">
        <div v-if="selectedOrder" class="grid">
            <div class="col-12 md:col-6">
                <h3 class="text-lg font-semibold mb-2">Informations commande</h3>
                <p><strong>N° :</strong> {{ selectedOrder.order_number }}</p>
                <p><strong>Date :</strong> {{ formatDate(selectedOrder.created_at) }}</p>
                <p><strong>Montant :</strong> {{ formatPrice(selectedOrder.total_amount, selectedOrder.currency) }}</p>

                <div class="mt-3">
                    <label class="font-semibold block mb-1">Statut commande</label>
                    <Select v-model="selectedOrder.status" :options="dialogStatusOptions" optionLabel="label" optionValue="value" class="w-full" />
                </div>
                <div class="mt-3">
                    <label class="font-semibold block mb-1">Statut paiement</label>
                    <Select
                        v-model="selectedOrder.payment_status"
                        :options="dialogPaymentStatusOptions"
                        optionLabel="label"
                        optionValue="value"
                        class="w-full"
                    />
                </div>
            </div>

            <div class="col-12 md:col-6">
                <h3 class="text-lg font-semibold mb-2">Client</h3>
                <p><strong>Nom :</strong> {{ selectedOrder.customer?.name }}</p>
                <p><strong>Email :</strong> {{ selectedOrder.customer?.email }}</p>
                <p><strong>Téléphone :</strong> {{ selectedOrder.customer?.phone ?? '—' }}</p>

                <h3 class="text-lg font-semibold mt-4 mb-2">Adresse de facturation</h3>
                <p>{{ selectedOrder.billing_address?.line1 }}</p>
                <p>
                    {{ selectedOrder.billing_address?.postal_code }}
                    {{ selectedOrder.billing_address?.city }},
                    {{ selectedOrder.billing_address?.country }}
                </p>

                <h3 class="text-lg font-semibold mt-4 mb-2">Adresse de livraison</h3>
                <p>{{ selectedOrder.shipping_address?.line1 }}</p>
                <p>
                    {{ selectedOrder.shipping_address?.postal_code }}
                    {{ selectedOrder.shipping_address?.city }},
                    {{ selectedOrder.shipping_address?.country }}
                </p>
            </div>

            <div class="col-12">
                <h3 class="text-lg font-semibold mt-4 mb-2">Articles</h3>
                <DataTable :value="selectedOrder.items || []" responsive-layout="scroll">
                    <Column field="product_name_snapshot" header="Produit" />
                    <Column field="quantity" header="Quantité" />
                    <Column field="unit_price" header="Prix unitaire">
                        <template #body="{ data }">
                            {{ formatPrice(data.unit_price, selectedOrder.currency) }}
                        </template>
                    </Column>
                    <Column field="total_line" header="Total">
                        <template #body="{ data }">
                            {{ formatPrice(data.total_line, selectedOrder.currency) }}
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>

        <template #footer>
            <Button label="Fermer" icon="pi pi-times" text @click="closeOrderDialog" />
            <Button label="Enregistrer le statut" icon="pi pi-check" @click="saveOrderStatus" />
        </template>
    </Dialog>

    <ConfirmDialog />
</template>

<script setup>
import { computed } from 'vue';
import { useOrders } from '@/composables/admin/useOrders';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Tag from 'primevue/tag';
import ConfirmDialog from 'primevue/confirmdialog';

const {
    orders,
    loading,
    pagination,
    search,
    statusFilter,
    paymentStatusFilter,
    dateFrom,
    dateTo,
    orderDialog,
    selectedOrder,
    statusOptions,
    paymentStatusOptions,
    dialogStatusOptions,
    dialogPaymentStatusOptions,
    statusSeverity,
    onPage,
    onSearch,
    onFilterChange,
    openOrder,
    closeOrderDialog,
    saveOrderStatus
} = useOrders();

const dialogTitle = computed(() => (selectedOrder.value ? `Commande ${selectedOrder.value.order_number}` : 'Commande'));

function formatPrice(value, currency = 'EUR') {
    if (value == null) return '—';
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency
    }).format(Number(value));
}

function formatDate(value) {
    if (!value) return '—';
    return new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(new Date(value));
}
</script>

<style scoped>
.card .p-input-icon-left > .p-inputtext,
.card .p-select,
.card .p-button,
.card .p-calendar {
    width: 100%;
}

@media screen and (min-width: 768px) {
    .card .p-input-icon-left > .p-inputtext,
    .card .p-select,
    .card .p-calendar {
        width: 14rem;
    }
}
</style>
