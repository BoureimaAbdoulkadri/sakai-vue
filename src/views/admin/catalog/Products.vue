<script setup>
import {computed} from 'vue';
import {useProducts} from '@/composables/admin/useProducts';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Tag from 'primevue/tag';
import ConfirmDialog from 'primevue/confirmdialog';

const {
    products,
    loading,
    pagination,
    search,
    statusFilter,
    categoryFilter,
    statusOptions,
    categoryOptions,
    productDialog,
    form,
    selectedProducts,
    openNew,
    openEdit,
    hideDialog,
    saveProduct,
    confirmDeleteProduct,
    onPage,
    exportCSV,
    exportExcel,
    bulkDelete,
    bulkUpdateStatus
} = useProducts();

const dialogStatusOptions = computed(() => statusOptions.filter((option) => option.value !== null));
const dialogTitle = computed(() => (form.id ? 'Modifier le produit' : 'Nouveau produit'));

function formatPrice(value) {
    if (value == null) {
        return '—';
    }
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
        case 'published':
            return 'success';
        case 'draft':
            return 'warning';
        case 'archived':
            return 'danger';
        default:
            return 'info';
    }
}
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-4 mb-4">
                    <div>
                        <h2 class="text-2xl font-semibold mb-1">Produits</h2>
                        <span class="text-sm text-muted-color">Gestion du catalogue produits</span>
                    </div>
                    <div class="flex flex-column md:flex-row gap-3 w-full md:w-auto">
                        <span class="p-input-icon-left flex-1">
                            <i class="pi pi-search" />
                            <InputText v-model="search" placeholder="Rechercher" class="w-full" />
                        </span>
                        <Select v-model="statusFilter" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="Statut" class="w-full md:w-14rem" showClear />
                        <Select
                            v-model="categoryFilter"
                            :options="categoryOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Catégorie"
                            class="w-full md:w-14rem"
                            showClear
                        />
                        <Button v-tooltip.top="'Exporter en Excel'" icon="pi pi-file-excel" label="Excel" outlined severity="success"
                                @click="exportExcel"/>
                        <Button v-tooltip.top="'Exporter en CSV'" icon="pi pi-file" label="CSV" outlined severity="secondary"
                                @click="exportCSV"/>
                        <Button icon="pi pi-plus" label="Nouveau produit" severity="primary" @click="openNew" />
                    </div>
                </div>

                <div v-if="selectedProducts.length > 0"
                     class="mb-3 p-3 surface-100 border-round flex align-items-center gap-3">
                    <span class="font-semibold">{{ selectedProducts.length }} produit(s) sélectionné(s)</span>
                    <Button icon="pi pi-check" label="Publier" size="small" @click="bulkUpdateStatus('published')"/>
                    <Button icon="pi pi-archive" label="Archiver" severity="secondary" size="small"
                            @click="bulkUpdateStatus('archived')"/>
                    <Button icon="pi pi-trash" label="Supprimer" severity="danger" size="small" @click="bulkDelete"/>
                </div>

                <DataTable
                    v-model:selection="selectedProducts"
                    :value="products"
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
                    <Column headerStyle="width: 3rem" selectionMode="multiple"/>
                    <Column field="name" header="Nom" sortable>
                        <template #body="{ data }">
                            <div class="flex flex-column">
                                <span class="font-semibold">{{ data.name }}</span>
                                <small class="text-muted-color">Slug : {{ data.slug }}</small>
                            </div>
                        </template>
                    </Column>
                    <Column field="sku" header="SKU" sortable />
                    <Column field="category.name" header="Catégorie">
                        <template #body="{ data }">
                            {{ data.category?.name ?? '—' }}
                        </template>
                    </Column>
                    <Column field="base_price" header="Prix">
                        <template #body="{ data }">
                            {{ formatPrice(data.base_price) }}
                        </template>
                    </Column>
                    <Column field="stock" header="Stock" sortable>
                        <template #body="{ data }">
                            <Tag :value="data.stock" severity="info" />
                        </template>
                    </Column>
                    <Column field="status" header="Statut" sortable>
                        <template #body="{ data }">
                            <Tag :value="data.status" :severity="statusSeverity(data.status)" />
                        </template>
                    </Column>
                    <Column field="created_at" header="Créé le">
                        <template #body="{ data }">
                            {{ formatDate(data.created_at) }}
                        </template>
                    </Column>
                    <Column header="Actions" body-class="text-center">
                        <template #body="{ data }">
                            <Button icon="pi pi-pencil" rounded text severity="secondary" class="mr-2" v-tooltip.top="'Modifier'" @click="openEdit(data)" />
                            <Button icon="pi pi-trash" rounded text severity="danger" v-tooltip.top="'Supprimer'" @click="confirmDeleteProduct(data)" />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>

    <Dialog v-model:visible="productDialog" :header="dialogTitle" modal class="w-11 md:w-6">
        <div class="grid formgrid p-fluid">
            <div class="col-12 md:col-6">
                <label for="name" class="font-semibold">Nom</label>
                <InputText id="name" v-model="form.name" required />
            </div>
            <div class="col-12 md:col-6">
                <label for="slug" class="font-semibold">Slug</label>
                <InputText id="slug" v-model="form.slug" />
            </div>
            <div class="col-12 md:col-6">
                <label for="sku" class="font-semibold">SKU</label>
                <InputText id="sku" v-model="form.sku" />
            </div>
            <div class="col-12">
                <label for="description" class="font-semibold">Description</label>
                <Textarea id="description" v-model="form.description" rows="3" auto-resize />
            </div>
            <div class="col-12 md:col-6">
                <label for="price" class="font-semibold">Prix</label>
                <InputNumber id="price" v-model="form.base_price" mode="currency" currency="EUR" locale="fr-FR" />
            </div>
            <div class="col-12 md:col-6">
                <label for="stock" class="font-semibold">Stock</label>
                <InputNumber id="stock" v-model="form.stock" :min="0" />
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
                <label for="category" class="font-semibold">Catégorie</label>
                <Select
                    id="category"
                    v-model="form.category_id"
                    :options="categoryOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Sélectionner"
                    showClear
                />
            </div>
        </div>
        <template #footer>
            <Button label="Annuler" icon="pi pi-times" text @click="hideDialog" />
            <Button label="Enregistrer" icon="pi pi-check" @click="saveProduct" />
        </template>
    </Dialog>

    <ConfirmDialog />
</template>

<style scoped>
.card .p-input-icon-left > .p-inputtext,
.card .p-dropdown,
.card .p-button {
    width: 100%;
}

@media screen and (min-width: 768px) {
    .card .p-input-icon-left > .p-inputtext,
    .card .p-dropdown {
        width: 14rem;
    }
}
</style>
