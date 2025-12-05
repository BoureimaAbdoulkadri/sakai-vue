import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';

const STORAGE_KEY = 'client_cart';

function safeParse(value) {
    try {
        return JSON.parse(value);
    } catch (error) {
        console.error('Failed to parse cart data from storage', error);
        return [];
    }
}

export const useCartStore = defineStore('cart', () => {
    const items = ref([]);

    function loadFromStorage() {
        if (typeof window === 'undefined') {
            return;
        }

        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
            items.value = safeParse(raw);
        }
    }

    function persist() {
        if (typeof window === 'undefined') {
            return;
        }

        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value));
        } catch (error) {
            console.error('Failed to save cart to storage', error);
        }
    }

    loadFromStorage();

    watch(
        items,
        () => persist(),
        { deep: true }
    );

    const itemCount = computed(() =>
        items.value.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
    );

    const subtotal = computed(() =>
        items.value.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0)
    );

    function addItem(product, quantity = 1) {
        if (!product || !product.id) {
            return;
        }

        const normalizedQuantity = Math.max(1, Number(quantity) || 1);
        const existing = items.value.find((item) => item.product_id === product.id);

        if (existing) {
            existing.quantity += normalizedQuantity;
            return;
        }

        items.value.push({
            product_id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            image_url: product.image_url,
            quantity: normalizedQuantity
        });
    }

    function updateQuantity(productId, quantity) {
        const item = items.value.find((entry) => entry.product_id === productId);
        if (!item) {
            return;
        }

        item.quantity = Math.max(1, Number(quantity) || 1);
    }

    function removeItem(productId) {
        items.value = items.value.filter((entry) => entry.product_id !== productId);
    }

    function clear() {
        items.value = [];
    }

    return {
        items,
        itemCount,
        subtotal,
        addItem,
        updateQuantity,
        removeItem,
        clear
    };
});
