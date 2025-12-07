<script setup>
import {computed} from 'vue';
import {storeToRefs} from 'pinia';
import {RouterLink, useRouter} from 'vue-router';
import {useI18n} from 'vue-i18n';
import Button from 'primevue/button';
import {useClientAuthStore} from '@/stores/clientAuth';
import ClientLanguageSwitcher from '@/components/client/ClientLanguageSwitcher.vue';
import MiniCartDropdown from '@/components/client/MiniCartDropdown.vue';

const router = useRouter();
const clientAuth = useClientAuthStore();
const { customer } = storeToRefs(clientAuth);
const { t } = useI18n();

const navItems = computed(() => [
    { label: t('client.topbar.nav.collections'), target: 'categories' },
    { label: t('client.topbar.nav.new'), target: 'featured-products' },
    { label: t('client.topbar.nav.newsletter'), target: 'newsletter' }
]);

function smoothScroll(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

async function handleLogout() {
    await clientAuth.logout();
    router.push({ name: 'landing' });
}
</script>

<template>
    <div class="landing-topbar">
        <RouterLink :to="{ name: 'landing' }" class="landing-topbar__brand">
            <i class="pi pi-shopping-bag"></i>
            <span>EDO</span>
        </RouterLink>

        <nav class="landing-topbar__nav">
            <button v-for="item in navItems" :key="item.target" type="button" @click="smoothScroll(item.target)">
                {{ item.label }}
            </button>
        </nav>

        <div class="landing-topbar__actions">
            <ClientLanguageSwitcher />
            <MiniCartDropdown/>
            <template v-if="!customer">
                <Button
                    :label="t('client.topbar.actions.login')"
                    text
                    size="small"
                    class="landing-topbar__ghost"
                    @click="router.push({ name: 'client-login' })"
                />
            </template>
            <template v-else>
                <Button
                    :label="t('client.topbar.actions.account')"
                    text
                    size="small"
                    class="landing-topbar__ghost"
                    @click="router.push({ name: 'client-account' })"
                />
                <Button
                    :label="t('client.topbar.actions.logout')"
                    icon="pi pi-sign-out"
                    size="small"
                    outlined
                    @click="handleLogout"
                />
            </template>
            <Button
                :label="t('client.topbar.actions.shop')"
                icon="pi pi-arrow-right"
                iconPos="right"
                size="small"
                @click="router.push({ name: 'client-catalog' })"
            />
        </div>
    </div>
</template>

<style scoped>
.landing-topbar {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 1.5rem;
    align-items: center;
    padding: 1.25rem 0;
}

.landing-topbar__brand {
    display: inline-flex;
    align-items: center;
    gap: 0.65rem;
    font-weight: 600;
    font-size: 1.4rem;
    letter-spacing: 0.12em;
    color: var(--text-color);
    text-transform: uppercase;
}

.landing-topbar__brand i {
    font-size: 1.35rem;
    color: var(--primary-color);
}

.landing-topbar__nav {
    display: none;
    justify-content: center;
    gap: 1.5rem;
}

.landing-topbar__nav button {
    background: transparent;
    border: none;
    font-weight: 500;
    font-size: 0.95rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--text-color), transparent 25%);
    cursor: pointer;
    position: relative;
    padding: 0.25rem 0;
    transition: color 0.3s ease;
}

.landing-topbar__nav button::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -6px;
    width: 100%;
    height: 1px;
    background: currentColor;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
    opacity: 0.4;
}

.landing-topbar__nav button:hover {
    color: var(--text-color);
}

.landing-topbar__nav button:hover::after {
    transform: scaleX(1);
}

    .landing-topbar__actions {
        display: flex;
        gap: 0.75rem;
        align-items: center;
    }

.landing-topbar__ghost {
    border-radius: 999px;
    border-color: color-mix(in srgb, var(--text-color), transparent 65%);
    color: color-mix(in srgb, var(--text-color), transparent 10%);
}

@media (min-width: 992px) {
    .landing-topbar__nav {
        display: inline-flex;
    }

    .landing-topbar__actions .p-button-text {
        display: inline-flex;
    }
}

@media (max-width: 991px) {
    .landing-topbar {
        grid-template-columns: auto auto;
        grid-template-rows: auto auto;
    }

    .landing-topbar__actions {
        grid-column: 1 / -1;
        justify-content: flex-start;
    }
}
</style>
