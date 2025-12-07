import {computed, onBeforeUnmount, onMounted, reactive, ref, watch} from 'vue';
import {useToast} from 'primevue/usetoast';
import {useConfirm} from 'primevue/useconfirm';
import {createProduct, deleteProduct, fetchProducts, updateProduct} from '@/services/admin/productsService';
import {fetchCategories} from '@/services/admin/categoriesService';
import {useExport} from '@/composables/useExport';

export function useProducts() {
    const toast = useToast();
    const confirm = useConfirm();
    const {downloadCSV, downloadExcel, formatPrice, formatDateShort} = useExport();

    const products = ref([]);
    const loading = ref(false);
    const selectedProducts = ref([]);

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

    function exportCSV() {
        const exportColumns = [
            {field: 'id', header: 'ID'},
            {field: 'name', header: 'Nom'},
            {field: 'slug', header: 'Slug'},
            {field: 'sku', header: 'SKU'},
            {field: 'category.name', header: 'Catégorie'},
            {
                field: 'base_price',
                header: 'Prix',
                exportFormatter: (value) => formatPrice(value)
            },
            {field: 'stock', header: 'Stock'},
            {field: 'status', header: 'Statut'},
            {
                field: 'created_at',
                header: 'Créé le',
                exportFormatter: (value) => formatDateShort(value)
            }
        ];

        const dataToExport = selectedProducts.value.length > 0 ? selectedProducts.value : products.value;
        const filename = `produits_${new Date().toISOString().split('T')[0]}.csv`;
        downloadCSV(dataToExport, exportColumns, filename);
    }

    function exportExcel() {
        const exportColumns = [
            {field: 'id', header: 'ID'},
            {field: 'name', header: 'Nom'},
            {field: 'slug', header: 'Slug'},
            {field: 'sku', header: 'SKU'},
            {field: 'category.name', header: 'Catégorie'},
            {
                field: 'base_price',
                header: 'Prix',
                exportFormatter: (value) => formatPrice(value)
            },
            {field: 'stock', header: 'Stock'},
            {field: 'status', header: 'Statut'},
            {
                field: 'created_at',
                header: 'Créé le',
                exportFormatter: (value) => formatDateShort(value)
            }
        ];

        const dataToExport = selectedProducts.value.length > 0 ? selectedProducts.value : products.value;
        const filename = `produits_${new Date().toISOString().split('T')[0]}.xlsx`;
        downloadExcel(dataToExport, exportColumns, filename);
    }

    function bulkDelete() {
        if (selectedProducts.value.length === 0) {
            toast.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Aucun produit sélectionné',
                life: 3000
            });
            return;
        }

        confirm.require({
            message: `Supprimer ${selectedProducts.value.length} produit(s) sélectionné(s) ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: async () => {
                await performBulkDelete();
            }
        });
    }

    async function performBulkDelete() {
        try {
            const deletePromises = selectedProducts.value.map((product) => deleteProduct(product.id));
            await Promise.all(deletePromises);

            toast.add({
                severity: 'success',
                summary: 'Succès',
                detail: `${selectedProducts.value.length} produit(s) supprimé(s)`,
                life: 3000
            });

            selectedProducts.value = [];
            await loadProducts();
        } catch (error) {
            console.error(error);
            toast.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Erreur lors de la suppression',
                life: 3000
            });
        }
    }

    function bulkUpdateStatus(newStatus) {
        if (selectedProducts.value.length === 0) {
            toast.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Aucun produit sélectionné',
                life: 3000
            });
            return;
        }

        confirm.require({
            message: `Changer le statut de ${selectedProducts.value.length} produit(s) en "${newStatus}" ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: async () => {
                await performBulkUpdateStatus(newStatus);
            }
        });
    }

    async function performBulkUpdateStatus(newStatus) {
        try {
            const updatePromises = selectedProducts.value.map((product) =>
                updateProduct(product.id, {...product, status: newStatus})
            );
            await Promise.all(updatePromises);

            toast.add({
                severity: 'success',
                summary: 'Succès',
                detail: `${selectedProducts.value.length} produit(s) mis à jour`,
                life: 3000
            });

            selectedProducts.value = [];
            await loadProducts();
        } catch (error) {
            console.error(error);
            toast.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Erreur lors de la mise à jour',
                life: 3000
            });
        }
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
        selectedProducts,
        openNew,
        openEdit,
        hideDialog,
        loadProducts,
        saveProduct,
        confirmDeleteProduct,
        onPage,
        onSearch,
        onFilterChange,
        exportCSV,
        exportExcel,
        bulkDelete,
        bulkUpdateStatus,
        init
    };
}
