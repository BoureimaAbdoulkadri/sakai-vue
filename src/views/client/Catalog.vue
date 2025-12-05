<script setup>
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Card from 'primevue/card';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Paginator from 'primevue/paginator';
import Select from 'primevue/select';
import Skeleton from 'primevue/skeleton';
import Tag from 'primevue/tag';
import { useClientProducts } from '@/composables/client/useClientProducts';

const router = useRouter();
const { products, loading, filters, pagination, onPage, applyFilters } = useClientProducts();

const sortOptions = [
    { label: 'Nouveautés', value: 'newest' },
    { label: 'Prix croissant', value: 'price_asc' },
    { label: 'Prix décroissant', value: 'price_desc' },
    { label: 'Nom A → Z', value: 'name_asc' },
    { label: 'Nom Z → A', value: 'name_desc' }
];

function goToProduct(slug) {
    router.push({ name: 'client-product', params: { slug } });
}

function submitFilters() {
    applyFilters();
}

function resetFilters() {
    filters.search = '';
    filters.category = null;
    filters.minPrice = null;
    filters.maxPrice = null;
    filters.sort = 'newest';
    applyFilters();
}
</script>

<template>
    <div class="py-8 px-4 max-w-6xl mx-auto">
        <div class="mb-8 text-center">
            <p class="text-sm uppercase tracking-widest text-primary font-semibold">Catalogue</p>
            <h1 class="text-3xl md:text-4xl font-bold mb-3">Découvrez nos produits</h1>
            <p class="text-muted-color max-w-2xl mx-auto">
                Parcourez notre sélection et filtrez selon vos besoins. Chaque produit est prêt à être commandé.
            </p>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-surface-200 p-6 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <span class="p-input-icon-left">
                    <i class="pi pi-search" />
                    <InputText v-model="filters.search" placeholder="Rechercher un produit" @keyup.enter="submitFilters" />
                </span>
                <InputNumber v-model="filters.minPrice" inputId="min" placeholder="Prix min" mode="currency" currency="EUR" locale="fr-FR" />
                <InputNumber v-model="filters.maxPrice" inputId="max" placeholder="Prix max" mode="currency" currency="EUR" locale="fr-FR" />
                <Select
                    v-model="filters.sort"
                    :options="sortOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Trier par"
                    class="w-full"
                    @change="submitFilters"
                />
            </div>
            <div class="flex flex-wrap gap-3 mt-4 justify-end">
                <Button label="Réinitialiser" severity="secondary" text @click="resetFilters" />
                <Button label="Filtrer" icon="pi pi-filter" @click="submitFilters" />
            </div>
        </div>

        <div v-if="loading" class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div v-for="n in 6" :key="n" class="bg-white rounded-2xl p-4 shadow-sm">
                <Skeleton height="200px" class="mb-4" borderRadius="1rem" />
                <Skeleton width="60%" class="mb-2" />
                <Skeleton width="40%" class="mb-2" />
                <Skeleton width="80%" />
            </div>
        </div>

        <div v-else>
            <div v-if="products.length" class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <Card v-for="product in products" :key="product.id" class="shadow-sm border border-surface-200 rounded-2xl overflow-hidden">
                    <template #header>
                        <div class="h-48 bg-surface-100 flex items-center justify-center">
                            <img v-if="product.image_url" :src="product.image_url" :alt="product.name" class="h-full w-full object-cover" />
                            <div v-else class="text-center text-muted-color px-6">Image indisponible</div>
                        </div>
                    </template>
                    <template #title>
                        <div class="flex items-center justify-between gap-2">
                            <span>{{ product.name }}</span>
                            <Tag
                                severity="success"
                                :value="Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(product.price)"
                            />
                        </div>
                    </template>
                    <template #content>
                        <p class="text-sm text-muted-color mb-4 line-clamp-3">
                            {{ product.short_description || 'Aucune description courte disponible.' }}
                        </p>
                        <Button label="Voir le produit" icon="pi pi-arrow-right" class="w-full" @click="goToProduct(product.slug)" />
                    </template>
                </Card>
            </div>
            <div v-else class="text-center py-20 bg-white rounded-2xl border border-dashed border-surface-300">
                <p class="text-lg font-semibold mb-2">Aucun produit trouvé</p>
                <p class="text-muted-color">Ajustez vos filtres pour découvrir d'autres articles.</p>
            </div>
        </div>

        <div class="mt-8" v-if="pagination.total > pagination.perPage">
            <Paginator
                :rows="pagination.perPage"
                :totalRecords="pagination.total"
                :first="(pagination.page - 1) * pagination.perPage"
                @page="onPage"
                class="rounded-2xl border border-surface-200 bg-white"
            />
        </div>
    </div>
</template>

<style scoped>
.line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
