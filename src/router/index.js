import AppLayout from '@/layout/AppLayout.vue';
import StorefrontLayout from '@/layout/StorefrontLayout.vue';
import Landing from '@/views/pages/Landing.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        // Front public
        {
            path: '/',
            component: StorefrontLayout,
            children: [
                {
                    path: '',
                    name: 'landing',
                    component: Landing
                },
                {
                    path: 'shop',
                    name: 'client-catalog',
                    component: () => import('@/views/client/Catalog.vue')
                },
                {
                    path: 'products/:slug',
                    name: 'client-product',
                    component: () => import('@/views/client/Product.vue')
                }
            ]
        },
        // Back-office admin
        {
            path: '/admin',
            component: AppLayout,
            meta: { requiresAdmin: true },
            children: [
                {
                    path: 'dashboard',
                    name: 'admin-dashboard',
                    component: () => import('@/views/admin/dashboard/Dashboard.vue')
                },
                {
                    path: 'catalog/products',
                    name: 'admin-catalog-products',
                    component: () => import('@/views/admin/catalog/Products.vue')
                },
                {
                    path: 'catalog/categories',
                    name: 'admin-catalog-categories',
                    component: () => import('@/views/admin/catalog/Categories.vue')
                },
                {
                    path: 'sales/orders',
                    name: 'admin-sales-orders',
                    component: () => import('@/views/admin/sales/Orders.vue')
                },
                {
                    path: 'customers',
                    name: 'admin-customers',
                    component: () => import('@/views/admin/customers/Customers.vue')
                },
                {
                    path: 'marketing/coupons',
                    name: 'admin-marketing-coupons',
                    component: () => import('@/views/admin/marketing/Coupons.vue')
                },
                {
                    path: 'cms/banners',
                    name: 'admin-cms-banners',
                    component: () => import('@/views/admin/cms/Banners.vue')
                },
                {
                    path: 'settings',
                    name: 'admin-settings',
                    component: () => import('@/views/admin/settings/Settings.vue')
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
            path: '/auth/register',
            name: 'register',
            component: () => import('@/views/pages/auth/Register.vue')
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

router.beforeEach(async (to, from, next) => {
    const requiresAdmin = to.matched.some((record) => record.meta?.requiresAdmin);

    if (!requiresAdmin) {
        return next();
    }

    const authStore = useAuthStore();

    if (!authStore.isAuthenticated) {
        return next({ path: '/auth/login', query: { redirect: to.fullPath } });
    }

    if (!authStore.user) {
        try {
            await authStore.fetchMe();
        } catch (error) {
            return next({ path: '/auth/login', query: { redirect: to.fullPath } });
        }
    }

    if (!authStore.isAdmin) {
        return next({ path: '/auth/login' });
    }

    return next();
});

export default router;
