import { ref, reactive, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import {
    fetchBannersPaginated,
    fetchBannerDetail,
    createBanner,
    updateBanner,
    deleteBanner
} from '@/services/admin/bannersService';

export function useBanners() {
    const toast = useToast();
    const confirm = useConfirm();

    const banners = ref([]);
    const loading = ref(false);

    const pagination = reactive({
        page: 1,
        perPage: 15,
        total: 0
    });

    const search = ref('');
    const statusFilter = ref(null);
    const locationFilter = ref(null);

    const bannerDialog = ref(false);
    const editingBanner = ref(null);

    const form = reactive({
        id: null,
        title: '',
        slug: '',
        image_url: '',
        link_url: '',
        location: 'home_hero',
        position: 1,
        status: 'draft',
        starts_at: null,
        ends_at: null
    });

    const statusOptions = [
        { label: 'Tous', value: null },
        { label: 'Brouillon', value: 'draft' },
        { label: 'Publié', value: 'published' },
        { label: 'Programmé', value: 'scheduled' },
        { label: 'Archivé', value: 'archived' }
    ];

    const dialogStatusOptions = computed(() => statusOptions.filter((o) => o.value !== null));

    const locationOptions = [
        { label: 'Accueil - Hero', value: 'home_hero' },
        { label: 'Accueil - Bannière', value: 'home_banner' },
        { label: 'Catégorie - Sidebar', value: 'category_sidebar' },
        { label: 'Footer', value: 'footer' }
    ];

    function resetForm() {
        form.id = null;
        form.title = '';
        form.slug = '';
        form.image_url = '';
        form.link_url = '';
        form.location = 'home_hero';
        form.position = 1;
        form.status = 'draft';
        form.starts_at = null;
        form.ends_at = null;
    }

    async function loadBanners() {
        loading.value = true;

        try {
            const response = await fetchBannersPaginated({
                page: pagination.page,
                perPage: pagination.perPage,
                search: search.value || undefined,
                status: statusFilter.value,
                location: locationFilter.value
            });

            banners.value = response.data ?? [];
            pagination.total = response.meta?.total ?? 0;
        } catch (error) {
            console.error(error);
            toast.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible de charger les bannières.',
                life: 3000
            });
        } finally {
            loading.value = false;
        }
    }

    function onPage(event) {
        pagination.page = event.page + 1;
        pagination.perPage = event.rows;
        loadBanners();
    }

    function onSearch() {
        pagination.page = 1;
        loadBanners();
    }

    function onFilterChange() {
        pagination.page = 1;
        loadBanners();
    }

    function openNew() {
        resetForm();
        editingBanner.value = null;
        bannerDialog.value = true;
    }

    function openEdit(banner) {
        if (!banner) {
            console.warn('openEdit banner called without data');
            return;
        }

        form.id = banner.id ?? null;
        form.title = banner.title ?? '';
        form.slug = banner.slug ?? '';
        form.image_url = banner.image_url ?? '';
        form.link_url = banner.link_url ?? '';
        form.location = banner.location ?? 'home_hero';
        form.position = banner.position ?? 1;
        form.status = banner.status ?? 'draft';
        form.starts_at = banner.starts_at ? new Date(banner.starts_at) : null;
        form.ends_at = banner.ends_at ? new Date(banner.ends_at) : null;

        editingBanner.value = banner;
        bannerDialog.value = true;
    }

    function hideDialog() {
        bannerDialog.value = false;
    }

    function toIsoStringOrNull(value) {
        if (!value) return null;
        if (value instanceof Date) {
            return value.toISOString();
        }
        const d = new Date(value);
        return Number.isNaN(d.getTime()) ? null : d.toISOString();
    }

    async function saveBanner() {
        const payload = {
            title: form.title,
            slug: form.slug,
            image_url: form.image_url,
            link_url: form.link_url,
            location: form.location,
            position: form.position,
            status: form.status,
            starts_at: toIsoStringOrNull(form.starts_at),
            ends_at: toIsoStringOrNull(form.ends_at)
        };

        try {
            if (!form.id) {
                await createBanner(payload);
                toast.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Bannière créée avec succès.',
                    life: 3000
                });
            } else {
                await updateBanner(form.id, payload);
                toast.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Bannière mise à jour.',
                    life: 3000
                });
            }

            bannerDialog.value = false;
            await loadBanners();
        } catch (error) {
            console.error(error);
            toast.add({
                severity: 'error',
                summary: 'Erreur',
                detail: "Échec de l'enregistrement de la bannière.",
                life: 3000
            });
        }
    }

    function confirmDeleteBanner(banner) {
        if (!banner) return;

        confirm.require({
            message: `Supprimer la bannière "${banner.title}" ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: async () => {
                await removeBanner(banner);
            }
        });
    }

    async function removeBanner(banner) {
        try {
            await deleteBanner(banner.id);
            toast.add({
                severity: 'success',
                summary: 'Supprimé',
                detail: 'Bannière supprimée.',
                life: 3000
            });
            await loadBanners();
        } catch (error) {
            console.error(error);
            toast.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible de supprimer la bannière.',
                life: 3000
            });
        }
    }

    function statusSeverity(status) {
        switch (status) {
            case 'published':
                return 'success';
            case 'scheduled':
                return 'info';
            case 'draft':
                return 'warning';
            case 'archived':
                return 'danger';
            default:
                return 'info';
        }
    }

    async function init() {
        await loadBanners();
    }

    onMounted(() => {
        init();
    });

    return {
        banners,
        loading,
        pagination,
        search,
        statusFilter,
        locationFilter,
        statusOptions,
        locationOptions,
        bannerDialog,
        form,
        dialogStatusOptions,
        onPage,
        onSearch,
        onFilterChange,
        openNew,
        openEdit,
        hideDialog,
        saveBanner,
        confirmDeleteBanner,
        statusSeverity,
        init
    };
}
