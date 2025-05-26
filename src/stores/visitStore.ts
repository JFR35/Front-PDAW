// src/stores/visitStore.ts
import { defineStore } from 'pinia';
import api from '@/services/apiService';
import { AxiosError } from 'axios';
import type { Visit, VisitWithMeasurement } from '@/types/Visit';

interface VisitState {
  visits: Visit[];
  selectedVisit: VisitWithMeasurement | null;
  loading: boolean;
  error: string | null;
}

export const useVisitStore = defineStore('visitStore', {
  state: (): VisitState => ({
    visits: [],
    selectedVisit: null,
    loading: false,
    error: null,
  }),

  actions: {
    /**
     * Loads visits for a patient by their local ID.
     * @param patientLocalId The local ID of the patient.
     */
    async loadVisitsByPatient(patientLocalId: number) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get<Visit[]>(`/visits/patient/${patientLocalId}`);
        this.visits = response.data;
        this.loading = false;
      } catch (error: unknown) {
        this.loading = false;
        const errorMessage = (error instanceof AxiosError && error.response?.data?.message) || (error instanceof Error && error.message) || 'Error loading visits.';
        this.error = errorMessage;
        throw new Error(errorMessage);
      }
    },

    /**
     * Loads details of a specific visit, including measurements.
     * @param visitLocalId The local ID of the visit.
     */
    async loadVisitDetails(visitLocalId: number) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get<VisitWithMeasurement>(`/visits/${visitLocalId}/details`);
        this.selectedVisit = response.data;
        this.loading = false;
      } catch (error: unknown) {
        this.loading = false;
        const errorMessage = (error instanceof AxiosError && error.response?.data?.message) || (error instanceof Error && error.message) || 'Error loading visit details.';
        this.error = errorMessage;
        throw new Error(errorMessage);
      }
    },

    /**
     * Adds a new visit.
     * @param patientLocalId The local ID of the patient.
     * @param practitionerLocalId The local ID of the practitioner.
     * @param visitDate The visit date (ISO 8601).
     */
    async addVisit(patientLocalId: number, practitionerLocalId: number, visitDate: string) {
      this.loading = true;
      this.error = null;
      try {
        const visitData = {
          patientId: patientLocalId,
          practitionerId: practitionerLocalId,
          visitDate,
        };
        const response = await api.post<Visit>('/visits', visitData);
        this.visits.push(response.data);
        this.loading = false;
        return response.data;
      } catch (error: unknown) {
        this.loading = false;
        const errorMessage = (error instanceof AxiosError && error.response?.data?.message) || (error instanceof Error && error.message) || 'Error adding visit.';
        this.error = errorMessage;
        throw new Error(errorMessage);
      }
    },
  },

  getters: {
    sortedVisits: (state) => {
      return [...state.visits].sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
    },
  },
});
