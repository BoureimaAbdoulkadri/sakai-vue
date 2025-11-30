<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-4 mb-4">
                    <div>
                        <h2 class="text-2xl font-semibold mb-1">Coupons</h2>
                        <span class="text-sm text-muted-color">Gestion des codes promotionnels</span>
                    </div>
                    <div class="flex flex-column md:flex-row gap-3 w-full md:w-auto">
                        <span class="p-input-icon-left flex-1">
                            <i class="pi pi-search" />
                            <InputText v-model="search" placeholder="Rechercher par code" class="w-full" @keyup.enter="onSearch" />
                        </span>
                        <Select
                            v-model="typeFilter"
                            :options="typeOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Type"
                            class="w-full md:w-12rem"
                            showClear
                            @change="onFilterChange"
                        />
                        <Select
                            v-model="statusFilter"
                            :options="statusOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Statut"
                            class="w-full md:w-12rem"
                            showClear
                            @change="onFilterChange"
                        />
                        <Button icon="pi pi-plus" label="Nouveau coupon" severity="primary" @click="openNew" />
                    </div>
                </div>

                <DataTable
                    :value="coupons"
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
                    <Column field="code" header="Code" sortable>
                        <template #body="{ data }">
                            <span class="font-semibold">{{ data.code }}</span>
                        </template>
                    </Column>
                    <Column field="type" header="Avantage">
                        <template #body="{ data }">
                            {{ formatValue(data) }}
                        </template>
                    </Column>
                    <Column field="scope" header="Portée">
                        <template #body="{ data }">
                            <span v-if="data.scope === 'order'">Commande</span>
                            <span v-else-if="data.scope === 'product'">Produit</span>
                            <span v-else-if="data.scope === 'category'">Catégorie</span>
                            <span v-else>—</span>
                        </template>
                    </Column>
                    <Column field="status" header="Statut" sortable>
                        <template #body="{ data }">
                            <Tag :value="data.status" :severity="statusSeverity(data.status)" />
                        </template>
                    </Column>
                    <Column header="Période">
                        <template #body="{ data }">
                            <div class="flex flex-column">
                                <span>Du : {{ formatDate(data.starts_at) }}</span>
                                <span>Au : {{ formatDate(data.ends_at) }}</span>
                            </div>
                        </template>
                    </Column>
                    <Column field="min_amount" header="Min. commande">
                        <template #body="{ data }">
                            <span v-if="data.min_amount != null">
                                {{ new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(data.min_amount)) }}
                            </span>
                            <span v-else>—</span>
                        </template>
                    </Column>
                    <Column header="Utilisations">
                        <template #body="{ data }">
                            {{ usageText(data) }}
                        </template>
                    </Column>
                    <Column field="created_at" header="Créé le">
                        <template #body="{ data }">
                            {{ formatDate(data.created_at) }}
                        </template>
                    </Column>
                    <Column header="Actions" body-class="text-center">
                        <template #body="{ data }">
                            <Button icon="pi pi-pencil" rounded text severity="secondary" class="mr-2" @click="openEdit(data)" />
                            <Button icon="pi pi-trash" rounded text severity="danger" @click="confirmDeleteCoupon(data)" />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>

    <Dialog v-model:visible="couponDialog" :header="dialogTitle" modal class="w-11 md:w-7">
        <div class="grid formgrid p-fluid">
            <div class="col-12 md:col-6">
                <label for="code" class="font-semibold">Code</label>
                <InputText id="code" v-model="form.code" />
            </div>
            <div class="col-12 md:col-6">
                <label for="type" class="font-semibold">Type</label>
                <Select
                    id="type"
                    v-model="form.type"
                    :options="dialogTypeOptions"
                    optionLabel="label"
                    optionValue="value"
                />
            </div>
            <div class="col-12 md:col-6">
                <label for="value" class="font-semibold">Valeur</label>
                <InputNumber
                    id="value"
                    v-model="form.value"
                    :disabled="form.type === 'free_shipping'"
                    :min="0"
                    :max="form.type === 'percent' ? 100 : null"
                    :suffix="form.type === 'percent' ? ' %' : ''"
                />
            </div>
            <div class="col-12 md:col-6">
                <label for="status" class="font-semibold">Statut</label>
                <Select
                    id="status"
                    v-model="form.status"
                    :options="dialogStatusOptions"
                    optionLabel="label"
                    optionValue="value"
                />
            </div>
            <div class="col-12 md:col-6">
                <label for="scope" class="font-semibold">Portée</label>
                <Select
                    id="scope"
                    v-model="form.scope"
                    :options="scopeOptions"
                    optionLabel="label"
                    optionValue="value"
                />
            </div>
            <div class="col-12 md:col-6">
                <label for="usage_limit" class="font-semibold">Limite d'utilisation</label>
                <InputNumber id="usage_limit" v-model="form.usage_limit" :min="0" placeholder="Illimité si vide" />
            </div>
            <div class="col-12 md:col-6">
                <label for="min_amount" class="font-semibold">Montant min. commande</label>
                <InputNumber id="min_amount" v-model="form.min_amount" :min="0" mode="currency" currency="EUR" locale="fr-FR" />
            </div>
            <div class="col-12 md:col-6">
                <label class="font-semibold">Période de validité</label>
                <div class="flex gap-2">
                    <Calendar v-model="form.starts_at" dateFormat="dd/mm/yy" placeholder="Date de début" showIcon class="w-full" />
                    <Calendar v-model="form.ends_at" dateFormat="dd/mm/yy" placeholder="Date de fin" showIcon class="w-full" />
                </div>
            </div>
        </div>
        <template #footer>
            <Button label="Annuler" icon="pi pi-times" text @click="hideDialog" />
            <Button label="Enregistrer" icon="pi pi-check" @click="saveCoupon" />
        </template>
    </Dialog>

    <ConfirmDialog />
</template>

<script setup>
import { computed } from 'vue';
import { useCoupons } from '@/composables/admin/useCoupons';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import InputNumber from 'primevue/inputnumber';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Tag from 'primevue/tag';
import ConfirmDialog from 'primevue/confirmdialog';

const {
    coupons,
    loading,
    pagination,
    search,
    typeFilter,
    statusFilter,
    typeOptions,
    statusOptions,
    scopeOptions,
    couponDialog,
    form,
    dialogTypeOptions,
    dialogStatusOptions,
    onPage,
    onSearch,
    onFilterChange,
    openNew,
    openEdit,
    hideDialog,
    saveCoupon,
    confirmDeleteCoupon,
    statusSeverity
} = useCoupons();

const dialogTitle = computed(() => (form.id ? 'Modifier le coupon' : 'Nouveau coupon'));

function formatValue(coupon) {
    if (!coupon) return '—';
    if (coupon.type === 'percent') {
        return `${coupon.value} %`;
    }
    if (coupon.type === 'fixed') {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(Number(coupon.value));
    }
    if (coupon.type === 'free_shipping') {
        return 'Livraison offerte';
    }
    return coupon.value ?? '—';
}

function formatDate(value) {
    if (!value) return '—';
    return new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'medium'
    }).format(new Date(value));
}

function usageText(coupon) {
    if (!coupon) return '—';
    if (coupon.usage_limit == null) {
        return `${coupon.usage_count || 0}`;
    }
    return `${coupon.usage_count || 0} / ${coupon.usage_limit}`;
}
</script>

<style scoped>
.card .p-input-icon-left > .p-inputtext,
.card .p-select,
.card .p-inputnumber,
.card .p-button {
    width: 100%;
}

@media screen and (min-width: 768px) {
    .card .p-input-icon-left > .p-inputtext,
    .card .p-select,
    .card .p-inputnumber {
        width: 12rem;
    }
}
</style>
