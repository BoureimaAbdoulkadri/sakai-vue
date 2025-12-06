<template>
    <div class="flex justify-content-center py-6">
        <div class="w-full md:w-6 lg:w-4">
            <Card class="surface-card shadow-1 border-round">
                <template #title>
                    <h1 class="text-2xl font-semibold mb-1">{{ t('client.auth.register.title') }}</h1>
                </template>
                <template #subtitle>
                    <span class="text-sm text-muted-color">
                        {{ t('client.auth.register.subtitle') }}
                    </span>
                </template>
                <template #content>
                    <div class="flex flex-column gap-3">
                        <Message v-if="formError" severity="error" :closable="false">
                            {{ formError }}
                        </Message>

                        <div class="field-grid">
                            <div class="field">
                                <label for="first_name" class="block font-semibold mb-2">{{ t('client.auth.register.firstName') }}</label>
                                <InputText id="first_name" v-model="form.first_name" fluid autocomplete="given-name" />
                                <small v-if="fieldErrors.first_name" class="p-error">
                                    {{ fieldErrors.first_name }}
                                </small>
                            </div>
                            <div class="field">
                                <label for="last_name" class="block font-semibold mb-2">{{ t('client.auth.register.lastName') }}</label>
                                <InputText id="last_name" v-model="form.last_name" fluid autocomplete="family-name" />
                                <small v-if="fieldErrors.last_name" class="p-error">
                                    {{ fieldErrors.last_name }}
                                </small>
                            </div>
                        </div>

                        <div class="field">
                            <label for="email" class="block font-semibold mb-2">{{ t('client.auth.register.email') }}</label>
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

                        <div class="field-grid">
                            <div class="field">
                                <label for="phone" class="block font-semibold mb-2">{{ t('client.auth.register.phone') }}</label>
                                <InputText id="phone" v-model="form.phone" fluid autocomplete="tel" />
                                <small v-if="fieldErrors.phone" class="p-error">
                                    {{ fieldErrors.phone }}
                                </small>
                            </div>
                            <div class="field">
                                <label for="company" class="block font-semibold mb-2">{{ t('client.auth.register.company') }}</label>
                                <InputText id="company" v-model="form.company_name" fluid />
                                <small v-if="fieldErrors.company_name" class="p-error">
                                    {{ fieldErrors.company_name }}
                                </small>
                            </div>
                        </div>

                        <div class="field">
                            <label for="password" class="block font-semibold mb-2">{{ t('client.auth.register.password') }}</label>
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
                                {{ t('client.auth.register.passwordConfirmation') }}
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
                                {{ t('client.auth.register.loginLink') }}
                            </RouterLink>
                        </div>

                        <Button
                            :label="t('client.auth.register.submit')"
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

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import { useClientAuthStore } from '@/stores/clientAuth';

import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Message from 'primevue/message';

const router = useRouter();
const toast = useToast();
const clientAuth = useClientAuthStore();
const { t } = useI18n();

interface RegisterForm {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    company_name?: string;
    password: string;
    password_confirmation: string;
}

const form = reactive<RegisterForm>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company_name: '',
    password: '',
    password_confirmation: ''
});

const formError = ref('');
const fieldErrors = reactive({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company_name: '',
    password: ''
});

function resetFieldErrors() {
    fieldErrors.first_name = '';
    fieldErrors.last_name = '';
    fieldErrors.email = '';
    fieldErrors.phone = '';
    fieldErrors.company_name = '';
    fieldErrors.password = '';
}

async function submit() {
    formError.value = '';
    resetFieldErrors();

    if (
        !form.first_name ||
        !form.last_name ||
        !form.email ||
        !form.password ||
        !form.password_confirmation
    ) {
        formError.value = t('client.auth.register.formError');
        return;
    }

    if (form.password !== form.password_confirmation) {
        formError.value = t('client.auth.register.passwordMismatch');
        return;
    }

    try {
        await clientAuth.register({
            first_name: form.first_name,
            last_name: form.last_name,
            email: form.email,
            phone: form.phone || undefined,
            company_name: form.company_name || undefined,
            password: form.password,
            password_confirmation: form.password_confirmation
        });

        toast.add({
            severity: 'success',
            summary: t('client.auth.toast.created'),
            detail: t('client.auth.register.success'),
            life: 4000
        });

        router.push({ name: 'client-catalog' });
    } catch (error) {
        console.error(error);

        const data = error.response?.data;

        if (data?.errors) {
            if (data.errors.first_name?.[0]) fieldErrors.first_name = data.errors.first_name[0];
            if (data.errors.last_name?.[0]) fieldErrors.last_name = data.errors.last_name[0];
            if (data.errors.email?.[0]) fieldErrors.email = data.errors.email[0];
            if (data.errors.phone?.[0]) fieldErrors.phone = data.errors.phone[0];
            if (data.errors.company_name?.[0]) fieldErrors.company_name = data.errors.company_name[0];
            if (data.errors.password?.[0]) fieldErrors.password = data.errors.password[0];

            formError.value = data.message || t('client.auth.register.fixErrors');
        } else {
            formError.value = data?.message || t('client.auth.register.genericError');
        }

        toast.add({
            severity: 'error',
            summary: t('client.auth.toast.error'),
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

.field-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}
</style>
