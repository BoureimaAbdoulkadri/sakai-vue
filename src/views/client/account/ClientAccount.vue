<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Card from 'primevue/card';
import { useClientAuthStore } from '@/stores/clientAuth';

const router = useRouter();
const clientAuth = useClientAuthStore();
const { customer } = storeToRefs(clientAuth);

function goToOrders() {
    router.push({ name: 'client-orders' });
}

async function logout() {
    await clientAuth.logout();
    router.push({ name: 'landing' });
}
</script>

<template>
    <section class="client-account">
        <div class="client-account__header">
            <div>
                <p class="client-account__eyebrow">Mon espace</p>
                <h1>Mon compte</h1>
                <p class="client-account__subtitle">Retrouvez vos informations personnelles et vos commandes.</p>
            </div>
            <div class="client-account__actions">
                <Button label="Mes commandes" icon="pi pi-truck" outlined @click="goToOrders" />
                <Button label="Déconnexion" severity="secondary" @click="logout" />
            </div>
        </div>

        <div class="client-account__grid" v-if="customer">
            <Card>
                <template #title>Identité</template>
                <template #content>
                    <p class="text-lg font-semibold">{{ customer.name }}</p>
                    <p class="text-sm text-muted-color">{{ customer.email }}</p>
                </template>
            </Card>
            <Card>
                <template #title>Préférences</template>
                <template #content>
                    <p class="text-sm text-muted-color mb-2">
                        Les communications personnalisées seront envoyées sur votre adresse email.
                    </p>
                    <Button label="Mettre à jour bientôt" text disabled />
                </template>
            </Card>
        </div>

        <div v-else class="text-center text-muted-color">
            <p>Chargement de vos informations...</p>
        </div>
    </section>
</template>

<style scoped>
.client-account {
    padding: clamp(2rem, 4vw, 4rem) clamp(1.5rem, 6vw, 4rem);
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.client-account__header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 1rem;
}

.client-account__eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.35em;
    font-size: 0.8rem;
    color: color-mix(in srgb, var(--text-color), transparent 45%);
}

.client-account__subtitle {
    color: color-mix(in srgb, var(--text-color), transparent 30%);
}

.client-account__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
}

.client-account__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
}
</style>
