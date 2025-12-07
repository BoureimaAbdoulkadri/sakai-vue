<script lang="ts" setup>
import {computed} from 'vue';
import {useRouter} from 'vue-router';
import {useI18n} from 'vue-i18n';
import {useCartStore} from '@/stores/cart';
import Button from 'primevue/button';
import Badge from 'primevue/badge';
import Popover from 'primevue/popover';

const router = useRouter();
const cartStore = useCartStore();
const {t, locale} = useI18n();

const formattedTotal = computed(() => {
    return new Intl.NumberFormat(locale.value === 'fr' ? 'fr-FR' : 'en-US', {
        style: 'currency',
        currency: 'EUR'
    }).format(Number(cartStore.subtotal || 0));
});

function goToCart() {
    router.push({name: 'client-cart'});
}

function goToCheckout() {
    router.push({name: 'client-checkout'});
}
</script>

<template>
    <Popover>
        <template #trigger="{ toggle }">
            <Button
                aria-label="Panier"
                class="mini-cart-trigger"
                icon="pi pi-shopping-cart"
                rounded
                severity="secondary"
                text
                @click="toggle"
            >
                <Badge v-if="cartStore.itemCount > 0" :value="cartStore.itemCount" class="mini-cart-badge"
                       severity="primary"/>
            </Button>
        </template>

        <div class="mini-cart-dropdown">
            <div class="mini-cart-header">
                <h3>{{ t('client.miniCart.title', 'Mon panier') }}</h3>
                <span class="mini-cart-count">{{
                        t('client.miniCart.items', {count: cartStore.itemCount}, `${cartStore.itemCount} article(s)`)
                    }}</span>
            </div>

            <div v-if="cartStore.items.length === 0" class="mini-cart-empty">
                <i class="pi pi-shopping-bag"></i>
                <p>{{ t('client.miniCart.empty', 'Votre panier est vide') }}</p>
            </div>

            <div v-else class="mini-cart-content">
                <div class="mini-cart-items">
                    <div v-for="item in cartStore.items" :key="item.product_id" class="mini-cart-item">
                        <div class="mini-cart-item-image">
                            <img v-if="item.image_url" :alt="item.name" :src="item.image_url"/>
                            <div v-else class="mini-cart-item-placeholder">
                                <i class="pi pi-image"></i>
                            </div>
                        </div>
                        <div class="mini-cart-item-details">
                            <p class="mini-cart-item-name">{{ item.name }}</p>
                            <p class="mini-cart-item-meta">
                                {{ item.quantity }} × {{
                                    new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
                                        style: 'currency',
                                        currency: 'EUR'
                                    }).format(Number(item.price || 0))
                                }}
                            </p>
                        </div>
                        <Button
                            class="mini-cart-item-remove"
                            icon="pi pi-times"
                            rounded
                            severity="danger"
                            size="small"
                            text
                            @click="cartStore.removeItem(item.product_id)"
                        />
                    </div>
                </div>

                <div class="mini-cart-footer">
                    <div class="mini-cart-total">
                        <span>{{ t('client.miniCart.total', 'Total') }}</span>
                        <span class="mini-cart-total-amount">{{ formattedTotal }}</span>
                    </div>
                    <div class="mini-cart-actions">
                        <Button
                            :label="t('client.miniCart.viewCart', 'Voir le panier')"
                            class="w-full"
                            outlined
                            size="small"
                            @click="goToCart"
                        />
                        <Button
                            :label="t('client.miniCart.checkout', 'Commander')"
                            class="w-full"
                            size="small"
                            @click="goToCheckout"
                        />
                    </div>
                </div>
            </div>
        </div>
    </Popover>
</template>

<style scoped>
.mini-cart-trigger {
    position: relative;
}

.mini-cart-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    min-width: 18px;
    height: 18px;
    font-size: 0.7rem;
}

.mini-cart-dropdown {
    min-width: 320px;
    max-width: 400px;
}

.mini-cart-header {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--surface-border);
}

.mini-cart-header h3 {
    margin: 0 0 0.25rem 0;
    font-size: 1.1rem;
}

.mini-cart-count {
    font-size: 0.85rem;
    color: var(--text-color-secondary);
}

.mini-cart-empty {
    padding: 2rem;
    text-align: center;
    color: var(--text-color-secondary);
}

.mini-cart-empty i {
    font-size: 2.5rem;
    color: var(--surface-400);
    margin-bottom: 0.75rem;
}

.mini-cart-empty p {
    margin: 0;
}

.mini-cart-content {
    display: flex;
    flex-direction: column;
}

.mini-cart-items {
    max-height: 300px;
    overflow-y: auto;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.mini-cart-item {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    padding: 0.5rem;
    border-radius: 0.5rem;
    transition: background-color 0.2s;
}

.mini-cart-item:hover {
    background-color: var(--surface-50);
}

.mini-cart-item-image {
    width: 60px;
    height: 60px;
    flex-shrink: 0;
    border-radius: 0.5rem;
    overflow: hidden;
    background: var(--surface-100);
}

.mini-cart-item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.mini-cart-item-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--surface-400);
}

.mini-cart-item-details {
    flex: 1;
    min-width: 0;
}

.mini-cart-item-name {
    margin: 0 0 0.25rem 0;
    font-weight: 600;
    font-size: 0.9rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.mini-cart-item-meta {
    margin: 0;
    font-size: 0.85rem;
    color: var(--text-color-secondary);
}

.mini-cart-item-remove {
    flex-shrink: 0;
}

.mini-cart-footer {
    padding: 1rem 1.25rem;
    border-top: 1px solid var(--surface-border);
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.mini-cart-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
}

.mini-cart-total-amount {
    font-size: 1.2rem;
    color: var(--primary-color);
}

.mini-cart-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
</style>
