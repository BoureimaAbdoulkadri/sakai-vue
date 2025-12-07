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
import Divider from 'primevue/divider';
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

  <Dialog v-model:visible="productDialog" :header="dialogTitle" class="w-11 md:w-9" modal>
    <div class="formgrid grid p-fluid">
      <!-- Section Informations de base -->
      <div class="col-12">
        <Divider align="left">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-info-circle text-primary"></i>
            <span class="font-semibold text-lg">Informations de base</span>
          </div>
        </Divider>
            </div>

            <div class="col-12 md:col-6">
              <label class="font-semibold block mb-2" for="name">
                Nom du produit <span class="text-red-500">*</span>
              </label>
              <InputText
                  id="name"
                  v-model="form.name"
                  class="w-full"
                  placeholder="Ex: T-shirt Premium"
              />
            </div>

            <div class="col-12 md:col-6">
              <label class="font-semibold block mb-2" for="slug">
                Slug <span class="text-red-500">*</span>
              </label>
              <InputText
                  id="slug"
                  v-model="form.slug"
                  class="w-full"
                  placeholder="t-shirt-premium"
              />
              <small class="text-muted-color">URL du produit (sans espaces)</small>
            </div>

            <div class="col-12 md:col-6">
              <label class="font-semibold block mb-2" for="sku">
                SKU (Référence)
              </label>
              <InputText
                  id="sku"
                  v-model="form.sku"
                  class="w-full"
                  placeholder="TSH-001"
                />
            </div>

            <div class="col-12 md:col-6">
              <label class="font-semibold block mb-2" for="category">
                Catégorie
              </label>
                <Select
                    id="category"
                    v-model="form.category_id"
                    :options="categoryOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                    showClear
                    placeholder="Sélectionner une catégorie"
                />
            </div>

      <!-- Section Description -->
      <div class="col-12 mt-3">
        <Divider align="left">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-align-left text-primary"></i>
            <span class="font-semibold text-lg">Description</span>
          </div>
        </Divider>
      </div>

      <div class="col-12">
        <label class="font-semibold block mb-2" for="short_description">
          Description courte
        </label>
        <Textarea
            id="short_description"
            v-model="form.short_description"
            auto-resize
            class="w-full"
            placeholder="Résumé du produit en 1-2 phrases"
            rows="2"
        />
        <small class="text-muted-color">Apparaît dans les listes de produits</small>
      </div>

      <div class="col-12">
        <label class="font-semibold block mb-2" for="description">
          Description complète
        </label>
        <Textarea
            id="description"
            v-model="form.description"
            auto-resize
            class="w-full"
            placeholder="Description détaillée : caractéristiques, matériaux, utilisation..."
            rows="5"
        />
      </div>

      <!-- Section Média -->
      <div class="col-12 mt-3">
        <Divider align="left">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-image text-primary"></i>
            <span class="font-semibold text-lg">Image</span>
          </div>
        </Divider>
      </div>

      <div class="col-12">
        <label class="font-semibold block mb-2" for="main_image_url">
          URL de l'image principale
        </label>
        <InputText
            id="main_image_url"
            v-model="form.main_image_url"
            class="w-full"
            placeholder="https://example.com/images/produit.jpg"
        />
        <small class="text-muted-color">Lien vers l'image du produit</small>
      </div>

      <!-- Section Prix et Stock -->
      <div class="col-12 mt-3">
        <Divider align="left">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-money-bill text-primary"></i>
            <span class="font-semibold text-lg">Prix et Inventaire</span>
          </div>
        </Divider>
      </div>

      <div class="col-12 md:col-4">
        <label class="font-semibold block mb-2" for="price">
          Prix <span class="text-red-500">*</span>
        </label>
        <InputNumber
            id="price"
            v-model="form.base_price"
            class="w-full"
            currency="EUR"
            locale="fr-FR"
            mode="currency"
        />
      </div>

      <div class="col-12 md:col-4">
        <label class="font-semibold block mb-2" for="stock">
          Stock <span class="text-red-500">*</span>
        </label>
        <InputNumber
            id="stock"
            v-model="form.stock"
            :min="0"
            class="w-full"
            placeholder="0"
        />
      </div>

      <div class="col-12 md:col-4">
        <label class="font-semibold block mb-2" for="status">
          Statut <span class="text-red-500">*</span>
        </label>
        <Select
            id="status"
            v-model="form.status"
            :options="dialogStatusOptions"
            class="w-full"
            optionLabel="label"
            optionValue="value"
                />
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
              @click="saveProduct"
          />
        </div>
      </div>
        </template>
    </Dialog>

    <ConfirmDialog />
</template>

<style scoped>
/* Style des filtres de recherche */
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
  max-height: 70vh;
  overflow-y: auto;
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
:deep(.formgrid .p-textarea),
:deep(.formgrid .p-select) {
  border-radius: 6px;
  transition: all 0.2s ease-in-out;
}

:deep(.formgrid .p-inputtext:focus),
:deep(.formgrid .p-inputnumber-input:focus),
:deep(.formgrid .p-textarea:focus),
:deep(.formgrid .p-select:focus) {
  box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
  border-color: #3b82f6;
}

:deep(.formgrid .p-inputtext::placeholder),
:deep(.formgrid .p-textarea::placeholder) {
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

/* Scrollbar personnalisée pour le dialog */
:deep(.p-dialog-content::-webkit-scrollbar) {
  width: 8px;
}

:deep(.p-dialog-content::-webkit-scrollbar-track) {
  background: var(--surface-100);
  border-radius: 4px;
}

:deep(.p-dialog-content::-webkit-scrollbar-thumb) {
  background: var(--surface-400);
  border-radius: 4px;
}

:deep(.p-dialog-content::-webkit-scrollbar-thumb:hover) {
  background: var(--surface-500);
}
</style>
