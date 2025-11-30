import { ref, reactive, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { fetchAccountSettings, updateAccountSettings } from '@/services/admin/accountSettingsService';

export function useAccountSettings() {
    const toast = useToast();

    const loading = ref(false);
    const saving = ref(false);
    const loaded = ref(false);
    const isDirty = ref(false);

    const form = reactive({
        name: '',
        slug: '',
        contact_email: '',
        support_email: '',
        default_locale: 'fr',
        timezone: 'Europe/Paris',
        currency: 'EUR',
        enable_guest_checkout: true,
        enable_stock_management: true,
        tax_included: true,
        logo_url: '',
        primary_color: '#2563eb',
        secondary_color: '#10b981'
    });

    const localeOptions = [
        { label: 'Français (fr)', value: 'fr' },
        { label: 'Anglais (en)', value: 'en' }
    ];

    const currencyOptions = [
        { label: 'Euro (EUR)', value: 'EUR' },
        { label: 'Dollar US (USD)', value: 'USD' }
    ];

    const timezoneOptions = [
        { label: 'Europe / Paris', value: 'Europe/Paris' },
        { label: 'Europe / Brussels', value: 'Europe/Brussels' },
        { label: 'Europe / London', value: 'Europe/London' },
        { label: 'UTC', value: 'UTC' }
    ];

    const canSave = computed(() => !loading.value && !saving.value && isDirty.value);

    function markDirty() {
        if (!isDirty.value && loaded.value) {
            isDirty.value = true;
        }
    }

    async function loadSettings() {
        loading.value = true;

        try {
            const data = await fetchAccountSettings();

            form.name = data.name ?? '';
            form.slug = data.slug ?? '';
            form.contact_email = data.contact_email ?? '';
            form.support_email = data.support_email ?? '';
            form.default_locale = data.default_locale ?? 'fr';
            form.timezone = data.timezone ?? 'Europe/Paris';
            form.currency = data.currency ?? 'EUR';
            form.enable_guest_checkout = data.enable_guest_checkout ?? true;
            form.enable_stock_management = data.enable_stock_management ?? true;
            form.tax_included = data.tax_included ?? true;
            form.logo_url = data.logo_url ?? '';
            form.primary_color = data.primary_color ?? '#2563eb';
            form.secondary_color = data.secondary_color ?? '#10b981';

            loaded.value = true;
            isDirty.value = false;
        } catch (error) {
            console.error(error);
            toast.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible de charger les paramètres du compte.',
                life: 3000
            });
        } finally {
            loading.value = false;
        }
    }

    async function saveSettings() {
        saving.value = true;

        const payload = {
            name: form.name,
            slug: form.slug,
            contact_email: form.contact_email,
            support_email: form.support_email,
            default_locale: form.default_locale,
            timezone: form.timezone,
            currency: form.currency,
            enable_guest_checkout: form.enable_guest_checkout,
            enable_stock_management: form.enable_stock_management,
            tax_included: form.tax_included,
            logo_url: form.logo_url,
            primary_color: form.primary_color,
            secondary_color: form.secondary_color
        };

        try {
            const updated = await updateAccountSettings(payload);

            form.name = updated.name ?? form.name;
            form.slug = updated.slug ?? form.slug;
            form.contact_email = updated.contact_email ?? form.contact_email;
            form.support_email = updated.support_email ?? form.support_email;
            form.default_locale = updated.default_locale ?? form.default_locale;
            form.timezone = updated.timezone ?? form.timezone;
            form.currency = updated.currency ?? form.currency;
            form.enable_guest_checkout = updated.enable_guest_checkout ?? form.enable_guest_checkout;
            form.enable_stock_management = updated.enable_stock_management ?? form.enable_stock_management;
            form.tax_included = updated.tax_included ?? form.tax_included;
            form.logo_url = updated.logo_url ?? form.logo_url;
            form.primary_color = updated.primary_color ?? form.primary_color;
            form.secondary_color = updated.secondary_color ?? form.secondary_color;

            isDirty.value = false;

            toast.add({
                severity: 'success',
                summary: 'Paramètres sauvegardés',
                detail: 'Les paramètres du compte ont été mis à jour.',
                life: 3000
            });
        } catch (error) {
            console.error(error);
            toast.add({
                severity: 'error',
                summary: 'Erreur',
                detail: "Échec de la sauvegarde des paramètres.",
                life: 3000
            });
        } finally {
            saving.value = false;
        }
    }

    onMounted(() => {
        loadSettings();
    });

    return {
        loading,
        saving,
        form,
        localeOptions,
        currencyOptions,
        timezoneOptions,
        canSave,
        isDirty,
        markDirty,
        loadSettings,
        saveSettings
    };
}
