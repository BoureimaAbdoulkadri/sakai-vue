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
    <section
        class="flex flex-column lg:flex-row pt-6 px-6 lg:px-20 overflow-hidden"
        style="background: linear-gradient(0deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)), radial-gradient(77.36% 256.97% at 77.36% 57.52%, rgb(238, 239, 175) 0%, rgb(195, 227, 250) 100%); clip-path: ellipse(150% 87% at 93% 13%)"
    >
        <div class="mx-6 md:mx-20 mt-0 md:mt-6 flex-1">
            <span class="inline-flex align-items-center gap-2 px-3 py-1 bg-primary text-white border-round mb-4 text-sm font-semibold">
                <i class="pi pi-sun" /> Collections printemps / été
            </span>
            <h1 class="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Mode Enfant, Femme &amp; Homme
            </h1>
            <p class="font-normal text-xl leading-normal md:mt-4 text-gray-700 max-w-2xl">
                Découvrez nos collections pour toute la famille : coupes modernes, matières confortables et pièces
                incontournables du quotidien.
            </p>
            <div class="flex flex-column sm:flex-row gap-3 mt-6">
                <Button
                    label="Découvrir la boutique"
                    icon="pi pi-shopping-bag"
                    class="!text-lg !px-4"
                    @click="goToShop"
                />
                <Button
                    label="Voir les nouveautés"
                    icon="pi pi-star"
                    severity="secondary"
                    text
                    class="!text-lg !px-4"
                    @click="goToFeatured"
                />
            </div>
        </div>
        <div class="flex justify-content-center lg:justify-content-end flex-1">
            <img src="/demo/images/landing/screen-1.png" alt="Hero Image" class="w-10/12 md:w-auto" />
        </div>
    </section>
</template>
