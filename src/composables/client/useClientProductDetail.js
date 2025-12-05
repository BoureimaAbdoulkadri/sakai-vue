import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { fetchClientProduct } from '@/services/client/productsService';

export function useClientProductDetail() {
    const toast = useToast();

    const product = ref(null);
    const loading = ref(false);

    async function loadProduct(slug) {
        loading.value = true;

        try {
            const response = await fetchClientProduct(slug);
            product.value = response.data;
        } catch (error) {
            console.error(error);
            toast.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible de charger ce produit.',
                life: 3000
            });
        } finally {
            loading.value = false;
        }
    }

    return {
        product,
        loading,
        loadProduct
    };
}
