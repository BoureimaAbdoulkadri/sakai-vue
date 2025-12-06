import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import type { ClientOrderDetail, ClientOrderSummary } from '@/services/clientProfile';
import { getClientOrder, getClientOrders } from '@/services/clientProfile';

interface PaginationState {
    page: number;
    perPage: number;
    total: number;
}

export const useClientOrdersStore = defineStore('clientOrders', () => {
    const orders = ref<ClientOrderSummary[]>([]);
    const selectedOrder = ref<ClientOrderDetail | null>(null);
    const loadingOrders = ref(false);
    const loadingOrderDetail = ref(false);
    const pagination = reactive<PaginationState>({
        page: 1,
        perPage: 10,
        total: 0
    });

    async function fetchOrders(options: { page?: number; perPage?: number } = {}) {
        loadingOrders.value = true;

        if (options.page) {
            pagination.page = options.page;
        }
        if (options.perPage) {
            pagination.perPage = options.perPage;
        }

        try {
            const response = await getClientOrders({
                page: pagination.page,
                perPage: pagination.perPage
            });

            orders.value = response.data ?? [];
            pagination.total = response.meta?.total ?? orders.value.length;
        } finally {
            loadingOrders.value = false;
        }
    }

    async function fetchOrderDetail(id: number | string) {
        loadingOrderDetail.value = true;
        selectedOrder.value = null;
        try {
            const response = await getClientOrder(id);
            selectedOrder.value = response.data;
        } finally {
            loadingOrderDetail.value = false;
        }
    }

    function clearSelectedOrder() {
        selectedOrder.value = null;
    }

    return {
        orders,
        selectedOrder,
        loadingOrders,
        loadingOrderDetail,
        pagination,
        fetchOrders,
        fetchOrderDetail,
        clearSelectedOrder
    };
});
