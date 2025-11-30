<script setup>
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { ref } from 'vue';

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
});

const submitting = ref(false);
const errorMessage = ref(null);

async function onRegister() {
    submitting.value = true;
    errorMessage.value = null;

    if (form.value.password !== form.value.confirmPassword) {
        errorMessage.value = 'Les mots de passe ne correspondent pas.';
        submitting.value = false;
        return;
    }

    try {
        // TODO: connecter sur /api/auth/register lorsque disponible.
        await authStore.register({
            name: form.value.name,
            email: form.value.email,
            password: form.value.password,
            password_confirmation: form.value.confirmPassword
        });

        await router.push('/auth/login');
    } catch (error) {
        errorMessage.value = 'Inscription impossible pour le moment.';
    } finally {
        submitting.value = false;
    }
}
</script>

<template>
    <FloatingConfigurator />
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <div class="text-center mb-8">
                        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Créer un compte</div>
                        <span class="text-muted-color font-medium">Rejoignez le back-office</span>
                    </div>

                    <form class="flex flex-col" @submit.prevent="onRegister">
                        <label for="name" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Nom complet</label>
                        <InputText id="name" type="text" placeholder="John Doe" class="w-full md:w-[30rem] mb-6" v-model="form.name" required />

                        <label for="email" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                        <InputText id="email" type="email" placeholder="adresse@email.com" class="w-full md:w-[30rem] mb-6" v-model="form.email" required />

                        <label for="password" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Mot de passe</label>
                        <Password id="password" v-model="form.password" placeholder="Password" :toggleMask="true" class="mb-6" fluid :feedback="false" required></Password>

                        <label for="confirmPassword" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Confirmez le mot de passe</label>
                        <Password id="confirmPassword" v-model="form.confirmPassword" placeholder="Confirm password" :toggleMask="true" class="mb-6" fluid :feedback="false" required></Password>

                        <p v-if="errorMessage" class="text-sm text-red-500 mb-4">{{ errorMessage }}</p>

                        <Button type="submit" label="Créer mon compte" class="w-full" :loading="submitting"></Button>
                        <Button label="Déjà un compte ? Se connecter" class="w-full mt-4" link as="router-link" to="/auth/login"></Button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>
