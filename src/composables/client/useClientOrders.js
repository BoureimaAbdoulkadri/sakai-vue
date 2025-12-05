import { ref, reactive, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { fetchClientOrders } from '@/services/client/ordersService';

export function useClientOrders() {
    const toast = useToast();

    const orders = ref([]);
    const loading = ref(false);

    const pagination = reactive({
        page: 1,
        perPage: 10,
        total: 0
    });

    async function loadOrders() {
        loading.value = true;

        try {
            const response = await fetchClientOrders({
                page: pagination.page,
                perPage: pagination.perPage
            });

            orders.value = response.data;
            pagination.total = response.meta?.total ?? 0;
        } catch (error) {
            console.error(error);
            toast.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible de charger vos commandes.',
                life: 4000
            });
        } finally {
            loading.value = false;
        }
    }

    function onPage(event) {
        pagination.page = event.page + 1;
        pagination.perPage = event.rows;
        loadOrders();
    }

    onMounted(() => {
        loadOrders();
    });

    return {
        orders,
        loading,
        pagination,
        loadOrders,
        onPage
    };
}
