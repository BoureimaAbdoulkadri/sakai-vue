<script lang="ts" setup>
import {computed, onMounted, ref, watch} from 'vue';
import {RouterLink, useRoute, useRouter} from 'vue-router';
import {useI18n} from 'vue-i18n';
import {useToast} from 'primevue/usetoast';
import {useClientProductDetail} from '@/composables/client/useClientProductDetail';
import {useCartStore} from '@/stores/cart';
import {useRecentlyViewed} from '@/composables/client/useRecentlyViewed';

import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Skeleton from 'primevue/skeleton';
import InputNumber from 'primevue/inputnumber';
import SelectButton from 'primevue/selectbutton';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const cartStore = useCartStore();
const { t, locale } = useI18n();

const { product, loading, loadProduct } = useClientProductDetail();
const {addProduct: addToRecentlyViewed} = useRecentlyViewed();

const quantity = ref(1);
const sizeOptions = ['XS', 'S', 'M', 'L', 'XL'];
const selectedSize = ref(null);

const highlights = computed(() => {
    const result = t('client.product.highlights', {returnObjects: true});
    return Array.isArray(result) ? result : [];
});

const guaranteeColumns = computed(() => {
    const result = t('client.product.guarantees', {returnObjects: true});
    return Array.isArray(result) ? result : [];
});

const priceFormatter = computed(
    () =>
        new Intl.NumberFormat(locale.value === 'fr' ? 'fr-FR' : 'en-US', {
            style: 'currency',
            currency: 'EUR'
        })
);

const isOutOfStock = computed(() => {
    return product.value && product.value.stock !== null && product.value.stock <= 0;
});

const isNewProduct = computed(() => Boolean(product.value?.is_new ?? product.value?.isNew));

function formatPrice(value) {
    if (value == null) return '—';
    return priceFormatter.value.format(Number(value));
}

function formatCategory() {
    return product.value?.category?.name || '';
}

function addToCart() {
    if (!product.value) return;

    if (quantity.value < 1) {
        quantity.value = 1;
    }

    // Optionnel : vérifier selectedSize si souhaité
    if (!selectedSize.value) {
        toast.add({
            severity: 'warn',
            summary: t('client.product.toast.warnTitle', 'Attention'),
            detail: t('client.product.toast.warnSize', 'Veuillez sélectionner une taille'),
            life: 3000
        });
        return;
    }

    cartStore.addItem(
        {
            ...product.value,
            size: selectedSize.value
        },
        quantity.value
    );

    toast.add({
        severity: 'success',
        summary: t('client.product.toast.addTitle'),
        detail: t('client.product.toast.addDetail', { name: product.value.name }),
        life: 3000
    });
}

onMounted(() => {
    if (route.params.slug) {
        loadProduct(route.params.slug);
    }
});

watch(
    () => route.params.slug,
    (slug) => {
        if (slug) {
            loadProduct(slug);
        }
    }
);

// Sauvegarder le produit consulté
watch(
    product,
    (newProduct) => {
        if (newProduct && newProduct.id) {
            addToRecentlyViewed({
                id: newProduct.id,
                slug: newProduct.slug || String(newProduct.id),
                name: newProduct.name || 'Produit',
                price: Number(newProduct.price || 0),
                image_url: newProduct.image_url
            });
        }
    }
);
</script>

<template>
    <section class="product-page">
        <div class="product-header">
            <RouterLink :to="{ name: 'client-catalog' }">{{ t('client.product.breadcrumb') }}</RouterLink>
            <span>/</span>
            <span>{{ product?.name ?? '—' }}</span>
        </div>

        <div v-if="loading" class="product-loading">
            <Skeleton height="400px" borderRadius="32px" />
            <div class="product-loading__info">
                <Skeleton width="60%" height="2rem" class="mb-3" />
                <Skeleton width="40%" height="1.5rem" class="mb-2" />
                <Skeleton width="80%" class="mb-2" />
                <Skeleton width="70%" class="mb-2" />
                <Skeleton width="50%" height="2.5rem" class="mb-3" />
                <Skeleton width="60%" height="2.5rem" />
            </div>
        </div>

        <div v-else-if="product" class="product-hero">
            <div class="product-media">
                <span v-if="isNewProduct" class="product-pill">{{ t('client.product.newBadge') }}</span>
                <img v-if="product.image_url" :src="product.image_url" :alt="product.name" />
                <div v-else class="product-media__placeholder">
                    <i class="pi pi-image"></i>
                    <span>{{ t('client.product.imageMissing') }}</span>
                </div>
            </div>

            <div class="product-info">
                <div class="product-meta">
                    <span v-if="formatCategory()" class="product-category">{{ formatCategory() }}</span>
                    <Tag
                        v-if="!isOutOfStock && product.stock !== null"
                        severity="success"
                        :value="t('client.product.stock', { count: product.stock })"
                    />
                    <Tag v-else-if="isOutOfStock" severity="danger" :value="t('client.product.stockOut')" />
                </div>

                <h1>{{ product.name }}</h1>
                <p class="product-price">{{ formatPrice(product.price) }}</p>
                <p class="product-description">
                    {{ product.short_description || product.description }}
                </p>

                <div class="product-controls">
                    <div class="product-control">
                        <label>{{ t('client.product.size') }}</label>
                        <SelectButton v-model="selectedSize" :options="sizeOptions" />
                    </div>
                    <div class="product-control">
                        <label>{{ t('client.product.quantity') }}</label>
                        <InputNumber
                            v-model="quantity"
                            :min="1"
                            :max="product.stock || 99"
                            showButtons
                            buttonLayout="horizontal"
                        />
                    </div>
                </div>

                <div class="product-actions">
                    <Button
                        :label="t('client.product.add')"
                        icon="pi pi-shopping-cart"
                        size="large"
                        class="product-action-primary"
                        :disabled="isOutOfStock"
                        v-tooltip.top="isOutOfStock ? t('client.product.tooltip') : ''"
                        @click="addToCart"
                    />
                    <Button
                        :label="t('client.product.continue')"
                        icon="pi pi-arrow-left"
                        size="large"
                        outlined
                        @click="router.push({ name: 'client-catalog' })"
                    />
                </div>

                <ul class="product-highlights">
                    <li v-for="item in highlights" :key="item">{{ item }}</li>
                </ul>
            </div>
        </div>

        <div v-else class="product-empty">
            {{ t('client.product.empty') }}
        </div>

        <div v-if="product" class="product-extra">
            <div class="product-extra__block">
                <h3>{{ t('client.product.details') }}</h3>
                <p>{{ product.description || product.short_description }}</p>
            </div>
            <div class="product-extra__grid">
                <div v-for="item in guaranteeColumns" :key="item.title" class="product-extra__card">
                    <h4>{{ item.title }}</h4>
                    <p>{{ item.text }}</p>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.product-page {
    min-height: 100vh;
    padding: clamp(2.5rem, 4vw, 4rem) clamp(1.5rem, 6vw, 4.5rem);
    background: linear-gradient(180deg, rgba(7, 9, 14, 0.045) 0%, transparent 35%);
    color: var(--text-color);
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
}

.product-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: color-mix(in srgb, var(--text-color), transparent 40%);
}

.product-header a {
    color: inherit;
}

.product-loading {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 2rem;
}

.product-loading__info {
    display: flex;
    flex-direction: column;
}

.product-hero {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: clamp(2rem, 4vw, 3.5rem);
    align-items: start;
}

.product-media {
    position: relative;
    border-radius: 2.5rem;
    overflow: hidden;
    min-height: 440px;
    background: linear-gradient(120deg, rgba(8, 11, 18, 0.9), rgba(8, 11, 18, 0.4));
    box-shadow: 0 30px 60px rgba(15, 23, 42, 0.18);
    display: flex;
    align-items: center;
    justify-content: center;
}

.product-media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.product-media__placeholder {
    text-align: center;
    color: color-mix(in srgb, #fff, transparent 35%);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
}

.product-media__placeholder i {
    font-size: 3rem;
}

.product-pill {
    position: absolute;
    top: 1.5rem;
    left: 1.5rem;
    padding: 0.35rem 1rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.9);
    color: var(--primary-color);
    letter-spacing: 0.2em;
    font-size: 0.75rem;
    text-transform: uppercase;
}

.product-info {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.product-meta {
    display: flex;
    gap: 0.75rem;
    align-items: center;
}

.product-category {
    text-transform: uppercase;
    letter-spacing: 0.25em;
    font-size: 0.8rem;
    color: color-mix(in srgb, var(--text-color), transparent 35%);
}

.product-info h1 {
    font-size: clamp(2rem, 4vw, 3rem);
    margin: 0;
}

.product-price {
    font-size: clamp(1.8rem, 3vw, 2.4rem);
    margin: 0;
}

.product-description {
    color: color-mix(in srgb, var(--text-color), transparent 20%);
    line-height: 1.7;
}

.product-controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.product-control {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

.product-control label {
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--text-color), transparent 40%);
}

.product-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
}

.product-action-primary {
    flex: 1 1 240px;
}

.product-highlights {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
}

.product-highlights li {
    padding: 0.35rem 0.9rem;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--text-color), transparent 60%);
    font-size: 0.85rem;
}

.product-empty {
    color: color-mix(in srgb, var(--text-color), transparent 35%);
}

.product-extra {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    border-radius: calc(var(--content-border-radius) * 1.5);
    border: 1px solid color-mix(in srgb, var(--surface-border), transparent 35%);
    padding: clamp(1.5rem, 3vw, 2.5rem);
    background: color-mix(in srgb, var(--surface-card), transparent 6%);
}

.product-extra__block h3 {
    margin: 0 0 0.5rem 0;
}

.product-extra__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.product-extra__card {
    border-radius: 1.25rem;
    border: 1px solid color-mix(in srgb, var(--surface-border), transparent 45%);
    padding: 1.25rem;
}

.product-extra__card h4 {
    margin: 0 0 0.5rem 0;
}

.product-extra__card p {
    margin: 0;
    color: color-mix(in srgb, var(--text-color), transparent 30%);
}

.product-loading,
.product-hero,
.product-extra {
    animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .product-media {
        min-height: 320px;
    }

    .product-actions {
        flex-direction: column;
    }
}
</style>
