<script setup>
import { onMounted, ref, computed } from 'vue';
import http from '@/http';

const products = ref([]);
const totalRecords = ref(0);
const loading = ref(false);
const pagination = ref({ page: 1, rows: 10 });

const first = computed(() => (pagination.value.page - 1) * pagination.value.rows);

const loadProducts = async (page = 1) => {
    loading.value = true;
    try {
        const { data } = await http.get('/admin/products', {
            params: { page }
        });
        products.value = data.data;
        totalRecords.value = data.meta.total;
        pagination.value.page = data.meta.current_page;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Unable to load products', error);
    } finally {
        loading.value = false;
    }
};

const handlePage = (event) => {
    loadProducts(event.page + 1);
};

onMounted(() => {
    loadProducts();
});
</script>

<template>
    <div class="card">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold">Products</h2>
            <Button label="Reload" icon="pi pi-refresh" outlined size="small" @click="loadProducts(pagination.page)" />
        </div>
        <DataTable
            :value="products"
            :loading="loading"
            :paginator="true"
            :rows="pagination.rows"
            :total-records="totalRecords"
            :lazy="true"
            :first="first"
            dataKey="id"
            @page="handlePage"
        >
            <Column field="id" header="ID" />
            <Column field="name" header="Name" />
            <Column field="sku" header="SKU" />
            <Column field="base_price" header="Price (XOF)" />
            <Column field="stock" header="Stock" />
        </DataTable>
    </div>
</template>
