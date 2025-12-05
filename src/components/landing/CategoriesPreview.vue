<script setup lang="ts">
import { useRouter } from 'vue-router';
import Card from 'primevue/card';
import Button from 'primevue/button';

interface CategoryPreview {
    key: string;
    label: string;
    description: string;
    icon: string;
}

const categories: CategoryPreview[] = [
    {
        key: 'kids',
        label: 'Enfant',
        description: 'Vêtements confortables pour les plus petits.',
        icon: 'pi pi-star'
    },
    {
        key: 'women',
        label: 'Femme',
        description: 'Tendances et indispensables du quotidien.',
        icon: 'pi pi-heart'
    },
    {
        key: 'men',
        label: 'Homme',
        description: 'Looks décontractés et élégants.',
        icon: 'pi pi-user'
    }
];

const router = useRouter();

function goToCategory() {
    router.push({ name: 'client-catalog' });
}
</script>

<template>
    <section>
        <div class="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4 gap-3">
            <div>
                <p class="text-sm uppercase tracking-widest text-primary font-semibold">Nos univers</p>
                <h2 class="text-2xl font-bold mb-1">Enfant, Femme &amp; Homme</h2>
                <p class="text-sm text-muted-color">Choisissez parmi nos collections pensées pour toute la famille.</p>
            </div>
            <Button label="Voir toute la boutique" icon="pi pi-arrow-right" text @click="router.push({ name: 'client-catalog' })" />
        </div>

        <div class="grid">
            <div v-for="category in categories" :key="category.key" class="col-12 md:col-4">
                <Card class="surface-card shadow-1 border-round h-full">
                    <template #title>
                        <div class="flex align-items-center gap-2">
                            <i :class="[category.icon, 'text-primary text-xl']" />
                            <span>{{ category.label }}</span>
                        </div>
                    </template>
                    <template #content>
                        <p class="text-sm text-muted-color mb-4">{{ category.description }}</p>
                        <Button label="Voir les produits" text @click="goToCategory" />
                    </template>
                </Card>
            </div>
        </div>
    </section>
</template>
