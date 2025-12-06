<script setup lang="ts">
import { useRouter } from 'vue-router';
import Button from 'primevue/button';

const router = useRouter();

function goToShop() {
    router.push({ name: 'client-catalog' });
}

function goToFeatured() {
    const section = document.getElementById('featured-products');
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}
</script>

<template>
    <section class="px-6 md:px-12 lg:px-20 py-12 md:py-16 lg:py-20">
        <div class="grid align-items-center">
            <!-- Colonne texte -->
            <div class="col-12 md:col-6 text-center md:text-left">
                <!-- Titre principal -->
                <h1 class="text-4xl md:text-5xl font-bold text-surface-900 mb-4">
                    Mode Enfant,<br />Femme & Homme
                </h1>

                <!-- Sous-titre -->
                <p class="text-lg text-surface-700 mb-6">
                    Découvrez nos collections pensées pour toute la famille : coupes modernes, matières confortables et pièces incontournables du quotidien.
                </p>

                <!-- Boutons CTAs -->
                <div class="flex flex-column sm:flex-row gap-3 justify-content-center md:justify-content-start">
                    <Button
                        label="Découvrir la boutique"
                        icon="pi pi-shopping-bag"
                        iconPos="right"
                        size="large"
                        @click="goToShop"
                    />
                    <Button
                        label="Voir les nouveautés"
                        icon="pi pi-arrow-right"
                        iconPos="right"
                        severity="secondary"
                        outlined
                        size="large"
                        @click="goToFeatured"
                    />
                </div>
            </div>

            <!-- Colonne visuel -->
            <div class="col-12 md:col-6 flex justify-content-center align-items-center mt-6 md:mt-0">
                <div class="surface-card shadow-2 border-round-2xl p-8 text-center" style="max-width: 500px; width: 100%;">
                    <i class="pi pi-images text-6xl text-surface-300 mb-4"></i>
                    <p class="text-surface-600 font-semibold mb-2">Visuel collection</p>
                    <p class="text-surface-500 text-sm m-0">1200 x 800px</p>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
/* Pas de styles personnalisés nécessaires - on utilise PrimeFlex */
</style>
