import {computed, ref} from 'vue';

const STORAGE_KEY = 'recently_viewed_products';
const MAX_ITEMS = 4;

interface RecentlyViewedProduct {
    id: number | string;
    slug: string;
    name: string;
    price: number;
    image_url?: string;
    viewedAt: number;
}

const recentlyViewedProducts = ref<RecentlyViewedProduct[]>([]);

function loadFromStorage() {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
            recentlyViewedProducts.value = JSON.parse(raw);
        }
    } catch (error) {
        console.error('Failed to load recently viewed products from storage', error);
    }
}

function saveToStorage() {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewedProducts.value));
    } catch (error) {
        console.error('Failed to save recently viewed products to storage', error);
    }
}

export function useRecentlyViewed() {
    loadFromStorage();

    const products = computed(() => recentlyViewedProducts.value);

    function addProduct(product: Omit<RecentlyViewedProduct, 'viewedAt'>) {
        // Supprimer le produit s'il existe déjà
        recentlyViewedProducts.value = recentlyViewedProducts.value.filter(
            (p) => p.id !== product.id && p.slug !== product.slug
        );

        // Ajouter le nouveau produit en premier
        recentlyViewedProducts.value.unshift({
            ...product,
            viewedAt: Date.now()
        });

        // Limiter le nombre de produits
        if (recentlyViewedProducts.value.length > MAX_ITEMS) {
            recentlyViewedProducts.value = recentlyViewedProducts.value.slice(0, MAX_ITEMS);
        }

        saveToStorage();
    }

    function clear() {
        recentlyViewedProducts.value = [];
        saveToStorage();
    }

    return {
        products,
        addProduct,
        clear
    };
}
