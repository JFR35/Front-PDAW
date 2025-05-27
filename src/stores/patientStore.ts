// src/stores/patientStore.ts
import { defineStore } from 'pinia';
import api from '@/services/apiService';
import type { FhirPatient, PatientResponseBackend } from '@/types/PatientTyped';
import { AxiosError } from 'axios';

interface PatientState {
  patients: FhirPatient[];
  loading: boolean;
  error: string | null;
}

export const usePatientStore = defineStore('patientStore', {
  state: (): PatientState => ({
    patients: [],
    loading: false,
    error: null,
  }),

  actions: {
    async loadPatients() {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get<PatientResponseBackend[]>('/patients');
        this.patients = response.data
          .map((backendDto: PatientResponseBackend) => {
            try {
              const parsedPatient = JSON.parse(backendDto.fhirPatientJson) as FhirPatient;
              if (!parsedPatient.id && backendDto.fhirId) {
                parsedPatient.id = backendDto.fhirId;
              }
              // Ensure nationalId is valid
              if (!backendDto.nationalId || backendDto.nationalId === 'N/A') {
                console.warn('Invalid nationalId in backend DTO:', backendDto);
                return null;
              }
              parsedPatient.identifier = parsedPatient.identifier || [{ system: 'national', value: backendDto.nationalId }];
              return parsedPatient;
            } catch (e) {
              console.error('Error parsing FHIR patient JSON:', e, backendDto);
              return null;
            }
          })
          .filter((patient): patient is FhirPatient => patient !== null); // Remove invalid patients
        if (this.patients.length === 0) {
          this.error = 'No valid patients found in the database.';
        }
      } catch (error: any) {
        this.error =
          (error instanceof AxiosError && error.response?.data?.error) ||
          'Error al cargar los pacientes.';
        console.error('Error loading patients from backend:', error);
      } finally {
        this.loading = false;
      }
    },

    async createPatient(patientData: FhirPatient): Promise<FhirPatient | null> {
      this.loading = true;
      this.error = null;
      try {
        const nationalId = patientData.identifier?.[0]?.value;
        if (!nationalId) {
          this.error = 'El identificador nacional es obligatorio.';
          throw new Error(this.error);
        }
        const patientJson = JSON.stringify(patientData);
        const response = await api.post<PatientResponseBackend>(`/patients?nationalId=${nationalId}`, patientJson, {
          headers: { 'Content-Type': 'application/json' },
        });
        let createdFhirPatient: FhirPatient;
        try {
          createdFhirPatient = JSON.parse(response.data.fhirPatientJson) as FhirPatient;
          if (!createdFhirPatient.id && response.data.fhirId) {
            createdFhirPatient.id = response.data.fhirId;
          }
        } catch (e) {
          console.error('Error parsing created FHIR patient JSON:', e, response.data);
          this.error = 'Paciente creado, pero hubo un error al procesar su información FHIR.';
          return null;
        }
        this.patients.push(createdFhirPatient);
        return createdFhirPatient;
      } catch (error: any) {
        this.error =
          (error instanceof AxiosError && error.response?.data?.error) ||
          'Error al crear el paciente.';
        return null;
      } finally {
        this.loading = false;
      }
    },

    async getPatientByNationalId(nationalId: string): Promise<FhirPatient | null> {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get<PatientResponseBackend>(`/patients/${nationalId}`);
        let fhirPatient: FhirPatient;
        try {
          fhirPatient = JSON.parse(response.data.fhirPatientJson) as FhirPatient;
          if (!fhirPatient.id && response.data.fhirId) {
            fhirPatient.id = response.data.fhirId;
          }
        } catch (e) {
          console.error('Error parsing FHIR patient JSON:', e, response.data);
          this.error = 'Error al procesar la información FHIR del paciente.';
          return null;
        }
        return fhirPatient;
      } catch (error: any) {
        this.error =
          (error instanceof AxiosError && error.response?.data?.error) ||
          'Error al obtener el paciente.';
        return null;
      } finally {
        this.loading = false;
      }
    },

    async updatePatient(nationalId: string, patientData: FhirPatient): Promise<FhirPatient | null> {
      this.loading = true;
      this.error = null;
      if (!patientData || !patientData.identifier || !patientData.identifier[0]?.value) {
        this.error = 'Datos de paciente o identificador inválidos.';
        throw new Error(this.error);
      }
      try {
        const patientJsonString = JSON.stringify(patientData);
        const response = await api.put<PatientResponseBackend>(`/patients/${nationalId}`, patientJsonString, {
          headers: { 'Content-Type': 'application/json' },
        });
        const updatedFhirPatient = JSON.parse(response.data.fhirPatientJson) as FhirPatient;
        if (!updatedFhirPatient.id && response.data.fhirId) {
          updatedFhirPatient.id = response.data.fhirId;
        }
        const index = this.patients.findIndex((p) => p.identifier?.[0]?.value === nationalId);
        if (index !== -1) {
          this.patients[index] = updatedFhirPatient;
        }
        return updatedFhirPatient;
      } catch (error: any) {
        this.error =
          (error instanceof AxiosError && error.response?.data?.error) ||
          'Error al actualizar el paciente.';
        return null;
      } finally {
        this.loading = false;
      }
    },

    async deletePatient(nationalId: string): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        await api.delete(`/patients/${nationalId}`);
        this.patients = this.patients.filter((p) => p.identifier?.[0]?.value !== nationalId);
      } catch (error: unknown) {
        const errorMessage =
          (error instanceof AxiosError && error.response?.data?.message) ||
          (error instanceof Error && error.message) ||
          'Error al eliminar el paciente.';
        this.error = errorMessage;
        throw new Error(errorMessage);
      } finally {
        this.loading = false;
      }
    },
  },
});
