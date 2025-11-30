<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-4 mb-4">
                    <div>
                        <h2 class="text-2xl font-semibold mb-1">Bannières</h2>
                        <span class="text-sm text-muted-color">Gestion des bannières du site (CMS)</span>
                    </div>
                    <div class="flex flex-column md:flex-row gap-3 w-full md:w-auto">
                        <span class="p-input-icon-left flex-1">
                            <i class="pi pi-search" />
                            <InputText v-model="search" placeholder="Rechercher par titre ou slug" class="w-full" @keyup.enter="onSearch" />
                        </span>
                        <Select
                            v-model="statusFilter"
                            :options="statusOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Statut"
                            class="w-full md:w-14rem"
                            showClear
                            @change="onFilterChange"
                        />
                        <Select
                            v-model="locationFilter"
                            :options="locationOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Emplacement"
                            class="w-full md:w-14rem"
                            showClear
                            @change="onFilterChange"
                        />
                        <Button icon="pi pi-plus" label="Nouvelle bannière" severity="primary" @click="openNew" />
                    </div>
                </div>

                <DataTable
                    :value="banners"
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
                    <Column field="title" header="Titre" sortable>
                        <template #body="{ data }">
                            <div class="flex flex-column">
                                <span class="font-semibold">{{ data.title }}</span>
                                <small class="text-muted-color">Slug : {{ data.slug }}</small>
                            </div>
                        </template>
                    </Column>
                    <Column header="Image">
                        <template #body="{ data }">
                            <div class="flex align-items-center gap-2">
                                <img
                                    v-if="data.image_url"
                                    :src="data.image_url"
                                    alt="Bannière"
                                    style="max-width: 80px; max-height: 40px; object-fit: cover; border-radius: 4px"
                                />
                                <span v-else class="text-muted-color">Aucune</span>
                            </div>
                        </template>
                    </Column>
                    <Column field="location" header="Emplacement">
                        <template #body="{ data }">
                            {{ locationLabel(data.location) }}
                        </template>
                    </Column>
                    <Column field="position" header="Position" sortable />
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
                    <Column field="created_at" header="Créée le">
                        <template #body="{ data }">
                            {{ formatDate(data.created_at) }}
                        </template>
                    </Column>
                    <Column header="Actions" body-class="text-center">
                        <template #body="{ data }">
                            <Button icon="pi pi-pencil" rounded text severity="secondary" class="mr-2" @click="openEdit(data)" />
                            <Button icon="pi pi-trash" rounded text severity="danger" @click="confirmDeleteBanner(data)" />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>

    <Dialog v-model:visible="bannerDialog" :header="dialogTitle" modal class="w-11 md:w-7">
        <div class="grid formgrid p-fluid">
            <div class="col-12 md:col-6">
                <label for="title" class="font-semibold">Titre</label>
                <InputText id="title" v-model="form.title" />
            </div>
            <div class="col-12 md:col-6">
                <label for="slug" class="font-semibold">Slug</label>
                <InputText id="slug" v-model="form.slug" />
            </div>
            <div class="col-12">
                <label for="image_url" class="font-semibold">URL de l'image</label>
                <InputText id="image_url" v-model="form.image_url" />
                <div class="mt-2">
                    <img
                        v-if="form.image_url"
                        :src="form.image_url"
                        alt="Prévisualisation"
                        style="max-width: 200px; max-height: 80px; object-fit: cover; border-radius: 4px"
                    />
                </div>
            </div>
            <div class="col-12">
                <label for="link_url" class="font-semibold">URL de redirection</label>
                <InputText id="link_url" v-model="form.link_url" />
            </div>
            <div class="col-12 md:col-6">
                <label for="location" class="font-semibold">Emplacement</label>
                <Select
                    id="location"
                    v-model="form.location"
                    :options="locationOptions"
                    optionLabel="label"
                    optionValue="value"
                />
            </div>
            <div class="col-12 md:col-6">
                <label for="position" class="font-semibold">Position</label>
                <InputNumber id="position" v-model="form.position" :min="1" />
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
                <label class="font-semibold">Période de validité</label>
                <div class="flex gap-2">
                    <Calendar v-model="form.starts_at" dateFormat="dd/mm/yy" placeholder="Date de début" showIcon class="w-full" />
                    <Calendar v-model="form.ends_at" dateFormat="dd/mm/yy" placeholder="Date de fin" showIcon class="w-full" />
                </div>
            </div>
        </div>
        <template #footer>
            <Button label="Annuler" icon="pi pi-times" text @click="hideDialog" />
            <Button label="Enregistrer" icon="pi pi-check" @click="saveBanner" />
        </template>
    </Dialog>

    <ConfirmDialog />
</template>

<script setup>
import { computed } from 'vue';
import { useBanners } from '@/composables/admin/useBanners';
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
    banners,
    loading,
    pagination,
    search,
    statusFilter,
    locationFilter,
    statusOptions,
    locationOptions,
    bannerDialog,
    form,
    dialogStatusOptions,
    onPage,
    onSearch,
    onFilterChange,
    openNew,
    openEdit,
    hideDialog,
    saveBanner,
    confirmDeleteBanner,
    statusSeverity
} = useBanners();

const dialogTitle = computed(() => (form.id ? 'Modifier la bannière' : 'Nouvelle bannière'));

function formatDate(value) {
    if (!value) return '—';
    return new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'medium'
    }).format(new Date(value));
}

function locationLabel(value) {
    const item = locationOptions.find((loc) => loc.value === value);
    return item ? item.label : value;
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
        width: 14rem;
    }
}
</style>
