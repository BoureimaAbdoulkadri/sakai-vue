<script setup>
import { computed } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import Button from 'primevue/button';
import InputNumber from 'primevue/inputnumber';
import Tag from 'primevue/tag';
import { useCartStore } from '@/stores/cart';

const cartStore = useCartStore();
const router = useRouter();

const hasItems = computed(() => cartStore.items.length > 0);
const formattedSubtotal = computed(() => formatPrice(cartStore.subtotal));

function formatPrice(value) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(Number(value || 0));
}

function goToCheckout() {
    router.push({ name: 'client-checkout' });
}

function onQuantityChange(item, value) {
    cartStore.updateQuantity(item.product_id, value ?? 1);
}

function removeItem(productId) {
    cartStore.removeItem(productId);
}
</script>

<template>
    <div class="py-8 px-4 max-w-5xl mx-auto">
        <div class="flex flex-column md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div>
                <p class="text-sm uppercase tracking-widest text-primary font-semibold">Panier</p>
                <h1 class="text-3xl font-bold">Vos articles</h1>
            </div>
            <RouterLink :to="{ name: 'client-catalog' }" class="text-primary hover:underline">
                &larr; Continuer vos achats
            </RouterLink>
        </div>

        <div v-if="hasItems" class="space-y-4">
            <div
                v-for="item in cartStore.items"
                :key="item.product_id"
                class="bg-white border border-surface-200 rounded-2xl p-4 flex flex-col md:flex-row gap-4"
            >
                <div class="w-full md:w-1/4">
                    <div class="bg-surface-100 rounded-xl h-32 flex items-center justify-center overflow-hidden">
                        <img
                            v-if="item.image_url"
                            :src="item.image_url"
                            :alt="item.name"
                            class="w-full h-full object-cover"
                        />
                        <span v-else class="text-muted-color text-sm">Pas d'image</span>
                    </div>
                </div>
                <div class="flex-1">
                    <div class="flex flex-column gap-2">
                        <div class="flex justify-between items-start gap-3">
                            <div>
                                <h2 class="text-xl font-semibold">{{ item.name }}</h2>
                                <p class="text-sm text-muted-color">Réf. {{ item.slug }}</p>
                            </div>
                            <Tag :value="formatPrice(item.price)" severity="success" />
                        </div>
                        <div class="flex flex-column sm:flex-row sm:items-center gap-4">
                            <div>
                                <label class="block text-sm text-muted-color mb-1">Quantité</label>
                                <InputNumber
                                    :modelValue="item.quantity"
                                    @update:modelValue="(value) => onQuantityChange(item, value)"
                                    :min="1"
                                    inputClass="w-6rem"
                                />
                            </div>
                            <div class="text-sm text-muted-color">
                                Sous-total :
                                <span class="font-semibold text-surface-900">{{ formatPrice(item.quantity * item.price) }}</span>
                            </div>
                            <Button
                                label="Retirer"
                                icon="pi pi-trash"
                                severity="danger"
                                text
                                v-tooltip.top="'Retirer du panier'"
                                @click="removeItem(item.product_id)"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-white border border-surface-200 rounded-2xl p-6 flex flex-column md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <p class="text-sm text-muted-color">Total</p>
                    <p class="text-2xl font-bold">{{ formattedSubtotal }}</p>
                </div>
                <div class="flex flex-column sm:flex-row gap-3 w-full md:w-auto">
                    <Button
                        label="Vider le panier"
                        icon="pi pi-times"
                        severity="secondary"
                        outlined
                        class="w-full sm:w-auto"
                        @click="cartStore.clear()"
                    />
                    <Button
                        label="Passer au paiement"
                        icon="pi pi-credit-card"
                        class="w-full sm:w-auto"
                        @click="goToCheckout"
                    />
                </div>
            </div>
        </div>

        <div v-else class="bg-white border border-dashed border-surface-300 rounded-2xl p-10 text-center">
            <div class="flex flex-column align-items-center gap-4">
                <i class="pi pi-shopping-cart text-6xl text-surface-300"></i>
                <div>
                    <p class="text-xl font-semibold mb-2 text-surface-900">Votre panier est vide</p>
                    <p class="text-muted-color mb-4">Ajoutez des produits pour commencer votre commande.</p>
                </div>
                <Button
                    label="Découvrir notre catalogue"
                    icon="pi pi-arrow-right"
                    iconPos="right"
                    size="large"
                    @click="router.push({ name: 'client-catalog' })"
                />
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Animation sur les items du panier */
.space-y-4 > div {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.space-y-4 > div:hover {
    transform: translateX(4px);
    box-shadow: 0 8px 16px -8px rgba(0, 0, 0, 0.1);
}

/* Animation sur les boutons */
:deep(.p-button) {
    transition: all 0.2s ease;
}

:deep(.p-button:hover:not(:disabled)) {
    transform: scale(1.02);
}

:deep(.p-button:active:not(:disabled)) {
    transform: scale(0.98);
}

/* Animation fade-in pour l'état vide */
.flex.flex-column.align-items-center {
    animation: fadeIn 0.5s ease-in;
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
</style>
