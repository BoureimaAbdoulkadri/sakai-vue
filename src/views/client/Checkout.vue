<script setup>
import { computed } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Divider from 'primevue/divider';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import FloatLabel from 'primevue/floatlabel';
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
    <div class="py-6 px-4 max-w-6xl mx-auto">
        <div class="flex flex-column md:flex-row md:justify-between md:align-items-center gap-3 mb-4">
            <div>
                <p class="text-sm uppercase tracking-widest text-primary font-semibold mb-1">Checkout</p>
                <h1 class="text-2xl font-semibold mb-1">Finaliser votre commande</h1>
                <span class="text-sm text-muted-color">
                    Complétez vos informations pour passer commande.
                </span>
            </div>
            <RouterLink :to="{ name: 'client-cart' }" class="inline-flex align-items-center text-sm text-primary cursor-pointer hover:underline">
                <i class="pi pi-arrow-left mr-2" />
                Retour au panier
            </RouterLink>
        </div>

        <div v-if="order" class="surface-card shadow-1 border-round p-6 md:p-8 text-center">
            <div class="flex flex-column align-items-center gap-4">
                <i class="pi pi-check-circle text-6xl text-green-500"></i>
                <div>
                    <h2 class="text-2xl font-semibold mb-2 text-surface-900">Merci pour votre commande !</h2>
                    <p class="text-muted-color mb-4">
                        Votre commande <strong class="text-primary">{{ order.number }}</strong> est en cours de traitement.
                    </p>
                </div>
                <div class="flex flex-column sm:flex-row gap-3 w-full sm:w-auto">
                    <Button
                        label="Voir mes commandes"
                        icon="pi pi-list"
                        @click="$router.push({ name: 'client-orders' })"
                    />
                    <Button
                        label="Retour à la boutique"
                        icon="pi pi-arrow-left"
                        severity="secondary"
                        outlined
                        @click="goBackToShop"
                    />
                </div>
            </div>
        </div>

        <div v-else-if="!order && hasItems" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form class="lg:col-span-2 space-y-6" @submit.prevent="submitCheckout">
                <Card class="surface-card shadow-1 border-round">
                    <template #title>
                        <div class="flex align-items-center gap-2">
                            <i class="pi pi-user text-primary"></i>
                            <span>Informations client</span>
                        </div>
                    </template>
                    <template #content>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FloatLabel>
                                <InputText id="email" v-model="customerForm.email" type="email" required fluid />
                                <label for="email">Email</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText id="phone" v-model="customerForm.phone" type="tel" fluid />
                                <label for="phone">Téléphone</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText id="firstName" v-model="customerForm.first_name" required fluid />
                                <label for="firstName">Prénom</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText id="lastName" v-model="customerForm.last_name" required fluid />
                                <label for="lastName">Nom</label>
                            </FloatLabel>
                        </div>
                    </template>
                </Card>

                <Card class="surface-card shadow-1 border-round">
                    <template #title>
                        <div class="flex align-items-center gap-2">
                            <i class="pi pi-file text-primary"></i>
                            <span>Adresse de facturation</span>
                        </div>
                    </template>
                    <template #content>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FloatLabel class="md:col-span-2">
                                <InputText id="billingLine1" v-model="customerForm.billing_address.line1" required fluid />
                                <label for="billingLine1">Adresse</label>
                            </FloatLabel>
                            <FloatLabel class="md:col-span-2">
                                <InputText id="billingLine2" v-model="customerForm.billing_address.line2" fluid />
                                <label for="billingLine2">Complément d'adresse (optionnel)</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText id="billingPostal" v-model="customerForm.billing_address.postal_code" required fluid />
                                <label for="billingPostal">Code postal</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText id="billingCity" v-model="customerForm.billing_address.city" required fluid />
                                <label for="billingCity">Ville</label>
                            </FloatLabel>
                            <FloatLabel class="md:col-span-2">
                                <InputText id="billingCountry" v-model="customerForm.billing_address.country" maxlength="2" required fluid placeholder="FR" />
                                <label for="billingCountry">Pays (code ISO, ex: FR)</label>
                            </FloatLabel>
                        </div>
                    </template>
                </Card>

                <Card class="surface-card shadow-1 border-round">
                    <template #title>
                        <div class="flex align-items-center gap-2">
                            <i class="pi pi-map-marker text-primary"></i>
                            <span>Adresse de livraison</span>
                        </div>
                    </template>
                    <template #content>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FloatLabel class="md:col-span-2">
                                <InputText id="shippingLine1" v-model="customerForm.shipping_address.line1" required fluid />
                                <label for="shippingLine1">Adresse</label>
                            </FloatLabel>
                            <FloatLabel class="md:col-span-2">
                                <InputText id="shippingLine2" v-model="customerForm.shipping_address.line2" fluid />
                                <label for="shippingLine2">Complément d'adresse (optionnel)</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText id="shippingPostal" v-model="customerForm.shipping_address.postal_code" required fluid />
                                <label for="shippingPostal">Code postal</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText id="shippingCity" v-model="customerForm.shipping_address.city" required fluid />
                                <label for="shippingCity">Ville</label>
                            </FloatLabel>
                            <FloatLabel class="md:col-span-2">
                                <InputText id="shippingCountry" v-model="customerForm.shipping_address.country" maxlength="2" required fluid placeholder="FR" />
                                <label for="shippingCountry">Pays (code ISO, ex: FR)</label>
                            </FloatLabel>
                        </div>
                    </template>
                </Card>

                <Card class="surface-card shadow-1 border-round">
                    <template #title>
                        <div class="flex align-items-center gap-2">
                            <i class="pi pi-comment text-primary"></i>
                            <span>Notes (optionnel)</span>
                        </div>
                    </template>
                    <template #content>
                        <Textarea v-model="notes" rows="4" autoResize placeholder="Instructions de livraison, commentaires..." fluid />
                    </template>
                </Card>

                <Button
                    label="Confirmer la commande"
                    icon="pi pi-check"
                    size="large"
                    class="w-full"
                    :loading="loading"
                    type="submit"
                />
            </form>

            <div class="lg:col-span-1">
                <Card class="surface-card shadow-1 border-round">
                    <template #title>
                        <div class="flex align-items-center gap-2">
                            <i class="pi pi-shopping-cart text-primary"></i>
                            <span>Récapitulatif</span>
                        </div>
                    </template>
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

        <div v-else-if="!order && !hasItems" class="bg-white border border-dashed border-surface-300 rounded-2xl p-10 text-center">
            <div class="flex flex-column align-items-center gap-4">
                <i class="pi pi-shopping-bag text-6xl text-surface-300"></i>
                <div>
                    <p class="text-xl font-semibold mb-2 text-surface-900">Votre panier est vide</p>
                    <p class="text-muted-color mb-4">Ajoutez des articles pour accéder au paiement.</p>
                </div>
                <Button
                    label="Découvrir notre catalogue"
                    icon="pi pi-arrow-right"
                    iconPos="right"
                    size="large"
                    @click="goBackToShop"
                />
            </div>
        </div>
    </div>
</template>
