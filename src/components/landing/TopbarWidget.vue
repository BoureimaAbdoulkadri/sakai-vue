<script setup>
import { useRouter } from 'vue-router';
import Button from 'primevue/button';

const router = useRouter();

function smoothScroll(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}
</script>

<template>
    <div class="w-full flex align-items-center justify-content-between">
        <!-- Logo -->
        <RouterLink :to="{ name: 'landing' }" class="flex align-items-center gap-2 cursor-pointer">
            <i class="pi pi-shopping-bag text-primary text-4xl"></i>
            <span class="text-surface-900 dark:text-surface-0 font-bold text-2xl">EDO</span>
        </RouterLink>

        <!-- Navigation Desktop -->
        <nav class="hidden lg:flex align-items-center gap-6">
            <a @click="smoothScroll('categories')" class="text-surface-700 hover:text-primary cursor-pointer font-medium transition-colors">
                Collections
            </a>
            <a @click="smoothScroll('featured-products')" class="text-surface-700 hover:text-primary cursor-pointer font-medium transition-colors">
                Nouveautés
            </a>
            <a @click="smoothScroll('newsletter')" class="text-surface-700 hover:text-primary cursor-pointer font-medium transition-colors">
                Newsletter
            </a>
        </nav>

        <!-- Actions -->
        <div class="flex align-items-center gap-3">
            <Button
                label="Se connecter"
                text
                size="small"
                @click="router.push({ name: 'client-login' })"
                class="hidden md:inline-flex"
            />
            <Button
                label="Voir la boutique"
                icon="pi pi-arrow-right"
                iconPos="right"
                size="small"
                @click="router.push({ name: 'client-catalog' })"
            />
        </div>
    </div>
</template>

<style scoped>
a {
    position: relative;
}

a::after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: -4px;
    left: 50%;
    background-color: var(--primary-color);
    transition: all 0.3s ease;
    transform: translateX(-50%);
}

a:hover::after {
    width: 100%;
}
</style>
