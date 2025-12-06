<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import ClientOrdersPanel from '@/components/client/ClientOrdersPanel.vue';

const { t } = useI18n();
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4 gap-3">
                <div>
                    <h1 class="text-2xl font-semibold mb-1">{{ t('client.account.orders.title') }}</h1>
                    <span class="text-sm text-muted-color">{{ t('client.account.orders.subtitle') }}</span>
                </div>
            </div>
        </div>
        <div class="col-12">
            <ClientOrdersPanel />
        </div>
    </div>
</template>
