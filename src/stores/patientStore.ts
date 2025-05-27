import { defineStore } from 'pinia'
import api from '@/services/apiService'
import type { FhirPatient, FhirPatientEntity } from '@/types/PatientTyped' // Importa FhirPatientEntity
import { AxiosError } from 'axios'

// Define el estado del store de pacientes
interface PatientState {
  patients: FhirPatient[]
  loading: boolean
  error: string | null
}

// Función para validar datos de un paciente, lo mejor sería refactorizar y sacarla a un archivo de utilidades
function validatePatient(patient: FhirPatient): boolean {
  // Validaciones basadas en el StructureDefinition y JSON de ejemplo
  if (
    !patient.identifier ||
    patient.identifier.length === 0 ||
    !patient.identifier[0].value ||
    !patient.identifier[0].system
  )
    return false
  if (
    !patient.name ||
    patient.name.length === 0 ||
    !patient.name[0].family ||
    !patient.name[0].given ||
    patient.name[0].given.length === 0
  )
    return false
  if (!patient.gender) return false
  if (!patient.birthDate) return false

  return true
}

// Store de Pinia para manejar a los pacientes
export const usePatientStore = defineStore('patientStore', {
  state: (): PatientState => ({
    patients: [],
    loading: false,
    error: null,
  }),

  // Acciones del store para manejar pacientes
  actions: {
    async loadPatients() {
      this.loading = true
      this.error = null
      try {
        // Obtenemos la lista de PatientMasterIndex (FhirPatientEntity sin fhirPatient)
        const response = await api.get<Omit<FhirPatientEntity, 'fhirPatient'>[]>('/patients')

        const fetchedPatients: FhirPatient[] = [] // Array que almacenará los pacientes completos
        // Validamos que la respuesta contenga datos
        if (!response.data || response.data.length === 0) {
          this.loading = false
          this.error = 'No se encontraron pacientes.'
          console.warn('No se encontraron pacientes en la respuesta del backend.')
          return
        }
        // Para cada entidad recibida, hacemos una llamada individual para obtener el FhirPatient completo
        for (const entity of response.data) {
          if (entity.nationalId) {
            try {
              // Llamamos a getPatientByNationalId para obtener el FhirPatient completo
              // Este getPatientByNationalId devuelve el FhirPatient con su JSON anidado
              const fhirPatient = await this.getPatientByNationalId(entity.nationalId)
              if (fhirPatient) {
                fetchedPatients.push(fhirPatient)
              } else {
                console.warn(
                  `No se pudo obtener el recurso (FhirPatient) para el paciente con DNI: : ${entity.nationalId}`,
                )
              }
            } catch (innerError) {
              console.error(
                `Error al obtener el recurso (FhirPatient) para el paciente con DNI ${entity.nationalId}:`,
                innerError,
              )
            }
          }
        }
        this.patients = fetchedPatients
        this.loading = false
      } catch (error: any) {
        this.loading = false
        this.error =
          (error instanceof AxiosError && error.response?.data?.error) ||
          'Error al cargar los pacientes.'
        console.error('Error loading patients from backend:', error)
      }
    },
    // Método para crear un nuevo paciente
    async createPatient(patientData: FhirPatient): Promise<FhirPatient | null> {
      this.loading = true
      this.error = null
      try {
        const nationalId = patientData.identifier?.[0]?.value
        if (!nationalId) {
          this.error = 'El identificador nacional (DNI) es obligatorio.'
          throw new Error(this.error)
        }
        const patientJson = JSON.stringify(patientData)
        interface PostPatientResponse {
          id: string // O number
          nationalId: string
          fhirId: string
          // ... otras propiedades que devuelva el backend
        }

        const response = await api.post<PostPatientResponse>(
          `/patients?nationalId=${nationalId}`,
          patientJson,
          {
            headers: { 'Content-Type': 'application/json' },
          },
        )

        // Llamada por nationalId para obtener el FhirPatient completo, el backend se encarga de buscar en Aidbox.
        const createdFhirPatient = await this.getPatientByNationalId(nationalId)

        if (createdFhirPatient) {
          this.patients.push(createdFhirPatient)
          this.loading = false
          return createdFhirPatient
        } else {
          this.error =
            'Paciente creado, pero no se pudo obtener el recurso FHIR completo para la UI.'
          this.loading = false
          return null
        }
      } catch (error: any) {
        this.error =
          (error instanceof AxiosError && error.response?.data?.error) ||
          'Error al crear el paciente.'
        this.loading = false
        return null
      }
    },

    // Método para obtener un paciente por su identificador nacional (DNI)
    async getPatientByNationalId(nationalId: string): Promise<FhirPatient | null> {
      this.loading = true
      this.error = null
      try {
        const response = await api.get<FhirPatientEntity>(`/patients/${nationalId}`)
        let fhirPatient: FhirPatient
        try {
          fhirPatient = JSON.parse(response.data.fhirPatient) as FhirPatient
          if (!fhirPatient.id && response.data.fhirId) {
            fhirPatient.id = response.data.fhirId
          }
        } catch (e) {
          console.error(
            'Error de parsing en FHIR patient JSON desde la entidad (getById):',
            e,
            response.data,
          )
          this.error = 'Error al procesar la información FHIR del paciente.'
          this.loading = false
          return null
        }
        this.loading = false
        return fhirPatient
      } catch (error: any) {
        this.error =
          (error instanceof AxiosError && error.response?.data?.error) ||
          'Error al obtener el paciente.'
        this.loading = false
        return null
      }
    },

    async updatePatient(nationalId: string, patientData: FhirPatient): Promise<FhirPatient | null> {
      this.loading = true
      this.error = null
      if (!validatePatient(patientData)) {
        this.error = 'Datos inválidos.'
        throw new Error(this.error)
      }
      try {
        const patientJsonString = JSON.stringify(patientData)
        await api.put<any>(`/patients/${nationalId}`, patientJsonString, {
          headers: { 'Content-Type': 'application/json' },
        })

        const index = this.patients.findIndex((p) => p.identifier?.[0]?.value === nationalId)
        if (index !== -1) {
          this.patients[index] = patientData
        }
        this.loading = false
        return patientData
      } catch (error: any) {
        this.error =
          (error instanceof AxiosError && error.response?.data?.error) ||
          'Error al actualizar el paciente.'
        this.loading = false
        return null
      }
    },

    async deletePatient(nationalId: string): Promise<void> {
      this.loading = true
      this.error = null
      try {
        const response = await api.delete(`/patients/${nationalId}`)
        console.log('Respuesta del delete:', response) // Para depuración

        if (response.status >= 200 && response.status < 300) {
          this.patients = this.patients.filter((p) => p.identifier?.[0]?.value !== nationalId)
        } else {
          throw new Error(`Error del servidor: ${response.status}`)
        }
      } catch (error: unknown) {
        console.error('Error en deletePatient:', error)
        this.error =
          (error instanceof AxiosError && error.response?.data?.message) ||
          (error instanceof Error && error.message) ||
          'Error al eliminar el paciente.'
        throw error // Re-lanzar el error para que el componente lo capture
      } finally {
        this.loading = false
      }
    },
  },
})
