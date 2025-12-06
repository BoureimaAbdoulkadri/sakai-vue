<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useClientProductDetail } from '@/composables/client/useClientProductDetail';
import { useCartStore } from '@/stores/cart';

import Card from 'primevue/card';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Skeleton from 'primevue/skeleton';
import InputNumber from 'primevue/inputnumber';
import SelectButton from 'primevue/selectbutton';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const cartStore = useCartStore();

const { product, loading, loadProduct } = useClientProductDetail();

const quantity = ref(1);
const sizeOptions = ['XS', 'S', 'M', 'L', 'XL'];
const selectedSize = ref(null);

const isOutOfStock = computed(() => {
    return product.value && product.value.stock !== null && product.value.stock <= 0;
});

function formatPrice(value) {
    if (value == null) return '—';
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(Number(value));
}

function formatCategory() {
    return product.value?.category?.name || '';
}

function addToCart() {
    if (!product.value) return;

    if (quantity.value < 1) {
        quantity.value = 1;
    }

    // Optionnel : vérifier selectedSize, mais non stocké pour l'instant
    cartStore.addItem(product.value, quantity.value);

    toast.add({
        severity: 'success',
        summary: 'Ajouté au panier',
        detail: `${product.value.name} a été ajouté à votre panier.`,
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
</script>

<template>
    <div class="grid">
        <div class="col-12 mb-3">
            <RouterLink
                :to="{ name: 'client-catalog' }"
                class="inline-flex align-items-center text-sm text-primary cursor-pointer hover:underline"
            >
                <i class="pi pi-arrow-left mr-2" />
                Retour à la boutique
            </RouterLink>
        </div>

        <div class="col-12">
            <Card class="surface-card shadow-1 border-round">
                <template #content>
                    <div v-if="loading" class="grid">
                        <div class="col-12 md:col-6">
                            <Skeleton height="360px" class="mb-3" />
                        </div>
                        <div class="col-12 md:col-6">
                            <Skeleton width="60%" height="2rem" class="mb-2" />
                            <Skeleton width="40%" height="1.5rem" class="mb-3" />
                            <Skeleton width="90%" class="mb-2" />
                            <Skeleton width="80%" class="mb-2" />
                            <Skeleton width="70%" class="mb-4" />
                            <Skeleton width="40%" height="2.5rem" class="mb-2" />
                            <Skeleton width="50%" height="2.5rem" />
                        </div>
                    </div>

                    <div v-else-if="product" class="grid">
                        <div class="col-12 md:col-6">
                            <div
                                class="border-round overflow-hidden shadow-1"
                                style="height: 400px; background-color: var(--surface-100);"
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
                                    class="w-full h-full flex flex-column align-items-center justify-content-center text-muted-color"
                                >
                                    <i class="pi pi-image text-6xl mb-3 text-surface-300"></i>
                                    <span class="text-sm">Image indisponible</span>
                                </div>
                            </div>
                        </div>

                        <div class="col-12 md:col-6">
                            <div class="flex flex-column gap-4">
                                <div>
                                    <Tag
                                        v-if="formatCategory()"
                                        :value="formatCategory()"
                                        severity="info"
                                        class="mb-3"
                                    />
                                    <h1 class="text-3xl font-bold mb-3">
                                        {{ product.name }}
                                    </h1>
                                    <div class="text-2xl font-bold text-primary mb-3">
                                        {{ formatPrice(product.price) }}
                                    </div>
                                    <p class="text-base text-muted-color line-height-3">
                                        {{ product.short_description || product.description }}
                                    </p>
                                </div>

                                <div class="surface-50 border-round p-3">
                                    <label class="block text-sm font-semibold mb-2">
                                        <i class="pi pi-tag mr-1"></i>
                                        Taille
                                    </label>
                                    <SelectButton
                                        v-model="selectedSize"
                                        :options="sizeOptions"
                                        fluid
                                    />
                                </div>

                                <div class="surface-50 border-round p-3">
                                    <div class="flex flex-column md:flex-row md:align-items-end gap-3">
                                        <div class="flex-1">
                                            <label class="block text-sm font-semibold mb-2">
                                                <i class="pi pi-shopping-cart mr-1"></i>
                                                Quantité
                                            </label>
                                            <InputNumber
                                                v-model="quantity"
                                                :min="1"
                                                :max="product.stock || 99"
                                                showButtons
                                                buttonLayout="horizontal"
                                                fluid
                                                decrementButtonClass="p-button-secondary"
                                                incrementButtonClass="p-button-secondary"
                                            />
                                        </div>

                                        <div class="text-sm">
                                            <span v-if="isOutOfStock" class="text-red-500 font-semibold">
                                                <i class="pi pi-times-circle mr-1"></i>
                                                Rupture de stock
                                            </span>
                                            <span v-else-if="product.stock !== null" class="text-green-600 font-semibold">
                                                <i class="pi pi-check-circle mr-1"></i>
                                                {{ product.stock }} en stock
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div class="flex flex-column md:flex-row gap-3">
                                    <Button
                                        label="Ajouter au panier"
                                        icon="pi pi-shopping-cart"
                                        size="large"
                                        class="w-full md:flex-1"
                                        :disabled="isOutOfStock"
                                        v-tooltip.top="isOutOfStock ? 'Ce produit est en rupture de stock' : ''"
                                        @click="addToCart"
                                    />
                                    <Button
                                        label="Continuer vos achats"
                                        icon="pi pi-arrow-left"
                                        severity="secondary"
                                        outlined
                                        size="large"
                                        class="w-full md:w-auto"
                                        @click="router.push({ name: 'client-catalog' })"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-else class="text-sm text-muted-color">
                        Produit introuvable.
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>

<style scoped>
/* Animation sur l'image produit */
:deep(.p-card img) {
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.p-card:hover img) {
    transform: scale(1.03);
}

/* Animation sur les boutons de taille */
:deep(.p-selectbutton .p-button) {
    transition: all 0.2s ease;
}

:deep(.p-selectbutton .p-button:hover) {
    transform: translateY(-2px);
}

/* Animation sur les boutons d'action */
:deep(.p-button) {
    transition: all 0.2s ease;
}

:deep(.p-button:hover:not(:disabled)) {
    transform: scale(1.02);
}

:deep(.p-button:active:not(:disabled)) {
    transform: scale(0.98);
}

/* Animation du contenu */
.grid > div {
    animation: slideIn 0.4s ease-out;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Animation sur le lien retour */
.inline-flex.align-items-center {
    transition: all 0.2s ease;
}

.inline-flex.align-items-center:hover {
    transform: translateX(-4px);
    color: var(--primary-color);
}
</style>
