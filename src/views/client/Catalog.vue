<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Dropdown from 'primevue/dropdown';
import Slider from 'primevue/slider';
import Skeleton from 'primevue/skeleton';
import { useClientProducts } from '@/composables/client/useClientProducts';

type CategoryKey = 'kids' | 'women' | 'men';
type SortKey = 'newest' | 'price-asc' | 'price-desc';

interface NormalizedProduct {
    id: number | string;
    name: string;
    categoryKey: CategoryKey | null;
    genderLabel: string;
    price: number;
    isNew: boolean;
    imageUrl: string;
}

const { products, loading } = useClientProducts();

const filterState = ref({
    categories: [] as CategoryKey[],
    priceRange: [0, 0] as [number, number],
    onlyNew: false,
    sort: 'newest' as SortKey
});

const mobileFiltersOpen = ref(false);

const curatedProducts: NormalizedProduct[] = [
    {
        id: 'curated-1',
        name: 'Chaise de bureau',
        categoryKey: null,
        genderLabel: 'Électronique',
        price: 194,
        isNew: false,
        imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=60'
    },
    {
        id: 'curated-2',
        name: 'Vélo de route',
        categoryKey: null,
        genderLabel: 'Électronique',
        price: 81,
        isNew: false,
        imageUrl: 'https://images.unsplash.com/photo-1518655048521-f130df041f66?auto=format&fit=crop&w=900&q=60'
    },
    {
        id: 'curated-3',
        name: 'Smartphone X',
        categoryKey: null,
        genderLabel: 'Maison',
        price: 298,
        isNew: false,
        imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=60'
    }
];

const normalizedProducts = computed<NormalizedProduct[]>(() => {
    return (products.value ?? []).map((product: any) => {
        const categorySlug = (product.category?.slug ?? product.category?.name ?? '').toString().toLowerCase();
        const mappedCategory = (['kids', 'women', 'men'] as CategoryKey[]).find((key) =>
            categorySlug.includes(key)
        ) ?? null;

        return {
            id: product.id ?? product.slug ?? product.name,
            name: product.name ?? 'Produit',
            categoryKey: mappedCategory,
            genderLabel: product.category?.name ?? product.genderLabel ?? 'Collection',
            price: Number(product.price ?? 0),
            isNew: Boolean(product.is_new ?? product.isNew),
            imageUrl:
                product.image_url ??
                product.image ??
                product.media?.[0]?.url ??
                'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=60'
        } satisfies NormalizedProduct;
    });
});

const priceBounds = computed(() => {
    if (!normalizedProducts.value.length) {
        return { min: 0, max: 0 };
    }

    const prices = normalizedProducts.value.map((product) => product.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
});

watch(
    priceBounds,
    ({ min, max }) => {
        filterState.value.priceRange = [min, max];
    },
    { immediate: true }
);

const sortedProducts = computed(() => {
    let result = [...normalizedProducts.value];

    if (filterState.value.categories.length) {
        result = result.filter((product) => product.categoryKey && filterState.value.categories.includes(product.categoryKey));
    }

    result = result.filter(
        (product) => product.price >= filterState.value.priceRange[0] && product.price <= filterState.value.priceRange[1]
    );

    if (filterState.value.onlyNew) {
        result = result.filter((product) => product.isNew);
    }

    if (filterState.value.sort === 'price-asc') {
        result.sort((a, b) => a.price - b.price);
    } else if (filterState.value.sort === 'price-desc') {
        result.sort((a, b) => b.price - a.price);
    } else {
        result.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    }

    return result;
});

const sortOptions = [
    { label: 'Nouveautés', value: 'newest' },
    { label: 'Prix croissant', value: 'price-asc' },
    { label: 'Prix décroissant', value: 'price-desc' }
];

const priceFormatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
});

function formatPrice(value: number) {
    return priceFormatter.format(value);
}

function resetFilters() {
    filterState.value.categories = [];
    filterState.value.onlyNew = false;
    filterState.value.sort = 'newest';
    filterState.value.priceRange = [priceBounds.value.min, priceBounds.value.max];
}

const featuredProducts = computed(() => {
    const picks = sortedProducts.value.slice(0, 3);
    return picks.length ? picks : curatedProducts;
});
</script>

<template>
    <section class="catalog-page">
        <div class="catalog-hero">
            <div>
                <p class="catalog-eyebrow">Collection</p>
                <h1>La boutique</h1>
                <p class="catalog-subtitle">Affine ton style en filtrant nos pièces phares.</p>
            </div>
            <div class="catalog-controls">
                <Button
                    class="lg:hidden"
                    label="Filtres"
                    icon="pi pi-sliders-h"
                    outlined
                    @click="mobileFiltersOpen = !mobileFiltersOpen"
                />
                <Dropdown
                    v-model="filterState.sort"
                    :options="sortOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Trier par"
                    class="catalog-sort"
                />
            </div>
        </div>

        <div class="catalog-layout">
            <aside class="catalog-sidebar" :class="{ 'is-open': mobileFiltersOpen }">
                <header class="sidebar-header lg:hidden">
                    <span>Filtres</span>
                    <Button icon="pi pi-times" text @click="mobileFiltersOpen = false" />
                </header>

                <div class="sidebar-section">
                    <div class="sidebar-title">
                        <span>Filtres</span>
                        <Button label="Réinitialiser" text size="small" @click="resetFilters" />
                    </div>
                </div>

                <div class="sidebar-section">
                    <p class="sidebar-label">Catégories</p>
                    <div class="sidebar-checks">
                        <div class="sidebar-check" v-for="option in ['kids', 'women', 'men']" :key="option">
                            <Checkbox :inputId="`cat-${option}`" :value="option" v-model="filterState.categories" />
                            <label :for="`cat-${option}`">
                                {{ option === 'kids' ? 'Enfant' : option === 'women' ? 'Femme' : 'Homme' }}
                            </label>
                        </div>
                    </div>
                </div>

                <div class="sidebar-section">
                    <p class="sidebar-label">
                        Prix ({{ formatPrice(filterState.priceRange[0]) }} –
                        {{ formatPrice(filterState.priceRange[1]) }})
                    </p>
                    <Slider v-model="filterState.priceRange" :min="priceBounds.min" :max="priceBounds.max" range class="w-full" />
                </div>

                <div class="sidebar-section">
                    <p class="sidebar-label">Nouveautés</p>
                    <div class="sidebar-check">
                        <Checkbox inputId="only-new" v-model="filterState.onlyNew" :binary="true" />
                        <label for="only-new">Afficher uniquement les nouveautés</label>
                    </div>
                </div>
            </aside>

            <section class="catalog-content">
                <div class="catalog-meta">
                    <span>{{ sortedProducts.length }} modèle(s)</span>
                    <div class="catalog-pills">
                        <span v-if="filterState.categories.length" class="pill">
                            {{ filterState.categories.join(', ') }}
                        </span>
                        <span v-if="filterState.onlyNew" class="pill pill-accent">Nouveautés</span>
                    </div>
                </div>

                <div v-if="loading && !normalizedProducts.length" class="product-grid">
                    <article v-for="n in 4" :key="`skeleton-${n}`" class="product-card">
                        <div class="product-media skeleton">
                            <Skeleton height="100%" width="100%" borderRadius="32px" />
                        </div>
                        <div class="product-body">
                            <Skeleton width="50%" class="mb-2" />
                            <Skeleton width="80%" class="mb-2" />
                            <Skeleton width="40%" />
                        </div>
                    </article>
                </div>

                <div v-else-if="!sortedProducts.length" class="catalog-empty">
                    <i class="pi pi-shopping-bag"></i>
                    <p>Aucun produit ne correspond aux filtres actuels.</p>
                    <Button label="Réinitialiser" text @click="resetFilters" />
                </div>

                <div v-else class="product-grid">
                    <article v-for="product in sortedProducts" :key="product.id" class="product-card">
                        <div class="product-media" :style="{ backgroundImage: `url(${product.imageUrl})` }">
                            <span class="product-badge" v-if="product.isNew">Nouveau</span>
                        </div>
                        <div class="product-body">
                            <div class="product-meta">
                                <span>{{ product.genderLabel }}</span>
                                <span>{{ formatPrice(product.price) }}</span>
                            </div>
                            <h3>{{ product.name }}</h3>
                            <div class="product-footer">
                                <Button label="Voir la fiche" text icon="pi pi-arrow-right" iconPos="right" />
                            </div>
                        </div>
                    </article>
                </div>

                <div v-if="featuredProducts.length" class="catalog-reco">
                    <div class="catalog-reco__header">
                        <div>
                            <p class="catalog-eyebrow">Sélection</p>
                            <h2>Tags favoris</h2>
                        </div>
                        <Button label="Tout voir" text icon="pi pi-arrow-right" iconPos="right" />
                    </div>
                    <div class="catalog-reco__grid">
                        <article v-for="product in featuredProducts" :key="`reco-${product.id}`" class="reco-card">
                            <div class="reco-card__body">
                                <span>{{ product.genderLabel }}</span>
                                <h3>{{ product.name }}</h3>
                                <p>{{ formatPrice(product.price) }}</p>
                            </div>
                        </article>
                    </div>
                </div>
            </section>
        </div>

        <div class="catalog-mask" v-if="mobileFiltersOpen" @click="mobileFiltersOpen = false"></div>
    </section>
</template>

<style scoped>
.catalog-page {
    min-height: 100vh;
    padding: clamp(2.5rem, 4vw, 4rem) clamp(1.5rem, 6vw, 4.5rem);
    background: linear-gradient(180deg, rgba(7, 9, 14, 0.045) 0%, transparent 35%);
    color: var(--text-color);
}

.catalog-hero {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1.5rem;
    margin-bottom: clamp(1.5rem, 3vw, 2.5rem);
}

.catalog-eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.35em;
    font-size: 0.8rem;
    color: color-mix(in srgb, var(--text-color), transparent 45%);
    margin-bottom: 0.5rem;
}

.catalog-hero h1 {
    margin: 0 0 0.5rem 0;
    font-size: clamp(2.2rem, 4vw, 3.2rem);
}

.catalog-subtitle {
    color: color-mix(in srgb, var(--text-color), transparent 30%);
}

.catalog-controls {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.catalog-sort :deep(.p-dropdown) {
    min-width: 200px;
}

.catalog-layout {
    display: grid;
    grid-template-columns: 280px minmax(0, 1fr);
    gap: 2.5rem;
    position: relative;
}

.catalog-sidebar {
    background: color-mix(in srgb, var(--surface-card), transparent 5%);
    border: 1px solid color-mix(in srgb, var(--surface-border), transparent 40%);
    border-radius: calc(var(--content-border-radius) * 1.25);
    padding: 1.5rem;
    position: sticky;
    top: 6rem;
    max-height: calc(100vh - 7rem);
    overflow-y: auto;
    box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
}

.sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    font-weight: 600;
}

.sidebar-section {
    margin-bottom: 1.75rem;
}

.sidebar-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 600;
}

.sidebar-label {
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: color-mix(in srgb, var(--text-color), transparent 50%);
    margin-bottom: 0.75rem;
}

.sidebar-checks,
.sidebar-check {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.sidebar-checks {
    flex-direction: column;
    gap: 0.75rem;
}

.catalog-content {
    min-height: 400px;
}

.catalog-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
    color: color-mix(in srgb, var(--text-color), transparent 30%);
}

.catalog-pills {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.pill {
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--text-color), transparent 60%);
}

.pill-accent {
    border-color: var(--primary-color);
    color: var(--primary-color);
}

.catalog-empty {
    border: 1px dashed color-mix(in srgb, var(--surface-border), transparent 30%);
    border-radius: calc(var(--content-border-radius) * 1.5);
    padding: 3rem;
    text-align: center;
    color: color-mix(in srgb, var(--text-color), transparent 35%);
}

.catalog-empty i {
    font-size: 2.5rem;
    color: color-mix(in srgb, var(--text-color), transparent 60%);
    margin-bottom: 1rem;
}

.product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.75rem;
}

.product-card {
    border-radius: 2rem;
    border: 1px solid color-mix(in srgb, var(--surface-border), transparent 40%);
    background: color-mix(in srgb, var(--surface-card), transparent 4%);
    box-shadow: 0 15px 35px rgba(15, 23, 42, 0.08);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.product-media {
    height: 240px;
    background-size: cover;
    background-position: center;
    position: relative;
}

.product-media.skeleton {
    background: transparent;
}

.product-badge {
    position: absolute;
    top: 1rem;
    left: 1rem;
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    background: rgba(255, 255, 255, 0.9);
    color: var(--primary-color);
    padding: 0.35rem 0.9rem;
    border-radius: 999px;
}

.product-body {
    padding: 1.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.product-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.9rem;
    color: color-mix(in srgb, var(--text-color), transparent 30%);
}

.product-body h3 {
    margin: 0;
    font-size: 1.15rem;
}

.product-footer {
    margin-top: 1rem;
}

.catalog-reco {
    margin-top: clamp(2rem, 4vw, 3rem);
    padding: clamp(1.5rem, 3vw, 2.5rem);
    border: 1px solid color-mix(in srgb, var(--surface-border), transparent 35%);
    border-radius: calc(var(--content-border-radius) * 1.5);
    background: color-mix(in srgb, var(--surface-card), transparent 6%);
}

.catalog-reco__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.catalog-reco__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.reco-card {
    border-radius: 1.5rem;
    padding: 1.25rem;
    border: 1px solid color-mix(in srgb, var(--surface-border), transparent 45%);
    background: rgba(255, 255, 255, 0.6);
}

.reco-card__body span {
    text-transform: uppercase;
    letter-spacing: 0.2em;
    font-size: 0.75rem;
    color: color-mix(in srgb, var(--text-color), transparent 45%);
}

.catalog-mask {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: 998;
}

@media (max-width: 991px) {
    .catalog-layout {
        display: block;
    }

    .catalog-sidebar {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        max-height: 100vh;
        border-radius: 0;
        width: min(85vw, 340px);
        transform: translateX(-100%);
        transition: transform 0.25s ease;
        z-index: 999;
    }

    .catalog-sidebar.is-open {
        transform: translateX(0);
    }
}
</style>
