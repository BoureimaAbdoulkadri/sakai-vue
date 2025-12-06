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
    <div class="landing-shell">
        <header class="landing-header">
            <div class="landing-container">
                <TopbarWidget />
            </div>
        </header>

        <main class="landing-main">
            <section id="hero" class="landing-section landing-section--hero">
                <HeroWidget />
            </section>

            <section id="usp" class="landing-section landing-section--stripe landing-section--compact">
                <div class="landing-container">
                    <UspStrip />
                </div>
            </section>

            <section id="categories" class="landing-section landing-section--compact">
                <div class="landing-container">
                    <CategoriesPreview />
                </div>
            </section>

            <section id="featured-products" class="landing-section landing-section--muted landing-section--compact">
                <div class="landing-container">
                    <FeaturedProductsPreview />
                </div>
            </section>

            <section id="newsletter" class="landing-section landing-section--compact">
                <div class="landing-container">
                    <NewsletterWidget />
                </div>
            </section>
        </main>

        <footer class="landing-footer">
            <div class="landing-container">
                <FooterWidget />
            </div>
        </footer>
    </div>
</template>

<style scoped>
:global(html) {
    scroll-behavior: smooth;
}


.landing-shell {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(180deg, color-mix(in srgb, var(--surface-0), transparent 0%), color-mix(in srgb, var(--surface-ground), transparent 10%));
    color: var(--text-color);
}

.landing-header {
    position: sticky;
    top: 0;
    z-index: 10;
    backdrop-filter: blur(18px);
    background: color-mix(in srgb, var(--surface-card), transparent 20%);
    border-bottom: 1px solid color-mix(in srgb, var(--surface-border), transparent 50%);
}

.landing-main {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.landing-footer {
    border-top: 1px solid var(--surface-border);
    background: color-mix(in srgb, var(--surface-0), transparent 5%);
}

.landing-section {
    padding: clamp(3.5rem, 7vw, 6.5rem) 0;
}

.landing-section--compact {
    padding: clamp(2.25rem, 5vw, 4.5rem) 0;
}

.landing-section--hero {
    padding-top: clamp(1rem, 4vw, 2.5rem);
    background: linear-gradient(180deg, rgba(6, 8, 12, 0.65) 0%, rgba(6, 8, 12, 0.35) 45%, transparent 100%);
}

.landing-section--stripe {
    background: color-mix(in srgb, var(--surface-card), transparent 70%);
}

.landing-section--muted {
    background: color-mix(in srgb, var(--surface-card), transparent 65%);
}

.landing-container {
    width: min(1180px, 100% - clamp(2.5rem, 8vw, 6rem));
    margin: 0 auto;
    padding: 0 clamp(1.25rem, 2.5vw, 2rem);
}

@media (max-width: 768px) {
    .landing-header {
        backdrop-filter: blur(8px);
    }

    .landing-container {
        width: 100%;
        padding: 0 1.25rem;
    }
}
</style>
