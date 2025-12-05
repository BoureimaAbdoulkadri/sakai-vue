<template>
    <div class="flex justify-content-center">
        <div class="w-full md:w-6 lg:w-4">
            <Card class="surface-card shadow-1 border-round">
                <template #title>
                    <div class="flex justify-content-between align-items-center">
                        <span>Connexion client</span>
                    </div>
                </template>
                <template #subtitle>
                    <span class="text-sm text-muted-color">
                        Connectez-vous pour accéder à vos commandes.
                    </span>
                </template>
                <template #content>
                    <div class="flex flex-column gap-3">
                        <Message v-if="formError" severity="error" :closable="false">
                            {{ formError }}
                        </Message>

                        <div class="field">
                            <label for="email" class="block font-semibold mb-2">Email</label>
                            <InputText
                                id="email"
                                v-model="form.email"
                                type="email"
                                class="w-full"
                                autocomplete="email"
                            />
                        </div>

                        <div class="field">
                            <label for="password" class="block font-semibold mb-2">Mot de passe</label>
                            <Password
                                id="password"
                                v-model="form.password"
                                :feedback="false"
                                toggleMask
                                class="w-full"
                                inputClass="w-full"
                                autocomplete="current-password"
                            />
                        </div>

                        <div class="flex align-items-center justify-content-between">
                            <RouterLink :to="{ name: 'client-register' }" class="text-sm text-primary cursor-pointer">
                                Créer un compte
                            </RouterLink>
                        </div>

                        <Button
                            label="Se connecter"
                            icon="pi pi-sign-in"
                            class="w-full mt-2"
                            :loading="clientAuth.loading"
                            @click="submit"
                        />
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useClientAuthStore } from '@/stores/clientAuth';

import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Message from 'primevue/message';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const clientAuth = useClientAuthStore();

const form = reactive({
    email: '',
    password: ''
});

const formError = ref('');

async function submit() {
    formError.value = '';

    if (!form.email || !form.password) {
        formError.value = 'Veuillez renseigner votre email et votre mot de passe.';
        return;
    }

    try {
        await clientAuth.login({
            email: form.email,
            password: form.password
        });

        const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/account/orders';

        toast.add({
            severity: 'success',
            summary: 'Connecté',
            detail: 'Connexion réussie.',
            life: 3000
        });

        router.push(redirect);
    } catch (error) {
        console.error(error);

        const message =
            error.response?.data?.message ||
            'Impossible de se connecter. Vérifiez vos identifiants.';

        formError.value = message;

        toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: message,
            life: 4000
        });
    }
}
</script>

<style scoped>
.field {
    margin-bottom: 0.75rem;
}
</style>
