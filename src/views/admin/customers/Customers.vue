<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-4 mb-4">
                    <div>
                        <h2 class="text-2xl font-semibold mb-1">Clients</h2>
                        <span class="text-sm text-muted-color">Gestion des clients et prospects</span>
                    </div>
                    <div class="flex flex-column md:flex-row gap-3 w-full md:w-auto">
                        <span class="p-input-icon-left flex-1">
                            <i class="pi pi-search" />
                            <InputText v-model="search" placeholder="Nom, email ou société" class="w-full" @keyup.enter="onSearch" />
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
                        <Select
                            v-model="countryFilter"
                            :options="countryOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Pays"
                            class="w-full md:w-12rem"
                            showClear
                            @change="onFilterChange"
                        />
                        <Button v-tooltip.top="'Exporter en Excel'" icon="pi pi-file-excel" label="Excel" outlined severity="success"
                                @click="exportExcel"/>
                        <Button v-tooltip.top="'Exporter en CSV'" icon="pi pi-file" label="CSV" outlined severity="secondary"
                                @click="exportCSV"/>
                        <Button icon="pi pi-plus" label="Nouveau client" severity="primary" @click="openNew" />
                    </div>
                </div>

                <DataTable
                    :value="customers"
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
                    <Column header="Client" field="full_name" sortable>
                        <template #body="{ data }">
                            <div class="flex flex-column">
                                <span class="font-semibold">{{ fullName(data) }}</span>
                                <small class="text-muted-color">{{ data.email }}</small>
                            </div>
                        </template>
                    </Column>
                    <Column field="type" header="Type" sortable>
                        <template #body="{ data }">
                            <Tag :value="data.type === 'company' ? 'Entreprise' : 'Particulier'" />
                        </template>
                    </Column>
                    <Column field="status" header="Statut" sortable>
                        <template #body="{ data }">
                            <Tag :value="data.status" :severity="statusSeverity(data.status)" />
                        </template>
                    </Column>
                    <Column field="company_name" header="Société">
                        <template #body="{ data }">
                            {{ data.company_name || '—' }}
                        </template>
                    </Column>
                    <Column header="Localisation">
                        <template #body="{ data }">
                            <div class="flex flex-column">
                                <span>{{ data.city || '—' }}</span>
                                <small class="text-muted-color">{{ data.country || '' }}</small>
                            </div>
                        </template>
                    </Column>
                    <Column field="total_orders" header="Cmd">
                        <template #body="{ data }">
                            {{ data.total_orders ?? 0 }}
                        </template>
                    </Column>
                    <Column field="total_spent" header="CA">
                        <template #body="{ data }">
                            {{ formatMoney(data.total_spent) }}
                        </template>
                    </Column>
                    <Column field="last_order_date" header="Dernière commande">
                        <template #body="{ data }">
                            {{ formatDate(data.last_order_date) }}
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
                            <Button icon="pi pi-trash" rounded text severity="danger" @click="confirmDeleteCustomer(data)" />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>

    <Dialog v-model:visible="customerDialog" :header="dialogTitle" modal class="w-11 md:w-7">
        <div class="grid formgrid p-fluid">
            <div class="col-12 md:col-6">
                <label for="first_name" class="font-semibold">Prénom</label>
                <InputText id="first_name" v-model="form.first_name" />
            </div>
            <div class="col-12 md:col-6">
                <label for="last_name" class="font-semibold">Nom</label>
                <InputText id="last_name" v-model="form.last_name" />
            </div>
            <div class="col-12 md:col-6">
                <label for="email" class="font-semibold">Email</label>
                <InputText id="email" v-model="form.email" />
            </div>
            <div class="col-12 md:col-6">
                <label for="phone" class="font-semibold">Téléphone</label>
                <InputText id="phone" v-model="form.phone" />
            </div>
            <div class="col-12">
                <label for="company_name" class="font-semibold">Société</label>
                <InputText id="company_name" v-model="form.company_name" />
            </div>
            <div class="col-12 md:col-6">
                <label for="type" class="font-semibold">Type</label>
                <Select id="type" v-model="form.type" :options="dialogTypeOptions" optionLabel="label" optionValue="value" />
            </div>
            <div class="col-12 md:col-6">
                <label for="status" class="font-semibold">Statut</label>
                <Select id="status" v-model="form.status" :options="dialogStatusOptions" optionLabel="label" optionValue="value" />
            </div>
            <div class="col-12 md:col-6">
                <label for="country" class="font-semibold">Pays</label>
                <Select
                    id="country"
                    v-model="form.country"
                    :options="countryOptions.filter((c) => c.value)"
                    optionLabel="label"
                    optionValue="value"
                />
            </div>
            <div class="col-12 md:col-6">
                <label for="city" class="font-semibold">Ville</label>
                <InputText id="city" v-model="form.city" />
            </div>
            <div class="col-12">
                <label for="address_line1" class="font-semibold">Adresse</label>
                <InputText id="address_line1" v-model="form.address_line1" />
            </div>
            <div class="col-12 md:col-6">
                <label for="postal_code" class="font-semibold">Code postal</label>
                <InputText id="postal_code" v-model="form.postal_code" />
            </div>
        </div>
        <template #footer>
            <Button label="Annuler" icon="pi pi-times" text @click="hideDialog" />
            <Button label="Enregistrer" icon="pi pi-check" @click="saveCustomer" />
        </template>
    </Dialog>

    <ConfirmDialog />
</template>

<script setup>
import {computed} from 'vue';
import {useCustomers} from '@/composables/admin/useCustomers';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Tag from 'primevue/tag';
import ConfirmDialog from 'primevue/confirmdialog';

const {
    customers,
    loading,
    pagination,
    search,
    typeFilter,
    statusFilter,
    countryFilter,
    typeOptions,
    statusOptions,
    countryOptions,
    customerDialog,
    form,
    dialogTypeOptions,
    dialogStatusOptions,
    onPage,
    onSearch,
    onFilterChange,
    openNew,
    openEdit,
    hideDialog,
    saveCustomer,
    confirmDeleteCustomer,
    exportCSV,
    exportExcel
} = useCustomers();

const dialogTitle = computed(() => (form.id ? 'Modifier le client' : 'Nouveau client'));

function fullName(customer) {
    if (customer.full_name) return customer.full_name;
    return [customer.first_name, customer.last_name].filter(Boolean).join(' ');
}

function formatMoney(value) {
    if (value == null) return '—';
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(Number(value));
}

function formatDate(value) {
    if (!value) return '—';
    return new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'medium'
    }).format(new Date(value));
}

function statusSeverity(status) {
    switch (status) {
        case 'active':
            return 'success';
        case 'prospect':
            return 'info';
        case 'inactive':
            return 'danger';
        default:
            return 'info';
    }
}
</script>

<style scoped>
.card .p-input-icon-left > .p-inputtext,
.card .p-select,
.card .p-button {
    width: 100%;
}

@media screen and (min-width: 768px) {
    .card .p-input-icon-left > .p-inputtext,
    .card .p-select {
        width: 12rem;
    }
}
</style>
