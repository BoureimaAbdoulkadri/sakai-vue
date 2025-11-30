import { ref, reactive, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { fetchOrdersPaginated, fetchOrderDetail, updateOrderStatus } from '@/services/admin/ordersService';

export function useOrders() {
    const toast = useToast();
    const confirm = useConfirm();

    const orders = ref([]);
    const loading = ref(false);

    const pagination = reactive({
        page: 1,
        perPage: 15,
        total: 0
    });

    const search = ref('');
    const statusFilter = ref(null);
    const paymentStatusFilter = ref(null);
    const dateFrom = ref(null);
    const dateTo = ref(null);

    const orderDialog = ref(false);
    const selectedOrder = ref(null);

    const statusOptions = [
        { label: 'Tous', value: null },
        { label: 'En attente', value: 'pending' },
        { label: 'En traitement', value: 'processing' },
        { label: 'Expédiée', value: 'shipped' },
        { label: 'Terminée', value: 'completed' },
        { label: 'Annulée', value: 'cancelled' }
    ];

    const paymentStatusOptions = [
        { label: 'Tous', value: null },
        { label: 'En attente', value: 'pending' },
        { label: 'Payée', value: 'paid' },
        { label: 'Échouée', value: 'failed' },
        { label: 'Remboursée', value: 'refunded' }
    ];

    const dialogStatusOptions = computed(() => statusOptions.filter((opt) => opt.value !== null));
    const dialogPaymentStatusOptions = computed(() => paymentStatusOptions.filter((opt) => opt.value !== null));

    const statusSeverity = (status) => {
        switch (status) {
            case 'completed':
            case 'shipped':
            case 'paid':
                return 'success';
            case 'pending':
            case 'processing':
                return 'warning';
            case 'cancelled':
            case 'failed':
                return 'danger';
            default:
                return 'info';
        }
    };

    async function loadOrders() {
        loading.value = true;

        try {
            const response = await fetchOrdersPaginated({
                page: pagination.page,
                perPage: pagination.perPage,
                search: search.value || undefined,
                status: statusFilter.value,
                paymentStatus: paymentStatusFilter.value,
                dateFrom: dateFrom.value ? formatDateParam(dateFrom.value) : null,
                dateTo: dateTo.value ? formatDateParam(dateTo.value) : null
            });

            orders.value = response.data ?? [];
            pagination.total = response.meta?.total ?? 0;
        } catch (error) {
            console.error(error);
            toast.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible de charger les commandes.',
                life: 3000
            });
        } finally {
            loading.value = false;
        }
    }

    function formatDateParam(value) {
        if (!value) return null;
        const date = value instanceof Date ? value : new Date(value);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function onPage(event) {
        pagination.page = event.page + 1;
        pagination.perPage = event.rows;
        loadOrders();
    }

    function onSearch() {
        pagination.page = 1;
        loadOrders();
    }

    function onFilterChange() {
        pagination.page = 1;
        loadOrders();
    }

    async function openOrder(order) {
        if (!order) return;

        try {
            const data = await fetchOrderDetail(order.id);
            selectedOrder.value = data;
            orderDialog.value = true;
        } catch (error) {
            console.error(error);
            toast.add({
                severity: 'error',
                summary: 'Erreur',
                detail: "Impossible de charger le détail de la commande.",
                life: 3000
            });
        }
    }

    function closeOrderDialog() {
        orderDialog.value = false;
        selectedOrder.value = null;
    }

    async function saveOrderStatus() {
        if (!selectedOrder.value) {
            return;
        }

        const payload = {
            status: selectedOrder.value.status,
            payment_status: selectedOrder.value.payment_status
        };

        try {
            const updated = await updateOrderStatus(selectedOrder.value.id, payload);
            selectedOrder.value = updated;

            const index = orders.value.findIndex((o) => o.id === updated.id);
            if (index !== -1) {
                orders.value[index] = {
                    ...orders.value[index],
                    status: updated.status,
                    payment_status: updated.payment_status
                };
            }

            toast.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Statut de commande mis à jour.',
                life: 3000
            });
        } catch (error) {
            console.error(error);
            toast.add({
                severity: 'error',
                summary: 'Erreur',
                detail: "Impossible de mettre à jour le statut de la commande.",
                life: 3000
            });
        }
    }

    async function init() {
        await loadOrders();
    }

    onMounted(() => {
        init();
    });

    return {
        orders,
        loading,
        pagination,
        search,
        statusFilter,
        paymentStatusFilter,
        dateFrom,
        dateTo,
        orderDialog,
        selectedOrder,
        statusOptions,
        paymentStatusOptions,
        dialogStatusOptions,
        dialogPaymentStatusOptions,
        statusSeverity,
        loadOrders,
        onPage,
        onSearch,
        onFilterChange,
        openOrder,
        closeOrderDialog,
        saveOrderStatus,
        init
    };
}
