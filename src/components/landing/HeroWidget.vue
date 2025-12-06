<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Carousel from 'primevue/carousel';

const router = useRouter();
const { t } = useI18n();

const heroSlides = computed(() => [
    {
        title: t('client.hero.slides.kids.title'),
        subtitle: t('client.hero.slides.kids.subtitle'),
        description: t('client.hero.slides.kids.description'),
        image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=1200&h=800&fit=crop',
        cta: t('client.hero.slides.kids.cta')
    },
    {
        title: t('client.hero.slides.women.title'),
        subtitle: t('client.hero.slides.women.subtitle'),
        description: t('client.hero.slides.women.description'),
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=800&fit=crop',
        cta: t('client.hero.slides.women.cta')
    },
    {
        title: t('client.hero.slides.men.title'),
        subtitle: t('client.hero.slides.men.subtitle'),
        description: t('client.hero.slides.men.description'),
        image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=1200&h=800&fit=crop',
        cta: t('client.hero.slides.men.cta')
    }
]);

function goToShop() {
    router.push({ name: 'client-catalog' });
}
</script>

<template>
    <div class="hero-section relative">
        <Carousel
            :value="heroSlides"
            :numVisible="1"
            :numScroll="1"
            :circular="true"
            :autoplayInterval="5000"
            class="hero-carousel"
        >
            <template #item="{ data }">
                <div class="hero-slide relative">
                    <!-- Image de fond avec overlay -->
                    <div class="hero-image-wrapper">
                        <img :src="data.image" :alt="data.subtitle" class="hero-image" />
                        <div class="hero-overlay"></div>
                    </div>

                    <!-- Contenu -->
                    <div class="hero-content relative">
                        <div class="max-w-4xl">
                            <span class="hero-badge inline-flex align-items-center gap-2 px-4 py-2 bg-white text-primary border-round-xl mb-4 shadow-2">
                                <i class="pi pi-sparkles"></i>
                                <span class="font-semibold text-sm">{{ data.title }}</span>
                            </span>

                            <h1 class="hero-title text-white text-5xl md:text-6xl lg:text-7xl font-bold mb-4">
                                {{ data.subtitle }}
                            </h1>

                            <p class="hero-description text-white text-xl md:text-2xl mb-6 opacity-90">
                                {{ data.description }}
                            </p>

                            <div class="flex flex-wrap gap-3">
                                <Button
                                    :label="data.cta"
                                    icon="pi pi-shopping-bag"
                                    iconPos="right"
                                    size="large"
                                    class="px-8 py-4 font-semibold text-lg"
                                    @click="goToShop"
                                />
                                <Button
                                    :label="t('client.hero.viewAll')"
                                    icon="pi pi-arrow-right"
                                    iconPos="right"
                                    severity="secondary"
                                    outlined
                                    size="large"
                                    class="px-8 py-4 font-semibold text-lg bg-white-alpha-20"
                                    @click="goToShop"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </Carousel>

    </div>
</template>

<style scoped>
.hero-section {
    margin-bottom: clamp(3.5rem, 7vw, 6rem);
}

.hero-carousel :deep(.p-carousel-content) {
    position: relative;
}

.hero-slide {
    position: relative;
    min-height: 68vh;
    display: flex;
    align-items: center;
}

.hero-image-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.hero-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(120deg, rgba(3, 6, 12, 0.78) 0%, rgba(6, 8, 12, 0.2) 60%);
}

.hero-content {
    position: relative;
    z-index: 5;
    padding: clamp(3rem, 8vw, 6rem) clamp(2rem, 6vw, 6rem) clamp(4rem, 10vw, 7rem);
}

.hero-badge {
    animation: fadeInDown 0.8s ease-out;
}

.hero-title {
    animation: fadeInUp 0.8s ease-out 0.2s both;
    text-shadow: 0 10px 35px rgba(0, 0, 0, 0.4);
}

.hero-description {
    animation: fadeInUp 0.8s ease-out 0.4s both;
    color: color-mix(in srgb, #fff, transparent 10%);
}

.hero-content .flex {
    animation: fadeInUp 0.8s ease-out 0.6s both;
}

@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translateY(-30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Customisation des indicateurs du carousel */
.hero-carousel :deep(.p-carousel-indicators) {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
}

.hero-carousel :deep(.p-carousel-indicator button) {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    border: 2px solid white;
}

.hero-carousel :deep(.p-carousel-indicator.p-highlight button) {
    background: white;
}

/* Responsive */
@media (max-width: 768px) {
    .hero-slide {
        min-height: 60vh;
    }
}
</style>
