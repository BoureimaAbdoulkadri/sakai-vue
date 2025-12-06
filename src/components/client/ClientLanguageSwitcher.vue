<script setup lang="ts">
import { computed, ref } from 'vue';
import Button from 'primevue/button';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { updateClientLocale } from '@/services/client/locale';

const { locale, t } = useI18n();
const toast = useToast();
const syncing = ref(false);

const options = computed(() => [
    { code: 'fr', label: t('client.language.fr') },
    { code: 'en', label: t('client.language.en') }
]);

async function selectLocale(code: string) {
    if (locale.value === code || syncing.value) {
        return;
    }

    locale.value = code;
    if (typeof window !== 'undefined') {
        localStorage.setItem('client_locale', code);
        localStorage.setItem('locale', code);
    }

    try {
        syncing.value = true;
        await updateClientLocale({ locale: code });
    } catch (error) {
        console.error('Unable to sync locale', error);
        toast.add({
            severity: 'error',
            summary: t('client.common.error'),
            detail: t('client.language.syncError'),
            life: 3000
        });
    } finally {
        syncing.value = false;
    }
}
</script>

<template>
    <div class="client-language-switch" :aria-label="t('client.language.label')">
        <Button
            v-for="option in options"
            :key="option.code"
            :label="option.label"
            class="p-button-text p-button-sm"
            :class="{ 'p-button-outlined': locale !== option.code }"
            :loading="syncing && locale === option.code"
            @click="selectLocale(option.code)"
        />
    </div>
</template>

<style scoped>
.client-language-switch {
    display: inline-flex;
    gap: 0.35rem;
}
</style>
