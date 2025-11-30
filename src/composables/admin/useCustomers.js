import { ref, reactive, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import {
    fetchCustomersPaginated,
    fetchCustomerDetail,
    createCustomer,
    updateCustomer,
    deleteCustomer
} from '@/services/admin/customersService';

export function useCustomers() {
    const toast = useToast();
    const confirm = useConfirm();

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
        status: 'active',
        country: '',
        city: '',
        address_line1: '',
        postal_code: ''
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
        form.country = '';
        form.city = '';
        form.address_line1 = '';
        form.postal_code = '';
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
        form.country = customer.country ?? '';
        form.city = customer.city ?? '';
        form.address_line1 = customer.address_line1 ?? '';
        form.postal_code = customer.postal_code ?? '';

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
            type: form.type,
            status: form.status,
            country: form.country,
            city: form.city,
            address_line1: form.address_line1,
            postal_code: form.postal_code
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
        init
    };
}
