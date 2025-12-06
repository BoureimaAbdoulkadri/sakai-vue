<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import Card from 'primevue/card';
import TabMenu from 'primevue/tabmenu';
import type { MenuItem } from 'primevue/menuitem';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useClientAuthStore } from '@/stores/clientAuth';
import { useClientProfileStore } from '@/stores/clientProfile';
import ClientProfilePanel from '@/components/client/ClientProfilePanel.vue';
import ClientOrdersPanel from '@/components/client/ClientOrdersPanel.vue';

const router = useRouter();
const clientAuth = useClientAuthStore();
const profileStore = useClientProfileStore();
const { customer } = storeToRefs(clientAuth);
const { t } = useI18n();
const activeTab = ref<'profile' | 'orders'>('profile');
const activeIndex = ref(0);

const tabItems = computed<MenuItem[]>(() => [
    { label: t('client.account.tabs.profile'), icon: 'pi pi-user' },
    { label: t('client.account.tabs.orders'), icon: 'pi pi-shopping-bag' }
]);

function goToOrders() {
    activeIndex.value = 1;
}

async function logout() {
    await clientAuth.logout();
    router.push({ name: 'landing' });
}

onMounted(() => {
    if (!profileStore.profile && !profileStore.loadingProfile) {
        profileStore.fetchProfile().catch(() => undefined);
    }
});

watch(
    activeIndex,
    (index) => {
        activeTab.value = index === 1 ? 'orders' : 'profile';
    },
    { immediate: true }
);
</script>

<template>
    <section class="client-account">
        <div class="client-account__header">
            <div>
                <p class="client-account__eyebrow">{{ t('client.account.header.eyebrow') }}</p>
                <h1>{{ t('client.account.header.title') }}</h1>
                <p class="client-account__subtitle">{{ t('client.account.header.subtitle') }}</p>
            </div>
            <div class="client-account__actions">
                <Button :label="t('client.account.header.orders')" icon="pi pi-truck" outlined @click="goToOrders" />
                <Button :label="t('client.account.header.logout')" severity="secondary" @click="logout" />
            </div>
        </div>

        <Card class="client-account__card">
            <template #title>
                <div class="client-account__card-header">
                    <div>
                        <p class="text-sm text-muted-color mb-1">{{ t('client.account.header.connected') }}</p>
                        <p class="text-lg font-semibold mb-0">{{ customer?.name }}</p>
                        <p class="text-sm text-muted-color mb-0">{{ customer?.email }}</p>
                    </div>
                    <div class="client-account__tabmenu">
                        <TabMenu :model="tabItems" v-model:activeIndex="activeIndex" />
                    </div>
                </div>
            </template>
            <template #content>
                <div v-show="activeTab === 'profile'">
                    <ClientProfilePanel />
                </div>
                <div v-show="activeTab === 'orders'">
                    <ClientOrdersPanel />
                </div>
            </template>
        </Card>
    </section>
</template>

<style scoped>
.client-account {
    padding: clamp(2rem, 4vw, 4rem) clamp(1.5rem, 6vw, 4rem);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.client-account__header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 1rem;
}

.client-account__eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.35em;
    font-size: 0.8rem;
    color: color-mix(in srgb, var(--text-color), transparent 45%);
}

.client-account__subtitle {
    color: color-mix(in srgb, var(--text-color), transparent 30%);
}

.client-account__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
}

.client-account__card-header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
}

.client-account__tabmenu :deep(.p-tabmenu-nav) {
    border: none;
}

.client-account__card {
    border-radius: 1rem;
}
</style>
