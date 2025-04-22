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
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get('/fhir/Practitioner');
        this.practitioners = response.data;
        this.loading = false;
      } catch (error: any) {
        this.loading = false;
        this.error = (error instanceof AxiosError && error.response?.data?.message) || (error instanceof Error && error.message) || 'Error al cargar los profesionales sanitarios.';
      }
    },

    async createPractitioner(practitionerData: FhirPractitioner): Promise<FhirPractitionerEntity | null> {
      this.loading = true;
      this.error = null;
      try {
        const practitionerJson = JSON.stringify(practitionerData);
        const response = await api.post('/fhir/Practitioner', practitionerJson, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        this.practitioners.push(response.data);
        this.loading = false;
        return response.data;
      } catch (error: unknown) {
        this.loading = false;
        const errorMessage = (error instanceof AxiosError && error.response?.data?.message) || (error instanceof Error && error.message) || 'Error al crear el profesional sanitario.';
        this.error = errorMessage;
        throw new Error(errorMessage);
      } finally {
        this.loading = false;
      }
    },

    async updatePractitioner(id: string, practitionerData: FhirPractitioner): Promise<FhirPractitionerEntity | null> {
      this.loading = true;
      this.error = null;
      try {
        const practitionerJson = JSON.stringify(practitionerData);
        const response = await api.put(`/practitioners/${id}`, practitionerJson, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const index = this.practitioners.findIndex(p => p.id === id);
        if (index !== -1) {
          this.practitioners[index] = response.data;
        }
        this.loading = false;
        return response.data;
      } catch (error: unknown) {
        this.loading = false;
        const errorMessage = (error instanceof AxiosError && error.response?.data?.message) || (error instanceof Error && error.message) || 'Error al actualizar el profesional sanitario.';
        this.error = errorMessage;
        throw new Error(errorMessage);
      } finally {
        this.loading = false;
      }
    },

    async deletePractitioner(id: string): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        await api.delete(`/practitioners/${id}`);
        this.practitioners = this.practitioners.filter(p => p.id !== id);
        this.loading = false;
      } catch (error: unknown) {
        this.loading = false;
        const errorMessage = (error instanceof AxiosError && error.response?.data?.message) || (error instanceof Error && error.message) || 'Error al eliminar el profesional sanitario.';
        this.error = errorMessage;
        throw new Error(errorMessage);
      } finally {
        this.loading = false;
      }
    },
  },
});
