<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Skeleton from 'primevue/skeleton';
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
                per_page: 4,
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
    return (
        product.short_description ||
        product.description ||
        'Pièce incontournable pour compléter votre dressing.'
    );
}
</script>

<template>
    <section class="surface-card shadow-1 border-round p-4 md:p-5">
        <div class="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3 mb-4">
            <div>
                <p class="text-sm uppercase tracking-widest text-primary font-semibold">Nouveautés</p>
                <h2 class="text-2xl font-bold mb-1">Produits mis en avant</h2>
                <p class="text-sm text-muted-color">Un aperçu des dernières nouveautés ajoutées à la boutique.</p>
            </div>
            <Button label="Voir toute la boutique" icon="pi pi-arrow-right" text @click="goToShop" />
        </div>

        <div v-if="loading" class="grid">
            <div v-for="n in 4" :key="n" class="col-12 md:col-6 lg:col-3">
                <Skeleton height="18rem" borderRadius="1rem" />
            </div>
        </div>

        <div v-else-if="products.length" class="grid">
            <div v-for="product in products" :key="product.id" class="col-12 md:col-6 lg:col-3">
                <Card class="h-full surface-card border-round shadow-1 flex flex-column">
                    <template #content>
                        <div class="bg-surface-100 border-round mb-3 overflow-hidden" style="height: 200px">
                            <img
                                v-if="product.image_url"
                                :src="product.image_url"
                                :alt="product.name"
                                class="w-full h-full object-cover"
                            />
                            <div v-else class="flex align-items-center justify-content-center h-full text-muted-color text-sm">
                                Image indisponible
                            </div>
                        </div>
                        <h3 class="text-lg font-semibold mb-2">{{ product.name }}</h3>
                        <p class="text-sm text-muted-color mb-3 line-height-3">{{ productDescription(product) }}</p>
                        <p class="text-lg font-bold mb-4">{{ formatPrice(product.price) }}</p>
                        <div class="mt-auto">
                            <Button label="Voir" icon="pi pi-search" class="w-full" @click="goToProduct(product)" />
                        </div>
                    </template>
                </Card>
            </div>
        </div>

        <div v-else class="text-center text-muted-color py-4">
            Aucun produit à afficher pour le moment.
        </div>
    </section>
</template>
