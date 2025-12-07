<template>
    <div :class="fieldClasses">
        <label v-if="label" :class="labelClasses" :for="id">
            {{ label }}
            <span v-if="required" class="text-red-500 ml-1">*</span>
        </label>
        <small v-if="hint" class="block text-muted-color mb-2">{{ hint }}</small>
        <slot/>
        <small v-if="error" class="block text-red-500 mt-1">{{ error }}</small>
    </div>
</template>

<script setup>
import {computed} from 'vue';

const props = defineProps({
    label: {
        type: String,
        default: null
    },
    id: {
        type: String,
        default: null
    },
    hint: {
        type: String,
        default: null
    },
    error: {
        type: String,
        default: null
    },
    required: {
        type: Boolean,
        default: false
    },
    col: {
        type: String,
        default: 'col-12'
    }
});

const fieldClasses = computed(() => props.col);
const labelClasses = computed(() => {
    return 'font-semibold block mb-2';
});
</script>

<style scoped>
/* Style professionnel Sakai pour les champs de formulaire */
:deep(.p-inputtext),
:deep(.p-inputnumber-input),
:deep(.p-textarea),
:deep(.p-select),
:deep(.p-calendar) {
    width: 100%;
    border-radius: 6px;
    transition: all 0.2s;
}

:deep(.p-inputtext:focus),
:deep(.p-inputnumber-input:focus),
:deep(.p-textarea:focus),
:deep(.p-select:focus),
:deep(.p-calendar:focus-within) {
    box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
}

:deep(.p-inputtext.p-invalid),
:deep(.p-inputnumber-input.p-invalid),
:deep(.p-textarea.p-invalid),
:deep(.p-select.p-invalid) {
    border-color: #ef4444;
}
</style>
