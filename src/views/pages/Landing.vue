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
    <div class="bg-surface-0 dark:bg-surface-900">
        <div id="home" class="landing-wrapper overflow-hidden min-h-screen flex flex-col">
            <header class="py-6 px-6 mx-0 md:mx-12 lg:mx-20 lg:px-20 flex items-center justify-between relative lg:static">
                <TopbarWidget />
            </header>

            <main class="flex-1">
                <section id="hero">
                    <HeroWidget />
                </section>

                <section id="usp" class="px-6 md:px-12 lg:px-20 py-6">
                    <UspStrip />
                </section>

                <section id="categories" class="px-6 md:px-12 lg:px-20 py-6">
                    <CategoriesPreview />
                </section>

                <section id="featured-products" class="px-6 md:px-12 lg:px-20 py-6">
                    <FeaturedProductsPreview />
                </section>

                <section id="newsletter" class="px-6 md:px-12 lg:px-20 py-6">
                    <NewsletterWidget />
                </section>
            </main>

            <footer class="mt-6">
                <FooterWidget />
            </footer>
        </div>
    </div>
</template>
