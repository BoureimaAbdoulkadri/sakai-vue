import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import { fetchClientProduct } from '@/services/client/productsService';

export function useClientProductDetail() {
    const toast = useToast();
    const { t } = useI18n();

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
                summary: t('client.common.error'),
                detail: t('client.product.empty'),
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
