<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { storeToRefs } from 'pinia';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Skeleton from 'primevue/skeleton';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import { useClientProfileStore } from '@/stores/clientProfile';

const toast = useToast();
const { t, locale } = useI18n();
const clientProfileStore = useClientProfileStore();
const { profile, stats, loadingProfile, updatingProfile } = storeToRefs(clientProfileStore);

const form = reactive({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company_name: ''
});

const hasProfile = computed(() => Boolean(profile.value));
const formattedTotalSpent = computed(() => {
    const amount = stats.value?.total_spent ?? 0;
    return new Intl.NumberFormat(locale.value === 'fr' ? 'fr-FR' : 'en-US', {
        style: 'currency',
        currency: 'EUR'
    }).format(Number(amount));
});

watch(
    profile,
    (value) => {
        form.first_name = value?.first_name ?? '';
        form.last_name = value?.last_name ?? '';
        form.email = value?.email ?? '';
        form.phone = value?.phone ?? '';
        form.company_name = value?.company_name ?? '';
    },
    { immediate: true }
);

async function handleSubmit() {
    try {
        await clientProfileStore.updateProfile({
            first_name: form.first_name,
            last_name: form.last_name,
            email: form.email,
            phone: form.phone,
            company_name: form.company_name
        });
        toast.add({
            severity: 'success',
            summary: t('client.common.success'),
            detail: t('client.account.profile.toast.success'),
            life: 3000
        });
    } catch (error) {
        console.error('Unable to update profile', error);
        toast.add({
            severity: 'error',
            summary: t('client.common.error'),
            detail: t('client.account.profile.toast.error'),
            life: 4000
        });
    }
}
</script>

<template>
    <section class="client-profile-panel">
        <div class="stats-grid" v-if="stats">
            <Card class="stat-card">
                <template #title>{{ t('client.account.profile.stats.orders') }}</template>
                <template #content>
                    <p class="stat-value">{{ stats.orders_count }}</p>
                    <p class="stat-label">{{ t('client.account.profile.stats.orders') }}</p>
                </template>
            </Card>
            <Card class="stat-card">
                <template #title>{{ t('client.account.profile.stats.spent') }}</template>
                <template #content>
                    <p class="stat-value">{{ formattedTotalSpent }}</p>
                    <p class="stat-label">{{ t('client.account.profile.stats.spent') }}</p>
                </template>
            </Card>
        </div>

        <div class="profile-form" v-if="loadingProfile">
            <Skeleton height="2rem" class="mb-3" borderRadius="8px" v-for="index in 5" :key="index" />
        </div>

        <form v-else class="profile-form" @submit.prevent="handleSubmit">
            <div v-if="!hasProfile" class="text-sm text-muted-color mb-3">
                {{ t('client.account.profile.empty') }}
            </div>

            <div class="grid grid-nogutter gap-3">
                <div class="col-12 md:col-6">
                    <span class="p-float-label">
                        <InputText id="firstName" v-model="form.first_name" required fluid />
                        <label for="firstName">{{ t('client.account.profile.labels.firstName') }}</label>
                    </span>
                </div>
                <div class="col-12 md:col-6">
                    <span class="p-float-label">
                        <InputText id="lastName" v-model="form.last_name" required fluid />
                        <label for="lastName">{{ t('client.account.profile.labels.lastName') }}</label>
                    </span>
                </div>
                <div class="col-12 md:col-6">
                    <span class="p-float-label">
                        <InputText id="email" v-model="form.email" type="email" required fluid />
                        <label for="email">{{ t('client.account.profile.labels.email') }}</label>
                    </span>
                </div>
                <div class="col-12 md:col-6">
                    <span class="p-float-label">
                        <InputText id="phone" v-model="form.phone" fluid />
                        <label for="phone">{{ t('client.account.profile.labels.phone') }}</label>
                    </span>
                </div>
                <div class="col-12">
                    <span class="p-float-label">
                        <InputText id="company" v-model="form.company_name" fluid />
                        <label for="company">{{ t('client.account.profile.labels.company') }}</label>
                    </span>
                </div>
            </div>

            <div class="form-actions">
                <Button type="submit" :label="t('client.account.profile.actions.update')" icon="pi pi-save" :loading="updatingProfile" />
            </div>
        </form>
    </section>
</template>

<style scoped>
.client-profile-panel {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.stat-card :deep(.p-card-title) {
    font-size: 1rem;
    color: var(--surface-500);
}

.stat-value {
    font-size: 1.75rem;
    font-weight: 600;
    margin: 0;
}

.stat-label {
    margin: 0;
    color: var(--text-color-secondary);
    font-size: 0.9rem;
}

.profile-form .p-float-label {
    width: 100%;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
}
</style>
