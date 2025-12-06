import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import { postClientCheckout } from '@/services/client/checkoutService';
import { useCartStore } from '@/stores/cart';

export function useClientCheckout() {
    const toast = useToast();
    const cartStore = useCartStore();
    const { t } = useI18n();

    const loading = ref(false);
    const order = ref(null);
    const notes = ref('');

    const customerForm = ref({
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        billing_address: {
            line1: '',
            line2: '',
            postal_code: '',
            city: '',
            country: 'FR'
        },
        shipping_address: {
            line1: '',
            line2: '',
            postal_code: '',
            city: '',
            country: 'FR'
        }
    });

    async function submitCheckout() {
        if (!cartStore.items.length) {
            toast.add({
                severity: 'warn',
                summary: t('client.common.warn'),
                detail: t('client.checkout.toast.empty'),
                life: 3000
            });
            return;
        }

        loading.value = true;

        const payload = {
            customer: customerForm.value,
            items: cartStore.items.map((item) => ({
                product_id: item.product_id,
                quantity: item.quantity
            })),
            notes: notes.value || undefined,
            payment_method: 'cod'
        };

        try {
            const response = await postClientCheckout(payload);
            order.value = response.data;
            cartStore.clear();

            toast.add({
                severity: 'success',
                summary: t('client.common.success'),
                detail: t('client.checkout.toast.created'),
                life: 4000
            });
        } catch (error) {
            console.error(error);
            toast.add({
                severity: 'error',
                summary: t('client.common.error'),
                detail: t('client.checkout.toast.error'),
                life: 4000
            });
        } finally {
            loading.value = false;
        }
    }

    return {
        loading,
        order,
        notes,
        customerForm,
        submitCheckout
    };
}
