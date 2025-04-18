// src/stores/practitionerStore.ts
import { defineStore } from 'pinia';
import api from '@/services/apiService';
import type { FhirPractitionerEntity, FhirPractitioner } from '@/types/FhirPractitioner';
import { AxiosError } from 'axios';

interface PractitionerState {
    practitioners: FhirPractitionerEntity[];
    loading: boolean;
    error: string | null;
}

export const usePractitionerStore = defineStore('practitionerStore', {
    state: (): PractitionerState => ({
        practitioners: [],
        loading: false,
        error: null,
    }),

    actions: {
        async loadPractitioners() {
            // ... (tu lógica para cargar practitioners)
        },

        async createPractitioner(practitionerData: FhirPractitioner, userId: string) {
            this.loading = true;
            try {
                const practitionerJson = JSON.stringify(practitionerData);
                const response = await api.post(`/practitioners?userId=${userId}`, practitionerJson, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                await this.loadPractitioners();
                return response.data;
            } catch (error: unknown) {
                const errorMessage = (error instanceof AxiosError && error.response?.data?.message) || (error instanceof Error && error.message) || 'Error creating practitioner';
                this.error = errorMessage;
                throw new Error(errorMessage);
            } finally {
                this.loading = false;
            }
        },

        async updatePractitioner(id: string, practitionerData: FhirPractitioner) {
            // ... (tu lógica para actualizar practitioners)
        },

        async deletePractitioner(id: string) {
            // ... (tu lógica para eliminar practitioners)
        },
    },
});
