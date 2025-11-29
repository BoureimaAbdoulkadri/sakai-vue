<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import AppMenuItem from './AppMenuItem.vue';

const { t } = useI18n();

const model = computed(() => [
    {
        label: t('menu.dashboard'),
        items: [{ label: t('menu.dashboard'), icon: 'pi pi-home', to: '/admin/dashboard' }]
    },
    {
        label: t('menu.catalog'),
        items: [
            { label: t('menu.products'), icon: 'pi pi-box', to: '/admin/catalog/products' },
            { label: t('menu.categories'), icon: 'pi pi-list', to: '/admin/catalog/categories' }
        ]
    },
    {
        label: t('menu.sales'),
        items: [{ label: t('menu.orders'), icon: 'pi pi-shopping-cart', to: '/admin/sales/orders' }]
    },
    {
        label: t('menu.customers'),
        items: [{ label: t('menu.customers'), icon: 'pi pi-users', to: '/admin/customers' }]
    },
    {
        label: t('menu.marketing'),
        items: [{ label: t('menu.coupons'), icon: 'pi pi-percentage', to: '/admin/marketing/coupons' }]
    },
    {
        label: t('menu.content'),
        items: [{ label: t('menu.banners'), icon: 'pi pi-images', to: '/admin/cms/banners' }]
    },
    {
        label: t('menu.settings'),
        items: [{ label: t('menu.settings'), icon: 'pi pi-cog', to: '/admin/settings' }]
    }
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
