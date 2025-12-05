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
            <p class="text-xl font-semibold mb-2">Votre panier est vide</p>
            <p class="text-muted-color mb-4">Ajoutez des produits pour commencer votre commande.</p>
            <Button label="Voir le catalogue" icon="pi pi-arrow-right" @click="router.push({ name: 'client-catalog' })" />
        </div>
    </div>
</template>
