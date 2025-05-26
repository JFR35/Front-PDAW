import { defineStore } from 'pinia'
import api from '@/services/apiService'
import type { FhirPractitionerEntity, FhirPractitioner } from '@/types/PractitionerTyped'
import { AxiosError } from 'axios'

interface PractitionerState {
  practitioners: FhirPractitioner[] | null;
  loading: boolean
  error: string | null
}

function validatePractitioner(practitioner: FhirPractitioner): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!practitioner.identifier || practitioner.identifier.length === 0) {
    errors.push('Se requiere al menos un identificador')
  } else {
    // Aquí el error "posiblemente null"
    if (!practitioner.identifier[0].value) errors.push('El valor del identificador es obligatorio')
    if (!practitioner.identifier[0].system) errors.push('El sistema del identificador es obligatorio')
  }

  if (!practitioner.name || practitioner.name.length === 0) {
    errors.push('Se requiere al menos un nombre')
  } else {
    // Aquí el error "posiblemente null"
    if (!practitioner.name[0].family) errors.push('El apellido es obligatorio')
    if (!practitioner.name[0].given || practitioner.name[0].given.length === 0) {
      errors.push('Se requiere al menos un nombre de pila')
    }
  }

  if (!practitioner.gender) errors.push('El género es obligatorio')
  if (!practitioner.birthDate) errors.push('La fecha de nacimiento es obligatoria')

  if (!practitioner.qualification || practitioner.qualification.length === 0) {
    errors.push('Se requiere al menos una cualificación')
  } else {
    // Aquí el error "posiblemente null"
    // Usamos encadenamiento opcional (?.) para acceder a propiedades anidadas
    if (!practitioner.qualification[0].code?.coding?.[0]?.code) {
      errors.push('El código de cualificación es obligatorio')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Ocurrió un error desconocido'
}

export const usePractitionerStore = defineStore('practitionerStore', {
  state: (): PractitionerState => ({
    practitioners: [], // Esto es un array, no puede ser null en esta inicialización
    loading: false,
    error: null,
  }),

  actions: {
    async loadPractitioners() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get<FhirPractitionerEntity[]>('/practitioners')
        // Asegurarse de que `this.practitioners` es un array antes de usar `push`
        // Si `practitioners` se inicializa como `[]`, no hay problema.
        this.practitioners = response.data
          .filter((pmi) => pmi.parsedPractitioner)
          .map((pmi) => pmi.parsedPractitioner as FhirPractitioner)
      } catch (error: unknown) {
        this.error = getErrorMessage(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createPractitioner(
      practitionerData: FhirPractitioner
    ): Promise<{ success: boolean; data?: FhirPractitioner; error?: string }> {
      this.loading = true
      this.error = null

      const validation = validatePractitioner(practitionerData)
      if (!validation.isValid) {
        const errorMessage = validation.errors.join(', ')
        this.error = errorMessage
        this.loading = false
        return { success: false, error: errorMessage }
      }

      try {
        // Asegurarse de que identifier y value existen antes de acceder
        const nationalId = practitionerData.identifier?.[0]?.value // Usa encadenamiento opcional
        if (!nationalId) {
          const errorMessage = 'El identificador nacional (nationalId) del profesional es obligatorio.'
          this.error = errorMessage
          return { success: false, error: errorMessage }
        }

        const response = await api.post<FhirPractitionerEntity>(
          `/practitioners?nationalId=${nationalId}`,
          JSON.stringify(practitionerData),
          { headers: { 'Content-Type': 'application/json' } }
        )

        if (response.data.parsedPractitioner) {
          // Asegurarse de que `this.practitioners` no es null antes de hacer push
          if (this.practitioners) {
            this.practitioners.push(response.data.parsedPractitioner)
          }
          return { success: true, data: response.data.parsedPractitioner }
        }
        return { success: false, error: 'Respuesta inesperada del servidor' }
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error)
        this.error = errorMessage
        return { success: false, error: errorMessage }
      } finally {
        this.loading = false
      }
    },

    async getPractitionerByNationalId(nationalId: string): Promise<FhirPractitioner | null> {
      this.loading = true
      this.error = null
      try {
        const response = await api.get<FhirPractitionerEntity>(`/practitioners/${nationalId}`)
        return response.data.parsedPractitioner || null
      } catch (error: unknown) {
        if (error instanceof AxiosError && error.response?.status === 404) {
          return null
        }
        this.error = getErrorMessage(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updatePractitioner(
      nationalId: string,
      practitionerData: FhirPractitioner
    ): Promise<FhirPractitioner | null> {
      this.loading = true
      this.error = null

      const validation = validatePractitioner(practitionerData)
      if (!validation.isValid) {
        this.error = validation.errors.join(', ')
        throw new Error(this.error)
      }

      try {
        const response = await api.put<FhirPractitionerEntity>(
          `/practitioners/${nationalId}`,
          JSON.stringify(practitionerData),
          { headers: { 'Content-Type': 'application/json' } }
        )

        // Asegurarse de que `this.practitioners` no es null antes de usar `findIndex`
        // y que `response.data.parsedPractitioner` existe.
        if (this.practitioners && response.data.parsedPractitioner) {
            const index = this.practitioners.findIndex(p =>
                p.identifier?.[0]?.value === nationalId // Usa encadenamiento opcional
            )

            if (index !== -1) {
                this.practitioners[index] = response.data.parsedPractitioner
            }
        }


        return response.data.parsedPractitioner || null
      } catch (error: unknown) {
        this.error = getErrorMessage(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deletePractitioner(nationalId: string): Promise<void> {
      this.loading = true
      this.error = null
      try {
        await api.delete(`/practitioners/${nationalId}`)
        // Asegurarse de que `this.practitioners` no es null antes de usar `filter`
        if (this.practitioners) {
            this.practitioners = this.practitioners.filter(
                p => p.identifier?.[0]?.value !== nationalId // Usa encadenamiento opcional
            )
        }
      } catch (error: unknown) {
        this.error = getErrorMessage(error)
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
