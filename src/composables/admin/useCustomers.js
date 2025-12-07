import {computed, onMounted, reactive, ref} from 'vue';
import {useToast} from 'primevue/usetoast';
import {useConfirm} from 'primevue/useconfirm';
import {
    createCustomer,
    deleteCustomer,
    fetchCustomerDetail,
    fetchCustomersPaginated,
    updateCustomer
} from '@/services/admin/customersService';
import {useExport} from '@/composables/useExport';

export function useCustomers() {
    const toast = useToast();
    const confirm = useConfirm();
    const {downloadCSV, downloadExcel, formatPrice, formatDateShort} = useExport();

    const customers = ref([]);
    const loading = ref(false);

    const pagination = reactive({
        page: 1,
        perPage: 15,
        total: 0
    });

    const search = ref('');
    const typeFilter = ref(null);
    const statusFilter = ref(null);
    const countryFilter = ref(null);

    const customerDialog = ref(false);
    const selectedCustomer = ref(null);
    const editingCustomer = ref(null);

    const form = reactive({
        id: null,
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        company_name: '',
        type: 'individual',
        status: 'active'
    });

    const typeOptions = [
        { label: 'Tous', value: null },
        { label: 'Particulier', value: 'individual' },
        { label: 'Entreprise', value: 'company' }
    ];

    const statusOptions = [
        { label: 'Tous', value: null },
        { label: 'Actif', value: 'active' },
        { label: 'Inactif', value: 'inactive' },
        { label: 'Prospect', value: 'prospect' }
    ];

    const countryOptions = [
        { label: 'Tous', value: null },
        { label: 'France', value: 'FR' },
        { label: 'Belgique', value: 'BE' },
        { label: 'Suisse', value: 'CH' },
        { label: 'Autre', value: 'OTHER' }
    ];

    const dialogTypeOptions = computed(() => typeOptions.filter((o) => o.value !== null));
    const dialogStatusOptions = computed(() => statusOptions.filter((o) => o.value !== null));

    function resetForm() {
        form.id = null;
        form.first_name = '';
        form.last_name = '';
        form.email = '';
        form.phone = '';
        form.company_name = '';
        form.type = 'individual';
        form.status = 'active';
    }

    async function loadCustomers() {
        loading.value = true;

        try {
            const response = await fetchCustomersPaginated({
                page: pagination.page,
                perPage: pagination.perPage,
                search: search.value || undefined,
                type: typeFilter.value,
                status: statusFilter.value,
                country: countryFilter.value
            });

            customers.value = response.data ?? [];
            pagination.total = response.meta?.total ?? 0;
        } catch (error) {
            console.error(error);
            toast.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible de charger les clients.',
                life: 3000
            });
        } finally {
            loading.value = false;
        }
    }

    function onPage(event) {
        pagination.page = event.page + 1;
        pagination.perPage = event.rows;
        loadCustomers();
    }

    function onSearch() {
        pagination.page = 1;
        loadCustomers();
    }

    function onFilterChange() {
        pagination.page = 1;
        loadCustomers();
    }

    function openNew() {
        resetForm();
        editingCustomer.value = null;
        customerDialog.value = true;
    }

    function openEdit(customer) {
        if (!customer) {
            console.warn('openEdit customer called without data');
            return;
        }

        form.id = customer.id ?? null;
        form.first_name = customer.first_name ?? '';
        form.last_name = customer.last_name ?? '';
        form.email = customer.email ?? '';
        form.phone = customer.phone ?? '';
        form.company_name = customer.company_name ?? '';
        form.type = customer.type ?? 'individual';
        form.status = customer.status ?? 'active';

        editingCustomer.value = customer;
        customerDialog.value = true;
    }

    async function openDetails(customer) {
        if (!customer) return;

        try {
            const data = await fetchCustomerDetail(customer.id);
            selectedCustomer.value = data;
            customerDialog.value = true;
        } catch (error) {
            console.error(error);
            toast.add({
                severity: 'error',
                summary: 'Erreur',
                detail: "Impossible de charger le détail du client.",
                life: 3000
            });
        }
    }

    function hideDialog() {
        customerDialog.value = false;
        selectedCustomer.value = null;
    }

    async function saveCustomer() {
        const payload = {
            first_name: form.first_name,
            last_name: form.last_name,
            email: form.email,
            phone: form.phone,
            company_name: form.company_name,
            status: form.status
        };

        try {
            if (!form.id) {
                await createCustomer(payload);
                toast.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Client créé avec succès.',
                    life: 3000
                });
            } else {
                await updateCustomer(form.id, payload);
                toast.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Client mis à jour.',
                    life: 3000
                });
            }

            customerDialog.value = false;
            await loadCustomers();
        } catch (error) {
            console.error(error);
            toast.add({
                severity: 'error',
                summary: 'Erreur',
                detail: "Échec de l'enregistrement du client.",
                life: 3000
            });
        }
    }

    function confirmDeleteCustomer(customer) {
        if (!customer) return;

        confirm.require({
            message: `Supprimer le client "${customer.full_name || `${customer.first_name ?? ''} ${customer.last_name ?? ''}`.trim()}" ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: async () => {
                await removeCustomer(customer);
            }
        });
    }

    async function removeCustomer(customer) {
        try {
            await deleteCustomer(customer.id);
            toast.add({
                severity: 'success',
                summary: 'Supprimé',
                detail: 'Client supprimé.',
                life: 3000
            });
            await loadCustomers();
        } catch (error) {
            console.error(error);
            toast.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible de supprimer le client.',
                life: 3000
            });
        }
    }

    function exportCSV() {
        const exportColumns = [
            {field: 'id', header: 'ID'},
            {
                field: 'full_name',
                header: 'Nom complet',
                exportFormatter: (_, row) => {
                    if (row.full_name) return row.full_name;
                    return [row.first_name, row.last_name].filter(Boolean).join(' ');
                }
            },
            {field: 'email', header: 'Email'},
            {field: 'phone', header: 'Téléphone'},
            {field: 'company_name', header: 'Société'},
            {
                field: 'type',
                header: 'Type',
                exportFormatter: (value) => (value === 'company' ? 'Entreprise' : 'Particulier')
            },
            {field: 'status', header: 'Statut'},
            {field: 'city', header: 'Ville'},
            {field: 'country', header: 'Pays'},
            {
                field: 'total_spent',
                header: 'CA Total',
                exportFormatter: (value) => formatPrice(value)
            },
            {field: 'total_orders', header: 'Nb Commandes'},
            {
                field: 'last_order_date',
                header: 'Dernière Commande',
                exportFormatter: (value) => formatDateShort(value)
            },
            {
                field: 'created_at',
                header: 'Créé le',
                exportFormatter: (value) => formatDateShort(value)
            }
        ];

        const filename = `clients_${new Date().toISOString().split('T')[0]}.csv`;
        downloadCSV(customers.value, exportColumns, filename);
    }

    function exportExcel() {
        const exportColumns = [
            {field: 'id', header: 'ID'},
            {
                field: 'full_name',
                header: 'Nom complet',
                exportFormatter: (_, row) => {
                    if (row.full_name) return row.full_name;
                    return [row.first_name, row.last_name].filter(Boolean).join(' ');
                }
            },
            {field: 'email', header: 'Email'},
            {field: 'phone', header: 'Téléphone'},
            {field: 'company_name', header: 'Société'},
            {
                field: 'type',
                header: 'Type',
                exportFormatter: (value) => (value === 'company' ? 'Entreprise' : 'Particulier')
            },
            {field: 'status', header: 'Statut'},
            {field: 'city', header: 'Ville'},
            {field: 'country', header: 'Pays'},
            {
                field: 'total_spent',
                header: 'CA Total',
                exportFormatter: (value) => formatPrice(value)
            },
            {field: 'total_orders', header: 'Nb Commandes'},
            {
                field: 'last_order_date',
                header: 'Dernière Commande',
                exportFormatter: (value) => formatDateShort(value)
            },
            {
                field: 'created_at',
                header: 'Créé le',
                exportFormatter: (value) => formatDateShort(value)
            }
        ];

        const filename = `clients_${new Date().toISOString().split('T')[0]}.xlsx`;
        downloadExcel(customers.value, exportColumns, filename);
    }

    async function init() {
        await loadCustomers();
    }

    onMounted(() => {
        init();
    });

    return {
        customers,
        loading,
        pagination,
        search,
        typeFilter,
        statusFilter,
        countryFilter,
        typeOptions,
        statusOptions,
        countryOptions,
        customerDialog,
        form,
        selectedCustomer,
        dialogTypeOptions,
        dialogStatusOptions,
        onPage,
        onSearch,
        onFilterChange,
        openNew,
        openEdit,
        openDetails,
        hideDialog,
        saveCustomer,
        confirmDeleteCustomer,
        exportCSV,
        exportExcel,
        init
    };
}
