import AppLayout from '@/layout/AppLayout.vue';
import Landing from '@/views/pages/Landing.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        // Front public
        {
            path: '/',
            name: 'landing',
            component: Landing
        },
        // Back-office admin
        {
            path: '/admin',
            component: AppLayout,
            children: [
                {
                    path: 'dashboard',
                    name: 'admin-dashboard',
                    component: () => import('@/views/dashboard/Dashboard.vue')
                },
                {
                    path: 'catalog/products',
                    name: 'admin-catalog-products',
                    component: () => import('@/views/catalog/Products.vue')
                },
                {
                    path: 'catalog/categories',
                    name: 'admin-catalog-categories',
                    component: () => import('@/views/catalog/Categories.vue')
                },
                {
                    path: 'sales/orders',
                    name: 'admin-sales-orders',
                    component: () => import('@/views/sales/Orders.vue')
                },
                {
                    path: 'customers',
                    name: 'admin-customers',
                    component: () => import('@/views/customers/Customers.vue')
                },
                {
                    path: 'marketing/coupons',
                    name: 'admin-marketing-coupons',
                    component: () => import('@/views/marketing/Coupons.vue')
                },
                {
                    path: 'cms/banners',
                    name: 'admin-cms-banners',
                    component: () => import('@/views/cms/Banners.vue')
                },
                {
                    path: 'settings',
                    name: 'admin-settings',
                    component: () => import('@/views/settings/Settings.vue')
                }
            ]
        },
        // Pages d'auth et 404 existantes
        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        }
    ]
});

export default router;
