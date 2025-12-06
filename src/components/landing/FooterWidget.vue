<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t } = useI18n();

const collectionLinks = computed(() => t('client.footer.collections.items', { returnObjects: true }) as string[]);
const serviceLinks = computed(() => t('client.footer.service.items', { returnObjects: true }) as string[]);
const infoLinks = computed(() => t('client.footer.info.items', { returnObjects: true }) as string[]);
const currentYear = new Date().getFullYear();
</script>

<template>
    <div class="landing-footer-widget">
        <div class="footer-grid">
            <div class="footer-brand">
                <div class="footer-logo">
                    <i class="pi pi-shopping-bag"></i>
                    <span>EDO</span>
                </div>
                <p>{{ t('client.footer.tagline') }}</p>
                <div class="footer-socials">
                    <a href="#" aria-label="Facebook">
                        <i class="pi pi-facebook"></i>
                    </a>
                    <a href="#" aria-label="Instagram">
                        <i class="pi pi-instagram"></i>
                    </a>
                    <a href="#" aria-label="Twitter">
                        <i class="pi pi-twitter"></i>
                    </a>
                </div>
            </div>

            <div class="footer-links">
                <h5>{{ t('client.footer.collections.title') }}</h5>
                <button v-for="link in collectionLinks" :key="link" type="button" @click="router.push({ name: 'client-catalog' })">
                    {{ link }}
                </button>
            </div>

            <div class="footer-links">
                <h5>{{ t('client.footer.service.title') }}</h5>
                <button v-for="link in serviceLinks" :key="link" type="button">
                    {{ link }}
                </button>
            </div>

            <div class="footer-links">
                <h5>{{ t('client.footer.info.title') }}</h5>
                <button v-for="link in infoLinks" :key="link" type="button">
                    {{ link }}
                </button>
            </div>
        </div>

        <div class="footer-bottom">
            <p>{{ t('client.footer.rights', { year: currentYear }) }}</p>
            <div class="footer-payments">
                <i class="pi pi-credit-card"></i>
                <i class="pi pi-paypal"></i>
                <i class="pi pi-shield"></i>
            </div>
        </div>
    </div>
</template>

<style scoped>
.landing-footer-widget {
    padding: clamp(3rem, 6vw, 4.5rem) 0;
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
}

.footer-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1.5rem 2.5rem;
}

.footer-brand {
    grid-column: span 2;
    min-width: 260px;
}

.footer-logo {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
}

.footer-logo i {
    color: var(--primary-color);
    font-size: 1.75rem;
}

.footer-brand p {
    margin: 0 0 1.25rem 0;
    color: color-mix(in srgb, var(--text-color), transparent 30%);
    line-height: 1.7;
}

.footer-socials {
    display: flex;
    gap: 0.75rem;
}

.footer-socials a {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--surface-border), transparent 40%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: color-mix(in srgb, var(--text-color), transparent 20%);
    transition: all 0.3s ease;
}

.footer-socials a:hover {
    color: var(--primary-color);
    border-color: var(--primary-color);
}

.footer-links {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.footer-links h5 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
}

.footer-links button {
    background: none;
    border: none;
    padding: 0;
    text-align: left;
    color: color-mix(in srgb, var(--text-color), transparent 30%);
    font-size: 0.95rem;
    cursor: pointer;
    transition: color 0.3s ease, transform 0.2s ease;
}

.footer-links button:hover {
    color: var(--primary-color);
    transform: translateX(4px);
}

.footer-bottom {
    border-top: 1px solid color-mix(in srgb, var(--surface-border), transparent 35%);
    padding-top: 1.75rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 1rem;
    font-size: 0.9rem;
    color: color-mix(in srgb, var(--text-color), transparent 35%);
}

.footer-payments {
    display: flex;
    gap: 0.75rem;
    font-size: 1.5rem;
    color: color-mix(in srgb, var(--text-color), transparent 55%);
}

@media (max-width: 768px) {
    .footer-brand {
        grid-column: span 1;
    }
}
</style>
