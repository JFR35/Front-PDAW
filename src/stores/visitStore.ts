import { defineStore } from 'pinia';
import api from '@/services/apiService';
import type { VisitRequestFrontend, VisitResponseBackend, Visit, BloodPressureFlatResponse, BloodPressureMeasurement } from '@/types/VisitTyped';
import { AxiosError } from 'axios';
import { usePatientStore } from './patientStore';


/**
 * @interface VisitState
 * @description Define la estructura del estado de las visitas en el store Pinia.
 */
interface VisitState {
  visits: Visit[];
  currentVisit: Visit | null;
  loading: boolean; // Indica si se está cargando información
  error: string | null; // Mensaje de error si ocurre un problema
}

/**
 * @function fetchBloodPressureMeasurement
 * @description Obtiene la medición de presión sanguínea asociada a una composición específica.
 * @param {string} compositionId - El ID de la composición de presión sanguínea.
 * @param {string} ehrId - El ID del EHR asociado a la composición.
 * @returns {Promise<BloodPressureMeasurement | null>} - La medición de presión sanguínea o null si no se encuentra.
 * @param compositionId
 * @param ehrId
 * @returns
 */
async function fetchBloodPressureMeasurement(compositionId: string, ehrId: string): Promise<BloodPressureMeasurement | null> {
  try {
    // Extraer el UUID del compositionId (sin ::local.ehrbase.org::1)
    const uuid = compositionId.split('::')[0];
    const response = await api.get<BloodPressureFlatResponse>(`/v1/blood-pressure/${ehrId}/composition/${uuid}?format=FLAT`);
    const flatData = response.data;
    // Mapear la respuesta FLAT a BloodPressureMeasurement
    return {
      date: flatData['blood_pressure/blood_pressure/any_event:0/time'],
      systolicMagnitude: flatData['blood_pressure/blood_pressure/any_event:0/systolic|magnitude'],
      systolicUnit: flatData['blood_pressure/blood_pressure/any_event:0/systolic|unit'],
      diastolicMagnitude: flatData['blood_pressure/blood_pressure/any_event:0/diastolic|magnitude'],
      diastolicUnit: flatData['blood_pressure/blood_pressure/any_event:0/diastolic|unit'],
      location: flatData['blood_pressure/blood_pressure/location_of_measurement|value'],
      measuredBy: flatData['blood_pressure/composer|name'],
    };
  } catch (error: any) {
    console.error(`Error fetching blood pressure measurement for composition ${compositionId}:`, error);
    return null;
  }
}
/**
 * @function mapVisitResponseToVisit
 * @description Esta función auxiliar mapea un DTO de la respuesta de visita del backend a un objeto Visit.
 * @param {VisitResponseBackend} backendDto
 * @param {BloodPressureMeasurement}measurement
 * @returns {Visit} El objeto Visit mapeado listo para usar en el Store de Pinia.
 */

function mapVisitResponseToVisit(backendDto: VisitResponseBackend, measurement?: BloodPressureMeasurement): Visit {
  return {
    uuid: backendDto.visitUuid,
    patientNationalId: backendDto.patientNationalId,
    practitionerNationalId: backendDto.practitionerNationalId,
    practitionerName: backendDto.practitionerName,
    date: new Date(backendDto.visitDate),
    bloodPressureCompositionId: backendDto.bloodPressureCompositionId,
    bloodPressureMeasurement: measurement,
    ehrId: backendDto.ehrId, // Incluir ehrId de la composición si está disponible
  };
}

/**
 * @store visitStore
 * @description Store de Pinia para manejar el estado de las visitas médicas.
 */
export const useVisitStore = defineStore('visitStore', {
  state: (): VisitState => ({
    visits: [],
    currentVisit: null,
    loading: false,
    error: null,
  }),
  /**
   * @action createVisitWithBloodPressure
   * @description Crea una nueva visita médica con medición de presión sanguínea.
   */
  actions: {
    async createVisitWithBloodPressure(requestData: VisitRequestFrontend): Promise<Visit | null> {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post<VisitResponseBackend>('/visits', requestData);
        let measurement: BloodPressureMeasurement | undefined;
        if (response.data.bloodPressureCompositionId && response.data.ehrId) {
          measurement = await fetchBloodPressureMeasurement(response.data.bloodPressureCompositionId, response.data.ehrId);
        }
        const newVisit = mapVisitResponseToVisit(response.data, measurement);
        this.visits.push(newVisit);
        this.currentVisit = newVisit;
        return newVisit;
      } catch (error: any) { // Creo que el problema es por ESLint
        this.error =
          (error instanceof AxiosError && error.response?.data?.message) ||
          'Error al crear la visita.';
        console.error('Error creating visit:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    /**
     * @action getVisitByUuid
     * @description Obtiene una visita médica por su UUID.
     * @param {string} visitUuid - Es el UIID de la visita a buscar.
     * @returns {Promise<Visit | null>} - La visita encontrada o null si no se encuentra.
     */
    async getVisitByUuid(visitUuid: string): Promise<Visit | null> {
      if (!visitUuid) {
        this.error = 'Visit UUID is required.';
        return null;
      }
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get<VisitResponseBackend>(`/visits/${visitUuid}`);
        let measurement: BloodPressureMeasurement | undefined;
        if (response.data.bloodPressureCompositionId && response.data.ehrId) {
          measurement = await fetchBloodPressureMeasurement(response.data.bloodPressureCompositionId, response.data.ehrId);
        }
        const fetchedVisit = mapVisitResponseToVisit(response.data, measurement);
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
    /**
     * @action getVisitsByPatientNationalId
     * @description Obtiene todas las visitas médicas asociadas a un paciente por su National ID.
     * @param {string} patientNationalId - El National ID del paciente.
     * @returns {Promise<Visit[] | null>} - Lista de visitas del paciente o null si ocurre un error.
     */
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
        const patientStore = usePatientStore();
        // Obtener el ehrId desde patientStore (ajusta según cómo almacenes ehrId)
        const patient = patientStore.patients.find(p => p.identifier?.[0]?.value === patientNationalId);
        const ehrId = patient?.ehrId; // Asume que ehrId está en FhirPatient, ajusta si es necesario

        this.visits = await Promise.all(
          response.data.map(async (backendDto) => {
            let measurement: BloodPressureMeasurement | undefined;
            if (backendDto.bloodPressureCompositionId && ehrId) {
              measurement = await fetchBloodPressureMeasurement(backendDto.bloodPressureCompositionId, ehrId);
              if (!measurement) {
                console.warn(`No blood pressure measurement found for composition ${backendDto.bloodPressureCompositionId}`);
              }
            }
            return mapVisitResponseToVisit(backendDto, measurement);
          })
        );
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
