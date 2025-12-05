<script setup lang="ts">
const uspItems = [
    {
        icon: 'pi pi-truck',
        title: 'Livraison rapide',
        description: 'Commandes expédiées sous 24h partout en France.'
    },
    {
        icon: 'pi pi-refresh',
        title: 'Retours gratuits 30 jours',
        description: "Essayez chez vous, retournez gratuitement si ça ne convient pas."
    },
    {
        icon: 'pi pi-shield',
        title: 'Paiement sécurisé',
        description: 'Transactions cryptées et protégées.'
    },
    {
        icon: 'pi pi-headphones',
        title: 'Support client réactif',
        description: 'Une équipe mode à votre écoute 6j/7.'
    }
];
</script>

<template>
    <div class="surface-card shadow-1 border-round px-4 py-5">
        <div class="grid">
            <div
                v-for="usp in uspItems"
                :key="usp.title"
                class="col-12 md:col-6 lg:col-3 flex align-items-center gap-3"
            >
                <span class="bg-primary-50 text-primary border-circle flex align-items-center justify-content-center" style="width: 3rem; height: 3rem">
                    <i :class="[usp.icon, 'text-2xl']"></i>
                </span>
                <div>
                    <p class="text-lg font-semibold mb-1">{{ usp.title }}</p>
                    <p class="text-sm text-muted-color">{{ usp.description }}</p>
                </div>
            </div>
        </div>
    </div>
</template>
