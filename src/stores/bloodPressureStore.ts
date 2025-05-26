// src/stores/bloodPressureStore.ts
import { defineStore } from 'pinia';
import api from '@/services/apiService';
import { AxiosError } from 'axios';
import type { BloodPressureRecordRequest } from '@/types/Visit';

interface BloodPressureState {
  loading: boolean;
  error: string | null;
}

export const useBloodPressureStore = defineStore('bloodPressureStore', {
  state: (): BloodPressureState => ({
    loading: false,
    error: null,
  }),

  actions: {
    /**
     * Saves a new blood pressure measurement for a patient.
     * @param nationalId The patient's national ID (e.g., "12345678D").
     * @param data The measurement data.
     */
    async addBloodPressureMeasurement(nationalId: string, data: BloodPressureRecordRequest) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post(`/observations/blood-pressure/${nationalId}`, data);
        this.loading = false;
        return response.data; // Returns { compositionId, visitLocalId }
      } catch (error: unknown) {
        this.loading = false;
        const errorMessage = (error instanceof AxiosError && error.response?.data?.message) || (error instanceof Error && error.message) || 'Error saving blood pressure measurement.';
        this.error = errorMessage;
        throw new Error(errorMessage);
      }
    },
  },
});
