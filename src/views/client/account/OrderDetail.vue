<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Divider from 'primevue/divider';
import Tag from 'primevue/tag';
import { useToast } from 'primevue/usetoast';
import { fetchClientOrder } from '@/services/client/ordersService';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const order = ref(null);
const loading = ref(false);

onMounted(loadOrder);
watch(
    () => route.params.id,
    () => loadOrder()
);

async function loadOrder() {
    const id = route.params.id;
    if (!id) return;

    loading.value = true;
    try {
        const response = await fetchClientOrder(id);
        order.value = response.data;
    } catch (error) {
        console.error(error);
        toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de charger cette commande.',
            life: 4000
        });
        router.push({ name: 'client-orders' });
    } finally {
        loading.value = false;
    }
}

function formatPrice(value, currency = 'EUR') {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(Number(value || 0));
}
</script>

<template>
    <div class="py-8 px-4 max-w-5xl mx-auto">
        <div class="flex flex-column md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div>
                <p class="text-sm uppercase tracking-widest text-primary font-semibold">Commande</p>
                <h1 class="text-3xl font-bold">{{ order?.number ?? 'Commande' }}</h1>
            </div>
            <Button label="Retour aux commandes" icon="pi pi-arrow-left" outlined @click="router.push({ name: 'client-orders' })" />
        </div>

        <Card class="shadow-sm border border-surface-200">
            <template v-if="loading">
                <div class="text-center py-10 text-muted-color">Chargement...</div>
            </template>
            <template v-else-if="order">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <p class="text-sm text-muted-color mb-1">Statut</p>
                        <Tag :value="order.status" :severity="order.status === 'completed' ? 'success' : 'info'" />
                    </div>
                    <div>
                        <p class="text-sm text-muted-color mb-1">Paiement</p>
                        <Tag
                            :value="order.payment_status"
                            :severity="order.payment_status === 'paid' ? 'success' : 'warning'"
                        />
                    </div>
                    <div>
                        <p class="text-sm text-muted-color mb-1">Total</p>
                        <p class="text-xl font-semibold">{{ formatPrice(order.total, order.currency || 'EUR') }}</p>
                    </div>
                </div>

                <Divider class="my-6" />

                <div class="space-y-3">
                    <p class="text-lg font-semibold">Articles</p>
                    <div
                        v-for="item in order.items"
                        :key="item.product_id + '-' + item.quantity"
                        class="flex justify-between items-center py-3 border-b border-surface-100"
                    >
                        <div>
                            <p class="font-semibold">{{ item.product_name }}</p>
                            <p class="text-sm text-muted-color">Qté {{ item.quantity }}</p>
                        </div>
                        <p>{{ formatPrice(item.total, order.currency || 'EUR') }}</p>
                    </div>
                </div>
            </template>
            <template v-else>
                <div class="text-center py-10 text-muted-color">Commande introuvable.</div>
            </template>
        </Card>
    </div>
</template>
