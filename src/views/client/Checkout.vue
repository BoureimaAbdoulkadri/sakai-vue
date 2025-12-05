<script setup>
import { computed } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Divider from 'primevue/divider';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import { useCartStore } from '@/stores/cart';
import { useClientCheckout } from '@/composables/client/useClientCheckout';

const cartStore = useCartStore();
const router = useRouter();
const { loading, order, notes, customerForm, submitCheckout } = useClientCheckout();

const hasItems = computed(() => cartStore.items.length > 0);

function formatPrice(value) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(Number(value || 0));
}

function goBackToShop() {
    router.push({ name: 'client-catalog' });
}
</script>

<template>
    <div class="py-8 px-4 max-w-6xl mx-auto">
        <div class="flex flex-column md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div>
                <p class="text-sm uppercase tracking-widest text-primary font-semibold">Checkout</p>
                <h1 class="text-3xl font-bold">Finaliser votre commande</h1>
            </div>
            <RouterLink :to="{ name: 'client-cart' }" class="text-primary hover:underline">
                &larr; Retour au panier
            </RouterLink>
        </div>

        <div v-if="order" class="bg-white border border-surface-200 rounded-2xl p-8 text-center">
            <h2 class="text-2xl font-semibold mb-2">Merci pour votre commande !</h2>
            <p class="text-muted-color mb-4">
                Votre commande <strong>{{ order.number }}</strong> est en cours de traitement.
            </p>
            <Button label="Retour à la boutique" icon="pi pi-arrow-left" outlined @click="goBackToShop" />
        </div>

        <div v-else-if="hasItems" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form class="lg:col-span-2 space-y-6" @submit.prevent="submitCheckout">
                <Card class="shadow-sm border border-surface-200">
                    <template #title>Informations client</template>
                    <template #content>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <span class="p-float-label">
                                <InputText id="email" v-model="customerForm.email" type="email" required />
                                <label for="email">Email</label>
                            </span>
                            <span class="p-float-label">
                                <InputText id="phone" v-model="customerForm.phone" />
                                <label for="phone">Téléphone</label>
                            </span>
                            <span class="p-float-label">
                                <InputText id="firstName" v-model="customerForm.first_name" required />
                                <label for="firstName">Prénom</label>
                            </span>
                            <span class="p-float-label">
                                <InputText id="lastName" v-model="customerForm.last_name" required />
                                <label for="lastName">Nom</label>
                            </span>
                        </div>
                    </template>
                </Card>

                <Card class="shadow-sm border border-surface-200">
                    <template #title>Adresse de facturation</template>
                    <template #content>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <span class="p-float-label">
                                <InputText id="billingLine1" v-model="customerForm.billing_address.line1" required />
                                <label for="billingLine1">Adresse</label>
                            </span>
                            <span class="p-float-label">
                                <InputText id="billingLine2" v-model="customerForm.billing_address.line2" />
                                <label for="billingLine2">Complément</label>
                            </span>
                            <span class="p-float-label">
                                <InputText id="billingPostal" v-model="customerForm.billing_address.postal_code" required />
                                <label for="billingPostal">Code postal</label>
                            </span>
                            <span class="p-float-label">
                                <InputText id="billingCity" v-model="customerForm.billing_address.city" required />
                                <label for="billingCity">Ville</label>
                            </span>
                            <span class="p-float-label">
                                <InputText id="billingCountry" v-model="customerForm.billing_address.country" maxlength="2" required />
                                <label for="billingCountry">Pays</label>
                            </span>
                        </div>
                    </template>
                </Card>

                <Card class="shadow-sm border border-surface-200">
                    <template #title>Adresse de livraison</template>
                    <template #content>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <span class="p-float-label">
                                <InputText id="shippingLine1" v-model="customerForm.shipping_address.line1" required />
                                <label for="shippingLine1">Adresse</label>
                            </span>
                            <span class="p-float-label">
                                <InputText id="shippingLine2" v-model="customerForm.shipping_address.line2" />
                                <label for="shippingLine2">Complément</label>
                            </span>
                            <span class="p-float-label">
                                <InputText id="shippingPostal" v-model="customerForm.shipping_address.postal_code" required />
                                <label for="shippingPostal">Code postal</label>
                            </span>
                            <span class="p-float-label">
                                <InputText id="shippingCity" v-model="customerForm.shipping_address.city" required />
                                <label for="shippingCity">Ville</label>
                            </span>
                            <span class="p-float-label">
                                <InputText id="shippingCountry" v-model="customerForm.shipping_address.country" maxlength="2" required />
                                <label for="shippingCountry">Pays</label>
                            </span>
                        </div>
                    </template>
                </Card>

                <Card class="shadow-sm border border-surface-200">
                    <template #title>Notes</template>
                    <template #content>
                        <Textarea v-model="notes" rows="4" auto-resize placeholder="Instructions supplémentaires" />
                    </template>
                </Card>

                <Button
                    label="Confirmer la commande"
                    icon="pi pi-check"
                    class="w-full"
                    :loading="loading"
                    type="submit"
                />
            </form>

            <div class="lg:col-span-1">
                <Card class="shadow-sm border border-surface-200">
                    <template #title>Récapitulatif</template>
                    <template #content>
                        <div class="space-y-4">
                            <div v-for="item in cartStore.items" :key="item.product_id" class="flex justify-between text-sm">
                                <div>
                                    <p class="font-semibold">{{ item.name }}</p>
                                    <p class="text-muted-color">Qté {{ item.quantity }}</p>
                                </div>
                                <span>{{ formatPrice(item.quantity * item.price) }}</span>
                            </div>
                            <Divider />
                            <div class="flex justify-between text-lg font-semibold">
                                <span>Total</span>
                                <span>{{ formatPrice(cartStore.subtotal) }}</span>
                            </div>
                        </div>
                    </template>
                </Card>
            </div>
        </div>

        <div v-else class="bg-white border border-dashed border-surface-300 rounded-2xl p-10 text-center">
            <p class="text-xl font-semibold mb-2">Votre panier est vide</p>
            <p class="text-muted-color mb-4">Ajoutez des articles pour accéder au paiement.</p>
            <Button label="Voir le catalogue" icon="pi pi-arrow-right" @click="goBackToShop" />
        </div>
    </div>
</template>
