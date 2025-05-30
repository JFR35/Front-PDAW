// Definición del store para gestionar profesionales de la salud
import { defineStore } from 'pinia';
import api from '@/services/apiService';
import type { FhirPractitioner, PractitionerResponseBackend } from '@/types/PractitionerTyped';
import { AxiosError } from 'axios';

// Definicion del estado
interface PractitionerState {
  practitioners: FhirPractitioner[]; // Listar profesionales de la salud
  loading: boolean; // Estado de carga para solicitudes
  error: string | null; // Mensaje de error si ocurre un problema
}

/**
 * @description Función para validar un objeto FhirPractitioner.
 * @action validatePractitioner
 * @param practitioner - Recibe un objeto FhirPractitioner para validar.
 * @returns ture si el objeto es válido o false si no lo es.
 */
function validatePractitioner(practitioner: FhirPractitioner): boolean {
  // Verificar campos obligatorios según FHIR Practitioner
  if (!practitioner.identifier || practitioner.identifier.length === 0 || !practitioner.identifier[0].value) return false;
  if (!practitioner.name || practitioner.name.length === 0 || !practitioner.name[0].family || !practitioner.name[0].given || practitioner.name[0].given.length === 0) return false;
  return true;
}

/**
 * @description Store de Pinia para gestionar profesionales de la salud.
 *
 */
export const usePractitionerStore = defineStore('practitionerStore', {
  state: (): PractitionerState => ({
    practitioners: [],
    loading: false,
    error: null,
  }),

  // Carga los profesionales de la salud desde el backend
  actions: {
    async loadPractitioners() {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get<PractitionerResponseBackend[]>('/practitioners');
        this.practitioners = response.data
          .map((backendDto: PractitionerResponseBackend) => {
            try {
              const parsedPractitioner = JSON.parse(backendDto.fhirPractitionerJson) as FhirPractitioner;
              if (!parsedPractitioner.id && backendDto.fhirId) {
                parsedPractitioner.id = backendDto.fhirId;
              }
              if (!backendDto.nationalId || backendDto.nationalId === 'N/A') {
                console.warn('Invalid nationalId in backend DTO:', backendDto);
                return null;
              }
              parsedPractitioner.identifier = parsedPractitioner.identifier || [{ system: 'national', value: backendDto.nationalId }];
              return parsedPractitioner;
            } catch (e) {
              console.error('Error parsing FHIR practitioner JSON:', e, backendDto);
              return null;
            }
          })
          .filter((practitioner): practitioner is FhirPractitioner => practitioner !== null);
        if (this.practitioners.length === 0) {
          this.error = 'No disponemos de pacientes en nuestra base de datos.';
        }
      } catch (error: any) {
        this.error =
          (error instanceof AxiosError && error.response?.data?.error) ||
          'Error al cargar los profesionales.';
        console.error('Error loading practitioners from backend:', error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * @description Funcion asíncrona para crear un nuevo profesional de la salud.
     * @param practitionerData - Recicibe objeto FhirPractitioner
     * @returns - Devuelve el profesional creado o si es error devuelve null.
     */
    async createPractitioner(practitionerData: FhirPractitioner): Promise<FhirPractitioner | null> {
      this.loading = true;
      this.error = null;
      try {
        const nationalId = practitionerData.identifier?.[0]?.value;
        if (!nationalId) {
          this.error = 'El identificador nacional es obligatorio.';
          throw new Error(this.error);
        }
        const practitionerJson = JSON.stringify(practitionerData);
        const response = await api.post<PractitionerResponseBackend>(`/practitioners?nationalId=${nationalId}`, practitionerJson, {
          headers: { 'Content-Type': 'application/json' },
        });
        let createdFhirPractitioner: FhirPractitioner;
        try {
          createdFhirPractitioner = JSON.parse(response.data.fhirPractitionerJson) as FhirPractitioner;
          if (!createdFhirPractitioner.id && response.data.fhirId) {
            createdFhirPractitioner.id = response.data.fhirId;
          }
        } catch (e) {
          console.error('Error parsing created FHIR practitioner JSON:', e, response.data);
          this.error = 'Profesional creado, pero hubo un error al procesar su información FHIR.';
          return null;
        }
        this.practitioners.push(createdFhirPractitioner);
        return createdFhirPractitioner;
      } catch (error: any) {
        this.error =
          (error instanceof AxiosError && error.response?.data?.error) ||
          'Error al crear el profesional.';
        return null;
      } finally {
        this.loading = false;
      }
    },

    /**
     * @description Obtener profesional de la salud por su National ID.
     * @param nationalId - Recice el nationalId por parametro
     * @returns
     */
    async getPractitionerByNationalId(nationalId: string): Promise<FhirPractitioner | null> {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get<PractitionerResponseBackend>(`/practitioners/${nationalId}`);
        let fhirPractitioner: FhirPractitioner;
        try {
          fhirPractitioner = JSON.parse(response.data.fhirPractitionerJson) as FhirPractitioner;
          if (!fhirPractitioner.id && response.data.fhirId) {
            fhirPractitioner.id = response.data.fhirId;
          }
        } catch (e) {
          console.error('Error parsing FHIR practitioner JSON:', e, response.data);
          this.error = 'Error al procesar la información FHIR del profesional.';
          return null;
        }
        return fhirPractitioner;
      } catch (error: any) {
        this.error =
          (error instanceof AxiosError && error.response?.data?.error) ||
          'Error al obtener el profesional.';
        return null;
      } finally {
        this.loading = false;
      }
    },

    // Metodo para actualizar un profesional de la salud
    async updatePractitioner(nationalId: string, practitionerData: FhirPractitioner): Promise<FhirPractitioner | null> {
      this.loading = true;
      this.error = null;
      if (!validatePractitioner(practitionerData)) {
        this.error = 'Datos de profesional o identificador inválidos.';
        throw new Error(this.error);
      }
      try {
        const practitionerJsonString = JSON.stringify(practitionerData);
        const response = await api.put<PractitionerResponseBackend>(`/practitioners/${nationalId}`, practitionerJsonString, {
          headers: { 'Content-Type': 'application/json' },
        });
        const updatedFhirPractitioner = JSON.parse(response.data.fhirPractitionerJson) as FhirPractitioner;
        if (!updatedFhirPractitioner.id && response.data.fhirId) {
          updatedFhirPractitioner.id = response.data.fhirId;
        }
        const index = this.practitioners.findIndex((p) => p.identifier?.[0]?.value === nationalId);
        if (index !== -1) {
          this.practitioners[index] = updatedFhirPractitioner;
        }
        return updatedFhirPractitioner;
      } catch (error: any) {
        this.error =
          (error instanceof AxiosError && error.response?.data?.error) ||
          'Error al actualizar el profesional.';
        return null;
      } finally {
        this.loading = false;
      }
    },

    // Metodo para eliminar un profesional de la salud
    async deletePractitioner(nationalId: string): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        await api.delete(`/practitioners/${nationalId}`);
        this.practitioners = this.practitioners.filter((p) => p.identifier?.[0]?.value !== nationalId);
      } catch (error: unknown) {
        const errorMessage =
          (error instanceof AxiosError && error.response?.data?.message) ||
          (error instanceof Error && error.message) ||
          'Error al eliminar el profesional.';
        this.error = errorMessage;
        throw new Error(errorMessage);
      } finally {
        this.loading = false;
      }
    },
  },
});
