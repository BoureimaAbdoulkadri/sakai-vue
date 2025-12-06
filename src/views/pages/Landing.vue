<script setup lang="ts">
import TopbarWidget from '@/components/landing/TopbarWidget.vue';
import HeroWidget from '@/components/landing/HeroWidget.vue';
import UspStrip from '@/components/landing/UspStrip.vue';
import CategoriesPreview from '@/components/landing/CategoriesPreview.vue';
import FeaturedProductsPreview from '@/components/landing/FeaturedProductsPreview.vue';
import NewsletterWidget from '@/components/landing/NewsletterWidget.vue';
import FooterWidget from '@/components/landing/FooterWidget.vue';
</script>

<template>
    <div class="bg-surface-0 dark:bg-surface-900 min-h-screen flex flex-column">
        <!-- Header fixe professionnel -->
        <header class="surface-card shadow-2 sticky top-0 z-5">
            <div class="px-6 md:px-12 lg:px-20 py-4">
                <TopbarWidget />
            </div>
        </header>

        <main class="flex-1">
            <!-- Hero Section - Full viewport height avec impact visuel -->
            <section id="hero" class="relative">
                <HeroWidget />
            </section>

            <!-- USP Strip - Juste après le hero pour rassurer -->
            <section id="usp" class="px-6 md:px-12 lg:px-20 py-8 surface-100">
                <UspStrip />
            </section>

            <!-- Collections - Section importante avec bon espacement -->
            <section id="categories" class="px-6 md:px-12 lg:px-20 py-12">
                <CategoriesPreview />
            </section>

            <!-- Featured Products - Produits mis en avant -->
            <section id="featured-products" class="px-6 md:px-12 lg:px-20 py-12 surface-50">
                <FeaturedProductsPreview />
            </section>

            <!-- Newsletter - Avant le footer pour capter l'attention -->
            <section id="newsletter" class="px-6 md:px-12 lg:px-20 py-12">
                <NewsletterWidget />
            </section>
        </main>

        <!-- Footer professionnel e-commerce -->
        <footer>
            <FooterWidget />
        </footer>
    </div>
</template>

<style scoped>
/* Smooth scroll behavior */
html {
    scroll-behavior: smooth;
}

/* Section backgrounds alternées pour rythme visuel */
section:nth-child(even) {
    background-color: var(--surface-50);
}
</style>
