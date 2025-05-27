// src/stores/practitionerStore.ts
import { defineStore } from 'pinia'
import api from '@/services/apiService'
import type { FhirPractitioner, FhirPractitionerEntity } from '@/types/PractitionerTyped'
import { AxiosError } from 'axios'

interface PractitionerState {
  practitioners: FhirPractitioner[]
  loading: boolean
  error: string | null
}

function validatePractitioner(practitioner: FhirPractitioner): boolean {
  if (!practitioner.identifier?.[0]?.value || !practitioner.identifier?.[0]?.system) return false
  if (!practitioner.name?.[0]?.family || !practitioner.name?.[0]?.given?.[0]) return false
  return true
}

export const usePractitionerStore = defineStore('practitionerStore', {
  state: (): PractitionerState => ({
    practitioners: [],
    loading: false,
    error: null,
  }),

  actions: {
    async loadPractitioners() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get<{ fhirPractitioner: string }[]>('/practitioners')
        this.practitioners = response.data.map(
          (item) => JSON.parse(item.fhirPractitioner) as FhirPractitioner,
        )
      } catch (error: any) {
        this.error =
          (error instanceof AxiosError && error.response?.data?.error) ||
          'Error al cargar los profesionales.'
      } finally {
        this.loading = false
      }
    },

    async getPractitionerByNationalId(nationalId: string): Promise<FhirPractitioner | null> {
      this.loading = true
      this.error = null
      try {
        const response = await api.get<{ fhirPractitioner: string }>(`/practitioners/${nationalId}`)
        return JSON.parse(response.data.fhirPractitioner) as FhirPractitioner
      } catch (error: any) {
        if (error instanceof AxiosError && error.response?.status === 404) {
          // 404 means not found, which is expected for new practitioners
          return null
        }
        this.error =
          (error instanceof AxiosError && error.response?.data?.error) ||
          'Error al obtener el profesional.'
        return null
      } finally {
        this.loading = false
      }
    },

    async createPractitioner(practitionerData: FhirPractitioner): Promise<FhirPractitioner | null> {
      this.loading = true
      this.error = null
      try {
        const nationalId = practitionerData.identifier?.[0]?.value?.trim().toUpperCase()
        if (!nationalId) {
          throw new Error('El identificador nacional es obligatorio.')
        }

        if (!practitionerData.name?.[0]?.family || !practitionerData.name?.[0]?.given?.[0]) {
          throw new Error('Nombre y apellido son obligatorios.')
        }

        console.log('Submitting practitioner data:', JSON.stringify(practitionerData, null, 2))

        const response = await api.post<{ fhirId: string; localId: string; message: string }>(
          `/practitioners?nationalId=${nationalId}`,
          practitionerData,
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          },
        )

        if (response.data.fhirId) {
          const createdPractitioner = { ...practitionerData, id: response.data.fhirId }
          this.practitioners.push(createdPractitioner)
          return createdPractitioner
        }
        throw new Error('No se recibió un ID válido del servidor.')
      } catch (error: any) {
        let errorMsg = 'Error al crear el profesional.'
        if (error instanceof AxiosError) {
          errorMsg = error.response?.data?.message || error.response?.data?.error || error.message
          console.error('Backend error details:', error.response?.data)
        }
        this.error = errorMsg
        return null
      } finally {
        this.loading = false
      }
    },

    async updatePractitioner(
      nationalId: string,
      practitionerData: FhirPractitioner,
    ): Promise<FhirPractitioner | null> {
      this.loading = true
      this.error = null
      if (!validatePractitioner(practitionerData)) {
        this.error = 'Datos inválidos.'
        throw new Error(this.error)
      }
      try {
        const practitionerJson = JSON.stringify(practitionerData)
        await api.put(`/practitioners/${nationalId}`, practitionerJson, {
          headers: { 'Content-Type': 'application/json' },
        })
        const index = this.practitioners.findIndex(
          (p) => p.identifier?.[0]?.value?.toUpperCase() === nationalId.toUpperCase(),
        )
        if (index !== -1) {
          this.practitioners[index] = practitionerData
        }
        return practitionerData
      } catch (error: any) {
        this.error =
          (error instanceof AxiosError && error.response?.data?.error) ||
          'Error al actualizar el profesional.'
        return null
      } finally {
        this.loading = false
      }
    },

    async deletePractitioner(nationalId: string): Promise<void> {
      this.loading = true
      this.error = null
      try {
        await api.delete(`/practitioners/${nationalId}`)
        this.practitioners = this.practitioners.filter(
          (p) => p.identifier?.[0]?.value?.toUpperCase() !== nationalId.toUpperCase(),
        )
      } catch (error: any) {
        this.error =
          (error instanceof AxiosError && error.response?.data?.error) ||
          'Error al eliminar el profesional.'
        throw new Error(this.error)
      } finally {
        this.loading = false
      }
    },
  },
})
