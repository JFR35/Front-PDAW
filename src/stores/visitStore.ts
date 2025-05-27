// src/stores/visitStore.ts
import { defineStore } from 'pinia';
import api from '@/services/apiService';
import type { VisitRequestFrontend, VisitResponseBackend, Visit } from '@/types/VisitTyped';
import { AxiosError } from 'axios';

interface VisitState {
  visits: Visit[];
  currentVisit: Visit | null;
  loading: boolean;
  error: string | null;
}

function mapVisitResponseToVisit(backendDto: VisitResponseBackend): Visit {
  return {
    uuid: backendDto.visitUuid,
    patientNationalId: backendDto.patientNationalId,
    practitionerNationalId: backendDto.practitionerNationalId,
    practitionerName: backendDto.practitionerName,
    date: new Date(backendDto.visitDate),
    bloodPressureCompositionId: backendDto.bloodPressureCompositionId,
  };
}

export const useVisitStore = defineStore('visitStore', {
  state: (): VisitState => ({
    visits: [],
    currentVisit: null,
    loading: false,
    error: null,
  }),

  actions: {
    async createVisitWithBloodPressure(requestData: VisitRequestFrontend): Promise<Visit | null> {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post<VisitResponseBackend>('/visits', requestData);
        const newVisit = mapVisitResponseToVisit(response.data);
        this.visits.push(newVisit);
        this.currentVisit = newVisit;
        return newVisit;
      } catch (error: any) {
        this.error =
          (error instanceof AxiosError && error.response?.data?.message) ||
          'Error al crear la visita.';
        console.error('Error creating visit:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async getVisitByUuid(visitUuid: string): Promise<Visit | null> {
      if (!visitUuid) {
        this.error = 'Visit UUID is required.';
        return null;
      }
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get<VisitResponseBackend>(`/visits/${visitUuid}`);
        const fetchedVisit = mapVisitResponseToVisit(response.data);
        this.currentVisit = fetchedVisit;
        return fetchedVisit;
      } catch (error: any) {
        this.error =
          (error instanceof AxiosError && error.response?.data?.message) ||
          'Error al obtener la visita.';
        console.error('Error fetching visit by UUID:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async getVisitsByPatientNationalId(patientNationalId: string): Promise<Visit[] | null> {
      if (!patientNationalId || patientNationalId === 'N/A') {
        this.error = 'Patient National ID is required and must be valid.';
        console.error('Error: Patient National ID is undefined or invalid:', patientNationalId);
        return null;
      }
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get<VisitResponseBackend[]>(`/visits/patient/${patientNationalId}`);
        this.visits = response.data.map(mapVisitResponseToVisit);
        return this.visits;
      } catch (error: any) {
        this.error =
          (error instanceof AxiosError && error.response?.data?.message) ||
          'Error al obtener las visitas del paciente.';
        console.error('Error fetching visits by patient national ID:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },
  },
});
