// src/stores/practitionerStore.ts
import { defineStore } from 'pinia';
import api from '@/services/apiService';
import type { FhirPractitionerEntity } from '@/types/FhirPractitioner';
import  { AxiosError } from 'axios'; // Import AxiosError for type safety

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
      this.loading = true;
      try {
        const response = await api.get('/practitioners');
        this.practitioners = response.data.map((entity: FhirPractitionerEntity) => ({
          ...entity,
          parsedPractitioner: JSON.parse(entity.resourcePractitionerJson),
        }));
      } catch (error: AxiosError) {
        const errorMessage =
          error.response?.data?.message || error.message || 'Error loading practitioners';
        console.error('Error loading practitioners:', error.response?.data || error.message);
        this.error = errorMessage;
      } finally {
        this.loading = false;
      }
    },

    async createPractitioner(practitionerJson: string, userId: string) {
      try {
        const response = await api.post(`/practitioners/${userId}`, practitionerJson, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        await this.loadPractitioners();
        return response.data;
      } catch (error: unknown) {
        throw new Error(error instanceof Error ? error.message : 'Error creating practitioner');
      }
    },

    async updatePractitioner(id: string, practitionerJson: string) {
      try {
        const response = await api.put(`/practitioners/${id}`, practitionerJson, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        await this.loadPractitioners();
        return response.data;
      } catch (error: unknown) {
        throw new Error(error instanceof Error ? error.message : 'Error updating practitioner');
      }
    },

    async deletePractitioner(id: string) {
      try {
        await api.delete(`/practitioners/${id}`);
        await this.loadPractitioners();
      } catch (error: unknown) {
        throw new Error(error instanceof Error ? error.message : 'Error deleting practitioner');
      }
    },
  },
});
