<template>
    <div class="grid">
        <div class="col-12">
            <div class="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-4 mb-4">
                <div>
                    <h2 class="text-2xl font-semibold mb-1">Paramètres du compte</h2>
                    <span class="text-sm text-muted-color">
                        Configuration de la boutique et du back-office
                    </span>
                    <div v-if="isDirty" class="mt-2 inline-flex align-items-center gap-2">
                        <i class="pi pi-circle-fill text-yellow-500 text-xs"></i>
                        <span class="text-xs text-yellow-600">
                            Modifications non enregistrées
                        </span>
                    </div>
                </div>
                <div>
                    <Button
                        label="Enregistrer"
                        icon="pi pi-check"
                        :disabled="!canSave"
                        :loading="saving"
                        severity="primary"
                        @click="saveSettings"
                    />
                </div>
            </div>
        </div>

        <div class="col-12 lg:col-6">
            <Card class="mb-4 surface-card shadow-1 border-round">
                <template #title>Informations générales</template>
                <template #subtitle>Données principales de la boutique</template>
                <template #content>
                    <div v-if="loading" class="flex flex-column gap-3">
                        <Skeleton height="2.5rem" />
                        <Skeleton height="2.5rem" />
                        <Skeleton height="2.5rem" />
                        <Skeleton height="2.5rem" />
                    </div>
                    <div v-else class="grid formgrid p-fluid">
                        <div class="col-12">
                            <label for="name" class="font-semibold">Nom de la boutique</label>
                            <InputText id="name" v-model="form.name" @input="markDirty" />
                        </div>
                        <div class="col-12">
                            <label for="slug" class="font-semibold">Slug</label>
                            <InputText
                                id="slug"
                                v-model="form.slug"
                                placeholder="Identifiant URL"
                                @input="markDirty"
                            />
                        </div>
                        <div class="col-12 md:col-6">
                            <label for="contact_email" class="font-semibold">Email de contact</label>
                            <InputText id="contact_email" v-model="form.contact_email" @input="markDirty" />
                        </div>
                        <div class="col-12 md:col-6">
                            <label for="support_email" class="font-semibold">Email support</label>
                            <InputText id="support_email" v-model="form.support_email" @input="markDirty" />
                        </div>
                    </div>
                </template>
            </Card>
        </div>

        <div class="col-12 lg:col-6">
            <Card class="mb-4 surface-card shadow-1 border-round">
                <template #title>Langue & localisation</template>
                <template #subtitle>Paramètres régionaux</template>
                <template #content>
                    <div v-if="loading" class="flex flex-column gap-3">
                        <Skeleton height="2.5rem" />
                        <Skeleton height="2.5rem" />
                        <Skeleton height="2.5rem" />
                    </div>
                    <div v-else class="grid formgrid p-fluid">
                        <div class="col-12 md:col-6">
                            <label for="default_locale" class="font-semibold">Langue</label>
                            <Select
                                id="default_locale"
                                v-model="form.default_locale"
                                :options="localeOptions"
                                optionLabel="label"
                                optionValue="value"
                                @change="markDirty"
                            />
                        </div>
                        <div class="col-12 md:col-6">
                            <label for="timezone" class="font-semibold">Fuseau horaire</label>
                            <Select
                                id="timezone"
                                v-model="form.timezone"
                                :options="timezoneOptions"
                                optionLabel="label"
                                optionValue="value"
                                @change="markDirty"
                            />
                        </div>
                        <div class="col-12 md:col-6">
                            <label for="currency" class="font-semibold">Devise</label>
                            <Select
                                id="currency"
                                v-model="form.currency"
                                :options="currencyOptions"
                                optionLabel="label"
                                optionValue="value"
                                @change="markDirty"
                            />
                        </div>
                    </div>
                </template>
            </Card>
        </div>

        <div class="col-12 lg:col-6">
            <Card class="mb-4 surface-card shadow-1 border-round">
                <template #title>Paramètres e-commerce</template>
                <template #subtitle>Comportement du checkout & stock</template>
                <template #content>
                    <div v-if="loading" class="flex flex-column gap-3">
                        <Skeleton height="2.5rem" />
                        <Skeleton height="2.5rem" />
                        <Skeleton height="2.5rem" />
                    </div>
                    <div v-else class="grid formgrid p-fluid">
                        <div class="col-12">
                            <div class="flex align-items-center justify-content-between gap-3">
                                <div>
                                    <div class="font-semibold mb-1">Checkout invité</div>
                                    <small class="text-muted-color">Autoriser les commandes sans compte.</small>
                                </div>
                                <InputSwitch v-model="form.enable_guest_checkout" @change="markDirty" />
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="flex align-items-center justify-content-between gap-3">
                                <div>
                                    <div class="font-semibold mb-1">Gestion de stock</div>
                                    <small class="text-muted-color">Décrémenter les stocks automatiquement.</small>
                                </div>
                                <InputSwitch v-model="form.enable_stock_management" @change="markDirty" />
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="flex align-items-center justify-content-between gap-3">
                                <div>
                                    <div class="font-semibold mb-1">Prix TTC</div>
                                    <small class="text-muted-color">Afficher les prix avec TVA incluse.</small>
                                </div>
                                <InputSwitch v-model="form.tax_included" @change="markDirty" />
                            </div>
                        </div>
                    </div>
                </template>
            </Card>
        </div>

        <div class="col-12 lg:col-6">
            <Card class="mb-4 surface-card shadow-1 border-round">
                <template #title>Branding & identité visuelle</template>
                <template #subtitle>Logo et couleurs</template>
                <template #content>
                    <div v-if="loading" class="flex flex-column gap-3">
                        <Skeleton height="2.5rem" />
                        <Skeleton height="2.5rem" />
                        <Skeleton height="2.5rem" />
                    </div>
                    <div v-else class="grid formgrid p-fluid">
                        <div class="col-12">
                            <label for="logo_url" class="font-semibold">URL du logo</label>
                            <InputText
                                id="logo_url"
                                v-model="form.logo_url"
                                placeholder="https://..."
                                @input="markDirty"
                            />
                            <div class="mt-3">
                                <img
                                    v-if="form.logo_url"
                                    :src="form.logo_url"
                                    alt="Logo"
                                    style="max-width: 160px; max-height: 80px; object-fit: contain"
                                />
                                <span v-else class="text-muted-color text-sm">Aucun logo défini.</span>
                            </div>
                        </div>
                        <div class="col-12 md:col-6">
                            <label class="font-semibold mb-2">Couleur principale</label>
                            <div class="flex align-items-center gap-2">
                                <ColorPicker v-model="form.primary_color" @change="markDirty" />
                                <span class="text-sm">{{ form.primary_color }}</span>
                            </div>
                        </div>
                        <div class="col-12 md:col-6">
                            <label class="font-semibold mb-2">Couleur secondaire</label>
                            <div class="flex align-items-center gap-2">
                                <ColorPicker v-model="form.secondary_color" @change="markDirty" />
                                <span class="text-sm">{{ form.secondary_color }}</span>
                            </div>
                        </div>
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>

<script setup>
import { useAccountSettings } from '@/composables/admin/useAccountSettings';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import InputSwitch from 'primevue/inputswitch';
import Button from 'primevue/button';
import Card from 'primevue/card';
import ColorPicker from 'primevue/colorpicker';
import Skeleton from 'primevue/skeleton';

const {
    loading,
    saving,
    form,
    localeOptions,
    currencyOptions,
    timezoneOptions,
    isDirty,
    canSave,
    markDirty,
    saveSettings
} = useAccountSettings();
</script>

<style scoped>
.card :deep(.p-inputtext),
.card :deep(.p-dropdown),
.card :deep(.p-button),
.card :deep(.p-colorpicker) {
    width: 100%;
}

@media screen and (min-width: 768px) {
    .card :deep(.p-inputtext),
    .card :deep(.p-dropdown),
    .card :deep(.p-colorpicker) {
        width: 100%;
    }
}
</style>
