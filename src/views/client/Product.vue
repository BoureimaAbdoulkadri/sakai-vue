<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import Button from 'primevue/button';
import Skeleton from 'primevue/skeleton';
import Tag from 'primevue/tag';
import InputNumber from 'primevue/inputnumber';
import { useToast } from 'primevue/usetoast';
import { useClientProductDetail } from '@/composables/client/useClientProductDetail';
import { useCartStore } from '@/stores/cart';

const route = useRoute();
const { product, loading, loadProduct } = useClientProductDetail();
const cartStore = useCartStore();
const toast = useToast();
const quantity = ref(1);

const isOutOfStock = computed(() => {
    if (!product.value || product.value.stock === null || product.value.stock === undefined) {
        return false;
    }

    return Number(product.value.stock) <= 0;
});

function fetchProduct() {
    const slugParam = route.params.slug;
    const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

    if (slug) {
        loadProduct(slug);
    }
}

onMounted(fetchProduct);
watch(
    () => route.params.slug,
    () => {
        fetchProduct();
    }
);

function formatPrice(value) {
    if (value == null) {
        return '—';
    }

    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(value));
}

function addToCart() {
    if (!product.value) {
        return;
    }

    const qty = Math.max(1, Number(quantity.value) || 1);
    cartStore.addItem(product.value, qty);
    quantity.value = 1;

    toast.add({
        severity: 'success',
        summary: 'Ajouté au panier',
        detail: `${product.value.name} x${qty} a été ajouté au panier.`,
        life: 3000
    });
}
</script>

<template>
    <div class="py-8 px-4 max-w-5xl mx-auto">
        <RouterLink :to="{ name: 'client-catalog' }" class="inline-flex items-center text-primary hover:underline mb-4">
            <i class="pi pi-arrow-left mr-2" /> Retour à la boutique
        </RouterLink>

        <div class="bg-white rounded-2xl shadow-sm border border-surface-200 p-6">
            <template v-if="loading">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton height="320px" borderRadius="1.5rem" />
                    <div>
                        <Skeleton width="60%" class="mb-3" />
                        <Skeleton width="40%" class="mb-3" />
                        <Skeleton width="80%" class="mb-2" v-for="n in 4" :key="n" />
                    </div>
                </div>
            </template>

            <template v-else-if="product">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-surface-100 rounded-2xl overflow-hidden">
                        <img
                            v-if="product.image_url"
                            :src="product.image_url"
                            :alt="product.name"
                            class="w-full h-full object-cover"
                        />
                        <div v-else class="flex items-center justify-center h-full text-muted-color p-8">
                            Aucune image disponible
                        </div>
                    </div>
                    <div>
                        <p class="text-sm uppercase tracking-widest text-primary font-semibold mb-2">Produit</p>
                        <h1 class="text-3xl font-bold mb-4">{{ product.name }}</h1>
                        <div class="flex items-center gap-3 mb-6">
                            <Tag severity="success" :value="formatPrice(product.price)" />
                            <Tag v-if="product.stock > 0" value="En stock" severity="success" />
                            <Tag v-else value="Rupture" severity="danger" />
                        </div>
                        <p class="text-muted-color leading-relaxed mb-6">{{ product.description || product.short_description }}</p>
                        <div class="flex flex-col sm:flex-row gap-3">
                            <div class="flex items-center gap-2">
                                <span class="text-sm text-muted-color">Quantité</span>
                                <InputNumber v-model="quantity" :min="1" inputClass="w-6rem" />
                            </div>
                            <Button
                                label="Ajouter au panier"
                                icon="pi pi-shopping-cart"
                                class="w-full sm:w-auto"
                                :disabled="isOutOfStock"
                                @click="addToCart"
                            />
                            <Button label="Contacter" icon="pi pi-envelope" outlined class="w-full sm:w-auto" />
                        </div>
                        <div class="mt-6 text-sm text-muted-color">
                            <p><strong>Status :</strong> {{ product.status }}</p>
                            <p v-if="product.category"><strong>Catégorie :</strong> {{ product.category.name }}</p>
                            <p v-if="product.created_at">
                                <strong>Ajouté le :</strong>
                                {{ new Date(product.created_at).toLocaleDateString('fr-FR') }}
                            </p>
                        </div>
                    </div>
                </div>
            </template>

            <template v-else>
                <div class="text-center py-12">
                    <p class="text-lg font-semibold mb-2">Produit introuvable</p>
                    <p class="text-muted-color">
                        Il se peut que ce produit n'existe plus. Revenir à la
                        <RouterLink :to="{ name: 'client-catalog' }" class="text-primary hover:underline">boutique</RouterLink>.
                    </p>
                </div>
            </template>
        </div>
    </div>
</template>
