// src/stores/patientStore.ts
import { defineStore } from 'pinia';
import api from '@/services/apiService';
import type { FhirPatientEntity, FhirPatient } from '@/types/PatientTyped'; // Asegúrate que la ruta sea correcta
import { AxiosError } from 'axios';

interface PatientState {
  patients: FhirPatient[]; // Almacenaremos FhirPatient directamente para la UI
  loading: boolean;
  error: string | null;
}

function validatePatient(patient: FhirPatient): boolean {
  // Validaciones basadas en tu StructureDefinition y JSON de ejemplo
  if (!patient.identifier || patient.identifier.length === 0 || !patient.identifier[0].value || !patient.identifier[0].system) return false;
  if (!patient.name || patient.name.length === 0 || !patient.name[0].family || !patient.name[0].given || patient.name[0].given.length === 0) return false;
  if (!patient.gender) return false;
  if (!patient.birthDate) return false;

  // Añade aquí cualquier otra validación requerida por tu StructureDefinition o lógica de negocio
  // Por ejemplo, si telecom o address fueran obligatorios en Patient, los añadirías aquí.

  return true;
}

export const usePatientStore = defineStore('patientStore', {
  state: (): PatientState => ({
    patients: [],
    loading: false,
    error: null,
  }),

  actions: {
    /**
     * Carga todos los pacientes del backend.
     * Asume que el backend GET /api/patients devuelve List<PatientMasterIndex>.
     * Necesitamos mapear eso a FhirPatient.
     */
    async loadPatients() {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get<FhirPatientEntity[]>('/patients'); // Asume que la URL es /api/patients
        // Mapear PatientMasterIndex a FhirPatient para el estado del store
        this.patients = response.data
          .filter(pmi => pmi.parsedPatient) // Asegúrate de que parsedPatient exista
          .map(pmi => pmi.parsedPatient as FhirPatient); // Castear a FhirPatient
        this.loading = false;
      } catch (error: any) {
        this.loading = false;
        this.error = (error instanceof AxiosError && error.response?.data?.message) || (error instanceof Error && error.message) || 'Error al cargar los pacientes.';
      }
    },

    /**
     * Crea un nuevo paciente en el backend.
     * Backend: POST /api/patients?nationalId={nationalId} con FHIR JSON en el body.
     */
     async createPatient(patientData: FhirPatient): Promise<FhirPatient | null> {
      this.loading = true;
      this.error = null;
      try {
        const nationalId = patientData.identifier?.[0]?.value;
        if (!nationalId) {
          this.error = 'El identificador nacional (nationalId) del paciente es obligatorio.';
          throw new Error(this.error);
        }

        const patientJson = JSON.stringify(patientData);

        const response = await api.post<FhirPatientEntity>(`/patients?nationalId=${nationalId}`, patientJson, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.data && response.data.parsedPatient) {
          this.patients.push(response.data.parsedPatient);
          return response.data.parsedPatient;
        } else {
          this.error = 'El backend no devolvió un paciente válido.';
          return null;
        }
      } catch (error: unknown) {
        this.error = (error instanceof AxiosError && error.response?.data?.message) || (error instanceof Error && error.message) || 'Error al crear el paciente.';
        return null;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Obtiene un paciente por su nationalId.
     * Backend: GET /api/patients/{nationalId} devuelve PatientMasterIndex.
     */
    async getPatientByNationalId(nationalId: string): Promise<FhirPatient | null> {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get<FhirPatientEntity>(`/patients/${nationalId}`); // Asume que la URL es /api/patients/{nationalId}
        if (response.data && response.data.parsedPatient) {
          return response.data.parsedPatient;
        } else {
          console.warn(`Paciente con nationalId ${nationalId} encontrado pero sin parsedPatient.`);
          return null;
        }
      } catch (error: unknown) {
        if (error instanceof AxiosError && error.response?.status === 404) {
          console.warn(`Paciente con nationalId ${nationalId} no encontrado (404).`);
          return null;
        }
        const errorMessage = (error instanceof AxiosError && error.response?.data?.message) || (error instanceof Error && error.message) || 'Error al obtener el paciente.';
        this.error = errorMessage;
        throw new Error(errorMessage);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Actualiza un paciente existente.
     * Backend: PUT /api/patients/{nationalId} espera PatientMasterIndex en el body.
     *
     * NOTA IMPORTANTE: Al igual que con Practitioner, si tu backend PUT espera
     * PatientMasterIndex y quieres actualizar el recurso FHIR completo en Aidbox,
     * el backend PUT /api/patients/{nationalId} debería aceptar 'String fhirPatientJson'
     * en el @RequestBody, no 'PatientMasterIndex'.
     */
    async updatePatient(nationalId: string, patientData: FhirPatient): Promise<FhirPatient | null> {
      this.loading = true;
      this.error = null;
      if (!validatePatient(patientData)) {
        this.error = 'Los datos del paciente no cumplen los requisitos mínimos para la actualización.';
        throw new Error(this.error);
      }
      try {
        const patientJson = JSON.stringify(patientData); // Envía el FHIR JSON completo

        const response = await api.put<FhirPatientEntity>(`/patients/${nationalId}`, patientJson, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // Actualizar el estado del store
        const index = this.patients.findIndex(p => p.identifier?.[0]?.value === nationalId);
        if (index !== -1 && response.data.parsedPatient) {
          this.patients[index] = response.data.parsedPatient;
        }
        this.loading = false;
        return response.data.parsedPatient || null;
      } catch (error: unknown) {
        this.loading = false;
        const errorMessage = (error instanceof AxiosError && error.response?.data?.message) || (error instanceof Error && error.message) || 'Error al actualizar el paciente.';
        this.error = errorMessage;
        throw new Error(errorMessage);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Elimina un paciente por su nationalId.
     * Backend: DELETE /api/patients/{nationalId}
     */
    async deletePatient(nationalId: string): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        await api.delete(`/patients/${nationalId}`);
        this.patients = this.patients.filter(p => p.identifier?.[0]?.value !== nationalId);
        this.loading = false;
      } catch (error: unknown) {
        this.loading = false;
        const errorMessage = (error instanceof AxiosError && error.response?.data?.message) || (error instanceof Error && error.message) || 'Error al eliminar el paciente.';
        this.error = errorMessage;
        throw new Error(errorMessage);
      } finally {
        this.loading = false;
      }
    },
  },

});
