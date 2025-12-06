<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Skeleton from 'primevue/skeleton';
import Tag from 'primevue/tag';
import { useClientProducts } from '@/composables/client/useClientProducts';
import { useCartStore } from '@/stores/cart';

const router = useRouter();
const toast = useToast();
const cartStore = useCartStore();

const { products, loading, filters, pagination, onPage, applyFilters } = useClientProducts();

const sortOptions = [
    { label: 'Nouveautés', value: 'newest' },
    { label: 'Prix croissant', value: 'price_asc' },
    { label: 'Prix décroissant', value: 'price_desc' },
    { label: 'Nom (A-Z)', value: 'name_asc' },
    { label: 'Nom (Z-A)', value: 'name_desc' }
];

const categoryFilters = [
    { key: null, label: 'Tous' },
    { key: 'kids', label: 'Enfant' },
    { key: 'women', label: 'Femme' },
    { key: 'men', label: 'Homme' }
];

function setCategory(key) {
    filters.category = key;
    pagination.page = 1;
    applyFilters();
}

function formatPrice(value) {
    if (value == null) return '—';
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(Number(value));
}

function formatCategory(product) {
    return product.category?.name || '';
}

function goToProduct(product) {
    router.push({ name: 'client-product', params: { slug: product.slug } });
}

function addToCart(product) {
    cartStore.addItem(product, 1);

    toast.add({
        severity: 'success',
        summary: 'Ajouté au panier',
        detail: `${product.name} a été ajouté à votre panier.`,
        life: 3000
    });
}
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4 gap-3">
                <div>
                    <p class="text-sm uppercase tracking-widest text-primary font-semibold mb-1">Shopping</p>
                    <h1 class="text-2xl font-semibold mb-1">Boutique</h1>
                    <span class="text-sm text-muted-color">
                        Découvrez nos collections Enfant, Femme et Homme.
                    </span>
                </div>
            </div>
        </div>

        <div class="col-12">
            <div class="surface-card shadow-1 border-round px-4 py-4 mb-4">
                <div class="flex flex-column md:flex-row gap-3 md:align-items-center md:justify-content-between mb-3">
                    <div class="flex-1">
                        <span class="p-input-icon-left w-full">
                            <i class="pi pi-search" />
                            <InputText
                                v-model="filters.search"
                                placeholder="Rechercher un vêtement..."
                                fluid
                                @keyup.enter="applyFilters"
                            />
                        </span>
                    </div>
                    <div class="flex flex-column md:flex-row gap-2 md:align-items-center">
                        <Select
                            v-model="filters.sort"
                            :options="sortOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Trier par"
                            fluid
                            @change="applyFilters"
                        />
                        <Button
                            icon="pi pi-filter-fill"
                            label="Appliquer"
                            severity="secondary"
                            class="w-full md:w-auto"
                            @click="applyFilters"
                        />
                    </div>
                </div>

                <div class="flex flex-wrap gap-2">
                    <Button
                        v-for="cat in categoryFilters"
                        :key="cat.key ?? 'all'"
                        :label="cat.label"
                        :text="filters.category !== cat.key"
                        :outlined="filters.category === cat.key"
                        rounded
                        size="small"
                        :severity="filters.category === cat.key ? 'primary' : 'secondary'"
                        @click="setCategory(cat.key)"
                    />
                </div>
            </div>
        </div>

        <div class="col-12">
            <!-- Loading -->
            <div v-if="loading" class="grid">
                <div class="col-12 sm:col-6 lg:col-3" v-for="n in 4" :key="n">
                    <Card class="h-full surface-card shadow-1 border-round">
                        <template #content>
                            <Skeleton height="220px" class="mb-3" />
                            <Skeleton width="60%" class="mb-2" />
                            <Skeleton width="80%" class="mb-2" />
                            <Skeleton width="40%" />
                        </template>
                    </Card>
                </div>
            </div>

            <!-- Grille de produits -->
            <div v-else-if="products.length" class="grid">
                <div
                    v-for="product in products"
                    :key="product.id"
                    class="col-12 sm:col-6 lg:col-3"
                >
                    <Card class="h-full surface-card shadow-1 border-round flex flex-column">
                        <template #content>
                            <div class="flex flex-column h-full">
                                <div class="mb-3">
                                    <div
                                        class="border-round overflow-hidden mb-2"
                                        style="height: 220px; background-color: var(--surface-100);"
                                    >
                                        <img
                                            v-if="product.image_url"
                                            :src="product.image_url"
                                            :alt="product.name"
                                            class="w-full h-full"
                                            style="object-fit: cover"
                                        />
                                        <div
                                            v-else
                                            class="w-full h-full flex align-items-center justify-content-center text-muted-color text-sm"
                                        >
                                            Image indisponible
                                        </div>
                                    </div>
                                    <Tag
                                        v-if="formatCategory(product)"
                                        :value="formatCategory(product)"
                                        severity="info"
                                        class="mb-2"
                                    />
                                    <h3 class="text-base font-semibold mb-1">
                                        {{ product.name }}
                                    </h3>
                                    <p class="text-sm text-muted-color mb-2 line-clamp-2">
                                        {{ product.short_description || product.description }}
                                    </p>
                                </div>

                                <div class="mt-auto flex align-items-center justify-content-between">
                                    <span class="text-lg font-semibold">
                                        {{ formatPrice(product.price) }}
                                    </span>
                                    <div class="flex gap-2">
                                        <Button
                                            icon="pi pi-eye"
                                            rounded
                                            text
                                            severity="secondary"
                                            v-tooltip.top="'Voir le détail'"
                                            @click="goToProduct(product)"
                                        />
                                        <Button
                                            icon="pi pi-shopping-cart"
                                            rounded
                                            :disabled="product.stock === 0"
                                            v-tooltip.top="product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'"
                                            @click="addToCart(product)"
                                        />
                                    </div>
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>
            </div>

            <!-- Aucun produit -->
            <div v-else class="col-12">
                <div class="surface-card shadow-1 border-round p-8 text-center">
                    <div class="flex flex-column align-items-center gap-4">
                        <i class="pi pi-search text-6xl text-surface-300"></i>
                        <div>
                            <p class="text-xl font-semibold mb-2 text-surface-900">Aucun produit trouvé</p>
                            <p class="text-muted-color mb-0">
                                Aucun vêtement ne correspond à votre recherche. <br />
                                Essayez de modifier vos filtres ou votre recherche.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* Micro-animations sur les cartes produits */
:deep(.p-card) {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
}

:deep(.p-card:hover) {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.15);
}

:deep(.p-card:hover img) {
    transform: scale(1.05);
}

:deep(.p-card img) {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Animation sur les boutons */
:deep(.p-button) {
    transition: all 0.2s ease;
}

:deep(.p-button:hover:not(:disabled)) {
    transform: scale(1.05);
}

:deep(.p-button:active:not(:disabled)) {
    transform: scale(0.98);
}
</style>
