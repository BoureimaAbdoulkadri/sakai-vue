<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const usps = computed(() => [
    {
        icon: 'pi-truck',
        title: t('client.usp.items.delivery.title'),
        description: t('client.usp.items.delivery.description')
    },
    {
        icon: 'pi-shield',
        title: t('client.usp.items.payment.title'),
        description: t('client.usp.items.payment.description')
    },
    {
        icon: 'pi-sync',
        title: t('client.usp.items.returns.title'),
        description: t('client.usp.items.returns.description')
    },
    {
        icon: 'pi-heart',
        title: t('client.usp.items.quality.title'),
        description: t('client.usp.items.quality.description')
    }
]);
</script>

<template>
    <div class="usp-strip">
        <div class="usp-grid">
            <article v-for="(usp, index) in usps" :key="usp.title" class="usp-item" :style="{ animationDelay: `${index * 80}ms` }">
                <div class="usp-icon-wrapper">
                    <i :class="`pi ${usp.icon}`"></i>
                </div>
                <div>
                    <h3>{{ usp.title }}</h3>
                    <p>{{ usp.description }}</p>
                </div>
            </article>
        </div>
    </div>
</template>

<style scoped>
.usp-strip {
    position: relative;
}

.usp-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
}

.usp-item {
    display: flex;
    gap: 1rem;
    padding: 1.5rem;
    border-radius: calc(var(--content-border-radius) * 1.2);
    background: color-mix(in srgb, var(--surface-card), transparent 8%);
    border: 1px solid color-mix(in srgb, var(--surface-border), transparent 40%);
    backdrop-filter: blur(8px);
    animation: fadeIn 0.5s ease backwards;
    transition: transform 0.35s ease, box-shadow 0.35s ease;
}

.usp-item:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
}

.usp-icon-wrapper {
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 50%;
    background: color-mix(in srgb, var(--primary-color), transparent 90%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-color);
    font-size: 1.35rem;
    transition: transform 0.3s ease;
}

.usp-item:hover .usp-icon-wrapper {
    transform: scale(1.08);
}

.usp-item h3 {
    margin: 0 0 0.25rem 0;
    font-size: 1rem;
    font-weight: 600;
}

.usp-item p {
    margin: 0;
    font-size: 0.9rem;
    color: var(--text-color-secondary);
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
