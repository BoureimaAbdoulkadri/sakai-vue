<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-4 mb-4">
                    <div>
                        <h2 class="text-2xl font-semibold mb-1">Catégories</h2>
                        <span class="text-sm text-muted-color">Gestion des catégories du catalogue</span>
                    </div>
                    <div class="flex flex-column md:flex-row gap-3 w-full md:w-auto">
                        <span class="p-input-icon-left flex-1">
                            <i class="pi pi-search" />
                            <InputText v-model="search" placeholder="Rechercher par nom ou slug" class="w-full" @keyup.enter="onSearch" />
                        </span>
                        <Select
                            v-model="isActiveFilter"
                            :options="isActiveOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Statut"
                            class="w-full md:w-14rem"
                            showClear
                            @change="onFilterChange"
                        />
                        <Select
                            v-model="parentFilter"
                            :options="parentOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Catégorie parent"
                            class="w-full md:w-14rem"
                            showClear
                            @change="onFilterChange"
                        />
                        <Button icon="pi pi-plus" label="Nouvelle catégorie" severity="primary" @click="openNew" />
                    </div>
                </div>

                <DataTable
                    :value="categories"
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
                    <Column field="name" header="Nom" sortable>
                        <template #body="{ data }">
                            <div class="flex flex-column">
                                <span class="font-semibold">{{ data.name }}</span>
                                <small class="text-muted-color">Slug : {{ data.slug }}</small>
                            </div>
                        </template>
                    </Column>
                    <Column field="parent.name" header="Parent">
                        <template #body="{ data }">
                            {{ data.parent?.name ?? '—' }}
                        </template>
                    </Column>
                    <Column field="position" header="Position" sortable />
                    <Column field="is_active" header="Statut">
                        <template #body="{ data }">
                            <Tag :value="data.is_active ? 'Actif' : 'Inactif'" :severity="statusSeverity(data.is_active)" />
                        </template>
                    </Column>
                    <Column field="products_count" header="Produits">
                        <template #body="{ data }">
                            {{ data.products_count ?? 0 }}
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
                            <Button icon="pi pi-trash" rounded text severity="danger" @click="confirmDeleteCategory(data)" />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>

    <Dialog v-model:visible="categoryDialog" :header="dialogTitle" modal class="w-11 md:w-6">
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
                <label for="parent" class="font-semibold">Parent</label>
                <Select
                    id="parent"
                    v-model="form.parent_id"
                    :options="parentOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Aucune"
                    showClear
                />
            </div>
            <div class="col-12 md:col-6">
                <label for="position" class="font-semibold">Position</label>
                <InputNumber id="position" v-model="form.position" :min="1" />
            </div>
            <div class="col-12">
                <div class="flex align-items-center gap-2">
                    <InputSwitch v-model="form.is_active" />
                    <span>{{ form.is_active ? 'Actif' : 'Inactif' }}</span>
                </div>
            </div>
        </div>
        <template #footer>
            <Button label="Annuler" icon="pi pi-times" text @click="hideDialog" />
            <Button label="Enregistrer" icon="pi pi-check" @click="saveCategory" />
        </template>
    </Dialog>

    <ConfirmDialog />
</template>

<script setup>
import { computed } from 'vue';
import { useCategories } from '@/composables/admin/useCategories';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Tag from 'primevue/tag';
import ConfirmDialog from 'primevue/confirmdialog';
import InputSwitch from 'primevue/inputswitch';

const {
    categories,
    loading,
    pagination,
    search,
    isActiveFilter,
    parentFilter,
    isActiveOptions,
    parentOptions,
    categoryDialog,
    form,
    openNew,
    openEdit,
    hideDialog,
    saveCategory,
    confirmDeleteCategory,
    onPage,
    onSearch,
    onFilterChange
} = useCategories();

const dialogTitle = computed(() => (form.id ? 'Modifier la catégorie' : 'Nouvelle catégorie'));

function statusSeverity(isActive) {
    return isActive ? 'success' : 'danger';
}

function formatDate(value) {
    if (!value) return '—';
    return new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'medium'
    }).format(new Date(value));
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
        width: 14rem;
    }
}
</style>
