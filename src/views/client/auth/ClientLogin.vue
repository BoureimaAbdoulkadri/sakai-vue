<template>
    <div class="flex justify-content-center py-6">
        <div class="w-full md:w-6 lg:w-4">
            <Card class="surface-card shadow-1 border-round">
                <template #title>
                    <h1 class="text-2xl font-semibold mb-1">{{ t('client.auth.login.title') }}</h1>
                </template>
                <template #subtitle>
                    <span class="text-sm text-muted-color">
                        {{ t('client.auth.login.subtitle') }}
                    </span>
                </template>
                <template #content>
                    <div class="flex flex-column gap-3">
                        <Message v-if="formError" severity="error" :closable="false">
                            {{ formError }}
                        </Message>

                        <div class="field">
                            <label for="email" class="block font-semibold mb-2">{{ t('client.auth.login.email') }}</label>
                            <InputText
                                id="email"
                                v-model="form.email"
                                type="email"
                                fluid
                                autocomplete="email"
                            />
                        </div>

                        <div class="field">
                            <label for="password" class="block font-semibold mb-2">{{ t('client.auth.login.password') }}</label>
                            <Password
                                id="password"
                                v-model="form.password"
                                :feedback="false"
                                toggleMask
                                fluid
                                autocomplete="current-password"
                            />
                        </div>

                        <div class="flex align-items-center justify-content-between">
                            <RouterLink :to="{ name: 'client-register' }" class="text-sm text-primary cursor-pointer hover:underline">
                                <i class="pi pi-user-plus mr-1" />
                                {{ t('client.auth.login.create') }}
                            </RouterLink>
                        </div>

                        <Button
                            :label="t('client.auth.login.submit')"
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

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
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
const { t } = useI18n();

interface LoginForm {
    email: string;
    password: string;
}

const form = reactive<LoginForm>({
    email: '',
    password: ''
});

const formError = ref('');

async function submit() {
    formError.value = '';

    if (!form.email || !form.password) {
        formError.value = t('client.auth.login.formError');
        return;
    }

    try {
        await clientAuth.login({
            email: form.email,
            password: form.password
        });

        const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : undefined;

        toast.add({
            severity: 'success',
            summary: t('client.auth.toast.logged'),
            detail: t('client.auth.login.success'),
            life: 3000
        });

        if (redirect) {
            router.push(redirect);
        } else {
            router.push({ name: 'client-catalog' });
        }
    } catch (error) {
        console.error(error);

        const message = error.response?.data?.message || t('client.auth.login.error');

        formError.value = message;

        toast.add({
            severity: 'error',
            summary: t('client.auth.toast.error'),
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
