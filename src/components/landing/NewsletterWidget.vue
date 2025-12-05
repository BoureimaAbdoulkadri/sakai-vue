<script setup lang="ts">
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

const email = ref('');
const loading = ref(false);
const errorMessage = ref('');
const toast = useToast();

async function submit() {
    errorMessage.value = '';

    if (!email.value || !email.value.includes('@')) {
        errorMessage.value = 'Merci de renseigner un email valide.';
        return;
    }

    loading.value = true;

    try {
        await new Promise((resolve) => setTimeout(resolve, 600));
        toast.add({
            severity: 'success',
            summary: 'Inscription confirmée',
            detail: 'Vous serez informé(e) des nouvelles collections.',
            life: 3000
        });
        email.value = '';
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div class="surface-card shadow-1 border-round px-4 py-5 md:px-6 lg:px-8 w-full md:w-8 lg:w-6 mx-auto">
        <div class="text-center mb-4">
            <p class="text-sm uppercase tracking-widest text-primary font-semibold mb-1">Newsletter</p>
            <h2 class="text-2xl font-bold mb-2">Restez au courant des nouvelles collections</h2>
            <p class="text-sm text-muted-color">
                Recevez nos nouveautés Enfant, Femme et Homme directement dans votre boîte mail.
            </p>
        </div>
        <form class="flex flex-column md:flex-row gap-3" @submit.prevent="submit">
            <div class="flex flex-column gap-2 flex-1">
                <InputText v-model="email" type="email" placeholder="Votre email" class="w-full" />
                <small v-if="errorMessage" class="p-error">{{ errorMessage }}</small>
            </div>
            <Button type="submit" label="S'inscrire" icon="pi pi-envelope" class="w-full md:w-auto" :loading="loading" />
        </form>
    </div>
</template>
