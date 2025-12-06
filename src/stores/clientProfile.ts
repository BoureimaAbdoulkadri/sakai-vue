import { defineStore } from 'pinia';
import { ref } from 'vue';
import type {
    ClientProfile,
    ClientProfileResponse,
    ClientProfileStats,
    UpdateClientProfilePayload
} from '@/services/clientProfile';
import { getClientProfile, updateClientProfile } from '@/services/clientProfile';
import { useClientAuthStore } from '@/stores/clientAuth';
import type { ClientUser } from '@/services/authClient';

export const useClientProfileStore = defineStore('clientProfile', () => {
    const profile = ref<ClientProfile | null>(null);
    const stats = ref<ClientProfileStats | null>(null);
    const loadingProfile = ref(false);
    const updatingProfile = ref(false);

    async function fetchProfile(): Promise<ClientProfileResponse> {
        loadingProfile.value = true;
        try {
            const response = await getClientProfile();
            profile.value = response.profile;
            stats.value = response.stats ?? null;

            const authStore = useClientAuthStore();
            if (response.profile) {
                authStore.setCustomer(mapProfileToClientUser(response.profile, authStore.customer));
            }

            return response;
        } finally {
            loadingProfile.value = false;
        }
    }

    async function updateProfile(payload: UpdateClientProfilePayload): Promise<ClientProfileResponse> {
        updatingProfile.value = true;
        try {
            const response = await updateClientProfile(payload);
            profile.value = response.profile;

            const authStore = useClientAuthStore();
            if (response.profile) {
                authStore.setCustomer(mapProfileToClientUser(response.profile, authStore.customer));
            }

            return response;
        } finally {
            updatingProfile.value = false;
        }
    }

    function mapProfileToClientUser(profile: ClientProfile, current: ClientUser | null): ClientUser {
        return {
            ...(current ?? {}),
            id: profile.id,
            name: profile.name,
            email: profile.email,
            first_name: profile.first_name ?? undefined,
            last_name: profile.last_name ?? undefined
        } as ClientUser;
    }

    return {
        profile,
        stats,
        loadingProfile,
        updatingProfile,
        fetchProfile,
        updateProfile
    };
});
