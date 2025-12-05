import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { fetchClientOrder } from '@/services/client/ordersService';

export function useClientOrderDetail() {
    const toast = useToast();

    const order = ref(null);
    const loading = ref(false);

    async function loadOrder(id) {
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
        } finally {
            loading.value = false;
        }
    }

    return {
        order,
        loading,
        loadOrder
    };
}
