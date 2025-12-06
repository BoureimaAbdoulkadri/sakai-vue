<script setup lang="ts">
import { useRouter } from 'vue-router';
import Button from 'primevue/button';

const router = useRouter();

const categories = [
    {
        key: 'kids',
        label: 'Enfant',
        description: 'Vêtements confortables et colorés pour vos enfants',
        icon: 'pi-star',
        image: 'https://images.unsplash.com/photo-1519457431-44caa965772d?w=600&h=800&fit=crop',
        color: 'bg-pink-100',
        iconColor: 'text-pink-600'
    },
    {
        key: 'women',
        label: 'Femme',
        description: 'Collections tendances pour toutes les occasions',
        icon: 'pi-heart',
        image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&h=800&fit=crop',
        color: 'bg-purple-100',
        iconColor: 'text-purple-600'
    },
    {
        key: 'men',
        label: 'Homme',
        description: 'Des pièces intemporelles et modernes',
        icon: 'pi-user',
        image: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=600&h=800&fit=crop',
        color: 'bg-cyan-100',
        iconColor: 'text-cyan-600'
    }
];

function goToCategory() {
    router.push({ name: 'client-catalog' });
}
</script>

<template>
    <div class="categories-preview">
        <div class="section-heading">
            <p>Nos Collections</p>
            <h2>Enfant, Femme & Homme</h2>
            <span>Découvrez nos univers mode pensés pour toute la famille</span>
        </div>

        <div class="categories-grid">
            <article
                v-for="(category, index) in categories"
                :key="category.key"
                class="category-card"
                :style="{ animationDelay: `${index * 120}ms` }"
                @click="goToCategory"
            >
                <div class="category-image-wrapper">
                    <img :src="category.image" :alt="category.label" />
                    <div class="category-overlay"></div>
                    <div class="category-badge">
                        <span>
                            <i :class="`pi ${category.icon}`"></i>
                        </span>
                    </div>
                </div>

                <div class="category-content">
                    <h3>{{ category.label }}</h3>
                    <p>{{ category.description }}</p>
                    <Button
                        label="Découvrir"
                        icon="pi pi-arrow-right"
                        iconPos="right"
                        text
                        class="category-cta"
                    />
                </div>
            </article>
        </div>
    </div>
</template>

<style scoped>
.categories-preview {
    display: flex;
    flex-direction: column;
    gap: 3rem;
}

.section-heading {
    text-align: center;
}

.section-heading p {
    text-transform: uppercase;
    letter-spacing: 0.3rem;
    font-size: 0.85rem;
    color: var(--primary-color);
    margin-bottom: 0.5rem;
    font-weight: 600;
}

.section-heading h2 {
    margin: 0 0 0.75rem 0;
    font-size: clamp(2rem, 4vw, 2.75rem);
}

.section-heading span {
    color: var(--text-color-secondary);
    font-size: 1rem;
    letter-spacing: 0.02em;
}

.categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1.5rem;
}

.category-card {
    border-radius: 2.25rem;
    overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--surface-border), transparent 35%);
    background: color-mix(in srgb, var(--surface-card), transparent 5%);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    animation: fadeInUp 0.6s ease both;
    transition: transform 0.45s ease, box-shadow 0.45s ease;
}

.category-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 30px 60px rgba(15, 23, 42, 0.15);
}

.category-image-wrapper {
    position: relative;
    height: 320px;
}

.category-image-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
}

.category-card:hover img {
    transform: scale(1.08);
}

.category-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, transparent 65%);
}

.category-badge {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
}

.category-badge span {
    display: inline-flex;
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    color: var(--primary-color);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
}

.category-content {
    padding: 2.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    flex: 1;
}

.category-content h3 {
    margin: 0;
    font-size: 1.5rem;
    letter-spacing: 0.04em;
}

.category-content p {
    margin: 0;
    color: color-mix(in srgb, var(--text-color), transparent 25%);
    line-height: 1.7;
}

.category-cta {
    align-self: flex-start;
    font-weight: 600;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
