import { ref, reactive, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { fetchClientProducts } from '@/services/client/productsService';

export function useClientProducts() {
    const toast = useToast();

    const products = ref([]);
    const loading = ref(false);

    const filters = reactive({
        search: '',
        category: null,
        minPrice: null,
        maxPrice: null,
        sort: 'newest'
    });

    const pagination = reactive({
        page: 1,
        perPage: 12,
        total: 0
    });

    async function loadProducts() {
        loading.value = true;

        try {
            const response = await fetchClientProducts({
                page: pagination.page,
                perPage: pagination.perPage,
                search: filters.search || undefined,
                category: filters.category || undefined,
                minPrice: filters.minPrice || undefined,
                maxPrice: filters.maxPrice || undefined,
                sort: filters.sort || undefined
            });

            products.value = response.data;
            pagination.total = response.meta?.total ?? 0;
        } catch (error) {
            console.error(error);
            toast.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible de charger les produits.',
                life: 3000
            });
        } finally {
            loading.value = false;
        }
    }

    function onPage(event) {
        pagination.page = event.page + 1;
        pagination.perPage = event.rows;
        loadProducts();
    }

    function applyFilters() {
        pagination.page = 1;
        loadProducts();
    }

    onMounted(() => {
        loadProducts();
    });

    return {
        products,
        loading,
        filters,
        pagination,
        loadProducts,
        onPage,
        applyFilters
    };
}
