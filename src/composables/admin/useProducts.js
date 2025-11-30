import { ref, reactive, computed, onMounted, watch, onBeforeUnmount } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '@/services/admin/productsService';
import { fetchCategories } from '@/services/admin/categoriesService';

export function useProducts() {
    const toast = useToast();
    const confirm = useConfirm();

    const products = ref([]);
    const loading = ref(false);

    const pagination = reactive({
        page: 1,
        perPage: 15,
        total: 0
    });

    const search = ref('');
    const statusFilter = ref(null);
    const categoryFilter = ref(null);

    const categories = ref([]);

    const productDialog = ref(false);
    const editingProduct = ref(null);

    const form = reactive({
        id: null,
        name: '',
        slug: '',
        sku: '',
        description: '',
        base_price: 0,
        stock: 0,
        status: 'draft',
        category_id: null
    });

    const statusOptions = [
        { label: 'Tous', value: null },
        { label: 'Brouillon', value: 'draft' },
        { label: 'Publié', value: 'published' },
        { label: 'Archivé', value: 'archived' }
    ];

    const categoryOptions = computed(() =>
        categories.value.map((cat) => ({
            label: cat.name,
            value: cat.id
        }))
    );

    function resetForm() {
        form.id = null;
        form.name = '';
        form.slug = '';
        form.sku = '';
        form.description = '';
        form.base_price = 0;
        form.stock = 0;
        form.status = 'draft';
        form.category_id = null;
    }

    function openNew() {
        resetForm();
        editingProduct.value = null;
        productDialog.value = true;
    }

    function openEdit(product) {
        if (!product) {
            console.warn('openEdit called without a valid product', product);
            return;
        }

        console.debug('openEdit product', product);

        form.id = product.id ?? null;
        form.name = product.name ?? '';
        form.slug = product.slug ?? '';
        form.sku = product.sku ?? '';
        form.description = product.description ?? '';
        form.base_price = product.base_price ?? 0;
        form.stock = product.stock ?? 0;
        form.status = product.status ?? 'draft';
        form.category_id = product.category && product.category.id ? product.category.id : null;

        editingProduct.value = product;
        productDialog.value = true;
    }

    function hideDialog() {
        productDialog.value = false;
    }

    async function loadCategories() {
        try {
            categories.value = await fetchCategories();
        } catch (error) {
            console.error(error);
            toast.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible de charger les catégories.',
                life: 3000
            });
        }
    }

    async function loadProducts() {
        loading.value = true;

        try {
            const response = await fetchProducts({
                page: pagination.page,
                perPage: pagination.perPage,
                search: search.value || undefined,
                status: statusFilter.value,
                categoryId: categoryFilter.value
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

    async function saveProduct() {
        const payload = {
            name: form.name,
            slug: form.slug,
            sku: form.sku,
            description: form.description,
            base_price: form.base_price,
            stock: form.stock,
            status: form.status,
            category_id: form.category_id
        };

        try {
            if (form.id === null) {
                await createProduct(payload);
                toast.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Produit créé avec succès.',
                    life: 3000
                });
            } else {
                await updateProduct(form.id, payload);
                toast.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Produit mis à jour.',
                    life: 3000
                });
            }

            productDialog.value = false;
            await loadProducts();
        } catch (error) {
            console.error(error);
            toast.add({
                severity: 'error',
                summary: 'Erreur',
                detail: "Échec de l'enregistrement du produit.",
                life: 3000
            });
        }
    }

    function confirmDeleteProduct(product) {
        confirm.require({
            message: `Supprimer le produit "${product.name}" ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: async () => {
                await removeProduct(product);
            }
        });
    }

    async function removeProduct(product) {
        try {
            await deleteProduct(product.id);
            toast.add({
                severity: 'success',
                summary: 'Supprimé',
                detail: 'Produit supprimé.',
                life: 3000
            });
            await loadProducts();
        } catch (error) {
            console.error(error);
            toast.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible de supprimer le produit.',
                life: 3000
            });
        }
    }

    function onPage(event) {
        pagination.page = event.page + 1;
        pagination.perPage = event.rows;
        loadProducts();
    }

    function onSearch() {
        pagination.page = 1;
        loadProducts();
    }

    function onFilterChange() {
        pagination.page = 1;
        loadProducts();
    }

    async function init() {
        await loadCategories();
        await loadProducts();
    }

    let searchTimeoutId;

    watch(search, () => {
        clearTimeout(searchTimeoutId);
        searchTimeoutId = setTimeout(() => {
            onSearch();
        }, 400);
    });

    watch([statusFilter, categoryFilter], () => {
        onFilterChange();
    });

    onMounted(() => {
        init();
    });

    onBeforeUnmount(() => {
        clearTimeout(searchTimeoutId);
    });

    return {
        products,
        loading,
        pagination,
        search,
        statusFilter,
        categoryFilter,
        categories,
        productDialog,
        editingProduct,
        form,
        statusOptions,
        categoryOptions,
        openNew,
        openEdit,
        hideDialog,
        loadProducts,
        saveProduct,
        confirmDeleteProduct,
        onPage,
        onSearch,
        onFilterChange,
        init
    };
}
