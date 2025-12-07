<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-4 mb-4">
                    <div>
                        <h2 class="text-2xl font-semibold mb-1">{{ $t('admin.categories.title') }}</h2>
                        <span class="text-sm text-muted-color">{{ $t('admin.categories.subtitle') }}</span>
                    </div>
                    <div class="flex flex-column md:flex-row gap-3 w-full md:w-auto">
                        <span class="p-input-icon-left flex-1">
                            <i class="pi pi-search" />
                            <InputText v-model="search" :placeholder="$t('admin.common.actions.search')" class="w-full"
                                       @keyup.enter="onSearch"/>
                        </span>
                        <Select
                            v-model="isActiveFilter"
                            :options="isActiveOptions"
                            optionLabel="label"
                            optionValue="value"
                            :placeholder="$t('admin.categories.filters.status')"
                            class="w-full md:w-14rem"
                            showClear
                            @change="onFilterChange"
                        />
                        <Select
                            v-model="parentFilter"
                            :options="parentOptions"
                            optionLabel="label"
                            optionValue="value"
                            :placeholder="$t('admin.categories.filters.parent')"
                            class="w-full md:w-14rem"
                            showClear
                            @change="onFilterChange"
                        />
                        <Button :label="$t('admin.categories.new')" icon="pi pi-plus" severity="primary"
                                @click="openNew"/>
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
                    <Column :header="$t('admin.categories.columns.name')" field="name" sortable>
                        <template #body="{ data }">
                            <div class="flex flex-column">
                                <span class="font-semibold">{{ data.name }}</span>
                                <small class="text-muted-color">Slug : {{ data.slug }}</small>
                            </div>
                        </template>
                    </Column>
                    <Column :header="$t('admin.categories.columns.parent')" field="parent.name">
                        <template #body="{ data }">
                            {{ data.parent?.name ?? '—' }}
                        </template>
                    </Column>
                    <Column :header="$t('admin.categories.columns.position')" field="position" sortable/>
                    <Column :header="$t('admin.categories.columns.status')" field="is_active">
                        <template #body="{ data }">
                            <Tag
                                :severity="statusSeverity(data.is_active)"
                                :value="data.is_active ? $t('admin.common.status.active') : $t('admin.common.status.inactive')"/>
                        </template>
                    </Column>
                    <Column :header="$t('admin.categories.columns.products_count')" field="products_count">
                        <template #body="{ data }">
                            {{ data.products_count ?? 0 }}
                        </template>
                    </Column>
                    <Column :header="$t('admin.categories.columns.created_at')" field="created_at">
                        <template #body="{ data }">
                            {{ formatDate(data.created_at) }}
                        </template>
                    </Column>
                    <Column :header="$t('admin.categories.columns.actions')" body-class="text-center">
                        <template #body="{ data }">
                            <Button icon="pi pi-pencil" rounded text severity="secondary" class="mr-2" @click="openEdit(data)" />
                            <Button icon="pi pi-trash" rounded text severity="danger" @click="confirmDeleteCategory(data)" />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>

    <Dialog v-model:visible="categoryDialog" :header="dialogTitle" class="w-11 md:w-7" modal>
        <div class="formgrid grid p-fluid">
            <!-- Section Informations de base -->
            <div class="col-12">
                <Divider align="left">
                    <div class="flex align-items-center gap-2">
                        <i class="pi pi-info-circle text-primary"></i>
                        <span class="font-semibold text-lg">{{ $t('admin.categories.sections.basic') }}</span>
                    </div>
                </Divider>
            </div>

            <div class="col-12 md:col-6">
                <label class="font-semibold block mb-2" for="name">
                    {{ $t('admin.categories.fields.name.label') }} <span class="text-red-500">*</span>
                </label>
                <InputText
                    id="name"
                    v-model="form.name"
                    :placeholder="$t('admin.categories.fields.name.placeholder')"
                    class="w-full"
                />
                <small class="text-muted-color">{{ $t('admin.categories.fields.name.hint') }}</small>
            </div>

            <div class="col-12 md:col-6">
                <label class="font-semibold block mb-2" for="slug">
                    {{ $t('admin.categories.fields.slug.label') }} <span class="text-red-500">*</span>
                </label>
                <InputText
                    id="slug"
                    v-model="form.slug"
                    :placeholder="$t('admin.categories.fields.slug.placeholder')"
                    class="w-full"
                />
                <small class="text-muted-color">{{ $t('admin.categories.fields.slug.hint') }}</small>
            </div>

            <!-- Section Hiérarchie -->
            <div class="col-12 mt-3">
                <Divider align="left">
                    <div class="flex align-items-center gap-2">
                        <i class="pi pi-sitemap text-primary"></i>
                        <span class="font-semibold text-lg">{{ $t('admin.categories.sections.hierarchy') }}</span>
                    </div>
                </Divider>
            </div>

            <div class="col-12 md:col-6">
                <label class="font-semibold block mb-2" for="parent">
                    {{ $t('admin.categories.fields.parent.label') }}
                </label>
                <Select
                    id="parent"
                    v-model="form.parent_id"
                    :options="parentOptions"
                    optionLabel="label"
                    optionValue="value"
                    :placeholder="$t('admin.categories.fields.parent.placeholder')"
                    showClear
                    class="w-full"
                />
                <small class="text-muted-color">{{ $t('admin.categories.fields.parent.hint') }}</small>
            </div>

            <div class="col-12 md:col-6">
                <label class="font-semibold block mb-2" for="position">
                    {{ $t('admin.categories.fields.position.label') }}
                </label>
                <InputNumber
                    id="position"
                    v-model="form.position"
                    :min="1"
                    :placeholder="$t('admin.categories.fields.position.placeholder')"
                    class="w-full"
                />
                <small class="text-muted-color">{{ $t('admin.categories.fields.position.hint') }}</small>
            </div>

            <!-- Section Paramètres -->
            <div class="col-12 mt-3">
                <Divider align="left">
                    <div class="flex align-items-center gap-2">
                        <i class="pi pi-cog text-primary"></i>
                        <span class="font-semibold text-lg">{{ $t('admin.categories.sections.settings') }}</span>
                    </div>
                </Divider>
            </div>

            <div class="col-12">
                <div class="field-checkbox">
                    <div class="flex align-items-center gap-3">
                        <InputSwitch
                            id="is_active"
                            v-model="form.is_active"
                        />
                        <label class="mb-0 cursor-pointer" for="is_active">
                            <span class="font-semibold">{{
                                    form.is_active ? $t('admin.categories.fields.is_active.label_active') : $t('admin.categories.fields.is_active.label_inactive')
                                }}</span>
                            <br>
                            <small class="text-muted-color">
                                {{
                                    form.is_active ? $t('admin.categories.fields.is_active.hint_active') : $t('admin.categories.fields.is_active.hint_inactive')
                                }}
                            </small>
                        </label>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-content-between align-items-center w-full">
                <small class="text-muted-color">
                    <i class="pi pi-info-circle mr-1"></i>
                    {{ $t('admin.common.messages.required_fields', {symbol: '*'}) }}
                </small>
                <div class="flex gap-2">
                    <Button
                        :label="$t('admin.common.actions.cancel')"
                        icon="pi pi-times"
                        severity="secondary"
                        text
                        @click="hideDialog"
                    />
                    <Button
                        :label="$t('admin.common.actions.save')"
                        icon="pi pi-check"
                        @click="saveCategory"
                    />
                </div>
            </div>
        </template>
    </Dialog>

    <ConfirmDialog />
</template>

<script setup>
import {computed} from 'vue';
import {useI18n} from 'vue-i18n';
import {useCategories} from '@/composables/admin/useCategories';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Tag from 'primevue/tag';
import Divider from 'primevue/divider';
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

const {t} = useI18n();

const dialogTitle = computed(() => (form.id ? t('admin.categories.edit') : t('admin.categories.new')));

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
/* Style des filtres de recherche */
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
:deep(.formgrid .p-inputnumber-input),
:deep(.formgrid .p-select) {
    border-radius: 6px;
    transition: all 0.2s ease-in-out;
}

:deep(.formgrid .p-inputtext:focus),
:deep(.formgrid .p-inputnumber-input:focus),
:deep(.formgrid .p-select:focus) {
    box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
    border-color: #3b82f6;
}

:deep(.formgrid .p-inputtext::placeholder) {
    color: var(--text-color-secondary);
    opacity: 0.7;
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

/* Style du InputSwitch */
:deep(.p-inputswitch) {
    width: 3rem;
    height: 1.75rem;
}

:deep(.p-inputswitch.p-inputswitch-checked .p-inputswitch-slider) {
    background-color: #3b82f6;
}

.field-checkbox {
    padding: 1rem;
    background: var(--surface-50);
    border-radius: 8px;
    border: 1px solid var(--surface-border);
}

.cursor-pointer {
    cursor: pointer;
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
