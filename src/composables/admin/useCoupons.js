import { ref, reactive, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import {
    fetchCouponsPaginated,
    fetchCouponDetail,
    createCoupon,
    updateCoupon,
    deleteCoupon
} from '@/services/admin/couponsService';

export function useCoupons() {
    const toast = useToast();
    const confirm = useConfirm();

    const coupons = ref([]);
    const loading = ref(false);

    const pagination = reactive({
        page: 1,
        perPage: 15,
        total: 0
    });

    const search = ref('');
    const typeFilter = ref(null);
    const statusFilter = ref(null);

    const couponDialog = ref(false);
    const editingCoupon = ref(null);

    const form = reactive({
        id: null,
        code: '',
        type: 'percent',
        value: 0,
        status: 'draft',
        scope: 'order',
        usage_limit: null,
        usage_count: 0,
        min_amount: null,
        starts_at: null,
        ends_at: null
    });

    const typeOptions = [
        { label: 'Tous', value: null },
        { label: 'Pourcentage', value: 'percent' },
        { label: 'Montant fixe', value: 'fixed' },
        { label: 'Livraison offerte', value: 'free_shipping' }
    ];

    const statusOptions = [
        { label: 'Tous', value: null },
        { label: 'Brouillon', value: 'draft' },
        { label: 'Actif', value: 'active' },
        { label: 'Programmé', value: 'scheduled' },
        { label: 'Expiré', value: 'expired' }
    ];

    const scopeOptions = [
        { label: 'Commande entière', value: 'order' },
        { label: 'Produit', value: 'product' },
        { label: 'Catégorie', value: 'category' }
    ];

    const dialogTypeOptions = computed(() => typeOptions.filter((o) => o.value !== null));
    const dialogStatusOptions = computed(() => statusOptions.filter((o) => o.value !== null));

    function resetForm() {
        form.id = null;
        form.code = '';
        form.type = 'percent';
        form.value = 0;
        form.status = 'draft';
        form.scope = 'order';
        form.usage_limit = null;
        form.usage_count = 0;
        form.min_amount = null;
        form.starts_at = null;
        form.ends_at = null;
    }

    async function loadCoupons() {
        loading.value = true;

        try {
            const response = await fetchCouponsPaginated({
                page: pagination.page,
                perPage: pagination.perPage,
                search: search.value || undefined,
                type: typeFilter.value,
                status: statusFilter.value
            });

            coupons.value = response.data ?? [];
            pagination.total = response.meta?.total ?? 0;
        } catch (error) {
            console.error(error);
            toast.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible de charger les coupons.',
                life: 3000
            });
        } finally {
            loading.value = false;
        }
    }

    function onPage(event) {
        pagination.page = event.page + 1;
        pagination.perPage = event.rows;
        loadCoupons();
    }

    function onSearch() {
        pagination.page = 1;
        loadCoupons();
    }

    function onFilterChange() {
        pagination.page = 1;
        loadCoupons();
    }

    function openNew() {
        resetForm();
        editingCoupon.value = null;
        couponDialog.value = true;
    }

    function openEdit(coupon) {
        if (!coupon) {
            console.warn('openEdit coupon called without data');
            return;
        }

        form.id = coupon.id ?? null;
        form.code = coupon.code ?? '';
        form.type = coupon.type ?? 'percent';
        form.value = coupon.value ?? 0;
        form.status = coupon.status ?? 'draft';
        form.scope = coupon.scope ?? 'order';
        form.usage_limit = coupon.usage_limit ?? null;
        form.usage_count = coupon.usage_count ?? 0;
        form.min_amount = coupon.min_amount ?? null;
        form.starts_at = coupon.starts_at ? new Date(coupon.starts_at) : null;
        form.ends_at = coupon.ends_at ? new Date(coupon.ends_at) : null;

        editingCoupon.value = coupon;
        couponDialog.value = true;
    }

    function hideDialog() {
        couponDialog.value = false;
    }

    function toIsoStringOrNull(value) {
        if (!value) return null;
        if (value instanceof Date) {
            return value.toISOString();
        }
        const d = new Date(value);
        return Number.isNaN(d.getTime()) ? null : d.toISOString();
    }

    async function saveCoupon() {
        const payload = {
            code: form.code,
            type: form.type,
            value: form.value,
            status: form.status,
            scope: form.scope,
            usage_limit: form.usage_limit,
            min_amount: form.min_amount,
            starts_at: toIsoStringOrNull(form.starts_at),
            ends_at: toIsoStringOrNull(form.ends_at)
        };

        try {
            if (!form.id) {
                await createCoupon(payload);
                toast.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Coupon créé avec succès.',
                    life: 3000
                });
            } else {
                await updateCoupon(form.id, payload);
                toast.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Coupon mis à jour.',
                    life: 3000
                });
            }

            couponDialog.value = false;
            await loadCoupons();
        } catch (error) {
            console.error(error);
            toast.add({
                severity: 'error',
                summary: 'Erreur',
                detail: "Échec de l'enregistrement du coupon.",
                life: 3000
            });
        }
    }

    function confirmDeleteCoupon(coupon) {
        if (!coupon) return;

        confirm.require({
            message: `Supprimer le coupon "${coupon.code}" ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: async () => {
                await removeCoupon(coupon);
            }
        });
    }

    async function removeCoupon(coupon) {
        try {
            await deleteCoupon(coupon.id);
            toast.add({
                severity: 'success',
                summary: 'Supprimé',
                detail: 'Coupon supprimé.',
                life: 3000
            });
            await loadCoupons();
        } catch (error) {
            console.error(error);
            toast.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible de supprimer le coupon.',
                life: 3000
            });
        }
    }

    function statusSeverity(status) {
        switch (status) {
            case 'active':
                return 'success';
            case 'scheduled':
                return 'info';
            case 'draft':
                return 'warning';
            case 'expired':
                return 'danger';
            default:
                return 'info';
        }
    }

    async function init() {
        await loadCoupons();
    }

    onMounted(() => {
        init();
    });

    return {
        coupons,
        loading,
        pagination,
        search,
        typeFilter,
        statusFilter,
        typeOptions,
        statusOptions,
        scopeOptions,
        couponDialog,
        form,
        dialogTypeOptions,
        dialogStatusOptions,
        onPage,
        onSearch,
        onFilterChange,
        openNew,
        openEdit,
        hideDialog,
        saveCoupon,
        confirmDeleteCoupon,
        statusSeverity,
        init
    };
}
