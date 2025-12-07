<script setup>
import {computed} from 'vue';
import {RouterLink, useRouter} from 'vue-router';
import {useI18n} from 'vue-i18n';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Divider from 'primevue/divider';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import FloatLabel from 'primevue/floatlabel';
import {useCartStore} from '@/stores/cart';
import {useClientCheckout} from '@/composables/client/useClientCheckout';

const cartStore = useCartStore();
const router = useRouter();
const { t, locale } = useI18n();
const {
    loading,
    order,
    notes,
    customerForm,
    paymentMethod,
    step,
    nextStep,
    prevStep,
    submitCheckout
} = useClientCheckout();

const paymentMethods = computed(() => [
    {
        value: 'cod',
        label: t('client.checkout.payment.cod', 'Paiement à la livraison'),
        description: t('client.checkout.payment.codDesc', 'Payez en espèces à la réception de votre commande'),
        available: true
    },
    {
        value: 'card',
        label: t('client.checkout.payment.card', 'Carte bancaire'),
        description: t('client.checkout.payment.cardDesc', 'Bientôt disponible'),
        available: false
    },
    {
        value: 'paypal',
        label: t('client.checkout.payment.paypal', 'PayPal'),
        description: t('client.checkout.payment.paypalDesc', 'Bientôt disponible'),
        available: false
    }
]);

const hasItems = computed(() => cartStore.items.length > 0);

function formatPrice(value) {
    return new Intl.NumberFormat(locale.value === 'fr' ? 'fr-FR' : 'en-US', {
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
                <p class="text-sm uppercase tracking-widest text-primary font-semibold mb-1">{{ t('client.checkout.eyebrow') }}</p>
                <h1 class="text-2xl font-semibold mb-1">{{ t('client.checkout.title') }}</h1>
                <span class="text-sm text-muted-color">
                    {{ t('client.checkout.subtitle') }}
                </span>
            </div>
            <RouterLink :to="{ name: 'client-cart' }" class="inline-flex align-items-center text-sm text-primary cursor-pointer hover:underline">
                <i class="pi pi-arrow-left mr-2" />
                {{ t('client.checkout.backToCart') }}
            </RouterLink>
        </div>

        <div v-if="order" class="surface-card shadow-1 border-round p-6 md:p-8 text-center">
                <div class="flex flex-column align-items-center gap-4">
                    <i class="pi pi-check-circle text-6xl text-green-500"></i>
                    <div>
                        <h2 class="text-2xl font-semibold mb-2 text-surface-900">{{ t('client.checkout.successTitle') }}</h2>
                        <p class="text-muted-color mb-4">
                            {{ t('client.checkout.successDetail', { number: order.number }) }}
                        </p>
                    </div>
                    <div class="flex flex-column sm:flex-row gap-3 w-full sm:w-auto">
                        <Button
                            :label="t('client.checkout.viewOrders')"
                            icon="pi pi-list"
                            @click="$router.push({ name: 'client-orders' })"
                        />
                        <Button
                            :label="t('client.checkout.backToShop')"
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
                            <span>{{ t('client.checkout.customer') }}</span>
                        </div>
                    </template>
                    <template #content>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FloatLabel>
                                <InputText id="email" v-model="customerForm.email" type="email" required fluid />
                                <label for="email">{{ t('client.checkout.fields.email') }}</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText id="phone" v-model="customerForm.phone" type="tel" fluid />
                                <label for="phone">{{ t('client.checkout.fields.phone') }}</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText id="firstName" v-model="customerForm.first_name" required fluid />
                                <label for="firstName">{{ t('client.checkout.fields.firstName') }}</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText id="lastName" v-model="customerForm.last_name" required fluid />
                                <label for="lastName">{{ t('client.checkout.fields.lastName') }}</label>
                            </FloatLabel>
                        </div>
                    </template>
                </Card>

                <Card class="surface-card shadow-1 border-round">
                    <template #title>
                        <div class="flex align-items-center gap-2">
                            <i class="pi pi-file text-primary"></i>
                            <span>{{ t('client.checkout.billing') }}</span>
                        </div>
                    </template>
                    <template #content>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FloatLabel class="md:col-span-2">
                                <InputText id="billingLine1" v-model="customerForm.billing_address.line1" required fluid />
                                <label for="billingLine1">{{ t('client.checkout.fields.address') }}</label>
                            </FloatLabel>
                            <FloatLabel class="md:col-span-2">
                                <InputText id="billingLine2" v-model="customerForm.billing_address.line2" fluid />
                                <label for="billingLine2">{{ t('client.checkout.fields.addressOptional') }}</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText id="billingPostal" v-model="customerForm.billing_address.postal_code" required fluid />
                                <label for="billingPostal">{{ t('client.checkout.fields.postalCode') }}</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText id="billingCity" v-model="customerForm.billing_address.city" required fluid />
                                <label for="billingCity">{{ t('client.checkout.fields.city') }}</label>
                            </FloatLabel>
                            <FloatLabel class="md:col-span-2">
                                <InputText id="billingCountry" v-model="customerForm.billing_address.country" maxlength="2" required fluid placeholder="FR" />
                                <label for="billingCountry">{{ t('client.checkout.fields.country') }}</label>
                            </FloatLabel>
                        </div>
                    </template>
                </Card>

                <Card class="surface-card shadow-1 border-round">
                    <template #title>
                        <div class="flex align-items-center gap-2">
                            <i class="pi pi-map-marker text-primary"></i>
                            <span>{{ t('client.checkout.shipping') }}</span>
                        </div>
                    </template>
                    <template #content>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FloatLabel class="md:col-span-2">
                                <InputText id="shippingLine1" v-model="customerForm.shipping_address.line1" required fluid />
                                <label for="shippingLine1">{{ t('client.checkout.fields.address') }}</label>
                            </FloatLabel>
                            <FloatLabel class="md:col-span-2">
                                <InputText id="shippingLine2" v-model="customerForm.shipping_address.line2" fluid />
                                <label for="shippingLine2">{{ t('client.checkout.fields.addressOptional') }}</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText id="shippingPostal" v-model="customerForm.shipping_address.postal_code" required fluid />
                                <label for="shippingPostal">{{ t('client.checkout.fields.postalCode') }}</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText id="shippingCity" v-model="customerForm.shipping_address.city" required fluid />
                                <label for="shippingCity">{{ t('client.checkout.fields.city') }}</label>
                            </FloatLabel>
                            <FloatLabel class="md:col-span-2">
                                <InputText id="shippingCountry" v-model="customerForm.shipping_address.country" maxlength="2" required fluid placeholder="FR" />
                                <label for="shippingCountry">{{ t('client.checkout.fields.country') }}</label>
                            </FloatLabel>
                        </div>
                    </template>
                </Card>

                <Card class="surface-card shadow-1 border-round">
                    <template #title>
                        <div class="flex align-items-center gap-2">
                            <i class="pi pi-comment text-primary"></i>
                            <span>{{ t('client.checkout.notes') }}</span>
                        </div>
                    </template>
                    <template #content>
                        <Textarea v-model="notes" rows="4" autoResize :placeholder="t('client.checkout.notesPlaceholder')" fluid />
                    </template>
                </Card>

                <Button
                    :label="t('client.checkout.confirm')"
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
                            <span>{{ t('client.checkout.summary') }}</span>
                        </div>
                    </template>
                    <template #content>
                        <div class="space-y-4">
                            <div v-for="item in cartStore.items" :key="item.product_id" class="flex justify-between text-sm">
                                <div>
                                    <p class="font-semibold">{{ item.name }}</p>
                                    <p class="text-muted-color">{{ t('client.checkout.qty', { count: item.quantity }) }}</p>
                                </div>
                                <span>{{ formatPrice(item.quantity * item.price) }}</span>
                            </div>
                            <Divider />
                            <div class="flex justify-between text-lg font-semibold">
                                <span>{{ t('client.checkout.total') }}</span>
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
                    <p class="text-xl font-semibold mb-2 text-surface-900">{{ t('client.checkout.emptyTitle') }}</p>
                    <p class="text-muted-color mb-4">{{ t('client.checkout.emptySubtitle') }}</p>
                </div>
                <Button
                    :label="t('client.checkout.emptyCta')"
                    icon="pi pi-arrow-right"
                    iconPos="right"
                    size="large"
                    @click="goBackToShop"
                />
            </div>
        </div>
    </div>
</template>
