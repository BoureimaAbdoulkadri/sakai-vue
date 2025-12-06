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
    <div class="newsletter-section">
        <div class="newsletter-background"></div>
        <div class="newsletter-content">
            <div class="newsletter-icon">
                <i class="pi pi-envelope"></i>
            </div>
            <h2>Restez informé de nos nouveautés</h2>
            <p>
                Inscrivez-vous à notre newsletter et soyez les premiers à découvrir nos nouvelles collections,
                offres exclusives et conseils mode pour toute la famille.
            </p>

            <form class="newsletter-form" @submit.prevent="submit">
                <div class="newsletter-input-group">
                    <div class="newsletter-field">
                        <InputText v-model="email" type="email" placeholder="Entrez votre adresse email" fluid size="large" />
                        <small v-if="errorMessage" class="p-error">{{ errorMessage }}</small>
                    </div>
                    <Button
                        type="submit"
                        label="S'inscrire gratuitement"
                        icon="pi pi-send"
                        iconPos="right"
                        size="large"
                        class="newsletter-cta"
                        :loading="loading"
                    />
                </div>
            </form>

            <ul class="newsletter-benefits">
                <li>
                    <i class="pi pi-check-circle"></i>
                    Offres exclusives
                </li>
                <li>
                    <i class="pi pi-check-circle"></i>
                    Nouveautés en avant-première
                </li>
                <li>
                    <i class="pi pi-check-circle"></i>
                    Désinscription facile
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
.newsletter-section {
    position: relative;
    border-radius: clamp(2.5rem, 4vw, 4rem);
    overflow: hidden;
    padding: clamp(2.5rem, 5vw, 4rem);
    isolation: isolate;
}

.newsletter-background {
    position: absolute;
    inset: 0;
    background: linear-gradient(120deg, color-mix(in srgb, var(--primary-color), transparent 75%), var(--primary-color));
    opacity: 0.25;
    filter: blur(10px);
    z-index: -1;
}

.newsletter-content {
    background: color-mix(in srgb, var(--surface-card), transparent 5%);
    border-radius: inherit;
    padding: clamp(2.25rem, 5vw, 4.5rem);
    text-align: center;
    border: 1px solid color-mix(in srgb, var(--surface-border), transparent 35%);
    box-shadow: 0 35px 60px rgba(15, 23, 42, 0.12);
    animation: scaleIn 0.8s ease;
}

.newsletter-icon {
    width: 84px;
    height: 84px;
    margin: 0 auto 1rem auto;
    border-radius: 999px;
    background: color-mix(in srgb, var(--primary-color), transparent 88%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-color);
    font-size: 2rem;
    animation: bounceIn 1s ease;
}

.newsletter-content h2 {
    font-size: clamp(2rem, 4vw, 3rem);
    margin-bottom: 1rem;
}

.newsletter-content p {
    max-width: 640px;
    margin: 0 auto 2rem auto;
    color: color-mix(in srgb, var(--text-color), transparent 20%);
    line-height: 1.75;
}

.newsletter-form {
    max-width: 720px;
    margin: 0 auto;
}

.newsletter-input-group {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}

.newsletter-field {
    flex: 1 1 240px;
}

.newsletter-field :deep(.p-inputtext) {
    height: 3.5rem;
    padding-inline: 1.35rem;
    border-radius: 999px;
}

.newsletter-field small {
    display: block;
    margin-top: 0.35rem;
    text-align: left;
}

.newsletter-cta {
    flex: 0 0 auto;
    min-width: 220px;
    height: 3.5rem;
    border-radius: 999px;
    font-weight: 600;
    box-shadow: 0 20px 40px rgba(15, 23, 42, 0.15);
}

.newsletter-benefits {
    margin: 2rem auto 0 auto;
    padding: 0;
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: center;
    color: var(--text-color-secondary);
}

.newsletter-benefits li {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}

.newsletter-benefits i {
    color: var(--primary-color);
}

@keyframes scaleIn {
    from {
        opacity: 0;
        transform: scale(0.96);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes bounceIn {
    0% {
        opacity: 0;
        transform: scale(0.3);
    }
    60% {
        opacity: 1;
        transform: scale(1.05);
    }
    80% {
        transform: scale(0.95);
    }
    100% {
        transform: scale(1);
    }
}

.newsletter-field :deep(.p-inputtext:focus) {
    transform: translateY(-2px);
    transition: transform 0.3s ease;
}

@media (max-width: 768px) {
    .newsletter-section {
        padding: 1rem;
    }

    .newsletter-content {
        padding: 1.5rem;
    }

    .newsletter-input-group {
        flex-direction: column;
    }

    .newsletter-cta {
        width: 100%;
    }
}
</style>
