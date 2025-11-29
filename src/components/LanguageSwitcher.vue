<template>
    <div class="flex align-items-center gap-2">
        <Button
            label="FR"
            class="p-button-text p-button-sm"
            :class="{ 'p-button-outlined': currentLocale !== 'fr' }"
            @click="setLocale('fr')"
        />
        <Button
            label="EN"
            class="p-button-text p-button-sm"
            :class="{ 'p-button-outlined': currentLocale !== 'en' }"
            @click="setLocale('en')"
        />
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';

const { locale } = useI18n();

const currentLocale = computed(() => locale.value);

const setLocale = (lang) => {
    locale.value = lang;
    localStorage.setItem('locale', lang);
};
</script>
