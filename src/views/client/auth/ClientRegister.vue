<script setup>
import { reactive } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import Button from 'primevue/button';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import { useToast } from 'primevue/usetoast';
import { useClientAuthStore } from '@/stores/clientAuth';

const authStore = useClientAuthStore();
const router = useRouter();
const toast = useToast();

const form = reactive({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: ''
});

async function submit() {
    try {
        await authStore.register(form);
        toast.add({
            severity: 'success',
            summary: 'Compte créé',
            detail: 'Bienvenue !',
            life: 3000
        });
        router.push({ name: 'client-orders' });
    } catch (error) {
        console.error(error);
        toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de créer le compte.',
            life: 4000
        });
    }
}
</script>

<template>
    <div class="py-8 px-4 max-w-md mx-auto">
        <Card class="shadow-sm border border-surface-200">
            <template #title>Créer un compte</template>
            <template #content>
                <form class="space-y-4" @submit.prevent="submit">
                    <span class="p-float-label">
                        <InputText id="name" v-model="form.name" required class="w-full" />
                        <label for="name">Nom complet</label>
                    </span>
                    <span class="p-float-label">
                        <InputText id="email" v-model="form.email" type="email" required class="w-full" />
                        <label for="email">Email</label>
                    </span>
                    <span class="p-float-label">
                        <InputText id="phone" v-model="form.phone" class="w-full" />
                        <label for="phone">Téléphone (optionnel)</label>
                    </span>
                    <span class="p-float-label">
                        <Password id="password" v-model="form.password" :feedback="false" toggle-mask input-class="w-full" required />
                        <label for="password">Mot de passe</label>
                    </span>
                    <span class="p-float-label">
                        <Password
                            id="passwordConfirmation"
                            v-model="form.password_confirmation"
                            :feedback="false"
                            toggle-mask
                            input-class="w-full"
                            required
                        />
                        <label for="passwordConfirmation">Confirmation</label>
                    </span>
                    <Button type="submit" label="Créer mon compte" class="w-full" :loading="authStore.loading" />
                </form>
                <p class="mt-4 text-sm text-center text-muted-color">
                    Déjà inscrit ?
                    <RouterLink :to="{ name: 'client-login' }" class="text-primary hover:underline">Se connecter</RouterLink>
                </p>
            </template>
        </Card>
    </div>
</template>
