<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import Carousel from 'primevue/carousel';
import Skeleton from 'primevue/skeleton';
import Tag from 'primevue/tag';
import http from '@/api/http';

interface ProductPreview {
    id: number;
    name: string;
    slug: string;
    price: number | string;
    image_url?: string;
    short_description?: string;
    description?: string;
}

const router = useRouter();
const toast = useToast();
const products = ref<ProductPreview[]>([]);
const loading = ref(false);

onMounted(() => {
    loadProducts();
});

async function loadProducts() {
    loading.value = true;

    try {
        const response = await http.get('/client/products', {
            params: {
                per_page: 8,
                sort: 'newest'
            }
        });
        products.value = response.data?.data ?? [];
    } catch (error) {
        console.error(error);
        products.value = [];
        toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de charger les nouveautés.',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
}

function goToShop() {
    router.push({ name: 'client-catalog' });
}

function goToProduct(product: ProductPreview) {
    router.push({ name: 'client-product', params: { slug: product.slug } });
}

function formatPrice(value: ProductPreview['price']) {
    if (value == null) {
        return '—';
    }

    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(value));
}

function productDescription(product: ProductPreview) {
    const desc = product.short_description || product.description || 'Pièce incontournable pour compléter votre dressing.';
    return desc.length > 80 ? desc.substring(0, 80) + '...' : desc;
}
</script>

<template>
    <section class="featured-products">
        <div class="featured-products__heading">
            <div>
                <p>Nouveautés</p>
                <h2>Nos derniers produits</h2>
                <span>Découvrez les dernières pièces ajoutées à notre collection</span>
            </div>
            <Button label="Voir tout" icon="pi pi-arrow-right" iconPos="right" outlined size="large" @click="goToShop" />
        </div>

        <div v-if="loading" class="products-skeleton">
            <div v-for="n in 4" :key="n" class="products-skeleton__card">
                <Skeleton height="220px" borderRadius="1.25rem" class="mb-3" />
                <Skeleton height="1.5rem" borderRadius="0.5rem" class="mb-2" />
                <Skeleton height="1rem" borderRadius="0.5rem" class="mb-3" />
                <Skeleton height="2rem" borderRadius="999px" />
            </div>
        </div>

        <div v-else-if="products.length" class="featured-carousel">
            <Carousel
                :value="products"
                :numVisible="4"
                :numScroll="1"
                :circular="true"
                :autoplayInterval="4000"
                :responsiveOptions="[
                    { breakpoint: '1400px', numVisible: 3, numScroll: 1 },
                    { breakpoint: '1024px', numVisible: 2, numScroll: 1 },
                    { breakpoint: '768px', numVisible: 1, numScroll: 1 }
                ]"
            >
                <template #item="{ data: product }">
                    <div class="product-card-wrapper">
                        <article class="product-card" @click="goToProduct(product)">
                            <div class="product-card__media">
                                <img v-if="product.image_url" :src="product.image_url" :alt="product.name" />
                                <div v-else class="product-card__placeholder">
                                    <i class="pi pi-image"></i>
                                </div>
                                <Tag value="Nouveau" severity="success" class="product-card__badge" />
                            </div>
                            <div class="product-card__body">
                                <h3>{{ product.name }}</h3>
                                <p>{{ productDescription(product) }}</p>
                                <div class="product-card__footer">
                                    <span>{{ formatPrice(product.price) }}</span>
                                    <Button icon="pi pi-arrow-right" rounded text class="product-card__arrow" />
                                </div>
                            </div>
                        </article>
                    </div>
                </template>
            </Carousel>
        </div>

        <div v-else class="featured-products__empty">
            <i class="pi pi-shopping-bag"></i>
            <p>Aucun produit disponible</p>
            <span>Revenez bientôt pour découvrir nos nouveautés !</span>
        </div>
    </section>
</template>

<style scoped>
.featured-products {
    display: flex;
    flex-direction: column;
    gap: 4rem;
}

.featured-products__heading {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 2rem;
}

.featured-products__heading p {
    text-transform: uppercase;
    letter-spacing: 0.4rem;
    font-size: 0.85rem;
    color: var(--primary-color);
    margin-bottom: 0.75rem;
    font-weight: 600;
}

.featured-products__heading h2 {
    margin: 0 0 0.75rem 0;
    font-size: clamp(2.4rem, 4.2vw, 3.2rem);
}

.featured-products__heading span {
    color: color-mix(in srgb, var(--text-color), transparent 25%);
}

.products-skeleton {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
}

.products-skeleton__card {
    background: color-mix(in srgb, var(--surface-card), transparent 5%);
    border-radius: 1.75rem;
    padding: 1.5rem;
    border: 1px solid color-mix(in srgb, var(--surface-border), transparent 40%);
}

.featured-carousel {
    animation: fadeIn 0.8s ease;
}

.featured-carousel :deep(.p-carousel-items-container) {
    padding: 1rem 0;
}

.featured-carousel :deep(.p-carousel-indicators) {
    padding-top: 1.5rem;
    gap: 0.75rem;
}

.featured-carousel :deep(.p-carousel-indicator button) {
    width: 2rem;
    height: 0.35rem;
    border-radius: 999px;
    background: color-mix(in srgb, var(--surface-border), transparent 25%);
}

.featured-carousel :deep(.p-carousel-indicator.p-highlight button) {
    background: var(--primary-color);
}

.featured-carousel :deep(.p-carousel-prev),
.featured-carousel :deep(.p-carousel-next) {
    width: 3rem;
    height: 3rem;
    border-radius: 1rem;
    border: 1px solid color-mix(in srgb, var(--surface-border), transparent 35%);
    background: color-mix(in srgb, var(--surface-card), transparent 5%);
    color: var(--primary-color);
    transition: all 0.3s ease;
}

.featured-carousel :deep(.p-carousel-prev:hover),
.featured-carousel :deep(.p-carousel-next:hover) {
    background: var(--primary-color);
    color: #fff;
    transform: translateY(-2px);
}

.product-card-wrapper {
    padding: 0.9rem;
    height: 100%;
}

.product-card-wrapper article {
    height: 100%;
}

.product-card {
    border-radius: 2.75rem;
    overflow: hidden;
    background: color-mix(in srgb, var(--surface-card), transparent 3%);
    border: 1px solid color-mix(in srgb, var(--surface-border), transparent 45%);
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    min-height: 100%;
    transition: transform 0.35s ease, box-shadow 0.35s ease;
}

.product-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 28px 55px rgba(15, 23, 42, 0.12);
}

.product-card__media {
    position: relative;
    height: 280px;
    overflow: hidden;
}

.product-card__media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
}

.product-card:hover img {
    transform: scale(1.08);
}

.product-card__placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--surface-border), transparent 75%);
    color: var(--surface-500, #94a3b8);
    font-size: 3rem;
}

.product-card__badge {
    position: absolute;
    top: 1rem;
    left: 1rem;
    border-radius: 999px;
    padding: 0.2rem 0.9rem;
    animation: bounceIn 0.8s ease;
}

.product-card__body {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    flex: 1;
}

.product-card__body h3 {
    margin: 0;
    font-size: 1.25rem;
}

.product-card__body p {
    margin: 0;
    line-height: 1.65;
    color: color-mix(in srgb, var(--text-color), transparent 25%);
    font-size: 0.95rem;
}

.product-card__footer {
    margin-top: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.product-card__footer span {
    font-weight: 600;
    font-size: 1.45rem;
    color: var(--text-color);
}

.product-card__arrow {
    transition: transform 0.3s ease;
}

.product-card:hover .product-card__arrow {
    transform: translateX(4px);
}

.featured-products__empty {
    text-align: center;
    padding: 4rem 2rem;
    border-radius: 2rem;
    border: 1px dashed var(--surface-border);
}

.featured-products__empty i {
    font-size: 3rem;
    color: var(--surface-500, #999);
}

.featured-products__empty p {
    font-weight: 600;
    margin: 1rem 0 0.5rem 0;
}

.featured-products__empty span {
    color: var(--text-color-secondary);
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes bounceIn {
    0% {
        opacity: 0;
        transform: scale(0.3);
    }
    60% {
        opacity: 1;
        transform: scale(1.05);
    }
    80% {
        transform: scale(0.95);
    }
    100% {
        transform: scale(1);
    }
}
</style>
