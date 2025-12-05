<script setup>
import { reactive } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import Button from 'primevue/button';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import { useToast } from 'primevue/usetoast';
import { useClientAuthStore } from '@/stores/clientAuth';

const authStore = useClientAuthStore();
const router = useRouter();
const route = useRoute();
const toast = useToast();

const form = reactive({
    email: '',
    password: ''
});

async function submit() {
    try {
        await authStore.login(form);
        toast.add({
            severity: 'success',
            summary: 'Connecté',
            detail: 'Vous êtes maintenant connecté.',
            life: 3000
        });
        const redirect = route.query.redirect;
        if (typeof redirect === 'string') {
            router.push(redirect);
        } else {
            router.push({ name: 'client-orders' });
        }
    } catch (error) {
        console.error(error);
        toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: "Impossible de vous connecter.",
            life: 4000
        });
    }
}
</script>

<template>
    <div class="py-8 px-4 max-w-md mx-auto">
        <Card class="shadow-sm border border-surface-200">
            <template #title>Connexion client</template>
            <template #content>
                <form class="space-y-4" @submit.prevent="submit">
                    <span class="p-float-label">
                        <InputText id="email" v-model="form.email" type="email" required class="w-full" />
                        <label for="email">Email</label>
                    </span>
                    <span class="p-float-label">
                        <Password
                            id="password"
                            v-model="form.password"
                            :feedback="false"
                            toggle-mask
                            input-class="w-full"
                            required
                        />
                        <label for="password">Mot de passe</label>
                    </span>
                    <Button type="submit" label="Connexion" class="w-full" :loading="authStore.loading" />
                </form>
                <p class="mt-4 text-sm text-center text-muted-color">
                    Pas encore de compte ?
                    <RouterLink :to="{ name: 'client-register' }" class="text-primary hover:underline">Créer un compte</RouterLink>
                </p>
            </template>
        </Card>
    </div>
</template>
