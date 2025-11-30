import { ref, reactive, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import {
    fetchCategoriesPaginated,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from '@/services/admin/categoriesService';

export function useCategories() {
    const toast = useToast();
    const confirm = useConfirm();

    const categories = ref([]);
    const loading = ref(false);

    const pagination = reactive({
        page: 1,
        perPage: 15,
        total: 0
    });

    const search = ref('');
    const isActiveFilter = ref(null);
    const parentFilter = ref(null);

    const allCategories = ref([]);

    const categoryDialog = ref(false);
    const editingCategory = ref(null);

    const form = reactive({
        id: null,
        name: '',
        slug: '',
        parent_id: null,
        is_active: true,
        position: 1
    });

    const isActiveOptions = [
        { label: 'Tous', value: null },
        { label: 'Actif', value: true },
        { label: 'Inactif', value: false }
    ];

    const parentOptions = computed(() =>
        allCategories.value.map((cat) => ({
            label: cat.name,
            value: cat.id
        }))
    );

    function resetForm() {
        form.id = null;
        form.name = '';
        form.slug = '';
        form.parent_id = null;
        form.is_active = true;
        form.position = 1;
    }

    function openNew() {
        resetForm();
        editingCategory.value = null;
        categoryDialog.value = true;
    }

    function openEdit(category) {
        if (!category) {
            console.warn('openEdit category called without data', category);
            return;
        }

        form.id = category.id ?? null;
        form.name = category.name ?? '';
        form.slug = category.slug ?? '';
        form.parent_id = category.parent_id ?? null;
        form.is_active = category.is_active ?? true;
        form.position = category.position ?? 1;

        editingCategory.value = category;
        categoryDialog.value = true;
    }

    function hideDialog() {
        categoryDialog.value = false;
    }

    async function loadAllCategoriesForDropdown() {
        try {
            allCategories.value = await fetchCategories();
        } catch (error) {
            console.error(error);
            toast.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible de charger la liste des catégories.',
                life: 3000
            });
        }
    }

    async function loadCategories() {
        loading.value = true;

        try {
            const response = await fetchCategoriesPaginated({
                page: pagination.page,
                perPage: pagination.perPage,
                search: search.value || undefined,
                isActive: isActiveFilter.value,
                parentId: parentFilter.value
            });

            categories.value = response.data ?? [];
            pagination.total = response.meta?.total ?? 0;
        } catch (error) {
            console.error(error);
            toast.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible de charger les catégories.',
                life: 3000
            });
        } finally {
            loading.value = false;
        }
    }

    async function saveCategory() {
        const payload = {
            name: form.name,
            slug: form.slug,
            parent_id: form.parent_id,
            is_active: form.is_active,
            position: form.position
        };

        try {
            if (!form.id) {
                await createCategory(payload);
                toast.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Catégorie créée avec succès.',
                    life: 3000
                });
            } else {
                await updateCategory(form.id, payload);
                toast.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Catégorie mise à jour.',
                    life: 3000
                });
            }

            categoryDialog.value = false;
            await loadCategories();
            await loadAllCategoriesForDropdown();
        } catch (error) {
            console.error(error);
            toast.add({
                severity: 'error',
                summary: 'Erreur',
                detail: "Échec de l'enregistrement de la catégorie.",
                life: 3000
            });
        }
    }

    function confirmDeleteCategory(category) {
        if (!category) {
            return;
        }

        confirm.require({
            message: `Supprimer la catégorie "${category.name}" ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: async () => {
                await removeCategory(category);
            }
        });
    }

    async function removeCategory(category) {
        try {
            await deleteCategory(category.id);
            toast.add({
                severity: 'success',
                summary: 'Supprimé',
                detail: 'Catégorie supprimée.',
                life: 3000
            });
            await loadCategories();
            await loadAllCategoriesForDropdown();
        } catch (error) {
            console.error(error);
            toast.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible de supprimer la catégorie.',
                life: 3000
            });
        }
    }

    function onPage(event) {
        pagination.page = event.page + 1;
        pagination.perPage = event.rows;
        loadCategories();
    }

    function onSearch() {
        pagination.page = 1;
        loadCategories();
    }

    function onFilterChange() {
        pagination.page = 1;
        loadCategories();
    }

    async function init() {
        await loadAllCategoriesForDropdown();
        await loadCategories();
    }

    onMounted(() => {
        init();
    });

    return {
        categories,
        loading,
        pagination,
        search,
        isActiveFilter,
        parentFilter,
        isActiveOptions,
        parentOptions,
        categoryDialog,
        form,
        openNew,
        openEdit,
        hideDialog,
        saveCategory,
        confirmDeleteCategory,
        onPage,
        onSearch,
        onFilterChange,
        init
    };
}
