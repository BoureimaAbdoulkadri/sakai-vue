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

    <Dialog v-model:visible="customerDialog" :header="dialogTitle" class="w-11 md:w-8" modal>
        <div class="formgrid grid p-fluid">
            <!-- Section Informations personnelles -->
            <div class="col-12">
                <Divider align="left">
                    <div class="flex align-items-center gap-2">
                        <i class="pi pi-user text-primary"></i>
                        <span class="font-semibold text-lg">Informations personnelles</span>
                    </div>
                </Divider>
            </div>

            <div class="col-12 md:col-6">
                <label class="font-semibold block mb-2" for="first_name">
                    Prénom <span class="text-red-500">*</span>
                </label>
                <InputText
                    id="first_name"
                    v-model="form.first_name"
                    class="w-full"
                    placeholder="Ex: Jean"
                />
            </div>

            <div class="col-12 md:col-6">
                <label class="font-semibold block mb-2" for="last_name">
                    Nom <span class="text-red-500">*</span>
                </label>
                <InputText
                    id="last_name"
                    v-model="form.last_name"
                    class="w-full"
                    placeholder="Ex: Dupont"
                />
            </div>

            <!-- Section Contact -->
            <div class="col-12 mt-3">
                <Divider align="left">
                    <div class="flex align-items-center gap-2">
                        <i class="pi pi-envelope text-primary"></i>
                        <span class="font-semibold text-lg">Coordonnées</span>
                    </div>
                </Divider>
            </div>

            <div class="col-12 md:col-6">
                <label class="font-semibold block mb-2" for="email">
                    Email <span class="text-red-500">*</span>
                </label>
                <InputText
                    id="email"
                    v-model="form.email"
                    class="w-full"
                    placeholder="email@exemple.com"
                    type="email"
                />
            </div>

            <div class="col-12 md:col-6">
                <label class="font-semibold block mb-2" for="phone">
                    Téléphone
                </label>
                <InputText
                    id="phone"
                    v-model="form.phone"
                    class="w-full"
                    placeholder="+33 6 12 34 56 78"
                />
            </div>

            <!-- Section Entreprise -->
            <div class="col-12 mt-3">
                <Divider align="left">
                    <div class="flex align-items-center gap-2">
                        <i class="pi pi-building text-primary"></i>
                        <span class="font-semibold text-lg">Informations entreprise</span>
                    </div>
                </Divider>
            </div>

            <div class="col-12">
                <label class="font-semibold block mb-2" for="company_name">
                    Nom de la société
                </label>
                <InputText
                    id="company_name"
                    v-model="form.company_name"
                    class="w-full"
                    placeholder="Ex: ACME Corporation"
                />
                <small class="text-muted-color">Laisser vide si client particulier</small>
            </div>

            <!-- Section Statut -->
            <div class="col-12 mt-3">
                <Divider align="left">
                    <div class="flex align-items-center gap-2">
                        <i class="pi pi-cog text-primary"></i>
                        <span class="font-semibold text-lg">Paramètres</span>
                    </div>
                </Divider>
            </div>

            <div class="col-12 md:col-6">
                <label class="font-semibold block mb-2" for="status">
                    Statut <span class="text-red-500">*</span>
                </label>
                <Select
                    id="status"
                    v-model="form.status"
                    :options="dialogStatusOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                />
                <small class="text-muted-color">Définit l'état du compte client</small>
            </div>

            <div class="col-12 md:col-6">
                <div class="field">
                    <label class="font-semibold block mb-2">Type de client</label>
                    <div class="flex gap-4 align-items-center">
                        <div class="flex align-items-center">
                            <RadioButton
                                v-model="form.type"
                                inputId="type_individual"
                                value="individual"
                            />
                            <label class="ml-2" for="type_individual">Particulier</label>
                        </div>
                        <div class="flex align-items-center">
                            <RadioButton
                                v-model="form.type"
                                inputId="type_company"
                                value="company"
                            />
                            <label class="ml-2" for="type_company">Entreprise</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-content-between align-items-center w-full">
                <small class="text-muted-color">
                    <i class="pi pi-info-circle mr-1"></i>
                    Les champs marqués d'un <span class="text-red-500">*</span> sont obligatoires
                </small>
                <div class="flex gap-2">
                    <Button
                        icon="pi pi-times"
                        label="Annuler"
                        severity="secondary"
                        text
                        @click="hideDialog"
                    />
                    <Button
                        icon="pi pi-check"
                        label="Enregistrer"
                        @click="saveCustomer"
                    />
                </div>
            </div>
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
import Divider from 'primevue/divider';
import RadioButton from 'primevue/radiobutton';
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
/* Style des filtres de recherche */
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

/* Style Sakai professionnel pour le formulaire */
:deep(.p-dialog) {
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

:deep(.p-dialog-header) {
    border-bottom: 1px solid var(--surface-border);
    padding: 1.5rem;
}

:deep(.p-dialog-content) {
    padding: 1.5rem;
}

:deep(.p-dialog-footer) {
    border-top: 1px solid var(--surface-border);
    padding: 1.25rem 1.5rem;
}

/* Style des dividers */
:deep(.p-divider) {
    margin: 0.5rem 0;
}

:deep(.p-divider .p-divider-content) {
    background-color: transparent;
}

:deep(.p-divider-horizontal.p-divider-left::before) {
    flex-grow: 0;
    width: 0;
}

/* Style des inputs dans le formulaire */
:deep(.formgrid .p-inputtext),
:deep(.formgrid .p-select) {
    border-radius: 6px;
    transition: all 0.2s ease-in-out;
}

:deep(.formgrid .p-inputtext:focus),
:deep(.formgrid .p-select:focus) {
    box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
    border-color: #3b82f6;
}

:deep(.formgrid .p-inputtext::placeholder) {
    color: var(--text-color-secondary);
    opacity: 0.7;
}

/* Style des radio buttons */
:deep(.p-radiobutton) {
    width: 1.25rem;
    height: 1.25rem;
}

:deep(.p-radiobutton .p-radiobutton-box) {
    border-radius: 50%;
    transition: all 0.2s ease-in-out;
}

:deep(.p-radiobutton .p-radiobutton-box.p-highlight) {
    background-color: #3b82f6;
    border-color: #3b82f6;
}

/* Style des labels et hints */
.formgrid label {
    color: var(--text-color);
    font-weight: 600;
}

.formgrid small.text-muted-color {
    display: block;
    margin-top: 0.375rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
}

/* Icônes de section */
.text-primary {
    color: #3b82f6 !important;
}

/* Animation d'entrée du dialog */
:deep(.p-dialog-enter-active) {
    transition: all 0.3s ease;
}

:deep(.p-dialog-enter-from) {
    opacity: 0;
    transform: scale(0.95);
}
</style>
