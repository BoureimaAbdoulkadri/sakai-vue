<template>
    <div class="flex justify-content-center py-6">
        <div class="w-full md:w-6 lg:w-4">
            <Card class="surface-card shadow-1 border-round">
                <template #title>
                    <h1 class="text-2xl font-semibold mb-1">Créer un compte client</h1>
                </template>
                <template #subtitle>
                    <span class="text-sm text-muted-color">
                        Créez votre compte pour suivre vos commandes et profiter de tous nos services.
                    </span>
                </template>
                <template #content>
                    <div class="flex flex-column gap-3">
                        <Message v-if="formError" severity="error" :closable="false">
                            {{ formError }}
                        </Message>

                        <div class="field">
                            <label for="name" class="block font-semibold mb-2">Nom complet</label>
                            <InputText id="name" v-model="form.name" fluid autocomplete="name" />
                            <small v-if="fieldErrors.name" class="p-error">
                                {{ fieldErrors.name }}
                            </small>
                        </div>

                        <div class="field">
                            <label for="email" class="block font-semibold mb-2">Email</label>
                            <InputText
                                id="email"
                                v-model="form.email"
                                type="email"
                                fluid
                                autocomplete="email"
                            />
                            <small v-if="fieldErrors.email" class="p-error">
                                {{ fieldErrors.email }}
                            </small>
                        </div>

                        <div class="field">
                            <label for="password" class="block font-semibold mb-2">Mot de passe</label>
                            <Password
                                id="password"
                                v-model="form.password"
                                :feedback="true"
                                toggleMask
                                fluid
                            />
                            <small v-if="fieldErrors.password" class="p-error">
                                {{ fieldErrors.password }}
                            </small>
                        </div>

                        <div class="field">
                            <label for="password_confirmation" class="block font-semibold mb-2">
                                Confirmation du mot de passe
                            </label>
                            <Password
                                id="password_confirmation"
                                v-model="form.password_confirmation"
                                :feedback="false"
                                toggleMask
                                fluid
                            />
                        </div>

                        <div class="flex align-items-center justify-content-between">
                            <RouterLink :to="{ name: 'client-login' }" class="text-sm text-primary cursor-pointer hover:underline">
                                <i class="pi pi-sign-in mr-1" />
                                Déjà un compte ? Se connecter
                            </RouterLink>
                        </div>

                        <Button
                            label="Créer mon compte"
                            icon="pi pi-user-plus"
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
import { useRouter, RouterLink } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useClientAuthStore } from '@/stores/clientAuth';

import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Message from 'primevue/message';

const router = useRouter();
const toast = useToast();
const clientAuth = useClientAuthStore();

const form = reactive({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
});

const formError = ref('');
const fieldErrors = reactive({
    name: '',
    email: '',
    password: ''
});

function resetFieldErrors() {
    fieldErrors.name = '';
    fieldErrors.email = '';
    fieldErrors.password = '';
}

async function submit() {
    formError.value = '';
    resetFieldErrors();

    if (!form.name || !form.email || !form.password || !form.password_confirmation) {
        formError.value = 'Veuillez remplir tous les champs obligatoires.';
        return;
    }

    if (form.password !== form.password_confirmation) {
        formError.value = 'Les mots de passe ne correspondent pas.';
        return;
    }

    try {
        await clientAuth.register({
            name: form.name,
            email: form.email,
            password: form.password,
            password_confirmation: form.password_confirmation
        });

        toast.add({
            severity: 'success',
            summary: 'Compte créé',
            detail: 'Votre compte a été créé avec succès.',
            life: 4000
        });

        router.push({ name: 'client-orders' });
    } catch (error) {
        console.error(error);

        const data = error.response?.data;

        if (data?.errors) {
            if (data.errors.name?.[0]) fieldErrors.name = data.errors.name[0];
            if (data.errors.email?.[0]) fieldErrors.email = data.errors.email[0];
            if (data.errors.password?.[0]) fieldErrors.password = data.errors.password[0];

            formError.value = data.message || 'Veuillez corriger les erreurs du formulaire.';
        } else {
            formError.value = data?.message || 'Impossible de créer votre compte.';
        }

        toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: formError.value,
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
