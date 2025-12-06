<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
    <div class="surface-section border-top-1 border-surface-200">
        <div class="px-6 md:px-12 lg:px-20 py-8">
            <div class="grid">
                <!-- Logo & Description -->
                <div class="col-12 md:col-3 mb-4">
                    <div class="flex align-items-center gap-2 mb-3">
                        <i class="pi pi-shopping-bag text-primary text-3xl"></i>
                        <span class="text-surface-900 dark:text-surface-0 font-bold text-xl">EDO</span>
                    </div>
                    <p class="text-sm text-surface-600 line-height-3 mb-3">
                        Mode Enfant, Femme & Homme. Découvrez nos collections pensées pour toute la famille.
                    </p>
                    <div class="flex gap-3">
                        <a href="#" class="text-surface-600 hover:text-primary transition-colors">
                            <i class="pi pi-facebook text-xl"></i>
                        </a>
                        <a href="#" class="text-surface-600 hover:text-primary transition-colors">
                            <i class="pi pi-instagram text-xl"></i>
                        </a>
                        <a href="#" class="text-surface-600 hover:text-primary transition-colors">
                            <i class="pi pi-twitter text-xl"></i>
                        </a>
                    </div>
                </div>

                <!-- Collections -->
                <div class="col-12 md:col-3 mb-4">
                    <h5 class="font-semibold text-surface-900 mb-3">Collections</h5>
                    <ul class="list-none p-0 m-0">
                        <li class="mb-2">
                            <a @click="router.push({ name: 'client-catalog' })" class="text-surface-600 hover:text-primary cursor-pointer transition-colors">
                                Enfant
                            </a>
                        </li>
                        <li class="mb-2">
                            <a @click="router.push({ name: 'client-catalog' })" class="text-surface-600 hover:text-primary cursor-pointer transition-colors">
                                Femme
                            </a>
                        </li>
                        <li class="mb-2">
                            <a @click="router.push({ name: 'client-catalog' })" class="text-surface-600 hover:text-primary cursor-pointer transition-colors">
                                Homme
                            </a>
                        </li>
                        <li class="mb-2">
                            <a @click="router.push({ name: 'client-catalog' })" class="text-surface-600 hover:text-primary cursor-pointer transition-colors">
                                Nouveautés
                            </a>
                        </li>
                    </ul>
                </div>

                <!-- Service Client -->
                <div class="col-12 md:col-3 mb-4">
                    <h5 class="font-semibold text-surface-900 mb-3">Service Client</h5>
                    <ul class="list-none p-0 m-0">
                        <li class="mb-2">
                            <a class="text-surface-600 hover:text-primary cursor-pointer transition-colors">
                                Contact
                            </a>
                        </li>
                        <li class="mb-2">
                            <a class="text-surface-600 hover:text-primary cursor-pointer transition-colors">
                                Livraison & Retours
                            </a>
                        </li>
                        <li class="mb-2">
                            <a class="text-surface-600 hover:text-primary cursor-pointer transition-colors">
                                Guide des tailles
                            </a>
                        </li>
                        <li class="mb-2">
                            <a class="text-surface-600 hover:text-primary cursor-pointer transition-colors">
                                FAQ
                            </a>
                        </li>
                    </ul>
                </div>

                <!-- Informations -->
                <div class="col-12 md:col-3 mb-4">
                    <h5 class="font-semibold text-surface-900 mb-3">Informations</h5>
                    <ul class="list-none p-0 m-0">
                        <li class="mb-2">
                            <a class="text-surface-600 hover:text-primary cursor-pointer transition-colors">
                                À propos
                            </a>
                        </li>
                        <li class="mb-2">
                            <a class="text-surface-600 hover:text-primary cursor-pointer transition-colors">
                                Mentions légales
                            </a>
                        </li>
                        <li class="mb-2">
                            <a class="text-surface-600 hover:text-primary cursor-pointer transition-colors">
                                CGV
                            </a>
                        </li>
                        <li class="mb-2">
                            <a class="text-surface-600 hover:text-primary cursor-pointer transition-colors">
                                Politique de confidentialité
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="border-top-1 border-surface-200 pt-4 mt-4">
                <div class="flex flex-column md:flex-row justify-content-between align-items-center gap-3">
                    <p class="text-sm text-surface-600 m-0">
                        © {{ new Date().getFullYear() }} EDO. Tous droits réservés.
                    </p>
                    <div class="flex gap-4">
                        <i class="pi pi-credit-card text-2xl text-surface-400"></i>
                        <i class="pi pi-paypal text-2xl text-surface-400"></i>
                        <i class="pi pi-shield text-2xl text-surface-400"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
a {
    font-size: 0.875rem;
}
</style>
