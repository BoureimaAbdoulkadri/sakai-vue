<script setup>
import { computed } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';

const route = useRoute();
const showNavigation = computed(() => route.name !== 'landing');
</script>

<template>
    <div class="min-h-screen flex flex-col bg-surface-50 text-surface-900">
        <header v-if="showNavigation" class="bg-white shadow-sm">
            <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                <RouterLink to="/" class="text-xl font-semibold text-primary">EDO</RouterLink>
                <nav class="flex items-center gap-4 text-sm">
                    <RouterLink class="text-color hover:text-primary transition-colors" :to="{ name: 'landing' }">Accueil</RouterLink>
                    <RouterLink class="text-color hover:text-primary transition-colors" :to="{ name: 'client-catalog' }">Boutique</RouterLink>
                </nav>
            </div>
        </header>

        <main class="flex-1">
            <RouterView />
        </main>

        <footer v-if="showNavigation" class="bg-white border-t border-surface-200 py-6 text-center text-sm text-muted-color">
            © {{ new Date().getFullYear() }} EDO Commerce. Tous droits réservés.
        </footer>
    </div>
</template>
