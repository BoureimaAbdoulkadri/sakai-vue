<template>
    <div class="card">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold">{{ $t('menu.products') }}</h2>
            <Button :label="$t('common.add')" icon="pi pi-plus" />
        </div>

        <DataTable
            :value="products"
            :loading="loading"
            :paginator="true"
            :rows="10"
            :totalRecords="totalRecords"
            :lazy="true"
            @page="onPage"
        >
            <Column field="id" header="ID" />
            <Column field="name" :header="$t('menu.products')" />
            <Column field="sku" header="SKU" />
            <Column field="base_price" header="Prix (XOF)" />
            <Column field="stock" header="Stock" />
        </DataTable>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import http from '@/http';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';

const products = ref([]);
const totalRecords = ref(0);
const loading = ref(false);

const loadProducts = async (page = 1) => {
    loading.value = true;
    try {
        const { data } = await http.get('/admin/products', {
            params: { page }
        });
        products.value = data.data;
        totalRecords.value = data.meta.total;
    } finally {
        loading.value = false;
    }
};

const onPage = (event) => {
    const page = event.page + 1; // DataTable utilise un index de page à partir de 0
    loadProducts(page);
};

onMounted(() => {
    loadProducts();
});
</script>
