import {onMounted, ref} from 'vue';
import {useToast} from 'primevue/usetoast';
import {useI18n} from 'vue-i18n';
import {postClientCheckout} from '@/services/client/checkoutService';
import {useCartStore} from '@/stores/cart';
import {useClientProfileStore} from '@/stores/clientProfile';

export function useClientCheckout() {
    const toast = useToast();
    const cartStore = useCartStore();
    const clientProfileStore = useClientProfileStore();
    const { t } = useI18n();

    const loading = ref(false);
    const order = ref(null);
    const notes = ref('');
    const step = ref(1); // 1: Info, 2: Livraison, 3: Paiement, 4: Confirmation

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

    const paymentMethod = ref('cod'); // cash on delivery par défaut

    // Pré-remplir avec les données du profil si disponibles
    onMounted(async () => {
        try {
            await clientProfileStore.fetchProfile();
            const profile = clientProfileStore.profile;

            if (profile) {
                customerForm.value.email = profile.email || '';
                customerForm.value.first_name = profile.first_name || '';
                customerForm.value.last_name = profile.last_name || '';
                customerForm.value.phone = profile.phone || '';

                // Pré-remplir les adresses si disponibles
                if (profile.default_billing_address) {
                    Object.assign(customerForm.value.billing_address, profile.default_billing_address);
                }
                if (profile.default_shipping_address) {
                    Object.assign(customerForm.value.shipping_address, profile.default_shipping_address);
                }
            }
        } catch (error) {
            // Silently fail if profile not available (user not logged in)
            console.log('Profile not available for pre-fill');
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
                quantity: item.quantity,
                size: item.size || undefined
            })),
            notes: notes.value || undefined,
            payment_method: paymentMethod.value
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

    function nextStep() {
        if (step.value < 3) {
            step.value++;
        }
    }

    function prevStep() {
        if (step.value > 1) {
            step.value--;
        }
    }

    return {
        loading,
        order,
        notes,
        customerForm,
        paymentMethod,
        step,
        nextStep,
        prevStep,
        submitCheckout
    };
}
